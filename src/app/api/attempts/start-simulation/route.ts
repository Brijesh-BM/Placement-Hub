import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roundId } = body;

    if (!roundId) {
      return NextResponse.json({ error: 'Round ID is required' }, { status: 400 });
    }

    // Fetch the company round details
    const round = await db.companyRound.findUnique({
      where: { id: roundId },
      include: { company: true }
    });

    if (!round) {
      return NextResponse.json({ error: 'Company round not found' }, { status: 404 });
    }

    const topics = round.topics as string[] || [];

    // Query questions matching the round's topics or parent categories
    const matchingQuestions = await db.question.findMany({
      where: {
        isPublished: true,
        OR: [
          { subCategory: { name: { in: topics } } },
          { subCategory: { category: { name: { in: topics } } } }
        ]
      },
      include: { subCategory: true }
    });

    // Select exactly 20 questions randomly (shuffle)
    let selectedQuestions = matchingQuestions.sort(() => Math.random() - 0.5).slice(0, 20);

    // Fallback if matching pool is too small: grab any general questions to fill the test
    if (selectedQuestions.length < 20) {
      const existingIds = selectedQuestions.map(q => q.id);
      const extraQuestions = await db.question.findMany({
        where: {
          isPublished: true,
          id: { notIn: existingIds }
        },
        take: 20 - selectedQuestions.length,
        include: { subCategory: true }
      });
      selectedQuestions = [...selectedQuestions, ...extraQuestions];
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions available in database to simulate test.' }, { status: 500 });
    }

    // Find a fallback category ID for the test itself
    const testCategoryId = selectedQuestions[0].subCategory.categoryId;

    // Use a transaction to create the simulated test and the active attempt
    const attempt = await db.$transaction(async (tx) => {
      // 1. Create simulated test
      const test = await tx.test.create({
        data: {
          title: `${round.company.name} ${round.roundName} Simulator`,
          description: `Dynamic simulated assessment covering: ${topics.join(', ')}. Difficulty: ${round.difficulty}. Rules: Secure tab monitoring, unpausable timer.`,
          duration: round.duration || 90,
          difficulty: round.difficulty,
          type: 'COMPANY',
          categoryId: testCategoryId,
          companyId: round.companyId,
          isPublished: false, // private simulated test
          shuffleQuestions: true
        }
      });

      // 2. Link the selected questions
      for (let idx = 0; idx < selectedQuestions.length; idx++) {
        await tx.testQuestion.create({
          data: {
            testId: test.id,
            questionId: selectedQuestions[idx].id,
            order: idx + 1
          }
        });
      }

      // 3. Force invalidate any prior in-progress attempts for this simulated test/user
      await tx.attempt.updateMany({
        where: {
          userId: userPayload.userId,
          testId: test.id,
          status: 'IN_PROGRESS'
        },
        data: {
          status: 'EXPIRED',
          submittedAt: new Date()
        }
      });

      // 4. Create new Attempt
      const newAttempt = await tx.attempt.create({
        data: {
          testId: test.id,
          userId: userPayload.userId,
          status: 'IN_PROGRESS',
          maxScore: selectedQuestions.length,
          startedAt: new Date()
        }
      });

      // 5. Populate empty answer sheets for the attempt
      for (const q of selectedQuestions) {
        await tx.answer.create({
          data: {
            attemptId: newAttempt.id,
            questionId: q.id,
            selectedOption: null,
            isCorrect: false
          }
        });
      }

      return newAttempt;
    });

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error: any) {
    console.error('Start simulation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

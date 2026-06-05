import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = await request.json();
    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required.' }, { status: 400 });
    }

    // Verify test exists
    const test = await db.test.findUnique({
      where: { id: testId },
      include: {
        testQuestions: true
      }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found.' }, { status: 404 });
    }

    // Create a new Attempt in transaction
    const attempt = await db.$transaction(async (tx) => {
      // Set previous incomplete attempts for this test/user to EXPIRED or submit them
      await tx.attempt.updateMany({
        where: {
          userId: userPayload.userId,
          testId,
          status: 'IN_PROGRESS',
        },
        data: {
          status: 'EXPIRED',
          submittedAt: new Date(),
        },
      });

      const newAttempt = await tx.attempt.create({
        data: {
          testId,
          userId: userPayload.userId,
          status: 'IN_PROGRESS',
          maxScore: test.testQuestions.length,
          startedAt: new Date(),
        },
      });

      // Initialize empty Answer records to populate later
      for (const tq of test.testQuestions) {
        await tx.answer.create({
          data: {
            attemptId: newAttempt.id,
            questionId: tq.questionId,
            selectedOption: null,
            isCorrect: false,
          }
        });
      }

      return newAttempt;
    });

    return NextResponse.json({ success: true, attempt });
  } catch (error: any) {
    console.error('Start attempt API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

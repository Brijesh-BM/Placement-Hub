import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Search by Attempt ID or Result ID
    let attempt = await db.attempt.findFirst({
      where: {
        OR: [
          { id },
          { result: { id } }
        ],
        userId: userPayload.userId,
      },
      include: {
        test: {
          select: {
            title: true,
            duration: true,
            category: { select: { name: true } }
          }
        },
        result: true,
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                difficulty: true,
                subCategory: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Test results not found.' }, { status: 404 });
    }

    if (attempt.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Attempt has not been submitted yet.' }, { status: 400 });
    }

    // Format answers detail review
    const answersReview = attempt.answers.map(ans => {
      const q = ans.question;
      let opts = [];
      try {
        opts = JSON.parse(q.options);
      } catch (e) {
        opts = q.options.split(',');
      }

      return {
        questionId: q.id,
        text: q.text,
        options: opts,
        correctAnswer: q.correctAnswer,
        selectedOption: ans.selectedOption,
        isCorrect: ans.isCorrect,
        markedForReview: ans.markedForReview,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.subCategory.name,
      };
    });

    // Count skipped questions
    const maxQuestions = attempt.maxScore;
    const answeredCount = attempt.correctAnswers + attempt.incorrectAnswers;
    const skippedAnswers = maxQuestions - answeredCount;

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        testTitle: attempt.test.title,
        testCategory: attempt.test.category.name,
        testDuration: attempt.test.duration,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        correctCount: attempt.correctAnswers,
        incorrectCount: attempt.incorrectAnswers,
        skippedCount: skippedAnswers,
        submittedAt: attempt.submittedAt || attempt.startedAt,
        warningsCount: attempt.warningsCount,
      },
      result: attempt.result ? {
        id: attempt.result.id,
        rank: attempt.result.rank,
        accuracy: attempt.result.accuracy,
        topicAnalysis: JSON.parse(attempt.result.topicAnalysis || '{}'),
      } : null,
      answers: answersReview,
    });
  } catch (error: any) {
    console.error('GET results error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const attempt = await db.attempt.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            testQuestions: {
              orderBy: { order: 'asc' },
              include: {
                question: {
                  select: {
                    id: true,
                    text: true,
                    options: true,
                    difficulty: true,
                    subCategory: { select: { name: true } }
                  }
                }
              }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            selectedOption: true,
            markedForReview: true,
          }
        }
      }
    });

    if (!attempt || attempt.userId !== userPayload.userId) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({
        attempt: {
          id: attempt.id,
          status: attempt.status,
          testId: attempt.testId,
        },
        message: 'This test attempt is already completed.',
      });
    }

    // Calculate remaining time
    const durationSeconds = attempt.test.duration * 60;
    const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
    const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

    if (remainingSeconds <= 0) {
      // Time is up! Return expired warning
      return NextResponse.json({
        attempt: {
          id: attempt.id,
          status: 'EXPIRED',
          testId: attempt.testId,
        },
        remainingSeconds: 0,
        message: 'Time limit has expired.',
      });
    }

    // Sanitize and format questions
    const formattedQuestions = attempt.test.testQuestions.map((tq) => {
      const q = tq.question;
      let opts = [];
      try {
        opts = JSON.parse(q.options);
      } catch (e) {
        opts = q.options.split(',');
      }

      // Find if student previously answered this question in this session
      const savedAns = attempt.answers.find(a => a.questionId === q.id);

      return {
        id: q.id,
        text: q.text,
        options: opts,
        difficulty: q.difficulty,
        topic: q.subCategory.name,
        order: tq.order,
        selectedOption: savedAns?.selectedOption ?? null,
        markedForReview: savedAns?.markedForReview ?? false,
      };
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        warningsCount: attempt.warningsCount,
      },
      test: {
        id: attempt.test.id,
        title: attempt.test.title,
        duration: attempt.test.duration,
      },
      questions: formattedQuestions,
      remainingSeconds,
    });
  } catch (error: any) {
    console.error('GET attempt error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

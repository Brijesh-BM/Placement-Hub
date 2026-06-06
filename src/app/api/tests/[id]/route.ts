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

    const test = await db.test.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
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
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Sanitize the questions: Parse JSON options and remove correctAnswer index!
    const sanitizedQuestions = test.testQuestions.map((tq) => {
      const q = tq.question;
      const opts = Array.isArray(q.options)
        ? q.options
        : (typeof q.options === 'string' ? JSON.parse(q.options) : []);

      return {
        id: q.id,
        text: q.text,
        options: opts,
        difficulty: q.difficulty,
        topic: q.subCategory.name,
        order: tq.order,
      };
    });

    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        duration: test.duration,
        category: test.category.name,
        questions: sanitizedQuestions,
      }
    });
  } catch (error: any) {
    console.error('GET test detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

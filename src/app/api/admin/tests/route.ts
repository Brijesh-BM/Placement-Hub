import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tests = await db.test.findMany({
      include: {
        category: { select: { name: true } },
        testQuestions: {
          include: {
            question: { select: { id: true, text: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tests });
  } catch (error: any) {
    console.error('Admin GET tests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, duration, categoryId, questionIds } = body;

    if (!title || !categoryId || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters. Title, Category, and at least 1 Question are required.' }, { status: 400 });
    }

    // Create the test and order questions in a transaction
    const newTest = await db.$transaction(async (tx) => {
      const test = await tx.test.create({
        data: {
          title,
          description: description || null,
          duration: parseInt(duration, 10) || 60,
          categoryId,
          createdByUserId: userPayload.userId,
        },
      });

      // Create TestQuestion links
      for (let i = 0; i < questionIds.length; i++) {
        await tx.testQuestion.create({
          data: {
            testId: test.id,
            questionId: questionIds[i],
            order: i + 1,
          },
        });
      }

      return test;
    });

    return NextResponse.json({ success: true, test: newTest });
  } catch (error: any) {
    console.error('Admin POST test error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create test.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const question = await db.question.findUnique({
      where: { id },
      select: {
        id: true,
        text: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        difficulty: true
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Parse options if stored as string
    const opts = Array.isArray(question.options)
      ? question.options
      : (typeof question.options === 'string' ? JSON.parse(question.options) : []);

    return NextResponse.json({
      question: {
        ...question,
        options: opts
      }
    });
  } catch (error: any) {
    console.error('GET question-detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

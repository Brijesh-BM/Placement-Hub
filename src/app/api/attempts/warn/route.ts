import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId } = await request.json();
    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 });
    }

    const attempt = await db.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== userPayload.userId) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Attempt already completed' }, { status: 400 });
    }

    const updated = await db.attempt.update({
      where: { id: attemptId },
      data: {
        warningsCount: {
          increment: 1,
        },
      },
    });

    const triggerAutoSubmit = updated.warningsCount >= 3;

    return NextResponse.json({
      success: true,
      warningsCount: updated.warningsCount,
      triggerAutoSubmit,
    });
  } catch (error: any) {
    console.error('Warn attempt API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

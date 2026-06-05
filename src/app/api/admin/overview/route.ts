import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const totalStudents = await db.user.count({ where: { role: 'STUDENT' } });
    const totalQuestions = await db.question.count();
    const totalTests = await db.test.count();
    const totalAttempts = await db.attempt.count({ where: { status: 'SUBMITTED' } });

    // Fetch recent 10 attempts
    const recentAttempts = await db.attempt.findMany({
      take: 10,
      orderBy: { startedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        test: { select: { title: true } },
      },
    });

    return NextResponse.json({
      overview: {
        totalStudents,
        totalQuestions,
        totalTests,
        totalAttempts,
        recentAttempts: recentAttempts.map(a => ({
          id: a.id,
          userName: a.user.name,
          userEmail: a.user.email,
          testTitle: a.test.title,
          percentage: a.percentage,
          score: a.score,
          maxScore: a.maxScore,
          startedAt: a.startedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Admin overview API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const topic = searchParams.get('topic') || undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year') || '2026', 10) : undefined;

    const whereClause: any = {
      OR: [
        { question: { contains: search } },
        { role: { contains: search } },
        { answer: { contains: search } },
        { topic: { contains: search } }
      ]
    };
    if (companyId) whereClause.companyId = companyId;
    if (difficulty) whereClause.difficulty = difficulty;
    if (topic) whereClause.topic = topic;
    if (year) whereClause.year = year;

    const pyqs = await db.previousYearQuestion.findMany({
      where: whereClause,
      include: {
        company: { select: { id: true, name: true } }
      },
      orderBy: { year: 'desc' }
    });

    return NextResponse.json({ pyqs });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const test = await db.test.findFirst({
      where: { title: 'Placement Baseline Assessment' }
    });

    if (!test) {
      return NextResponse.json({ error: 'Baseline Assessment not found' }, { status: 404 });
    }

    return NextResponse.json({ testId: test.id });
  } catch (error: any) {
    console.error('GET baseline test ID error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

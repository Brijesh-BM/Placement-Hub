import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await db.company.findMany({
      include: {
        tests: { select: { id: true, title: true } }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error('GET companies error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

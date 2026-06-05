import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: userPayload.userId }
    });

    const roadmaps = await db.roadmap.findMany({
      include: {
        steps: { orderBy: { order: 'asc' } },
        progress: profile ? {
          where: { profileId: profile.id }
        } : false
      },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ roadmaps });
  } catch (error: any) {
    console.error('GET roadmaps error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

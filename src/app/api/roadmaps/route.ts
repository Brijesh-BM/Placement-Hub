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
      where: { userId: userPayload.userId },
      include: {
        roadmapCompletions: {
          include: {
            step: { select: { roadmapId: true } }
          }
        }
      }
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

    // Group completed steps by roadmapId
    const completedStepsMap: { [roadmapId: string]: string[] } = {};
    
    // Initialize empty arrays for all roadmaps
    roadmaps.forEach(r => {
      completedStepsMap[r.id] = [];
    });

    if (profile) {
      profile.roadmapCompletions.forEach(c => {
        const rId = c.step.roadmapId;
        if (completedStepsMap[rId]) {
          completedStepsMap[rId].push(c.stepId);
        }
      });
    }

    return NextResponse.json({ roadmaps, completedStepsMap });
  } catch (error: any) {
    console.error('GET roadmaps error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

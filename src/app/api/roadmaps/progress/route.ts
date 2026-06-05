import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roadmapId, stepId } = await request.json();
    if (!roadmapId || !stepId) {
      return NextResponse.json({ error: 'Roadmap ID and Step ID are required' }, { status: 400 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: userPayload.userId }
    });

    if (!profile) throw new Error('Student profile not found');

    const roadmap = await db.roadmap.findUnique({
      where: { id: roadmapId },
      include: { steps: true }
    });

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    const totalSteps = roadmap.steps.length;
    if (totalSteps === 0) {
      return NextResponse.json({ error: 'Roadmap has no steps' }, { status: 400 });
    }

    // Fetch existing progress
    const progress = await db.roadmapProgress.findFirst({
      where: {
        profileId: profile.id,
        roadmapId,
      }
    });

    let completedList: string[] = [];
    if (progress && progress.completedSteps) {
      completedList = progress.completedSteps.split(',').map(s => s.trim()).filter(Boolean);
    }

    let isCompleted = false;
    if (completedList.includes(stepId)) {
      // Toggle off: remove
      completedList = completedList.filter(s => s !== stepId);
    } else {
      // Toggle on: add
      completedList.push(stepId);
      isCompleted = true;
    }

    const completedStr = completedList.join(',');
    const percentageCompleted = parseFloat(((completedList.length / totalSteps) * 100).toFixed(1));

    const updatedProgress = await db.roadmapProgress.upsert({
      where: {
        profileId_roadmapId: {
          profileId: profile.id,
          roadmapId,
        }
      },
      update: {
        completedSteps: completedStr,
        percentageCompleted,
      },
      create: {
        profileId: profile.id,
        roadmapId,
        completedSteps: completedStr,
        percentageCompleted,
      }
    });

    return NextResponse.json({
      success: true,
      percentageCompleted,
      completedSteps: completedList,
    });
  } catch (error: any) {
    console.error('Roadmap progress error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

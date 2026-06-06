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

    // Check if completion exists
    const existingCompletion = await db.roadmapStepCompletion.findUnique({
      where: {
        profileId_stepId: {
          profileId: profile.id,
          stepId,
        }
      }
    });

    if (existingCompletion) {
      // Toggle off: delete completion
      await db.roadmapStepCompletion.delete({
        where: {
          profileId_stepId: {
            profileId: profile.id,
            stepId,
          }
        }
      });
    } else {
      // Toggle on: create completion
      await db.roadmapStepCompletion.create({
        data: {
          profileId: profile.id,
          stepId,
        }
      });
    }

    // Fetch all completed step IDs for this roadmap
    const completedStepCompletions = await db.roadmapStepCompletion.findMany({
      where: {
        profileId: profile.id,
        step: {
          roadmapId: roadmapId
        }
      },
      select: {
        stepId: true
      }
    });

    const completedList = completedStepCompletions.map(c => c.stepId);
    const percentageCompleted = parseFloat(((completedList.length / totalSteps) * 100).toFixed(1));

    const updatedProgress = await db.roadmapProgress.upsert({
      where: {
        profileId_roadmapId: {
          profileId: profile.id,
          roadmapId,
        }
      },
      update: {
        percentageCompleted,
      },
      create: {
        profileId: profile.id,
        roadmapId,
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

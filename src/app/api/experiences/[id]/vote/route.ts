import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { voteType } = await request.json(); // "HELPFUL" or "NOT_HELPFUL"

    if (voteType !== 'HELPFUL' && voteType !== 'NOT_HELPFUL') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const experience = await db.interviewExperience.findUnique({
      where: { id }
    });

    if (!experience) {
      return NextResponse.json({ error: 'Interview experience not found' }, { status: 404 });
    }

    const existingVote = await db.interviewExperienceVote.findUnique({
      where: {
        experienceId_userId: {
          experienceId: id,
          userId: userPayload.userId
        }
      }
    });

    let upvoteDiff = 0;

    await db.$transaction(async (tx) => {
      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Toggle off: Delete the vote
          await tx.interviewExperienceVote.delete({
            where: { id: existingVote.id }
          });
          if (voteType === 'HELPFUL') upvoteDiff = -1;
        } else {
          // Change vote type
          await tx.interviewExperienceVote.update({
            where: { id: existingVote.id },
            data: { voteType }
          });
          if (voteType === 'HELPFUL') {
            upvoteDiff = 1;
          } else {
            upvoteDiff = -1;
          }
        }
      } else {
        // Create new vote
        await tx.interviewExperienceVote.create({
          data: {
            experienceId: id,
            userId: userPayload.userId,
            voteType
          }
        });
        if (voteType === 'HELPFUL') upvoteDiff = 1;
      }

      // Update experience upvoteCount
      if (upvoteDiff !== 0) {
        await tx.interviewExperience.update({
          where: { id },
          data: {
            upvoteCount: {
              increment: upDiffToNumber(upvoteDiff)
            }
          }
        });
      }
    });

    const updatedExperience = await db.interviewExperience.findUnique({
      where: { id },
      select: { upvoteCount: true }
    });

    return NextResponse.json({
      success: true,
      upvoteCount: updatedExperience?.upvoteCount ?? 0,
      userVote: (existingVote && existingVote.voteType === voteType) ? null : voteType
    });
  } catch (error) {
    console.error('Experience vote error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function upDiffToNumber(diff: number): number {
  return diff;
}

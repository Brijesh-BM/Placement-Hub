import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, noteId, roadmapId, experienceId } = await request.json();

    if (!questionId && !noteId && !roadmapId && !experienceId) {
      return NextResponse.json({ error: 'Must provide an entity ID to bookmark' }, { status: 400 });
    }

    // Check if the bookmark already exists
    const whereClause: any = { userId: userPayload.userId };
    if (questionId) whereClause.questionId = questionId;
    if (noteId) whereClause.noteId = noteId;
    if (roadmapId) whereClause.roadmapId = roadmapId;
    if (experienceId) whereClause.experienceId = experienceId;

    const existing = await db.bookmark.findFirst({
      where: whereClause
    });

    if (existing) {
      // Toggle off: Delete
      await db.bookmark.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      // Toggle on: Create
      await db.bookmark.create({
        data: {
          userId: userPayload.userId,
          questionId: questionId || null,
          noteId: noteId || null,
          roadmapId: roadmapId || null,
          experienceId: experienceId || null,
        }
      });
      return NextResponse.json({ success: true, bookmarked: true });
    }
  } catch (error: any) {
    console.error('Bookmark toggle error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

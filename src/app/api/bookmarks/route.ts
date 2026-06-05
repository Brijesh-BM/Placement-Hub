import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId: userPayload.userId },
      include: {
        question: {
          select: { id: true, text: true, difficulty: true, subCategory: { select: { name: true } } }
        },
        note: {
          select: { id: true, title: true, category: true }
        },
        roadmap: {
          select: { id: true, title: true, description: true }
        },
        experience: {
          select: { id: true, company: { select: { name: true } }, role: true, difficulty: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

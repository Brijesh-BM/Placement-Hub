import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json(); // "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED"

    if (!['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid moderation status' }, { status: 400 });
    }

    const updated = await db.interviewExperience.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, experience: updated });
  } catch (error) {
    console.error('Moderation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

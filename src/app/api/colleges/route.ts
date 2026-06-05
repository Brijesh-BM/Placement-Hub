import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const colleges = await db.college.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ colleges });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

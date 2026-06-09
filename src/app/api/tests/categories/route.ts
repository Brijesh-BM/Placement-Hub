import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await db.category.findMany({
      include: {
        subCategories: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('GET categories error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

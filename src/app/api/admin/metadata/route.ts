import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const categories = await db.category.findMany({
      include: {
        subCategories: {
          select: { id: true, name: true }
        }
      }
    });

    const companyTags = await db.companyTag.findMany({
      select: { id: true, name: true }
    });

    return NextResponse.json({ categories, companyTags });
  } catch (error: any) {
    console.error('Admin metadata query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

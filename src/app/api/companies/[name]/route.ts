import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    // Find company hub case-insensitively
    const company = await db.company.findFirst({
      where: {
        name: {
          equals: name,
        }
      },
      include: {
        hiringRounds: { orderBy: { roundNumber: 'asc' } },
        faqs: true,
        tests: {
          select: {
            id: true,
            title: true,
            duration: true,
            category: { select: { name: true } },
            testQuestions: { select: { id: true } }
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company prep page not found.' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('GET company detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

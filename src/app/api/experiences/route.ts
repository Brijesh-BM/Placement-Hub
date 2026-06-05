import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const companyName = searchParams.get('company') || '';
    const difficulty = searchParams.get('difficulty') || '';

    // Admin can see all experiences to moderate; students can only see APPROVED
    const whereClause: any = {};
    
    if (userPayload.role !== 'ADMIN') {
      whereClause.status = 'APPROVED';
    }

    if (search) {
      whereClause.OR = [
        { company: { name: { contains: search } } },
        { role: { contains: search } },
        { experience: { contains: search } },
        { questionsAsked: { contains: search } }
      ];
    }

    if (companyName) {
      whereClause.company = { name: { equals: companyName } };
    }
    if (difficulty) {
      whereClause.difficulty = { equals: difficulty };
    }

    const experiences = await db.interviewExperience.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true } },
        company: { select: { name: true } },
        votes: {
          where: { userId: userPayload.userId }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ experiences });
  } catch (error: any) {
    console.error('GET experiences error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      company: companyName, 
      role, 
      questionsAsked, 
      experience, 
      difficulty, 
      selected, 
      packageText, 
      year, 
      roundsText, 
      prepTips 
    } = body;

    if (!companyName || !role || !questionsAsked || !experience) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // 1. Resolve or create company
    const trimmedCompany = companyName.trim();
    let dbCompany = await db.company.findUnique({
      where: { name: trimmedCompany }
    });

    if (!dbCompany) {
      dbCompany = await db.company.create({
        data: {
          name: trimmedCompany,
          hiringPattern: `### ${trimmedCompany} Recruitment Pattern\nInformation under review.`,
          eligibilityCriteria: 'Minimum 6.0 CGPA throughout academics.',
        }
      });
    }

    // 2. Create the experience record
    const newExp = await db.interviewExperience.create({
      data: {
        userId: userPayload.userId,
        companyId: dbCompany.id,
        role,
        questionsAsked,
        experience,
        difficulty: (difficulty || 'MEDIUM') as any,
        selected: !!selected,
        status: 'PENDING', // Default to PENDING for admin approval moderation
        packageText: packageText || null,
        year: year ? parseInt(year, 10) : 2026,
        roundsText: roundsText || null,
        prepTips: prepTips || null,
      }
    });

    return NextResponse.json({ success: true, experience: newExp });
  } catch (error: any) {
    console.error('POST experience error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit experience.' }, { status: 500 });
  }
}

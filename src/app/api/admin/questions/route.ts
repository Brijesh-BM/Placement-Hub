import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const subCategoryId = searchParams.get('subCategoryId') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const whereClause: any = {
      text: { contains: search },
    };
    if (subCategoryId) whereClause.subCategoryId = subCategoryId;
    if (difficulty) whereClause.difficulty = difficulty;

    const [questions, total] = await db.$transaction([
      db.question.findMany({
        where: whereClause,
        include: {
          subCategory: {
            select: {
              name: true,
              category: { select: { name: true } },
            },
          },
          companyTags: { select: { name: true } },
        },
        orderBy: { text: 'asc' },
        take: limit,
        skip: offset,
      }),
      db.question.count({ where: whereClause }),
    ]);

    return NextResponse.json({ questions, total });
  } catch (error: any) {
    console.error('Admin GET questions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { questionCreateSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = questionCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { text, options, correctAnswer, explanation, difficulty, subCategoryId, companyTags } = validation.data;

    // Resolve company tags relations
    const tagConnects: any[] = [];
    if (Array.isArray(companyTags)) {
      for (const tagName of companyTags) {
        if (tagName.trim()) {
          const tag = await db.companyTag.upsert({
            where: { name: tagName.trim() },
            update: {},
            create: { name: tagName.trim() },
          });
          tagConnects.push({ id: tag.id });
        }
      }
    }

    const newQuestion = await db.question.create({
      data: {
        text,
        options: options,
        correctAnswer: correctAnswer,
        explanation: explanation || null,
        difficulty: (difficulty || 'EASY') as any,
        subCategoryId,
        createdByUserId: userPayload.userId,
        companyTags: {
          connect: tagConnects,
        },
      },
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error: any) {
    console.error('Admin POST question error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create question.' }, { status: 500 });
  }
}

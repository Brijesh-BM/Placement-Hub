import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { text, options, correctAnswer, explanation, difficulty, subCategoryId, companyTags } = body;

    // Check if question exists
    const question = await db.question.findUnique({
      where: { id },
      include: { companyTags: true },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const optionsStr = Array.isArray(options) ? JSON.stringify(options) : options;

    // Resolve company tags relations:
    // First, disconnect all current tags, then connect new ones
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

    const updatedQuestion = await db.question.update({
      where: { id },
      data: {
        text: text || question.text,
        options: optionsStr || question.options,
        correctAnswer: correctAnswer !== undefined ? parseInt(correctAnswer, 10) : question.correctAnswer,
        explanation: explanation !== undefined ? explanation : question.explanation,
        difficulty: (difficulty || question.difficulty) as any,
        subCategoryId: subCategoryId || question.subCategoryId,
        companyTags: {
          set: tagConnects, // set acts as a reset-and-override
        },
      },
    });

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error: any) {
    console.error('Admin PUT question error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update question.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Delete question
    await db.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin DELETE question error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete question.' }, { status: 500 });
  }
}

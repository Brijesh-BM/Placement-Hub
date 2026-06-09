import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch only IDs for each category (extremely lightweight database query)
    const [aptIds, reasoningIds, techIds] = await Promise.all([
      db.question.findMany({
        where: { subCategory: { category: { name: 'Aptitude' } } },
        select: { id: true }
      }),
      db.question.findMany({
        where: { subCategory: { category: { name: 'Reasoning' } } },
        select: { id: true }
      }),
      db.question.findMany({
        where: { subCategory: { category: { name: 'Technical' } } },
        select: { id: true }
      }),
    ]);

    // Shuffle helper to pick random IDs
    const getRandomIds = (idsObj: { id: string }[], count: number) => {
      const shuffled = [...idsObj].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count).map(x => x.id);
    };

    const selectedAptIds = getRandomIds(aptIds, 10);
    const selectedReasoningIds = getRandomIds(reasoningIds, 10);
    const selectedTechIds = getRandomIds(techIds, 5);

    const targetIds = [...selectedAptIds, ...selectedReasoningIds, ...selectedTechIds];

    // 2. Fetch full details of ONLY the selected questions
    const dailySet = await db.question.findMany({
      where: { id: { in: targetIds } },
      include: {
        subCategory: {
          select: {
            name: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    // Sanitize options and remove correctAnswer key
    const sanitizedSet = dailySet.map((q, idx) => {
      const opts = Array.isArray(q.options)
        ? q.options
        : (typeof q.options === 'string' ? JSON.parse(q.options) : []);

      return {
        id: q.id,
        text: q.text,
        options: opts,
        difficulty: q.difficulty,
        category: q.subCategory.category.name,
        topic: q.subCategory.name,
        order: idx + 1,
      };
    });

    return NextResponse.json({
      questions: sanitizedSet,
      totalQuestions: sanitizedSet.length,
    });
  } catch (error: any) {
    console.error('GET daily practice error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

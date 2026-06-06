import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load questions categorized
    const allQuestions = await db.question.findMany({
      include: {
        subCategory: {
          select: {
            name: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    const aptQuestions = allQuestions.filter(q => q.subCategory.category.name === 'Aptitude');
    const reasoningQuestions = allQuestions.filter(q => q.subCategory.category.name === 'Reasoning');
    const techQuestions = allQuestions.filter(q => q.subCategory.category.name === 'Technical');

    // Shuffle helper
    const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

    const selectedApt = shuffle(aptQuestions).slice(0, 10);
    const selectedReasoning = shuffle(reasoningQuestions).slice(0, 10);
    const selectedTech = shuffle(techQuestions).slice(0, 5);

    const dailySet = [...selectedApt, ...selectedReasoning, ...selectedTech];

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

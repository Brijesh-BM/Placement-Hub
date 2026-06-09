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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Fetch published tests
    const tests = await db.test.findMany({
      where: { isPublished: true },
      include: {
        category: { select: { name: true } },
        testQuestions: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // In-memory filter for database safety and portability
    let filteredTests = tests.map(t => {
      let parsedTags: string[] = [];
      try {
        parsedTags = Array.isArray(t.tags)
          ? t.tags
          : (typeof t.tags === 'string' ? JSON.parse(t.tags) : []);
      } catch (e) {
        parsedTags = [];
      }

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        duration: t.duration,
        difficulty: t.difficulty,
        type: t.type,
        category: t.category.name,
        questionCount: t.testQuestions.length,
        attemptCount: t.attemptCount,
        averageScore: t.averageScore,
        tags: parsedTags,
        passingScore: t.passingScore
      };
    });

    if (category && category !== 'All') {
      filteredTests = filteredTests.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty && difficulty !== 'All') {
      filteredTests = filteredTests.filter(t => t.difficulty === difficulty);
    }

    if (type && type !== 'All') {
      filteredTests = filteredTests.filter(t => t.type === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTests = filteredTests.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(searchLower);
        const descMatch = (t.description || '').toLowerCase().includes(searchLower);
        const tagMatch = t.tags.some(tag => tag.toLowerCase().includes(searchLower));
        return titleMatch || descMatch || tagMatch;
      });
    }

    return NextResponse.json({ tests: filteredTests });
  } catch (error: any) {
    console.error('GET tests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

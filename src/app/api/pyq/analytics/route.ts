import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pyqs = await db.previousYearQuestion.findMany({
      include: { company: { select: { name: true } } }
    });

    // 1. Group by Topic
    const topicCounts: { [topic: string]: number } = {};
    pyqs.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    });

    const trendingTopics = Object.keys(topicCounts).map(name => ({
      name,
      count: topicCounts[name]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // 2. Group by Company -> Topic
    const companyTopicCounts: { [company: string]: { [topic: string]: number } } = {};
    pyqs.forEach(q => {
      const cName = q.company.name;
      if (!companyTopicCounts[cName]) companyTopicCounts[cName] = {};
      companyTopicCounts[cName][q.topic] = (companyTopicCounts[cName][q.topic] || 0) + 1;
    });

    const companyBreakdown = Object.keys(companyTopicCounts).map(cName => {
      const topics = companyTopicCounts[cName];
      const sortedTopics = Object.keys(topics).map(tName => ({
        topic: tName,
        count: topics[tName]
      })).sort((a, b) => b.count - a.count);
      return {
        company: cName,
        topTopics: sortedTopics
      };
    });

    return NextResponse.json({
      trendingTopics,
      companyBreakdown
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

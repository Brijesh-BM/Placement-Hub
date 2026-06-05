import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch student's submitted attempts
    const attempts = await db.attempt.findMany({
      where: {
        userId: userPayload.userId,
        status: 'SUBMITTED',
      },
      include: {
        test: {
          select: {
            title: true,
            category: { select: { name: true } },
          },
        },
        result: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    const totalTests = attempts.length;
    const averageScore = totalTests > 0
      ? parseFloat((attempts.reduce((sum, a) => sum + a.percentage, 0) / totalTests).toFixed(1))
      : 0;

    // Recalculate accuracies per topic (subcategory) across all attempts
    const subcategoryScores: { [name: string]: { totalAcc: number; count: number } } = {};

    attempts.forEach(attempt => {
      if (attempt.result && attempt.result.topicAnalysis) {
        try {
          const analysis = JSON.parse(attempt.result.topicAnalysis);
          Object.keys(analysis).forEach(topic => {
            const acc = analysis[topic]; // percentage accuracy
            if (!subcategoryScores[topic]) {
              subcategoryScores[topic] = { totalAcc: 0, count: 0 };
            }
            subcategoryScores[topic].totalAcc += acc;
            subcategoryScores[topic].count += 1;
          });
        } catch (e) {
          console.error('Failed to parse topic analysis JSON', e);
        }
      }
    });

    const topicsPerformance = Object.keys(subcategoryScores).map(name => {
      const { totalAcc, count } = subcategoryScores[name];
      return {
        name,
        averageAccuracy: parseFloat((totalAcc / count).toFixed(1)),
      };
    });

    // Categorize strong vs weak topics
    const strongTopics = topicsPerformance
      .filter(t => t.averageAccuracy >= 75)
      .map(t => t.name);

    const weakTopics = topicsPerformance
      .filter(t => t.averageAccuracy < 75)
      .map(t => t.name);

    // Fallbacks if user hasn't taken enough tests
    if (totalTests === 0) {
      // Return default roadmap goals or standard categories
      weakTopics.push('Aptitude', 'Operating Systems');
      strongTopics.push('OOP', 'DBMS');
    }

    // Build recommendations based on weak areas
    const recommendations: Array<{ id: string; title: string; type: string; reason: string }> = [];
    if (weakTopics.includes('DBMS') || weakTopics.includes('Operating Systems') || weakTopics.includes('OS')) {
      recommendations.push({
        id: 'tech-core-test',
        title: 'Technical Core MCQ Test',
        type: 'Test',
        reason: 'Improve your weak score in OS & DBMS.',
      });
      recommendations.push({
        id: 'dbms-normalization-note',
        title: 'DBMS Normalization Revision Notes',
        type: 'Learning Note',
        reason: 'Revise normalization rules to ace MCQs.',
      });
    }

    if (weakTopics.includes('Probability') || weakTopics.includes('Aptitude') || weakTopics.includes('Profit and Loss')) {
      recommendations.push({
        id: 'tcs-mock-test',
        title: 'TCS Full Mock Test',
        type: 'Mock Test',
        reason: 'Practice quantitative questions from mock exams.',
      });
    }

    // Default recommendation if empty
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'general-practice',
        title: 'Daily practice challenge',
        type: 'Daily Practice',
        reason: 'Keep your practice streak active with today\'s questions.',
      });
    }

    const recentActivity = attempts.slice(0, 5).map(a => ({
      id: a.id,
      testTitle: a.test.title,
      category: a.test.category.name,
      percentage: a.percentage,
      score: a.score,
      maxScore: a.maxScore,
      submittedAt: a.submittedAt || a.startedAt,
    }));

    // Generate score history for charts (e.g. past 6 tests)
    const scoreHistory = attempts
      .slice(0, 6)
      .reverse()
      .map((a, idx) => ({
        testNumber: `Test ${idx + 1}`,
        percentage: a.percentage,
        title: a.test.title,
      }));

    return NextResponse.json({
      stats: {
        totalTests,
        averageScore,
        strongTopics,
        weakTopics,
        recommendations,
        recentActivity,
        scoreHistory,
      },
    });
  } catch (error: any) {
    console.error('API /dashboard/stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

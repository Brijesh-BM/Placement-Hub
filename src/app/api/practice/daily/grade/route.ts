import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers } = await request.json(); // Array of { questionId, selectedOption }
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers must be an array.' }, { status: 400 });
    }

    const answersMap = new Map<string, number>();
    answers.forEach((a: any) => {
      if (a.questionId && a.selectedOption !== undefined) {
        answersMap.set(a.questionId, a.selectedOption);
      }
    });

    const questionIds = Array.from(answersMap.keys());

    // Fetch matching questions to grade
    const questions = await db.question.findMany({
      where: {
        id: { in: questionIds }
      },
      select: {
        id: true,
        correctAnswer: true,
        explanation: true,
        text: true,
      }
    });

    let correctCount = 0;
    const gradedResults = questions.map((q) => {
      const selected = answersMap.get(q.id) ?? null;
      const isCorrect = selected !== null && selected === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        text: q.text,
        correctAnswer: q.correctAnswer,
        selectedOption: selected,
        isCorrect,
        explanation: q.explanation,
      };
    });

    // Increment streak in user profile
    const profile = await db.profile.findUnique({
      where: { userId: userPayload.userId }
    });

    let currentStreak = 0;
    if (profile) {
      const today = new Date();
      const lastActive = new Date(profile.lastActive);
      const isSameDay = today.toDateString() === lastActive.toDateString();

      currentStreak = profile.streak;
      if (!isSameDay) {
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1; // reset if missed
        }
      } else if (currentStreak === 0) {
        currentStreak = 1;
      }

      await db.profile.update({
        where: { id: profile.id },
        data: {
          streak: currentStreak,
          lastActive: today,
        }
      });
    }

    return NextResponse.json({
      success: true,
      correctCount,
      totalCount: questions.length,
      streak: currentStreak,
      results: gradedResults,
    });
  } catch (error: any) {
    console.error('Grade daily practice error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

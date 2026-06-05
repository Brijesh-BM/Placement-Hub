import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateReadinessScore } from '@/lib/readiness';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId, answers } = await request.json();
    if (!attemptId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const attempt = await db.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            category: { select: { name: true } },
            testQuestions: {
              include: {
                question: {
                  include: { subCategory: { select: { name: true } } }
                }
              }
            }
          }
        }
      }
    });

    if (!attempt || attempt.userId !== userPayload.userId) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    if (attempt.status === 'SUBMITTED') {
      return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 });
    }

    // Prepare answers maps for quick search
    const answersMap = new Map<string, { selectedOption: number | null; markedForReview: boolean }>();
    answers.forEach((ans: any) => {
      answersMap.set(ans.questionId, {
        selectedOption: ans.selectedOption !== undefined ? ans.selectedOption : null,
        markedForReview: !!ans.markedForReview,
      });
    });

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const topicTracker: { [topic: string]: { correct: number; total: number } } = {};

    // Transaction for saving answers and updating status
    const result = await db.$transaction(async (tx) => {
      // 1. Process and save each answer
      for (const tq of attempt.test.testQuestions) {
        const q = tq.question;
        const submitted = answersMap.get(q.id) || { selectedOption: null, markedForReview: false };

        const isCorrect = submitted.selectedOption !== null && submitted.selectedOption === q.correctAnswer;

        if (submitted.selectedOption !== null) {
          if (isCorrect) correctAnswers++;
          else incorrectAnswers++;
        }

        // Track topic performance
        const topicName = q.subCategory.name;
        if (!topicTracker[topicName]) {
          topicTracker[topicName] = { correct: 0, total: 0 };
        }
        topicTracker[topicName].total++;
        if (isCorrect) topicTracker[topicName].correct++;

        // Update answer entry created at start
        await tx.answer.updateMany({
          where: {
            attemptId: attempt.id,
            questionId: q.id,
          },
          data: {
            selectedOption: submitted.selectedOption,
            isCorrect,
            markedForReview: submitted.markedForReview,
          }
        });
      }

      // Compute statistics
      const maxScore = attempt.test.testQuestions.length;
      const score = correctAnswers;
      const percentage = parseFloat(((score / maxScore) * 100).toFixed(1));
      const accuracy = correctAnswers + incorrectAnswers > 0
        ? parseFloat(((correctAnswers / (correctAnswers + incorrectAnswers)) * 100).toFixed(1))
        : 0;

      // Compile topic accuracy JSON
      const topicAnalysisObj: { [topic: string]: number } = {};
      Object.keys(topicTracker).forEach(topic => {
        const { correct, total } = topicTracker[topic];
        topicAnalysisObj[topic] = parseFloat(((correct / total) * 100).toFixed(1));
      });

      // Calculate Rank
      const higherAttemptsCount = await tx.attempt.count({
        where: {
          testId: attempt.testId,
          status: 'SUBMITTED',
          percentage: { gt: percentage }
        }
      });
      const rank = higherAttemptsCount + 1;

      // Create Result
      const dbResult = await tx.result.create({
        data: {
          attemptId: attempt.id,
          rank,
          accuracy,
          topicAnalysis: JSON.stringify(topicAnalysisObj),
        }
      });

      // Update Attempt
      const updatedAttempt = await tx.attempt.update({
        where: { id: attempt.id },
        data: {
          score,
          maxScore,
          percentage,
          correctAnswers,
          incorrectAnswers,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        }
      });

      // --- Badges & Streak Updates ---
      const profile = await tx.profile.findUnique({
        where: { userId: userPayload.userId },
        include: { badges: { include: { badge: true } } }
      });

      if (profile) {
        const currentBadges = profile.badges.map(b => b.badge.name);

        // Award Badges conditions
        // A. Aptitude Master: scores >= 85% in Aptitude test
        if (percentage >= 85 && attempt.test.category.name === 'Aptitude' && !currentBadges.includes('Aptitude Master')) {
          const badge = await tx.badge.findUnique({ where: { name: 'Aptitude Master' } });
          if (badge) {
            await tx.userBadge.create({
              data: { profileId: profile.id, badgeId: badge.id }
            });
          }
        }

        // B. DBMS Expert: scores >= 90% in DBMS topics
        const dbmsAcc = topicAnalysisObj['DBMS'];
        if (dbmsAcc >= 90 && !currentBadges.includes('DBMS Expert')) {
          const badge = await tx.badge.findUnique({ where: { name: 'DBMS Expert' } });
          if (badge) {
            await tx.userBadge.create({
              data: { profileId: profile.id, badgeId: badge.id }
            });
          }
        }

        // C. Update Streaks
        const today = new Date();
        const lastActive = new Date(profile.lastActive);
        const isSameDay = today.toDateString() === lastActive.toDateString();
        
        let newStreak = profile.streak;
        if (!isSameDay) {
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else {
            newStreak = 1; // reset streak if gap is larger than 1 day
          }
        } else if (newStreak === 0) {
          newStreak = 1;
        }

        // D. 7 Day Streak Badge
        if (newStreak >= 7 && !currentBadges.includes('7 Day Streak')) {
          const badge = await tx.badge.findUnique({ where: { name: '7 Day Streak' } });
          if (badge) {
            await tx.userBadge.create({
              data: { profileId: profile.id, badgeId: badge.id }
            });
          }
        }

        await tx.profile.update({
          where: { id: profile.id },
          data: {
            streak: newStreak,
            lastActive: today,
          }
        });
      }

      return dbResult;
    });

    // Check if baseline assessment was completed
    const profile = await db.profile.findUnique({
      where: { userId: userPayload.userId },
      include: { onboardingProfile: true }
    });

    if (profile && attempt.test.title === 'Placement Baseline Assessment') {
      await db.onboardingProfile.update({
        where: { profileId: profile.id },
        data: {
          completedBaselineAssessment: true,
          baselineAttemptId: attempt.id
        }
      });
    }

    // Recalculate Placement Readiness Score
    if (profile) {
      await calculateReadinessScore(profile.id);
    }

    return NextResponse.json({ success: true, resultId: result.id, attemptId: attempt.id });
  } catch (error: any) {
    console.error('Submit attempt API error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateReadinessScore } from '@/lib/readiness';
import { attemptSubmitSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = attemptSubmitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { attemptId, answers } = validation.data;

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

      // Generate Recommendations for Weak Areas (< 70%)
      const weakAreas = Object.keys(topicAnalysisObj)
        .map(topic => ({ topic, score: topicAnalysisObj[topic] }))
        .filter(item => item.score < 70.0)
        .sort((a, b) => a.score - b.score); // Ascending: worst first (Weak area ranking)

      const recommendationsList = [];
      for (const area of weakAreas.slice(0, 3)) {
        // Query learning notes
        const notes = await tx.learningNote.findMany({
          where: { subCategory: { name: area.topic } },
          take: 2,
          select: { id: true, title: true }
        });

        // Query recommended tests
        const recommendedTests = await tx.test.findMany({
          where: {
            isPublished: true,
            id: { not: attempt.testId },
            testQuestions: {
              some: {
                question: {
                  subCategory: { name: area.topic }
                }
              }
            }
          },
          take: 2,
          select: { id: true, title: true }
        });

        const prioritizedPath: string[] = [];
        notes.forEach(note => {
          prioritizedPath.push(`Read the learning note: "${note.title}"`);
        });
        recommendedTests.forEach(test => {
          prioritizedPath.push(`Take the practice test: "${test.title}"`);
        });

        recommendationsList.push({
          topic: area.topic,
          score: area.score,
          recommendedNotes: notes,
          recommendedTests: recommendedTests,
          prioritizedPath
        });
      }

      // Create Result
      const dbResult = await tx.result.create({
        data: {
          attemptId: attempt.id,
          rank,
          accuracy,
          topicAnalysis: topicAnalysisObj,
          recommendations: recommendationsList
        }
      });

      // Update Test global statistics
      const currentTest = await tx.test.findUnique({
        where: { id: attempt.testId },
        select: { attemptCount: true, averageScore: true }
      });
      if (currentTest) {
        const newAttemptCount = currentTest.attemptCount + 1;
        const newAverageScore = parseFloat(
          (((currentTest.averageScore * currentTest.attemptCount) + percentage) / newAttemptCount).toFixed(1)
        );

        await tx.test.update({
          where: { id: attempt.testId },
          data: {
            attemptCount: newAttemptCount,
            averageScore: newAverageScore
          }
        });
      }

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

        // C. Update Streaks using lastStreakDate
        const today = new Date();
        const todayStr = today.toDateString();
        let newStreak = profile.streak;
        let updateStreak = false;

        if (profile.lastStreakDate) {
          const lastStreak = new Date(profile.lastStreakDate);
          const lastStreakStr = lastStreak.toDateString();

          if (todayStr !== lastStreakStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastStreakStr === yesterdayStr) {
              newStreak += 1;
            } else {
              newStreak = 1; // Gap larger than 1 day, reset streak
            }
            updateStreak = true;
          }
        } else {
          newStreak = 1;
          updateStreak = true;
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
            lastStreakDate: updateStreak ? today : profile.lastStreakDate,
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

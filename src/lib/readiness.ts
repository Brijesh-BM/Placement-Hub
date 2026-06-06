import { db } from './db';
import { TargetRole } from '@prisma/client';

export async function calculateReadinessScore(profileId: string) {
  try {
    // 1. Fetch profile and user details
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    });

    if (!profile) throw new Error('Student profile not found');

    const role = profile.targetRole || TargetRole.SOFTWARE_ENGINEER;

    // 2. Fetch all student attempts
    const attempts = await db.attempt.findMany({
      where: {
        userId: profile.userId,
        status: 'SUBMITTED',
      },
      include: {
        result: true,
      }
    });

    // 3. Fetch weights configured for the student's target role
    const skillWeights = await db.skillWeight.findMany({
      where: { role }
    });

    // Build category map from weights
    const skillAverages: { [skill: string]: number } = {};
    const skillCounts: { [skill: string]: number } = {};
    skillWeights.forEach(sw => {
      skillAverages[sw.skillName] = 0.0;
      skillCounts[sw.skillName] = 0;
    });

    // 4. Calculate average scores per subcategory
    attempts.forEach((att) => {
      if (att.result && att.result.topicAnalysis) {
        try {
          const analysis = typeof att.result.topicAnalysis === 'string'
            ? JSON.parse(att.result.topicAnalysis)
            : (att.result.topicAnalysis as any || {});
          Object.keys(analysis).forEach((topicName) => {
            const percentage = analysis[topicName];
            
            // Map subcategory names to main skills
            // In our system, subcategory names like "Probability", "Profit and Loss" map to "Aptitude"
            // Let's check which main category they belong to or map them directly
            let skillKey = topicName;
            
            if (['Profit and Loss', 'Percentage', 'Probability', 'Time and Work', 'Time Speed Distance', 'Ratio and Proportion', 'Permutation and Combination'].includes(topicName)) {
              skillKey = 'Aptitude';
            } else if (['Blood Relations', 'Direction', 'Seating Arrangement', 'Coding Decoding', 'Puzzles'].includes(topicName)) {
              skillKey = 'Reasoning';
            } else if (['Grammar', 'Vocabulary', 'Reading Comprehension', 'Synonyms', 'Antonyms'].includes(topicName)) {
              skillKey = 'Verbal';
            }

            if (skillAverages[skillKey] !== undefined) {
              skillAverages[skillKey] += percentage;
              skillCounts[skillKey] += 1;
            }
          });
        } catch (e) {
          console.error('Failed to parse topic analysis in readiness calculator:', e);
        }
      }
    });

    // Average them out or fallback to seeded baseline if no attempts made
    // This ensures that students have a baseline score derived from their initial seed data
    const baselineScores: { [skill: string]: number } = {
      Aptitude: 80.0,
      Reasoning: 75.0,
      Verbal: 70.0,
      DSA: 65.0,
      DBMS: 90.0,
      OS: 60.0,
      CN: 55.0,
      OOP: 85.0,
      HTML: 70.0,
      React: 68.0,
      Interview: 72.0,
    };

    skillWeights.forEach((sw) => {
      const name = sw.skillName;
      if (skillCounts[name] > 0) {
        skillAverages[name] = parseFloat((skillAverages[name] / skillCounts[name]).toFixed(1));
      } else {
        // Fallback to baseline
        skillAverages[name] = baselineScores[name] || 60.0;
      }
    });

    // 5. Calculate Weighted overall score
    let overallScore = 0.0;
    let totalWeightUsed = 0.0;

    skillWeights.forEach((sw) => {
      const score = skillAverages[sw.skillName] || 60.0;
      overallScore += score * sw.weight;
      totalWeightUsed += sw.weight;
    });

    // Scale in case weights don't sum to exactly 1.0
    if (totalWeightUsed > 0) {
      overallScore = parseFloat((overallScore / totalWeightUsed).toFixed(1));
    } else {
      overallScore = 60.0;
    }

    // 6. Update in Database
    const updatedScore = await db.studentSkillScore.upsert({
      where: { profileId: profile.id },
      update: {
        aptitudeScore: skillAverages['Aptitude'] || 0.0,
        reasoningScore: skillAverages['Reasoning'] || 0.0,
        verbalScore: skillAverages['Verbal'] || 0.0,
        dsaScore: skillAverages['DSA'] || 0.0,
        dbmsScore: skillAverages['DBMS'] || 0.0,
        osScore: skillAverages['OS'] || 0.0,
        cnScore: skillAverages['CN'] || 0.0,
        oopScore: skillAverages['OOP'] || 0.0,
        interviewScore: skillAverages['Interview'] || 70.0,
        overallScore,
        lastUpdated: new Date(),
      },
      create: {
        profileId: profile.id,
        aptitudeScore: skillAverages['Aptitude'] || 0.0,
        reasoningScore: skillAverages['Reasoning'] || 0.0,
        verbalScore: skillAverages['Verbal'] || 0.0,
        dsaScore: skillAverages['DSA'] || 0.0,
        dbmsScore: skillAverages['DBMS'] || 0.0,
        osScore: skillAverages['OS'] || 0.0,
        cnScore: skillAverages['CN'] || 0.0,
        oopScore: skillAverages['OOP'] || 0.0,
        interviewScore: skillAverages['Interview'] || 70.0,
        overallScore,
      }
    });

    // Save to time-series history
    await db.studentSkillScoreHistory.create({
      data: {
        profileId: profile.id,
        skillName: 'Overall',
        score: overallScore,
      }
    });

    return updatedScore;
  } catch (error) {
    console.error('Readiness calculation failed:', error);
    return null;
  }
}

import { db } from './db';
import { TargetRole } from '@prisma/client';

export async function calculateReadinessScore(profileId: string) {
  try {
    // 1. Fetch profile, user, and onboarding details
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      include: { 
        user: true,
        onboardingProfile: true,
      }
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

    // Fetch subcategories to dynamically map topics/subcategories to category names
    const subCategories = await db.subCategory.findMany({
      include: { category: true }
    });
    
    const subCategoryToCategoryMap = new Map<string, string>();
    subCategories.forEach((sc) => {
      subCategoryToCategoryMap.set(sc.name, sc.category.name);
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
            
            // Map topic (subcategory) to main skill name dynamically
            const categoryName = subCategoryToCategoryMap.get(topicName);
            let skillKey = topicName;
            
            if (categoryName) {
              if (categoryName === 'Technical') {
                // For Technical category, the subcategory name is the skill name (e.g. DSA, DBMS, OS, CN, OOP)
                skillKey = topicName;
              } else {
                // Otherwise use the main category name (e.g. Aptitude, Reasoning, Verbal)
                skillKey = categoryName;
              }
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

    // Derive baseline scores from student onboarding profile confidence scores
    const onboarding = profile.onboardingProfile;
    const baselineScores: { [skill: string]: number } = {
      Aptitude: onboarding ? onboarding.confidenceAptitude * 10 : 80.0,
      Reasoning: onboarding ? onboarding.confidenceReasoning * 10 : 75.0,
      Verbal: onboarding ? onboarding.confidenceVerbal * 10 : 70.0,
      DSA: onboarding ? onboarding.confidenceDsa * 10 : 65.0,
      DBMS: onboarding ? onboarding.confidenceDbms * 10 : 90.0,
      OS: onboarding ? onboarding.confidenceOs * 10 : 60.0,
      CN: onboarding ? onboarding.confidenceCn * 10 : 55.0,
      OOP: onboarding ? onboarding.confidenceOop * 10 : 85.0,
      Interview: onboarding ? onboarding.confidenceCommunication * 10 : 72.0,
    };

    skillWeights.forEach((sw) => {
      const name = sw.skillName;
      if (skillCounts[name] > 0) {
        skillAverages[name] = parseFloat((skillAverages[name] / skillCounts[name]).toFixed(1));
      } else {
        // Fallback to onboarding profile baselines
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

    // Save history logs for overall and each individual skill score to the history table
    const historyData = [
      { profileId: profile.id, skillName: 'Overall', score: overallScore },
      { profileId: profile.id, skillName: 'Aptitude', score: skillAverages['Aptitude'] || 0.0 },
      { profileId: profile.id, skillName: 'Reasoning', score: skillAverages['Reasoning'] || 0.0 },
      { profileId: profile.id, skillName: 'Verbal', score: skillAverages['Verbal'] || 0.0 },
      { profileId: profile.id, skillName: 'DSA', score: skillAverages['DSA'] || 0.0 },
      { profileId: profile.id, skillName: 'DBMS', score: skillAverages['DBMS'] || 0.0 },
      { profileId: profile.id, skillName: 'OS', score: skillAverages['OS'] || 0.0 },
      { profileId: profile.id, skillName: 'CN', score: skillAverages['CN'] || 0.0 },
      { profileId: profile.id, skillName: 'OOP', score: skillAverages['OOP'] || 0.0 },
      { profileId: profile.id, skillName: 'Interview', score: skillAverages['Interview'] || 70.0 },
    ];

    await db.studentSkillScoreHistory.createMany({
      data: historyData,
    });

    return updatedScore;
  } catch (error) {
    console.error('Readiness calculation failed:', error);
    return null;
  }
}

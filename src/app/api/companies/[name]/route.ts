import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { companyWeights } from '../route';

// Weekly Roadmap Schemas
const companyRoadmaps: Record<string, Array<{ week: string; title: string; desc: string; topics: string[] }>> = {
  amazon: [
    { week: 'Week 1', title: 'Arrays & Strings', desc: 'Focus on sliding window, two-pointer techniques, and basic string parsing.', topics: ['Arrays', 'Strings'] },
    { week: 'Week 2', title: 'HashMaps & LinkedLists', desc: 'Master collision handling, hash map applications, and linked list node manipulation.', topics: ['Hash Maps', 'Linked Lists'] },
    { week: 'Week 3', title: 'Tree & Graph Algorithms', desc: 'Understand tree traversals (inorder, preorder, postorder) and basic graph algorithms (BFS/DFS).', topics: ['Trees', 'Graphs'] },
    { week: 'Week 4', title: 'Amazon Mock OA & HR', desc: 'Attempt timed mock assessments and study leadership principles scenarios.', topics: ['Behavioral', 'Leadership Principles'] }
  ],
  google: [
    { week: 'Week 1', title: 'Trees & Recursion', desc: 'Google heavily tests recursive thinking and balanced tree operations.', topics: ['Trees', 'Recursion'] },
    { week: 'Week 2', title: 'Advanced Graphs & DFS/BFS', desc: 'Explore topological sorting, shortest paths (Dijkstra), and cycle detection.', topics: ['Graphs'] },
    { week: 'Week 3', title: 'Dynamic Programming & Tries', desc: 'Study standard DP patterns (Knapsack, LCS) and character prefix lookup using Tries.', topics: ['DP', 'Tries'] },
    { week: 'Week 4', title: 'Google Mocks & Googliness', desc: 'Practice Hard difficulty dynamic mock tests and align with behavioral standards.', topics: ['Behavioral', 'Googliness'] }
  ],
  microsoft: [
    { week: 'Week 1', title: 'Arrays & Bit Manipulation', desc: 'Practice sliding window, binary searches, and bit-wise operations.', topics: ['Arrays', 'Bit Manipulation'] },
    { week: 'Week 2', title: 'Stacks & Linked Lists', desc: 'Implement stack-based matching and reverse lists under rigorous edge conditions.', topics: ['Stacks', 'Linked Lists'] },
    { week: 'Week 3', title: 'Heaps & Dynamic Programming', desc: 'Understand priority queues, job scheduling, and multi-dimensional DP cache.', topics: ['Heap', 'DP'] },
    { week: 'Week 4', title: 'System Design & HR Fit', desc: 'Revise design patterns and practice behavioral scenarios based on previous rounds.', topics: ['LLD', 'OOP'] }
  ],
  tcs: [
    { week: 'Week 1', title: 'Quantitative Aptitude', desc: 'Focus on percentages, profit & loss, and speed-time-distance formulas.', topics: ['Aptitude'] },
    { week: 'Week 2', title: 'Logical Reasoning', desc: 'Practice blood relations, coding-decoding, and seating arrangement puzzles.', topics: ['Reasoning'] },
    { week: 'Week 3', title: 'Verbal Ability & Grammar', desc: 'Revise syntax rules, sentence correction, and reading comprehension.', topics: ['Verbal'] },
    { week: 'Week 4', title: 'TCS Coding Mocks', desc: 'Write basic loops, sorting routines, and simple array algorithms.', topics: ['Technical', 'DSA'] }
  ],
  infosys: [
    { week: 'Week 1', title: 'Quantitative Aptitude', desc: 'Focus on percentages, compound interest, time & work.', topics: ['Aptitude'] },
    { week: 'Week 2', title: 'Logical Reasoning', desc: 'Practice seating arrangements, direction tests, syllogisms.', topics: ['Reasoning'] },
    { week: 'Week 3', title: 'Verbal Ability', desc: 'Practice synonyms, antonyms, spelling correction, grammar errors.', topics: ['Verbal'] },
    { week: 'Week 4', title: 'Core Coding Mocks', desc: 'Practice array and string puzzles in Java or Python.', topics: ['Technical'] }
  ],
  accenture: [
    { week: 'Week 1', title: 'Cognitive Ability', desc: 'Revise numerical aptitude and logical series completion.', topics: ['Aptitude', 'Reasoning'] },
    { week: 'Week 2', title: 'Technical MCQ Foundations', desc: 'OOP concepts, pseudocodes, HTML/CSS and cloud basics.', topics: ['OOP', 'Technical'] },
    { week: 'Week 3', title: 'Accenture Coding Questions', desc: 'Practice basic arrays, sorting, and string matching.', topics: ['DSA'] },
    { week: 'Week 4', title: 'Communication & HR Test', desc: 'Practice speaking, listening fluency, and personality queries.', topics: ['Verbal', 'Interview'] }
  ],
  capgemini: [
    { week: 'Week 1', title: 'Pseudo Code Assessment', desc: 'Analyze loop dry runs, bitwise operators, and recursion outputs.', topics: ['Technical'] },
    { week: 'Week 2', title: 'Cognitive & Verbal', desc: 'Practice syllogisms, analogies, grammar, reading summaries.', topics: ['Reasoning', 'Verbal'] },
    { week: 'Week 3', title: 'Programming & SQL', desc: 'Review inheritance, SQL joins, basic sorting logic.', topics: ['OOP', 'SQL'] },
    { week: 'Week 4', title: 'HR & Behavior', desc: 'Practice resume presentation and behavioral fit questions.', topics: ['Interview'] }
  ],
  cognizant: [
    { week: 'Week 1', title: 'Aptitude & Reasoning', desc: 'Prepare basic maths, blood relations, calendar problems.', topics: ['Aptitude', 'Reasoning'] },
    { week: 'Week 2', title: 'OOP & DBMS Concepts', desc: 'Review normalization, key constraints, classes, static members.', topics: ['OOP', 'DBMS'] },
    { week: 'Week 3', title: 'GenC Next Coding Prep', desc: 'Practice intermediate arrays, basic trees, and string search.', topics: ['DSA'] },
    { week: 'Week 4', title: 'HR Prep & Projects', desc: 'Align project summaries and prepare relocation checks.', topics: ['Interview'] }
  ],
  deloitte: [
    { week: 'Week 1', title: 'Aptitude & English', desc: 'Revise profit & loss, vocabulary, paragraph ordering.', topics: ['Aptitude', 'Verbal'] },
    { week: 'Week 2', title: 'SQL & DBMS Core', desc: 'Practice SQL queries, group filter aggregates, normal forms.', topics: ['SQL', 'DBMS'] },
    { week: 'Week 3', title: 'Deloitte Case Studies', desc: 'Study group discussion cases and technical project architectures.', topics: ['Technical'] },
    { week: 'Week 4', title: 'Fitment Round Prep', desc: 'Practice behavioral interview questions and consultancies scenarios.', topics: ['Interview'] }
  ],
  ibm: [
    { week: 'Week 1', title: 'IBM Coding Patterns', desc: 'Focus on arrays, hash mappings, dynamic allocations.', topics: ['DSA'] },
    { week: 'Week 2', title: 'Technical Core (OS & DBMS)', desc: 'Revise deadlocks, process states, indexing structures, SQL joins.', topics: ['OS', 'DBMS'] },
    { week: 'Week 3', title: 'OOP & CN Fundamentals', desc: 'Polymorphism, OSI layer encapsulation, TCP/UDP protocols.', topics: ['OOP', 'CN'] },
    { week: 'Week 4', title: 'IBM Managerial Fit', desc: 'Practice resume walkthroughs and project structure reasoning.', topics: ['Interview'] }
  ]
};

// Realistic Company Analytics
const companyAnalytics: Record<string, { attempted: number; avgReadiness: number; placementReady: number; diffRound: string; failedTopic: string }> = {
  amazon: { attempted: 8420, avgReadiness: 58, placementReady: 21, diffRound: 'Technical Round 2', failedTopic: 'Graphs' },
  google: { attempted: 6210, avgReadiness: 51, placementReady: 15, diffRound: 'Coding Interview II', failedTopic: 'Dynamic Programming' },
  microsoft: { attempted: 7540, avgReadiness: 56, placementReady: 19, diffRound: 'Technical Round 2', failedTopic: 'DP' },
  tcs: { attempted: 18450, avgReadiness: 68, placementReady: 42, diffRound: 'Technical Interview', failedTopic: 'Coding Basics' },
  infosys: { attempted: 16120, avgReadiness: 65, placementReady: 38, diffRound: 'Technical Interview', failedTopic: 'OOP' },
  accenture: { attempted: 12450, avgReadiness: 62, placementReady: 31, diffRound: 'Coding Assessment', failedTopic: 'Arrays' },
  capgemini: { attempted: 10210, avgReadiness: 61, placementReady: 29, diffRound: 'Technical Interview', failedTopic: 'SQL' },
  cognizant: { attempted: 9840, avgReadiness: 60, placementReady: 28, diffRound: 'Technical Interview', failedTopic: 'DBMS' },
  deloitte: { attempted: 11150, avgReadiness: 63, placementReady: 33, diffRound: 'Technical Interview', failedTopic: 'SQL Joins' },
  ibm: { attempted: 8960, avgReadiness: 59, placementReady: 24, diffRound: 'Technical Interview', failedTopic: 'CN' }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    const companyKey = name.toLowerCase();

    // Query the company and related data
    const companies = await db.company.findMany({
      include: {
        hiringRounds: { orderBy: { roundNumber: 'asc' } },
        faqs: true,
        pyqs: { orderBy: { year: 'desc' } },
        experiences: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            role: true,
            questionsAsked: true,
            experience: true,
            difficulty: true,
            selected: true,
            year: true,
            roundsText: true,
            prepTips: true,
            isAnonymous: true,
            upvoteCount: true
          }
        },
        tests: {
          select: {
            id: true,
            title: true,
            duration: true,
            category: { select: { name: true } },
            testQuestions: { select: { id: true } }
          }
        }
      }
    });

    const company = companies.find(
      (c) => c.name.toLowerCase() === companyKey
    );

    if (!company) {
      return NextResponse.json({ error: 'Company prep page not found.' }, { status: 404 });
    }

    // Fetch user profile and skill scores
    const profile = await db.profile.findUnique({
      where: { userId: userPayload.userId },
      include: { readinessScore: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    const studentScore = profile.readinessScore;

    // 1. Calculate overall readiness score
    const weights = companyWeights[companyKey] || companyWeights.amazon;
    let weightedScore = 0;
    let totalWeight = 0;

    if (studentScore) {
      for (const [key, weight] of Object.entries(weights)) {
        const val = (studentScore as any)[key] || 60.0;
        weightedScore += val * weight;
        totalWeight += weight;
      }
    }

    const overallReadiness = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 60;

    // 2. Success Probability Indicators
    let successProbability = 'Medium';
    if (overallReadiness >= 80) successProbability = 'Very High';
    else if (overallReadiness >= 70) successProbability = 'High';
    else if (overallReadiness >= 50) successProbability = 'Medium';
    else successProbability = 'Low';

    // 3. Category-level breakdowns
    const breakdown = {
      Aptitude: studentScore ? Math.round(studentScore.aptitudeScore) : 60,
      DSA: studentScore ? Math.round(studentScore.dsaScore) : 60,
      DBMS: studentScore ? Math.round(studentScore.dbmsScore) : 60,
      OS: studentScore ? Math.round(studentScore.osScore) : 60,
      CN: studentScore ? Math.round(studentScore.cnScore) : 60,
      OOP: studentScore ? Math.round(studentScore.oopScore) : 60,
    };

    // Calculate strong vs weak areas
    const strongAreas = Object.entries(breakdown)
      .filter(([_, val]) => val >= 70)
      .map(([name]) => name);

    const weakAreas = Object.entries(breakdown)
      .filter(([_, val]) => val < 70)
      .map(([name]) => name);

    // 4. Round-specific readiness scores
    const roundReadiness = company.hiringRounds.map(r => {
      // Map topics of this round to student's category scores
      // Default to overall readiness if no topics listed
      const topicsList = r.topics as string[] || [];
      if (topicsList.length === 0) return overallReadiness;

      let scoreSum = 0;
      let scoreCount = 0;

      topicsList.forEach(t => {
        const topicLower = t.toLowerCase();
        let matchScore = 60;

        if (topicLower.includes('dsa') || topicLower.includes('array') || topicLower.includes('string') || topicLower.includes('list') || topicLower.includes('tree') || topicLower.includes('graph') || topicLower.includes('dp')) {
          matchScore = breakdown.DSA;
        } else if (topicLower.includes('oop')) {
          matchScore = breakdown.OOP;
        } else if (topicLower.includes('dbms') || topicLower.includes('sql')) {
          matchScore = breakdown.DBMS;
        } else if (topicLower.includes('os') || topicLower.includes('operating')) {
          matchScore = breakdown.OS;
        } else if (topicLower.includes('cn') || topicLower.includes('network')) {
          matchScore = breakdown.CN;
        } else if (topicLower.includes('aptitude') || topicLower.includes('math') || topicLower.includes('numerical')) {
          matchScore = breakdown.Aptitude;
        } else if (studentScore) {
          // Fallback to interview or overall
          matchScore = Math.round(studentScore.overallScore);
        }

        scoreSum += matchScore;
        scoreCount += 1;
      });

      return scoreCount > 0 ? Math.round(scoreSum / scoreCount) : overallReadiness;
    });

    // 5. Leaderboard ranks
    const allStudentScores = await db.studentSkillScore.findMany({
      include: {
        profile: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { overallScore: 'desc' }
    });

    const leaderboardData = allStudentScores.slice(0, 5).map((l, index) => ({
      rank: index + 1,
      name: l.profile.user.name,
      score: Math.round(l.overallScore)
    }));

    const userRankIndex = allStudentScores.findIndex(s => s.profileId === profile.id);
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 1;

    // 6. Dynamic Weak Area Recommendations (using existing database pools)
    const weakTopics = weakAreas.map(t => {
      if (t === 'Aptitude') return ['Profit and Loss', 'Percentage', 'Probability', 'Time and Work'];
      if (t === 'DSA') return ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'DP'];
      if (t === 'DBMS') return ['DBMS', 'SQL'];
      return [t];
    }).flat();

    const recommendedTests = await db.test.findMany({
      where: {
        isPublished: true,
        type: { in: ['TOPIC', 'SECTIONAL'] },
        testQuestions: {
          some: {
            question: {
              subCategory: {
                name: { in: weakTopics }
              }
            }
          }
        }
      },
      take: 2,
      select: { id: true, title: true, type: true }
    });

    const recommendedNotes = await db.learningNote.findMany({
      where: {
        subCategory: {
          name: { in: weakTopics }
        }
      },
      take: 2,
      select: { id: true, title: true, category: true }
    });

    // 7. Company Roadmap
    const roadmap = companyRoadmaps[companyKey] || companyRoadmaps.amazon;

    // 8. Company Analytics
    const analytics = companyAnalytics[companyKey] || companyAnalytics.amazon;

    return NextResponse.json({
      company,
      overallReadiness,
      successProbability,
      breakdown,
      strongAreas,
      weakAreas,
      roundReadiness,
      leaderboard: leaderboardData,
      userRank,
      roadmap,
      analytics,
      recommendations: {
        tests: recommendedTests,
        notes: recommendedNotes
      }
    });
  } catch (error: any) {
    console.error('GET company detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

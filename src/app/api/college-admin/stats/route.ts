import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'COLLEGE_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the college this admin manages
    const college = await db.college.findFirst({
      where: { adminId: userPayload.userId },
    });

    if (!college) {
      return NextResponse.json({ error: 'No administered college found' }, { status: 404 });
    }

    // Fetch student profiles registered under this college
    const studentProfiles = await db.profile.findMany({
      where: { collegeId: college.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        readinessScore: true,
      }
    });

    // 1. Calculations
    const studentCount = studentProfiles.length;
    let overallReadinessSum = 0;
    let readinessCount = 0;
    const roleBreakdown: { [role: string]: number } = {};

    const studentsList = studentProfiles.map((p) => {
      const score = p.readinessScore?.overallScore ?? null;
      if (score !== null) {
        overallReadinessSum += score;
        readinessCount += 1;
      }
      
      const role = p.targetRole || 'SOFTWARE_ENGINEER';
      roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;

      return {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        branch: p.branch || 'N/A',
        gradYear: p.gradYear || 'N/A',
        cgpa: p.cgpa || null,
        targetRole: p.targetRole,
        readinessScore: score,
        lastActive: p.lastActive,
      };
    });

    const averageReadiness = readinessCount > 0
      ? parseFloat((overallReadinessSum / readinessCount).toFixed(1))
      : 0;

    // Compile list of weak/strong topics across college by checking all student skill scores
    let dsaSum = 0, dbmsSum = 0, osSum = 0, cnSum = 0, oopSum = 0, aptSum = 0, reasoningSum = 0, verbalSum = 0;
    let scoreRecordsCount = 0;

    studentProfiles.forEach(p => {
      if (p.readinessScore) {
        dsaSum += p.readinessScore.dsaScore;
        dbmsSum += p.readinessScore.dbmsScore;
        osSum += p.readinessScore.osScore;
        cnSum += p.readinessScore.cnScore;
        oopSum += p.readinessScore.oopScore;
        aptSum += p.readinessScore.aptitudeScore;
        reasoningSum += p.readinessScore.reasoningScore;
        verbalSum += p.readinessScore.verbalScore;
        scoreRecordsCount += 1;
      }
    });

    const subjectAverages = scoreRecordsCount > 0 ? {
      DSA: parseFloat((dsaSum / scoreRecordsCount).toFixed(1)),
      DBMS: parseFloat((dbmsSum / scoreRecordsCount).toFixed(1)),
      OS: parseFloat((osSum / scoreRecordsCount).toFixed(1)),
      CN: parseFloat((cnSum / scoreRecordsCount).toFixed(1)),
      OOP: parseFloat((oopSum / scoreRecordsCount).toFixed(1)),
      Aptitude: parseFloat((aptSum / scoreRecordsCount).toFixed(1)),
      Reasoning: parseFloat((reasoningSum / scoreRecordsCount).toFixed(1)),
      Verbal: parseFloat((verbalSum / scoreRecordsCount).toFixed(1)),
    } : {
      DSA: 0, DBMS: 0, OS: 0, CN: 0, OOP: 0, Aptitude: 0, Reasoning: 0, Verbal: 0
    };

    return NextResponse.json({
      collegeName: college.name,
      collegeLocation: college.location,
      stats: {
        studentCount,
        averageReadiness,
        roleBreakdown,
        subjectAverages,
      },
      students: studentsList,
    });
  } catch (error) {
    console.error('Fetch college stats failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

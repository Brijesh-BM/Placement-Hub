import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await db.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        profile: {
          select: {
            id: true,
            branch: true,
            gradYear: true,
            cgpa: true,
            targetRole: true,
            skills: { select: { name: true } },
            college: { select: { id: true, name: true } },
            readinessScore: true,
          }
        }
      }
    });

    // Compute mock averages per student for recruiter dashboard
    const studentIds = students.map(s => s.id);
    const attempts = await db.attempt.findMany({
      where: {
        userId: { in: studentIds },
        status: 'SUBMITTED',
      },
      select: {
        userId: true,
        percentage: true,
      }
    });

    const studentMockAverages: { [userId: string]: { total: number; count: number } } = {};
    attempts.forEach(att => {
      if (!studentMockAverages[att.userId]) {
        studentMockAverages[att.userId] = { total: 0, count: 0 };
      }
      studentMockAverages[att.userId].total += att.percentage;
      studentMockAverages[att.userId].count += 1;
    });

    const candidates = students.map(student => {
      const mockAvgData = studentMockAverages[student.id];
      const mockAverage = mockAvgData && mockAvgData.count > 0
        ? parseFloat((mockAvgData.total / mockAvgData.count).toFixed(1))
        : null;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        branch: student.profile?.branch || null,
        gradYear: student.profile?.gradYear || null,
        cgpa: student.profile?.cgpa || null,
        targetRole: student.profile?.targetRole || null,
        collegeName: student.profile?.college?.name || 'N/A',
        collegeId: student.profile?.college?.id || null,
        skills: student.profile?.skills.map(s => s.name) || [],
        readinessScore: student.profile?.readinessScore?.overallScore ?? null,
        readinessDetails: student.profile?.readinessScore || null,
        mockAverage,
      };
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Fetch recruiter candidates failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

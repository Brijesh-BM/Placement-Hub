import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Get Recruiter details and check verification status
    const recruiterUser = await db.user.findUnique({
      where: { id: userPayload.userId }
    });
    
    const isVerifiedRecruiter = recruiterUser?.isVerified ?? false;

    // 2. Find students invited by this recruiter
    let invitedStudentIds = new Set<string>();
    if (isVerifiedRecruiter) {
      const invitations = await db.assessmentInvitation.findMany({
        where: {
          assessment: {
            job: {
              recruiterId: userPayload.userId
            }
          }
        },
        select: {
          studentId: true
        }
      });
      invitedStudentIds = new Set(invitations.map(i => i.studentId));
    }

    // 3. Fetch all students
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

      // Email Display Logic: Only show email if recruiter is verified AND has invited this student
      const canSeeEmail = isVerifiedRecruiter && invitedStudentIds.has(student.id);
      let emailDisplay = '***@***.com';
      if (canSeeEmail) {
        emailDisplay = student.email;
      } else if (student.email) {
        const parts = student.email.split('@');
        if (parts.length === 2) {
          const username = parts[0];
          const domain = parts[1];
          const maskedUser = username.length > 2 ? username.substring(0, 2) + '***' : '***';
          emailDisplay = `${maskedUser}@${domain}`;
        }
      }

      return {
        id: student.id,
        name: student.name,
        email: emailDisplay,
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

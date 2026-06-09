import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { recruiterInviteSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = recruiterInviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { studentId, jobId, testId } = validation.data;

    // 1. Verify student exists
    const student = await db.user.findFirst({
      where: { id: studentId, role: 'STUDENT' }
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 2. Find or create RecruiterAssessment
    let recruiterAssessment = await db.recruiterAssessment.findFirst({
      where: { jobId, testId }
    });

    if (!recruiterAssessment) {
      recruiterAssessment = await db.recruiterAssessment.create({
        data: { jobId, testId }
      });
    }

    // 3. Check if student is already invited to this assessment
    const existingInvitation = await db.assessmentInvitation.findFirst({
      where: {
        assessmentId: recruiterAssessment.id,
        studentId
      }
    });

    if (existingInvitation) {
      return NextResponse.json({ error: 'Student already invited to this assessment' }, { status: 400 });
    }

    const job = await db.recruiterJob.findUnique({
      where: { id: jobId }
    });
    const test = await db.test.findUnique({
      where: { id: testId }
    });

    // 4. Create Invitation & notification inside transaction
    const invitation = await db.$transaction(async (tx) => {
      const invite = await tx.assessmentInvitation.create({
        data: {
          assessmentId: recruiterAssessment!.id,
          studentId,
          status: 'INVITED'
        }
      });

      await tx.notification.create({
        data: {
          userId: studentId,
          title: 'Assessment Invite',
          message: `${job?.company || 'Recruiter'} invited you to complete "${test?.title || 'Assessment'}" for the "${job?.title || 'Open Role'}" role.`,
          type: 'INVITE'
        }
      });

      return invite;
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error('Invite failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

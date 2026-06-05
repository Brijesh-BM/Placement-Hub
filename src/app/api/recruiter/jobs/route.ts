import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const jobs = await db.recruiterJob.findMany({
      where: { recruiterId: userPayload.userId },
      include: {
        assessments: {
          include: {
            _count: {
              select: { invitations: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Fetch recruiter jobs failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload || userPayload.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      company,
      description,
      location,
      salary,
      jobType,
      applicationDeadline,
      requiredSkills,
      experienceLevel,
      collegeId,
      cgpaCutoff,
      readinessCutoff,
      testId // Optional: link an assessment test immediately
    } = body;

    if (!title || !company || !description || !location || !jobType || !requiredSkills || !experienceLevel) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const newJob = await db.$transaction(async (tx) => {
      const job = await tx.recruiterJob.create({
        data: {
          recruiterId: userPayload.userId,
          title,
          company,
          description,
          location,
          salary: salary || null,
          jobType,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          requiredSkills,
          experienceLevel,
          collegeId: collegeId || null,
          cgpaCutoff: cgpaCutoff ? parseFloat(cgpaCutoff) : null,
          readinessCutoff: readinessCutoff ? parseFloat(readinessCutoff) : null,
        }
      });

      if (testId) {
        await tx.recruiterAssessment.create({
          data: {
            jobId: job.id,
            testId: testId,
          }
        });
      }

      return job;
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (error: any) {
    console.error('Create recruiter job failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { TargetRole } from '@prisma/client';
import { onboardingSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = onboardingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { targetRole, academicStage, timeline, objective, targetCompanies, confidence } = validation.data;

    // 1. Fetch student profile
    const profile = await db.profile.findUnique({
      where: { userId: userPayload.userId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Map role text to TargetRole enum
    let dbTargetRole: TargetRole = TargetRole.SOFTWARE_ENGINEER;
    const formattedRole = targetRole.toUpperCase().replace(/\s+/g, '_');
    if (Object.values(TargetRole).includes(formattedRole as TargetRole)) {
      dbTargetRole = formattedRole as TargetRole;
    }

    // 3. Update Profile targetRole
    await db.profile.update({
      where: { id: profile.id },
      data: {
        targetRole: dbTargetRole
      }
    });

    // 4. Upsert/Update OnboardingProfile
    const onboarding = await db.onboardingProfile.upsert({
      where: { profileId: profile.id },
      update: {
        targetRole,
        academicStage,
        timeline,
        objective,
        targetCompanies: targetCompanies,
        confidenceAptitude: confidence.Aptitude || 5,
        confidenceReasoning: confidence.Reasoning || 5,
        confidenceVerbal: confidence.Verbal || 5,
        confidenceDsa: confidence.DSA || 5,
        confidenceDbms: confidence.DBMS || 5,
        confidenceOs: confidence['Operating Systems'] || confidence.OS || 5,
        confidenceCn: confidence['Computer Networks'] || confidence.CN || 5,
        confidenceOop: confidence.OOP || 5,
        confidenceSql: confidence.SQL || 5,
        confidenceCommunication: confidence.Communication || 5,
        completedOnboarding: true,
      },
      create: {
        profileId: profile.id,
        targetRole,
        academicStage,
        timeline,
        objective,
        targetCompanies: targetCompanies,
        confidenceAptitude: confidence.Aptitude || 5,
        confidenceReasoning: confidence.Reasoning || 5,
        confidenceVerbal: confidence.Verbal || 5,
        confidenceDsa: confidence.DSA || 5,
        confidenceDbms: confidence.DBMS || 5,
        confidenceOs: confidence['Operating Systems'] || confidence.OS || 5,
        confidenceCn: confidence['Computer Networks'] || confidence.CN || 5,
        confidenceOop: confidence.OOP || 5,
        confidenceSql: confidence.SQL || 5,
        confidenceCommunication: confidence.Communication || 5,
        completedOnboarding: true,
        completedBaselineAssessment: false,
      }
    });

    return NextResponse.json({ success: true, onboarding });
  } catch (error: any) {
    console.error('Onboarding submission API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

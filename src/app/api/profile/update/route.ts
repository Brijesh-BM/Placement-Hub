import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateReadinessScore } from '@/lib/readiness';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, collegeId, branch, gradYear, cgpa, linkedinUrl, githubUrl, skills, targetRole } = body;

    // 1. Update User name
    if (name) {
      await db.user.update({
        where: { id: userPayload.userId },
        data: { name },
      });
    }

    // 2. Resolve skill database IDs (upsert them so they exist)
    const skillIds: Array<{ id: string }> = [];
    if (Array.isArray(skills)) {
      for (const skillName of skills) {
        if (typeof skillName === 'string' && skillName.trim()) {
          const sName = skillName.trim();
          const dbSkill = await db.skill.upsert({
            where: { name: sName },
            update: {},
            create: { name: sName },
          });
          skillIds.push({ id: dbSkill.id });
        }
      }
    }

    // 3. Update Profile record and skill relations
    const updatedProfile = await db.profile.update({
      where: { userId: userPayload.userId },
      data: {
        collegeId: collegeId || null,
        branch: branch || null,
        gradYear: gradYear ? parseInt(gradYear, 10) : null,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        targetRole: targetRole || undefined,
        skills: {
          set: skillIds, // completely overwrites linked skills with the new list
        },
      },
      include: {
        skills: true,
      },
    });

    // 4. Trigger dynamic readiness recalculation
    await calculateReadinessScore(updatedProfile.id);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

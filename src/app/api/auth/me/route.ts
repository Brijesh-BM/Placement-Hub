import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete('placementhub_token');
      return response;
    }

    const user = await db.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: {
          select: {
            id: true,
            collegeId: true,
            college: { select: { id: true, name: true } },
            branch: true,
            gradYear: true,
            cgpa: true,
            targetRole: true,
            skills: { select: { id: true, name: true } },
            resumeUrl: true,
            resumeName: true,
            linkedinUrl: true,
            githubUrl: true,
            streak: true,
            readinessScore: true,
            onboardingProfile: true,
            badges: {
              select: {
                badge: {
                  select: { name: true, description: true, icon: true }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

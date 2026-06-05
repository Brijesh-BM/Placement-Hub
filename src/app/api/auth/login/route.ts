import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginUserSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, isGoogle, googleEmail, googleName } = body;

    // 1. Google OAuth Simulation
    if (isGoogle) {
      const gEmail = googleEmail || 'google-student@placementhub.com';
      const gName = googleName || 'Google Student';

      // Find or create the google user
      let user = await db.user.findUnique({
        where: { email: gEmail },
      });

      if (!user) {
        user = await db.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email: gEmail,
              name: gName,
              role: 'STUDENT',
            },
          });

          const dbCollege = await tx.college.upsert({
            where: { name: 'Google Mock College' },
            update: {},
            create: { name: 'Google Mock College' },
          });

          const newProfile = await tx.profile.create({
            data: {
              userId: u.id,
              collegeId: dbCollege.id,
              branch: 'Computer Science',
              gradYear: 2026,
            },
          });

          await tx.onboardingProfile.create({
            data: {
              profileId: newProfile.id,
              completedOnboarding: false,
              completedBaselineAssessment: false,
            }
          });

          return u;
        });
      }

      await loginUserSession({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    // 2. Standard Credentials Login
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    await loginUserSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during login.' },
      { status: 500 }
    );
  }
}

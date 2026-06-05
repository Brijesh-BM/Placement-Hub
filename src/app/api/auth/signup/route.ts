import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginUserSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name, college, branch, gradYear } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists.' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create user and profile in transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'STUDENT',
        },
      });

      let collegeId: string | null = null;
      if (college && typeof college === 'string' && college.trim()) {
        const cName = college.trim();
        const dbCollege = await tx.college.upsert({
          where: { name: cName },
          update: {},
          create: { name: cName },
        });
        collegeId = dbCollege.id;
      }

      const newProfile = await tx.profile.create({
        data: {
          userId: user.id,
          collegeId: collegeId,
          branch: branch || null,
          gradYear: gradYear ? parseInt(gradYear, 10) : null,
          skills: {
            // connect some default skills
          }
        },
      });

      await tx.onboardingProfile.create({
        data: {
          profileId: newProfile.id,
          completedOnboarding: false,
          completedBaselineAssessment: false,
        }
      });

      return user;
    });

    // Create session
    await loginUserSession({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during signup.' },
      { status: 500 }
    );
  }
}

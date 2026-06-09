import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginUserSession } from '@/lib/auth';
import { recruiterSignupSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = recruiterSignupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, companyName, website } = validation.data;

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

    // Create recruiter in database transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'RECRUITER',
          isVerified: false, // Recruiters are unverified by default and require admin approval
          emailVerified: false,
        },
      });

      // Upsert the company to ensure it exists on the platform
      await tx.company.upsert({
        where: { name: companyName.trim() },
        update: {},
        create: {
          name: companyName.trim(),
          hiringPattern: '# Hiring Pattern\nInformation will be updated by recruiter.',
          eligibilityCriteria: '# Eligibility Criteria\nInformation will be updated by recruiter.',
        },
      });

      return user;
    });

    // Create session (allow them to log in but their permissions are restricted by isVerified: false)
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
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error('Recruiter signup error:', error);
    return NextResponse.json(
      { error: 'Registration failed. An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

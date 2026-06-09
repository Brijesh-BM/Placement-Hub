import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyEmailSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Find token in db
    const dbToken = await db.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!dbToken) {
      return NextResponse.json(
        { error: 'Invalid verification token.' },
        { status: 400 }
      );
    }

    if (dbToken.expiresAt < new Date()) {
      // Clean up expired token
      await db.emailVerificationToken.delete({ where: { id: dbToken.id } });
      return NextResponse.json(
        { error: 'Verification token has expired.' },
        { status: 400 }
      );
    }

    // Verify user and delete the token
    await db.$transaction([
      db.user.update({
        where: { id: dbToken.userId },
        data: { emailVerified: true },
      }),
      db.emailVerificationToken.delete({
        where: { id: dbToken.id },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

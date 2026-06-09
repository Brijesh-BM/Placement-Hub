import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validation';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await db.user.findUnique({
      where: { email },
    });

    // To prevent user enumeration, we return success even if user doesn't exist
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiration

    // Delete any existing tokens for this user first
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Save token
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // For development verification, log the token to server console
    console.log(`[DEVELOPMENT] Password Reset Link: http://localhost:3000/reset-password?token=${token}`);

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

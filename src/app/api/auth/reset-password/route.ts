import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Find the token
    const dbToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!dbToken) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token.' },
        { status: 400 }
      );
    }

    if (dbToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { id: dbToken.id } });
      return NextResponse.json(
        { error: 'Password reset token has expired.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Update user password and delete reset tokens in transaction
    await db.$transaction([
      db.user.update({
        where: { id: dbToken.userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0, // unlock in case they were locked out
          lockedUntil: null,
        },
      }),
      db.passwordResetToken.deleteMany({
        where: { userId: dbToken.userId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully!',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

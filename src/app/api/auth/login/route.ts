import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginUserSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

// In-memory rate limiter: max 5 requests per IP address per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const now = Date.now();
    const limit = rateLimitMap.get(ip);
    
    if (limit) {
      if (now > limit.resetTime) {
        // Reset count for the new window
        rateLimitMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
      } else {
        if (limit.count >= 5) {
          return NextResponse.json(
            { error: 'Too many login attempts. Please try again after 15 minutes.' },
            { status: 429 }
          );
        }
        limit.count += 1;
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    }

    // 2. Validate Request Body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 3. Find User
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Brute Force Lockout Check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `This account is temporarily locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.` },
        { status: 403 }
      );
    }

    // 5. Verify Password
    if (!user.passwordHash) {
      // User created without password (e.g. invalid state or custom entry), block login
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    
    if (!isMatch) {
      // Increment failed attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const lockedUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
      
      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil,
        },
      });

      if (newFailedAttempts >= 5) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. Your account has been locked for 30 minutes.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 6. Reset Failed Login Count and Update Login Info
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // 7. Create Session
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
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}

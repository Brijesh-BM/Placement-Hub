import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing. Configure it in your environment/.env file.');
}
const secret = JWT_SECRET as string;
const COOKIE_NAME = 'placementhub_token';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'RECRUITER' | 'COLLEGE_ADMIN';
  name: string;
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, secret) as UserPayload;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function loginUserSession(user: { id: string; email: string; role: 'STUDENT' | 'ADMIN' | 'RECRUITER' | 'COLLEGE_ADMIN'; name: string }) {
  const payload: UserPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

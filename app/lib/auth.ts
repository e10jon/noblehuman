import bcrypt from 'bcryptjs';
import { parse, serialize } from 'cookie';
import type { User } from '../../prisma/generated/client';
import { prisma } from './db';

const SESSION_NAME = 'nh_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      data: {
        photos: [],
        urls: [],
        bio: '',
      },
    },
  });
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return user;
}

export function createSessionCookie(userId: string): string {
  return serialize(SESSION_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export function destroySessionCookie(): string {
  return serialize(SESSION_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function getUserFromCookie(cookieHeader: string | null): Promise<User | null> {
  if (!cookieHeader) {
    return null;
  }

  const cookies = parse(cookieHeader);
  const userId = cookies[SESSION_NAME];

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function requireUser(request: Request): Promise<User> {
  const cookieHeader = request.headers.get('Cookie');
  const user = await getUserFromCookie(cookieHeader);

  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return user;
}

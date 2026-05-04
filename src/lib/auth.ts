import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
import type { User, UserRole } from '@prisma/client';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fabrica-de-ideas-secret-key-2024'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });
  
  return user;
}

export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = await db.user.findUnique({
    where: { email },
  });
  
  if (!user || !user.isActive) return null;
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;
  
  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  await db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  
  return { user, token };
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  acceptedTerms?: boolean;
}): Promise<{ user: User; token: string }> {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });
  
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  const hashedPassword = await hashPassword(data.password);
  
  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'PARTICIPANT',
      acceptedTerms: data.acceptedTerms || false,
      acceptedTermsAt: data.acceptedTerms ? new Date() : null,
    },
  });
  
  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  return { user, token };
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 5,
    ORGANIZER: 4,
    EVALUATOR: 3,
    MODERATOR: 2,
    PARTICIPANT: 1,
  };
  
  return allowedRoles.some(role => (roleHierarchy[userRole] ?? 0) >= (roleHierarchy[role] ?? 0));
}

export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function isOrganizer(role: UserRole): boolean {
  return role === 'ORGANIZER' || role === 'ADMIN';
}

export function isModerator(role: UserRole): boolean {
  return role === 'MODERATOR' || role === 'ORGANIZER' || role === 'ADMIN';
}

export function isEvaluator(role: UserRole): boolean {
  return role === 'EVALUATOR' || role === 'ORGANIZER' || role === 'ADMIN';
}

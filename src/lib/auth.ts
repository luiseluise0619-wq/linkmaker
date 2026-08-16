import "server-only";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getAuthSecret } from "./secrets";

const COOKIE_NAME = "lm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

async function getSecret(): Promise<Uint8Array> {
  // Uses AUTH_SECRET when set, otherwise a DB-managed generated secret.
  return new TextEncoder().encode(await getAuthSecret());
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  isGuest: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    isGuest: user.isGuest,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(await getSecret());
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await createToken(user);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

/** Returns the session user or null. Verifies the JWT signature. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await getSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: (payload.email as string) ?? "",
      name: (payload.name as string) ?? null,
      isGuest: (payload.isGuest as boolean) ?? false,
    };
  } catch {
    return null;
  }
}

/** Server-side guard: returns the user or redirects to /login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Verify a session user still exists in the DB. Use in API routes where you
 * want to be sure the account was not deleted after the token was issued.
 */
export async function requireDbUser(): Promise<SessionUser | null> {
  const session = await getSessionUser();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, isGuest: true },
  });
  return user;
}

/**
 * Auto-provision a guest account (no password) and start a session for it, so
 * a visitor gets a full dashboard without signing up. They can later upgrade
 * the guest into a real account by setting an email + password.
 */
export async function createGuestUserAndSession(): Promise<SessionUser> {
  const suffix = randomUUID();
  const user = await prisma.user.create({
    data: {
      email: `guest_${suffix}@guest.local`,
      name: "Guest",
      passwordHash: "!disabled-guest!",
      isGuest: true,
    },
    select: { id: true, email: true, name: true, isGuest: true },
  });
  await createSession(user);
  return user;
}

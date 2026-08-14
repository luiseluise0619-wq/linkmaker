import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "lm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is not set or too short. Set a strong secret in your environment.",
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
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
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
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
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: (payload.email as string) ?? "",
      name: (payload.name as string) ?? null,
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
    select: { id: true, email: true, name: true },
  });
  return user;
}

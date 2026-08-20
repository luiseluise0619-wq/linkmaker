import "server-only";
import { randomBytes, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
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

function newToken(): string {
  return randomBytes(24).toString("base64url");
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

/** Server-side guard: returns the workspace, or sends visitors to the landing
 * page (there is no login — a workspace is created by shortening a link). */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/");
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
 * Auto-provision an anonymous workspace (no login) and start a session for it,
 * so a visitor gets a full dashboard immediately. The workspace is identified
 * by an unguessable dashboardToken — visiting /d/<token> reopens it anywhere.
 */
export async function createGuestUserAndSession(): Promise<
  SessionUser & { dashboardToken: string }
> {
  const suffix = randomUUID();
  const user = await prisma.user.create({
    data: {
      email: `ws_${suffix}@workspace.local`,
      name: "Workspace",
      passwordHash: "!disabled!",
      isGuest: true,
      dashboardToken: newToken(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      isGuest: true,
      dashboardToken: true,
    },
  });
  await createSession(user);
  return { ...user, dashboardToken: user.dashboardToken as string };
}

/** Get (or lazily create) the dashboard token for a workspace. */
export async function getDashboardToken(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { dashboardToken: true },
  });
  if (existing?.dashboardToken) return existing.dashboardToken;
  const token = newToken();
  await prisma.user.update({
    where: { id: userId },
    data: { dashboardToken: token },
  });
  return token;
}

/** Open a workspace from its dashboard token: verifies it and starts a
 * session. Returns true if the token was valid. */
export async function startSessionByToken(token: string): Promise<boolean> {
  if (!token) return false;
  const user = await prisma.user.findUnique({
    where: { dashboardToken: token },
    select: { id: true, email: true, name: true, isGuest: true },
  });
  if (!user) return false;
  await createSession(user);
  return true;
}

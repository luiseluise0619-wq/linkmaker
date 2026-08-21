// 이 앱은 "로그인"이 없다. 대신 링크를 만들면 익명 작업공간(workspace)이 자동 생성되고,
// 브라우저에는 "세션 쿠키"가 하나 심긴다. 이 파일은 그 세션(로그인 상태와 비슷한 것)을
// 만들고/읽고/지우는 일을 담당한다.
import "server-only"; // 이 파일은 서버에서만 실행되도록 강제(비밀값이 브라우저로 새지 않게)
import { randomBytes, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// jose: JWT(JSON Web Token)를 만들고 검증하는 라이브러리.
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import { getAuthSecret } from "./secrets";

const COOKIE_NAME = "lm_session"; // 세션 토큰을 담는 쿠키 이름
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 세션 유효기간: 30일

// JWT에 서명할 때 쓰는 비밀 키(문자열)를 바이트 배열로 변환해 반환.
// 이 비밀값을 모르면 남이 가짜 토큰을 만들 수 없다.
async function getSecret(): Promise<Uint8Array> {
  // AUTH_SECRET 환경변수가 있으면 그것을, 없으면 DB가 관리하는 생성값을 사용.
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

// 사용자 정보를 담아 "서명된" JWT 문자열을 만든다.
// JWT는 { 내용 + 서명 }으로 이뤄지는데, 서명은 비밀값으로만 만들 수 있어서
// 내용을 위조하면 서명 검증에서 걸린다. sub(subject)에는 사용자 id를 넣는다.
async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    isGuest: user.isGuest,
  })
    .setProtectedHeader({ alg: "HS256" }) // 서명 방식
    .setSubject(user.id)
    .setIssuedAt() // 발급 시각
    .setExpirationTime(`${MAX_AGE_SECONDS}s`) // 만료 시각
    .sign(await getSecret());
}

// 토큰을 만들어 브라우저 쿠키에 심는다(= 이 브라우저를 이 작업공간에 "로그인"시킴).
export async function createSession(user: SessionUser): Promise<void> {
  const token = await createToken(user);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true, // JS로 못 읽게(탈취 방지) — 서버만 사용
    secure: process.env.NODE_ENV === "production", // 운영에선 HTTPS에서만 전송
    sameSite: "lax", // 다른 사이트에서의 요청엔 쿠키를 제한(CSRF 완화)
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

/** 현재 브라우저의 세션 사용자 정보를 돌려준다(없거나 위조되면 null). JWT 서명을 검증한다. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null; // 쿠키 자체가 없음 → 비로그인
  try {
    // 서명 검증. 비밀값과 맞지 않으면(위조·변조) 예외가 나서 catch로 빠진다.
    const { payload } = await jwtVerify(token, await getSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: (payload.email as string) ?? "",
      name: (payload.name as string) ?? null,
      isGuest: (payload.isGuest as boolean) ?? false,
    };
  } catch {
    // 토큰이 위조/만료/손상됨 → 비로그인으로 취급.
    return null;
  }
}

/** 서버 측 보호막: 세션이 있으면 작업공간을 돌려주고, 없으면 랜딩(/)으로 보낸다.
 * (로그인이 없으므로, 작업공간은 링크를 줄일 때 자동으로 생긴다.) */
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
 * 익명 작업공간(로그인 없음)을 자동으로 하나 만들고 그 세션을 시작한다.
 * 그래서 방문자는 곧바로 완전한 대시보드를 갖게 된다. 작업공간은 추측 불가능한
 * dashboardToken으로 식별되며, /d/<token> 주소로 어디서든 다시 열 수 있다.
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

/** dashboardToken으로 작업공간을 연다: 토큰이 실제로 존재하는지 확인하고 세션을 시작.
 * 토큰이 유효하면 true를 반환한다(= 다른 기기에서도 이 토큰만 있으면 접속 가능). */
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

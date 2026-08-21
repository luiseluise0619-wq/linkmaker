// [미들웨어란?] 페이지가 실제로 실행되기 "전"에, 모든 요청이 먼저 거쳐 가는 관문이다.
// 여기서 아주 가벼운 검사만 한다.
import { NextRequest, NextResponse } from "next/server";

/**
 * 가벼운 관문(edge gate). 여기서는 세션 쿠키가 "있는지 없는지"만 본다. 이렇게 하면
 * 로그인 안 된 사람이 대시보드를 잠깐 봤다가 튕기는 깜빡임을 막을 수 있다.
 * 진짜 검증(쿠키 서명 확인, 이 데이터가 정말 내 것인지)은 서버(레이아웃/서버액션/라우트)
 * 에서 다시 한다. 그러니 이 관문만 믿으면 안 된다(보조 수단일 뿐).
 */
const COOKIE_NAME = "lm_session";

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has(COOKIE_NAME); // 세션 쿠키 존재 여부만 확인
  const { pathname } = req.nextUrl;

  // /dashboard로 시작하는 주소인데 세션이 없으면 → 랜딩(/)으로 보낸다.
  if (pathname.startsWith("/dashboard") && !hasSession) {
    // 로그인이 없는 앱이므로, 방문자를 랜딩으로 보내 작업공간을 만들게 한다.
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // 통과: 원래 가려던 페이지로 진행
}

// matcher = 이 미들웨어를 어떤 경로에만 적용할지. 여기선 /dashboard 이하에만 적용.
export const config = {
  matcher: ["/dashboard/:path*"],
};

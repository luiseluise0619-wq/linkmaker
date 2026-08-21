// 이 파일은 로그아웃(세션 종료) Server Action을 담는다.
// "use server" = 이 안의 함수들은 브라우저가 아니라 "서버"에서 실행되는
// Server Action이라는 표시. 보통 폼 제출이나 버튼 클릭 시 서버에서 처리된다.
"use server";

// redirect = 다른 페이지로 강제로 이동시키는 함수.
import { redirect } from "next/navigation";
// destroySession = 현재 로그인 세션을 없애는(쿠키 제거) 함수.
import { destroySession } from "@/lib/auth";

/**
 * There is no login in LinkMaker — every workspace is anonymous and reachable
 * via its dashboard link. "Sign out" simply clears the current session; the
 * workspace itself stays reachable through its saved dashboard link.
 */
// 로그아웃: 현재 세션(쿠키)을 지우고 홈("/")으로 이동한다.
// 이 앱은 로그인이 없으므로, 세션만 지워도 저장해 둔 대시보드 링크로 다시 들어올 수 있다.
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

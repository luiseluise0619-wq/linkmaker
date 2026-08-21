// "use server" = 이 파일의 함수들은 "서버 액션"이다. 화면(버튼/폼)에서 호출하지만
// 실제 실행은 서버에서 일어난다. 그래서 DB를 직접 다룰 수 있다.
// 이 파일은 설정(Settings) 화면의 위험한 동작들: 통계 초기화 / 전체 삭제 / 새 작업공간.
"use server";

// revalidatePath = 데이터가 바뀌었으니 해당 페이지의 캐시를 새로 고치라는 지시.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "./links";

/**
 * 현재 작업공간의 모든 통계를 초기화한다: 이 작업공간 링크들의 클릭 기록을 전부 삭제.
 * 링크 자체는 그대로 두고 숫자만 0으로 되돌린다(DB 용량도 확보).
 */
export async function resetMetricsAction(): Promise<ActionResult> {
  const user = await requireUser();
  const result = await prisma.linkEvent.deleteMany({
    where: { link: { userId: user.id } },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/links");
  return { ok: true, data: { deleted: result.count } };
}

/**
 * 현재 작업공간의 모든 링크를 삭제한다(연결된 클릭 기록·이미지도 함께 삭제됨).
 * DB 공간을 비운다. 되돌릴 수 없다.
 */
export async function deleteAllLinksAction(): Promise<ActionResult> {
  const user = await requireUser();
  const result = await prisma.link.deleteMany({ where: { userId: user.id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard/analytics");
  return { ok: true, data: { deleted: result.count } };
}

/**
 * 새 작업공간 시작: 현재 세션을 지운다. 그러면 다음에 링크를 만들 때 새 빈 작업공간이
 * 생긴다. 기존 작업공간은 저장해 둔 대시보드 링크(/d/토큰)로 여전히 다시 열 수 있다.
 */
export async function newWorkspaceAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

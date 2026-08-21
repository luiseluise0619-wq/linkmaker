// 이 파일은 "캠페인"(여러 링크를 묶는 그룹)을 만들고 지우는 Server Action 모음이다.
// "use server" = 아래 함수들은 서버에서 실행되는 Server Action(폼 제출 시 서버가 처리).
"use server";

// revalidatePath = 특정 페이지의 캐시(임시 저장 화면)를 새로고침해서, 변경된 내용이
// 바로 반영되게 한다. 데이터가 바뀐 뒤 목록 페이지를 최신으로 만들 때 쓴다.
import { revalidatePath } from "next/cache";
// Prisma = 데이터베이스를 코드로 다루게 해 주는 도구(ORM). ORM은 표(테이블)를 객체처럼
// 다루게 해 주는 기술이다. 여기서는 오류 종류를 구분하려고 Prisma 타입을 가져온다.
import { Prisma } from "@prisma/client";
// requireUser = 현재 사용자를 확인하고, 없으면 접근을 막는(로그인 요구) 함수.
import { requireUser } from "@/lib/auth";
// prisma = 데이터베이스에 실제로 질의(조회/저장/삭제)를 보내는 연결 객체.
import { prisma } from "@/lib/prisma";
import { createCampaignSchema } from "@/lib/validations";
// ActionResult = 액션의 결과 모양({ ok, error, data }). links.ts에서 정의한 타입 재사용.
import type { ActionResult } from "./links";

// 새 캠페인 만들기. 폼 데이터(name, description)를 받아 검사한 뒤 DB에 저장한다.
// _prev(이전 상태)는 폼 상태 관리를 위해 넘어오지만 여기선 사용하지 않는다(밑줄 _ 로 표시).
export async function createCampaignAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createCampaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }
  try {
    await prisma.campaign.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });
    revalidatePath("/dashboard/campaigns");
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "You already have a campaign with that name." };
    }
    return { ok: false, error: "Could not create the campaign." };
  }
}

export async function deleteCampaignAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!campaign) return { ok: false, error: "Campaign not found." };
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}

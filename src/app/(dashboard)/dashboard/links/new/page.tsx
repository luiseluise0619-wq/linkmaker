// "새 링크 만들기" 페이지. 서버 컴포넌트(async): 먼저 로그인 확인(requireUser) 후,
// 이 작업공간의 캠페인 목록을 DB에서 가져와 폼(CreateLinkView)에 넘긴다.
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { getT } from "@/lib/i18n/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateLinkView } from "@/components/dashboard/create-link-view";

export const metadata: Metadata = { title: "Create link" };
export const dynamic = "force-dynamic";

export default async function NewLinkPage() {
  const t = getT();
  const user = await requireUser();
  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title={t("forms.newLinkTitle")}
        description={t("forms.newLinkDesc")}
      />
      <CreateLinkView
        campaigns={campaigns}
        storageEnabled={isStorageConfigured()}
      />
    </>
  );
}

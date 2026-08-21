import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getOwnedLinkBySlug } from "@/lib/links";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { getT } from "@/lib/i18n/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { LinkForm } from "@/components/dashboard/link-form";

export const metadata: Metadata = { title: "Edit link" };
export const dynamic = "force-dynamic";

// 링크 "수정" 페이지. 서버 컴포넌트(async). 주소의 slug로 링크를 찾되, 반드시 내 소유여야
// 한다(getOwnedLinkBySlug). 없거나 내 것이 아니면 notFound()로 404 처리.
// 찾은 링크의 현재 값들을 LinkForm에 initial로 넘겨 수정 폼을 채운다.
export default async function EditLinkPage({
  params,
}: {
  params: { slug: string };
}) {
  const t = getT();
  const user = await requireUser();
  const link = await getOwnedLinkBySlug(user.id, params.slug);
  if (!link) notFound();

  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title={t("forms.editLinkTitle")}
        description={t("forms.editLinkDesc")}
      />
      <div className="mx-auto max-w-2xl">
        <LinkForm
          mode="edit"
          campaigns={campaigns}
          storageEnabled={isStorageConfigured()}
          initial={{
            id: link.id,
            slug: link.slug,
            destinationUrl: link.destinationUrl,
            title: link.title,
            description: link.description,
            status: link.status,
            expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
            campaignId: link.campaignId,
            utmSource: link.utmSource,
            utmMedium: link.utmMedium,
            utmCampaign: link.utmCampaign,
            utmTerm: link.utmTerm,
            utmContent: link.utmContent,
            imageUrl: link.image?.url ?? null,
            imageAlt: link.image?.alt ?? null,
          }}
        />
      </div>
    </>
  );
}

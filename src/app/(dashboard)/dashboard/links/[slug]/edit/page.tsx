import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getOwnedLinkBySlug } from "@/lib/links";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { PageHeader } from "@/components/dashboard/page-header";
import { LinkForm } from "@/components/dashboard/link-form";

export const metadata: Metadata = { title: "Edit link" };
export const dynamic = "force-dynamic";

export default async function EditLinkPage({
  params,
}: {
  params: { slug: string };
}) {
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
        title="Edit link"
        description="Update the destination or details. Analytics are preserved."
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

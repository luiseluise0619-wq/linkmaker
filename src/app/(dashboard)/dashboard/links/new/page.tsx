import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateLinkView } from "@/components/dashboard/create-link-view";

export const metadata: Metadata = { title: "Create link" };
export const dynamic = "force-dynamic";

export default async function NewLinkPage() {
  const user = await requireUser();
  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Create a link"
        description="Generate a trackable short link, image link or QR code."
      />
      <CreateLinkView
        campaigns={campaigns}
        storageEnabled={isStorageConfigured()}
      />
    </>
  );
}

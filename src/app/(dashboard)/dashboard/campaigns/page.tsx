import Link from "next/link";
import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  CreateCampaignButton,
  DeleteCampaignButton,
} from "@/components/dashboard/campaign-manager";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await requireUser();
  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    include: { _count: { select: { links: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate clicks per campaign.
  const clickCounts = await prisma.linkEvent.groupBy({
    by: ["linkId"],
    where: { link: { userId: user.id, campaignId: { not: null } } },
    _count: { _all: true },
  });
  const linkToCampaign = await prisma.link.findMany({
    where: { userId: user.id, campaignId: { not: null } },
    select: { id: true, campaignId: true },
  });
  const campaignClicks = new Map<string, number>();
  const linkMap = new Map(linkToCampaign.map((l) => [l.id, l.campaignId]));
  for (const c of clickCounts) {
    const cid = linkMap.get(c.linkId);
    if (cid)
      campaignClicks.set(cid, (campaignClicks.get(cid) ?? 0) + c._count._all);
  }

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Group links and track combined performance."
        actions={<CreateCampaignButton />}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create a campaign to organize related links and measure them together."
          action={<CreateCampaignButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="min-w-0">
                  <CardTitle className="truncate">{c.name}</CardTitle>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </div>
                <DeleteCampaignButton id={c.id} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">
                    {formatNumber(c._count.links)} links
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatNumber(campaignClicks.get(c.id) ?? 0)} clicks
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {formatDate(c.createdAt)}</span>
                  <Link
                    href={`/dashboard/links?q=`}
                    className="font-medium text-primary hover:underline"
                  >
                    View links
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

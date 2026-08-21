import Link from "next/link";
import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
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

// 캠페인 목록 페이지. 서버 컴포넌트(async): 로그인 확인 후 이 작업공간의 캠페인들과
// 각 캠페인의 링크 수·클릭 수를 계산해 카드로 보여준다.
export default async function CampaignsPage() {
  const t = getT();
  const user = await requireUser();
  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    include: { _count: { select: { links: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 캠페인별 클릭수 합계 계산: 링크별 클릭수를 구한 뒤, 각 링크가 속한 캠페인끼리 더한다.
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
        title={t("forms.campaignsTitle")}
        description={t("forms.campaignsDesc")}
        actions={<CreateCampaignButton />}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={t("forms.noCampaignsTitle")}
          description={t("forms.noCampaignsDesc")}
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
                    {t("forms.linksCount", {
                      count: formatNumber(c._count.links),
                    })}
                  </Badge>
                  <span className="text-muted-foreground">
                    {t("forms.clicksCount", {
                      count: formatNumber(campaignClicks.get(c.id) ?? 0),
                    })}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("forms.createdOn", { date: formatDate(c.createdAt) })}
                  </span>
                  <Link
                    href={`/dashboard/links?q=`}
                    className="font-medium text-primary hover:underline"
                  >
                    {t("forms.viewLinks")}
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

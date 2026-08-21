// ============================================================================
// 파일 목적: 내가 만든 링크들을 표로 보여주는 목록 페이지(/dashboard/links)입니다.
//   - 검색어(q), 필터(활성/비활성/만료 등), 정렬, 페이지 번호를 URL(searchParams)로 받아
//     그 조건에 맞는 링크만 DB에서 골라 표로 보여주고, 아래에 페이지 이동 버튼을 그립니다.
//   - Server Component 입니다. (async 함수 -> 서버에서 실행되며 await로 DB를 직접 조회)
// ============================================================================
import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { Download, Link2, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT, type TranslateFn } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber, shortUrl } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { LinksToolbar } from "@/components/dashboard/links-toolbar";
import { LinkRowActions } from "@/components/dashboard/link-row-actions";
import { Pagination } from "@/components/dashboard/pagination";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Links" };
// 방문할 때마다 최신 데이터로 매번 새로 그리라는 설정(캐시하지 않음)
export const dynamic = "force-dynamic";

// 한 페이지에 보여줄 링크 개수 (페이지네이션 단위)
const PAGE_SIZE = 15;

// URL 물음표 뒤에서 받을 수 있는 값들의 타입. 모두 있을 수도 없을 수도 있어 ?를 붙임.
type SearchParams = {
  q?: string; // 검색어
  filter?: string; // 필터(all/active/disabled/expired/high/recent)
  sort?: string; // 정렬 기준
  page?: string; // 페이지 번호
};

// 링크 상태와 만료일을 보고 화면에 표시할 배지(라벨+색상)를 결정하는 도우미 함수.
function statusBadge(
  status: "ACTIVE" | "DISABLED",
  expiresAt: Date | null,
  t: TranslateFn,
): { label: string; variant: "success" | "secondary" | "warning" } {
  // 만료일이 있고 그 시각이 지금보다 이전(과거)이면 -> "만료됨"
  if (expiresAt && expiresAt.getTime() <= Date.now())
    return { label: t("links.statusExpired"), variant: "warning" };
  // 사용자가 꺼둔 링크이면 -> "비활성"
  if (status === "DISABLED")
    return { label: t("links.statusDisabled"), variant: "secondary" };
  // 위 두 경우가 아니면 -> "활성"(정상 작동 중)
  return { label: t("links.statusActive"), variant: "success" };
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser(); // 로그인 확인
  const t = getT(); // 현재 언어의 번역 함수
  // 페이지 번호를 숫자로 바꾸고, 최소 1 이상이 되도록 보정(잘못된 값 대비).
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const q = searchParams.q?.trim(); // 검색어 앞뒤 공백 제거
  const filter = searchParams.filter ?? "all"; // 필터 없으면 기본값 "all"
  const sort = searchParams.sort ?? "recent"; // 정렬 없으면 기본값 "recent"
  const now = new Date();

  // where: Prisma(DB 도구)에게 "이 조건에 맞는 링크만 찾아줘"라고 넘길 조건 객체.
  //   기본적으로 "내(userId) 링크만" 이라는 조건에서 시작합니다.
  const where: Prisma.LinkWhereInput = { userId: user.id };
  // 검색어가 있으면 슬러그/제목/도착 URL 중 하나라도 검색어를 포함하는 링크를 찾도록 조건 추가.
  //   mode: "insensitive" = 대소문자 구분 없이 검색.
  if (q) {
    where.OR = [
      { slug: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { destinationUrl: { contains: q, mode: "insensitive" } },
    ];
  }
  switch (filter) {
    case "active":
      where.status = "ACTIVE";
      where.AND = [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }];
      break;
    case "disabled":
      where.status = "DISABLED";
      break;
    case "expired":
      where.expiresAt = { lt: now };
      break;
    case "high":
      where.events = { some: {} };
      break;
    case "recent":
      where.createdAt = {
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };
      break;
  }

  let orderBy: Prisma.LinkOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "clicks" || filter === "high")
    orderBy = { events: { _count: "desc" } };

  const [total, links] = await Promise.all([
    prisma.link.count({ where }),
    prisma.link.findMany({
      where,
      include: { image: true, _count: { select: { events: true } } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pages = Math.ceil(total / PAGE_SIZE);
  const hasAnyLink = total > 0 || !!q || filter !== "all";

  function makeHref(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (filter !== "all") sp.set("filter", filter);
    if (sort !== "recent") sp.set("sort", sort);
    sp.set("page", String(p));
    return `/dashboard/links?${sp.toString()}`;
  }

  return (
    <>
      <PageHeader
        title={t("links.pageTitle")}
        description={t("links.pageDescription")}
        actions={
          <>
            {total > 0 && (
              <Button asChild variant="outline">
                <a href="/api/export/links" download>
                  <Download />
                  {t("links.exportCsv")}
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href="/dashboard/links/new">
                <Plus />
                {t("links.newLink")}
              </Link>
            </Button>
          </>
        }
      />

      {hasAnyLink && <LinksToolbar />}

      {links.length === 0 ? (
        q || filter !== "all" ? (
          <EmptyState
            icon={Link2}
            title={t("links.emptyNoMatchTitle")}
            description={t("links.emptyNoMatchDescription")}
          />
        ) : (
          <EmptyState
            icon={Link2}
            title={t("links.emptyTitle")}
            description={t("links.emptyDescription")}
            action={
              <Button asChild>
                <Link href="/dashboard/links/new">
                  <Plus />
                  {t("links.createLink")}
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("links.colLink")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("links.colDestination")}
                </TableHead>
                <TableHead className="text-right">
                  {t("links.colClicks")}
                </TableHead>
                <TableHead>{t("links.colStatus")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("links.colCreated")}
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const badge = statusBadge(link.status, link.expiresAt, t);
                const url = shortUrl(link.slug);
                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {link.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={link.image.url}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted">
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/links/${link.slug}`}
                            className="block truncate font-medium hover:underline"
                          >
                            {link.title || `/go/${link.slug}`}
                          </Link>
                          <span className="block truncate text-xs text-muted-foreground">
                            /go/{link.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[220px] md:table-cell">
                      <span
                        className="block truncate text-sm text-muted-foreground"
                        title={link.destinationUrl}
                      >
                        {link.destinationUrl}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(link._count.events)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {formatDate(link.createdAt)}
                    </TableCell>
                    <TableCell>
                      <LinkRowActions
                        id={link.id}
                        slug={link.slug}
                        shortUrl={url}
                        disabled={link.status === "DISABLED"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Pagination page={page} pages={pages} makeHref={makeHref} />
    </>
  );
}

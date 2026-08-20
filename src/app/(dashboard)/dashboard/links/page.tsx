import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { Download, Link2, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
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
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

type SearchParams = {
  q?: string;
  filter?: string;
  sort?: string;
  page?: string;
};

function statusBadge(
  status: "ACTIVE" | "DISABLED",
  expiresAt: Date | null,
): { label: string; variant: "success" | "secondary" | "warning" } {
  if (expiresAt && expiresAt.getTime() <= Date.now())
    return { label: "Expired", variant: "warning" };
  if (status === "DISABLED") return { label: "Disabled", variant: "secondary" };
  return { label: "Active", variant: "success" };
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const q = searchParams.q?.trim();
  const filter = searchParams.filter ?? "all";
  const sort = searchParams.sort ?? "recent";
  const now = new Date();

  const where: Prisma.LinkWhereInput = { userId: user.id };
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
        title="Links"
        description="Manage your short links, image links and QR codes."
        actions={
          <>
            {total > 0 && (
              <Button asChild variant="outline">
                <a href="/api/export/links" download>
                  <Download />
                  Export CSV
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href="/dashboard/links/new">
                <Plus />
                New link
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
            title="No matching links"
            description="Try adjusting your search or filters."
          />
        ) : (
          <EmptyState
            icon={Link2}
            title="No links yet"
            description="Create your first trackable short link to get started."
            action={
              <Button asChild>
                <Link href="/dashboard/links/new">
                  <Plus />
                  Create link
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
                <TableHead>Link</TableHead>
                <TableHead className="hidden md:table-cell">
                  Destination
                </TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const badge = statusBadge(link.status, link.expiresAt);
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

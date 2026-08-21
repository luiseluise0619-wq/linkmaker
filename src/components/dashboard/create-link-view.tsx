// "새 링크 만들기" 화면 전체. 두 가지 모습을 상태(created)로 전환한다:
//  - created가 없으면: 링크 입력 폼(LinkForm)을 보여준다.
//  - created가 있으면: 방금 만든 링크의 짧은 주소 + 복사/열기/QR/수정/분석 버튼을 보여준다.
// 클라이언트 컴포넌트: 폼 제출 후 결과를 화면에서 바로 바꿔 보여줘야 하므로.
"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, ExternalLink, Pencil, Plus, QrCode } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";
import { CopyButton } from "@/components/copy-button";
import { QrDialog } from "@/components/qr-dialog";
import { LinkForm } from "@/components/dashboard/link-form";

interface Campaign {
  id: string;
  name: string;
}

export function CreateLinkView({
  campaigns,
  storageEnabled,
}: {
  campaigns: Campaign[];
  storageEnabled: boolean;
}) {
  const t = useT();
  const [created, setCreated] = React.useState<{
    id: string;
    slug: string;
    shortUrl: string;
  } | null>(null);

  if (created) {
    // Use the server-computed absolute URL (correct even when the app URL is
    // only known server-side, e.g. on Vercel without NEXT_PUBLIC_APP_URL).
    const url = created.shortUrl;
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{t("dash.shortLinkReady")}</CardTitle>
          <CardDescription>
            {t("dash.shortLinkReadyDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <code className="flex-1 truncate text-sm">{url}</code>
            <CopyButton value={url} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={url} label={t("dash.copy")} />
            <Button asChild variant="outline">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                {t("dash.open")}
              </a>
            </Button>
            <QrDialog
              linkId={created.id}
              shortUrl={url}
              trigger={
                <Button variant="outline">
                  <QrCode />
                  {t("dash.qrCode")}
                </Button>
              }
            />
            <Button asChild variant="outline">
              <Link href={`/dashboard/links/${created.slug}/edit`}>
                <Pencil />
                {t("dash.edit")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/links/${created.slug}`}>
                <BarChart3 />
                {t("dash.analyticsTitle")}
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setCreated(null)} variant="secondary">
              <Plus />
              {t("dash.createAnother")}
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/links">{t("dash.goToLinks")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <LinkForm
        mode="create"
        campaigns={campaigns}
        storageEnabled={storageEnabled}
        onCreated={setCreated}
      />
    </div>
  );
}

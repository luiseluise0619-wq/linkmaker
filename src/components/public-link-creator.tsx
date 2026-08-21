// 랜딩 페이지의 핵심: 링크를 입력받아 짧게 만들어 주는 카드.
// 두 가지 모습을 상태(state)로 전환한다:
//  - 아직 안 만들었으면: URL 입력 폼(+선택: 커스텀 슬러그)을 보여준다.
//  - 성공하면: 짧은 링크 / 대시보드 링크 / QR / 통계 링크를 보여준다.
// 만드는 동안 CreatingOverlay가 "생성 중..." 반투명 막을 덮는다.
// 클라이언트 컴포넌트: 폼 제출 상태와 결과 화면 전환을 브라우저에서 처리.
"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Info,
  LayoutDashboard,
  Loader2,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/copy-button";
import {
  createPublicLinkAction,
  type PublicLinkState,
} from "@/lib/actions/public";
import { useT } from "@/lib/i18n/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          {t("landing.creatorCreating")}
        </>
      ) : (
        <>
          {t("landing.creatorShorten")}
          <ArrowRight />
        </>
      )}
    </Button>
  );
}

/** Full-card overlay shown while the link + dashboard are being created. */
function CreatingOverlay() {
  const { pending } = useFormStatus();
  const t = useT();
  if (!pending) return null;
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm font-medium">{t("landing.creatorOverlay")}</p>
    </div>
  );
}

export function PublicLinkCreator() {
  const t = useT();
  const [state, formAction] = useFormState<PublicLinkState, FormData>(
    createPublicLinkAction,
    { ok: false },
  );
  const [showSlug, setShowSlug] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);

  if (state.ok && state.data) {
    const { shortUrl, manageUrl, dashboardUrl, slug } = state.data;
    return (
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("landing.creatorShortLinkLabel")}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <code className="flex-1 truncate text-sm">{shortUrl}</code>
              <CopyButton value={shortUrl} />
            </div>
          </div>

          {/* The dashboard link — the way back to this workspace on any device. */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              {t("landing.creatorDashboardLabel")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("landing.creatorDashboardNote")}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-md border bg-background p-2">
              <code className="flex-1 truncate text-xs">{dashboardUrl}</code>
              <CopyButton value={dashboardUrl} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard">
                <LayoutDashboard />
                {t("landing.creatorOpenDashboard")}
              </Link>
            </Button>
            <CopyButton value={shortUrl} label={t("landing.creatorCopyLink")} />
            <Button asChild variant="outline">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                {t("landing.creatorOpen")}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`/api/qr/${slug}?download=1`} download>
                {t("landing.creatorDownloadQr")}
              </a>
            </Button>
          </div>

          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${slug}`}
              alt={t("landing.creatorQrAlt")}
              width={160}
              height={160}
              className="rounded-lg border bg-white p-2"
            />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-muted-foreground" />
              {t("landing.creatorStatsLabel")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("landing.creatorStatsNote")}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-md border bg-background p-2">
              <code className="flex-1 truncate text-xs">{manageUrl}</code>
              <CopyButton value={manageUrl} />
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="secondary"
              onClick={() => setResetKey((k) => k + 1)}
            >
              <Plus />
              {t("landing.creatorCreateAnother")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={resetKey} className="relative">
      <CardContent className="p-6">
        <form action={formAction} className="space-y-3">
          <CreatingOverlay />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="destinationUrl"
              type="url"
              inputMode="url"
              required
              placeholder={t("landing.creatorPlaceholder")}
              className="h-11 flex-1 text-base"
              aria-label={t("landing.creatorDestinationAria")}
            />
            <SubmitButton />
          </div>

          {showSlug ? (
            <div className="space-y-1.5">
              <Label htmlFor="pub-slug" className="text-xs text-muted-foreground">
                {t("landing.creatorCustomLabel")}
              </Label>
              <div className="flex items-center gap-2">
                <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
                  /go/
                </span>
                <Input
                  id="pub-slug"
                  name="slug"
                  placeholder={t("landing.creatorSlugPlaceholder")}
                  pattern="[a-zA-Z0-9_-]+"
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSlug(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {t("landing.creatorCustomizeToggle")}
            </button>
          )}

          {state.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {t("landing.creatorReassurance")}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

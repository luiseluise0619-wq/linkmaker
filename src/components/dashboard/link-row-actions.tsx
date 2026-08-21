// 링크 목록에서 각 줄 오른쪽의 "⋯"(더보기) 버튼과 그 메뉴.
// 메뉴 항목: 분석 보기 / 수정 / URL 복사 / QR / 새 탭에서 열기 / 사용중지·재개 / 삭제.
// 삭제는 실수 방지를 위해 확인 창을 한 번 더 띄운다.
// 클라이언트 컴포넌트: 메뉴·다이얼로그 열림 상태, 진행중 표시, 토스트 알림을 다룬다.
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Power,
  QrCode,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/client";
import { deleteLinkAction, setStatusAction } from "@/lib/actions/links";

interface Props {
  id: string;
  slug: string;
  shortUrl: string;
  disabled: boolean;
}

export function LinkRowActions({ id, slug, shortUrl, disabled }: Props) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [qrOpen, setQrOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast(t("links.toastCopied"), "success");
    } catch {
      toast(t("links.toastCopyError"), "error");
    }
  }

  // 링크를 켜고/끄기(활성 ↔ 비활성). 끄면 그 링크를 열려는 사람은 안내 페이지로 감.
  async function toggleStatus() {
    setPending(true);
    const res = await setStatusAction(id, !disabled);
    setPending(false);
    if (res.ok) {
      toast(
        disabled ? t("links.toastEnabled") : t("links.toastDisabled"),
        "success",
      );
      router.refresh();
    } else {
      toast(res.error ?? t("links.toastUpdateError"), "error");
    }
  }

  async function remove() {
    setPending(true);
    const res = await deleteLinkAction(id);
    setPending(false);
    setConfirmOpen(false);
    if (res.ok) {
      toast(t("links.toastDeleted"), "success");
      router.refresh();
    } else {
      toast(res.error ?? t("links.toastDeleteError"), "error");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("links.actionsAria")}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => router.push(`/dashboard/links/${slug}`)}>
            <BarChart3 />
            {t("links.actionAnalytics")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => router.push(`/dashboard/links/${slug}/edit`)}
          >
            <Pencil />
            {t("links.actionEdit")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copy}>
            <Copy />
            {t("links.actionCopyUrl")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setQrOpen(true)}>
            <QrCode />
            {t("links.actionQrCode")}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              {t("links.actionOpen")}
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={toggleStatus} disabled={pending}>
            <Power />
            {disabled ? t("links.actionEnable") : t("links.actionDisable")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            {t("links.actionDelete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden QR dialog controlled from the menu */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("links.qrTitle")}</DialogTitle>
            <DialogDescription>
              {t("links.qrDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/links/${id}/qr`}
              alt={t("links.qrAlt")}
              width={220}
              height={220}
              className="rounded-lg border bg-white p-2"
            />
            <div className="flex w-full gap-2">
              <Button asChild variant="outline" className="flex-1">
                <a href={`/api/links/${id}/qr?download=1`} download>
                  {t("links.downloadPng")}
                </a>
              </Button>
              <Button variant="outline" className="flex-1" onClick={copy}>
                {t("links.actionCopyUrl")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("links.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("links.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              {t("links.cancel")}
            </Button>
            <Button variant="destructive" onClick={remove} disabled={pending}>
              {pending ? t("links.deleting") : t("links.deleteConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

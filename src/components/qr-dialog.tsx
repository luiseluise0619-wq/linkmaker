"use client";

import * as React from "react";
import { Download, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { useT } from "@/lib/i18n/client";

interface QrDialogProps {
  linkId: string;
  shortUrl: string;
  trigger?: React.ReactNode;
}

export function QrDialog({ linkId, shortUrl, trigger }: QrDialogProps) {
  const t = useT();
  const qrSrc = `/api/links/${linkId}/qr`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="icon" aria-label={t("misc.qrCode")}>
            <QrCode />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("misc.qrCode")}</DialogTitle>
          <DialogDescription>{t("misc.qrDescription")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt={t("misc.qrCode")}
            width={220}
            height={220}
            className="rounded-lg border bg-white p-2"
          />
          <p className="break-all text-center text-xs text-muted-foreground">
            {shortUrl}
          </p>
          <div className="flex w-full gap-2">
            <Button asChild variant="outline" className="flex-1">
              <a href={`${qrSrc}?download=1`} download>
                <Download />
                PNG
              </a>
            </Button>
            <CopyButton
              value={shortUrl}
              label={t("misc.copyUrl")}
              className="flex-1"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

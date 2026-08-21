"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/client";
import { resetMetricsAction } from "@/lib/actions/workspace";

export function ResetMetricsButton() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function reset() {
    setPending(true);
    const res = await resetMetricsAction();
    setPending(false);
    setOpen(false);
    if (res.ok) {
      const n = (res.data as { deleted: number } | undefined)?.deleted ?? 0;
      toast(t("forms.toastAnalyticsReset", { count: n }), "success");
      router.refresh();
    } else {
      toast(res.error ?? t("forms.toastAnalyticsResetError"), "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RotateCcw />
          {t("forms.resetAllAnalytics")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("forms.resetAnalyticsTitle")}</DialogTitle>
          <DialogDescription>
            {t("forms.resetAnalyticsDesc")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            {t("forms.cancel")}
          </Button>
          <Button variant="destructive" onClick={reset} disabled={pending}>
            {pending ? t("forms.resetting") : t("forms.resetAnalytics")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
import { deleteAllLinksAction } from "@/lib/actions/workspace";

export function DeleteAllLinksButton() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function run() {
    setPending(true);
    const res = await deleteAllLinksAction();
    setPending(false);
    setOpen(false);
    if (res.ok) {
      const n = (res.data as { deleted: number } | undefined)?.deleted ?? 0;
      toast(t("forms.toastLinksDeleted", { count: n }), "success");
      router.refresh();
    } else {
      toast(res.error ?? t("forms.toastLinksDeleteError"), "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
          {t("forms.deleteAllLinks")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("forms.deleteAllLinksTitle")}</DialogTitle>
          <DialogDescription>
            {t("forms.deleteAllLinksDesc")}
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
          <Button variant="destructive" onClick={run} disabled={pending}>
            {pending ? t("forms.deleting") : t("forms.deleteEverything")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

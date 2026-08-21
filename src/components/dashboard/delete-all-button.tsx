// 설정 화면의 "모든 링크 삭제" 위험 버튼. 실수 방지를 위해 먼저 확인 창(다이얼로그)을
// 띄우고, 확인해야 서버 액션(deleteAllLinksAction)을 호출한다.
// 클라이언트 컴포넌트: 창 열림·진행중 상태, 결과 토스트, 화면 새로고침을 다룬다.
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

  // 확인 버튼을 눌렀을 때: 서버에 삭제 요청 → 결과에 따라 토스트로 알리고 화면 갱신.
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

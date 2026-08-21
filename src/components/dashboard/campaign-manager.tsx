// 캠페인(링크 묶음)을 "만들기" 버튼과 "삭제" 버튼 두 컴포넌트.
// 둘 다 확인 팝업을 띄운 뒤 서버 액션을 호출하고, 결과를 토스트로 알린다.
// 클라이언트 컴포넌트: 팝업 열림 상태와 폼 제출 상태를 다룬다.
"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/client";
import {
  createCampaignAction,
  deleteCampaignAction,
} from "@/lib/actions/campaigns";
import type { ActionResult } from "@/lib/actions/links";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("forms.creating") : t("forms.createCampaign")}
    </Button>
  );
}

export function CreateCampaignButton() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useFormState<ActionResult, FormData>(
    createCampaignAction,
    { ok: false },
  );

  React.useEffect(() => {
    if (state.ok) {
      toast(t("forms.toastCampaignCreated"), "success");
      setOpen(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("forms.newCampaign")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("forms.createCampaign")}</DialogTitle>
          <DialogDescription>
            {t("forms.createCampaignDesc")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("forms.nameLabel")}</Label>
            <Input id="name" name="name" placeholder="Summer 2026" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("forms.descriptionLabel")}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t("forms.optionalPlaceholder")}
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCampaignButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function remove() {
    setPending(true);
    const res = await deleteCampaignAction(id);
    setPending(false);
    setOpen(false);
    if (res.ok) {
      toast(t("forms.toastCampaignDeleted"), "success");
      router.refresh();
    } else {
      toast(res.error ?? t("forms.toastCampaignDeleteError"), "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("forms.deleteCampaignAria")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("forms.deleteCampaignTitle")}</DialogTitle>
          <DialogDescription>
            {t("forms.deleteCampaignDesc")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("forms.cancel")}
          </Button>
          <Button variant="destructive" onClick={remove} disabled={pending}>
            {pending ? t("forms.deleting") : t("forms.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

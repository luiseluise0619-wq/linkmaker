// 링크 "만들기/수정" 폼. 목적지 URL, 슬러그, 제목/설명, 캠페인, 만료일, 이미지, UTM,
// 상태(활성/비활성)를 한 화면에서 입력한다. 클라이언트 컴포넌트(입력·미리보기·토글이 많음).
//
// [핵심 개념]
// - useFormState: 폼을 제출하면 서버 액션을 호출하고, 그 결과(state)를 돌려받는다.
// - useFormStatus: 지금 제출이 진행 중인지(pending) 알려줘 버튼을 "저장 중..."으로 바꾼다.
// - 만료일은 사용자에겐 "내 지역 시간"으로 보여주되, 서버엔 UTC로 보내 시차 혼동을 막는다.
"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ChevronDown,
  ImageIcon,
  Trash2,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n/client";
import {
  createLinkAction,
  updateLinkAction,
  removeImageAction,
  type ActionResult,
} from "@/lib/actions/links";
import { cn } from "@/lib/utils";

/** DB에 저장된 UTC 시각(ISO 문자열)을, 화면의 날짜/시간 입력칸(datetime-local)이
 * 이해하는 "사용자 지역 시간" 문자열(YYYY-MM-DDTHH:mm)로 바꾼다.
 * getTimezoneOffset()으로 지역 시차를 빼서 지역 벽시계 값을 만든다. */
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export interface LinkFormData {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string | null;
  description: string | null;
  status: "ACTIVE" | "DISABLED";
  expiresAt: string | null;
  campaignId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

interface Campaign {
  id: string;
  name: string;
}

interface LinkFormProps {
  mode: "create" | "edit";
  campaigns: Campaign[];
  storageEnabled: boolean;
  initial?: LinkFormData;
  onCreated?: (data: { id: string; slug: string; shortUrl: string }) => void;
}

// 제출 버튼만 따로 컴포넌트로 뺀 이유: useFormStatus()는 <form> 안에서만 동작해서,
// 폼 내부의 이 버튼이 "제출 중"인지 스스로 알 수 있다.
function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? t("forms.saving")
        : mode === "create"
          ? t("forms.createLink")
          : t("forms.saveChanges")}
    </Button>
  );
}

export function LinkForm({
  mode,
  campaigns,
  storageEnabled,
  initial,
  onCreated,
}: LinkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  // 만들기 모드면 생성 액션, 수정 모드면 수정 액션을 쓴다.
  // formAction을 <form action={...}>에 연결하면 제출 시 서버에서 그 함수가 실행되고,
  // 결과가 state로 들어온다(초기값은 { ok: false }).
  const action = mode === "create" ? createLinkAction : updateLinkAction;
  const [state, formAction] = useFormState<ActionResult, FormData>(action, {
    ok: false,
  });

  // Expiration is edited in the user's local time via a datetime-local input,
  // but stored/submitted as an absolute UTC instant. We convert the stored UTC
  // value to a local wall-clock string for display, and submit an unambiguous
  // ISO instant (with offset) via a hidden field, so the expiry never drifts.
  // Initialize with the deterministic UTC slice so server and client render
  // identically (no hydration mismatch), then convert to the viewer's local
  // time after mount.
  const [expiresLocal, setExpiresLocal] = React.useState(
    initial?.expiresAt ? initial.expiresAt.slice(0, 16) : "",
  );
  React.useEffect(() => {
    if (initial?.expiresAt) setExpiresLocal(toLocalInputValue(initial.expiresAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showUtm, setShowUtm] = React.useState(
    !!(
      initial?.utmSource ||
      initial?.utmMedium ||
      initial?.utmCampaign ||
      initial?.utmTerm ||
      initial?.utmContent
    ),
  );
  const [disabled, setDisabled] = React.useState(
    initial?.status === "DISABLED",
  );
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const [hasStoredImage, setHasStoredImage] = React.useState(
    !!initial?.imageUrl,
  );
  const fileRef = React.useRef<HTMLInputElement>(null);

  const slugChanged = mode === "edit" && slug !== initial?.slug;

  // 제출 결과(state)가 바뀔 때마다 실행: 성공/실패에 따라 토스트를 띄우고 화면을 이동/갱신.
  React.useEffect(() => {
    if (!state.ok) return;
    if (mode === "create") {
      const data = state.data as
        | { id: string; slug: string; shortUrl: string }
        | undefined;
      if (data) {
        // On success `state.error` (if present) is a non-fatal warning.
        if (state.error) toast(state.error, "error");
        else toast(t("forms.toastLinkCreated"), "success");
        onCreated?.(data);
      }
    } else {
      if (state.error) toast(state.error, "error");
      else toast(t("forms.toastChangesSaved"), "success");
      const data = state.data as { slug: string } | undefined;
      if (data) router.push(`/dashboard/links/${data.slug}`);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setHasStoredImage(false);
    }
  }

  async function onRemoveImage() {
    if (mode === "edit" && initial?.id && hasStoredImage) {
      const res = await removeImageAction(initial.id);
      if (!res.ok) {
        toast(res.error ?? t("forms.toastImageRemoveError"), "error");
        return;
      }
      toast(t("forms.toastImageRemoved"), "success");
    }
    setImagePreview(null);
    setHasStoredImage(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && initial && (
        <input type="hidden" name="id" value={initial.id} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("forms.destinationSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destinationUrl">
              {t("forms.destinationLabel")} *
            </Label>
            <Input
              id="destinationUrl"
              name="destinationUrl"
              type="url"
              inputMode="url"
              placeholder="https://example.com/page"
              defaultValue={initial?.destinationUrl}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("forms.destinationHelp")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t("forms.slugLabel")}</Label>
            <div className="flex items-center gap-2">
              <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
                /go/
              </span>
              <Input
                id="slug"
                name="slug"
                placeholder={t("forms.slugPlaceholder")}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                pattern="[a-zA-Z0-9_-]+"
              />
            </div>
            {slugChanged && (
              <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {t("forms.slugChangeWarning")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("forms.detailsSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("forms.titleLabel")}</Label>
            <Input
              id="title"
              name="title"
              placeholder="Summer campaign"
              defaultValue={initial?.title ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("forms.descriptionLabel")}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t("forms.descriptionPlaceholder")}
              defaultValue={initial?.description ?? ""}
            />
          </div>

          {campaigns.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="campaignId">{t("forms.campaignLabel")}</Label>
              <select
                id="campaignId"
                name="campaignId"
                defaultValue={initial?.campaignId ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t("forms.noCampaign")}</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expiresAt">{t("forms.expirationLabel")}</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresLocal}
              onChange={(e) => setExpiresLocal(e.target.value)}
            />
            {/* Submit an unambiguous UTC instant, not the local wall-clock. */}
            <input
              type="hidden"
              name="expiresAt"
              value={
                expiresLocal ? new Date(expiresLocal).toISOString() : ""
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("forms.imageSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!storageEnabled && (
            <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {t("forms.imageUploadsDisabledPre")}{" "}
              <code>BLOB_READ_WRITE_TOKEN</code>{" "}
              {t("forms.imageUploadsDisabledPost")}
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt={t("forms.imagePreviewAlt")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                ref={fileRef}
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={!storageEnabled}
                onChange={onFileChange}
              />
              <Input
                name="imageAlt"
                placeholder={t("forms.imageAltPlaceholder")}
                defaultValue={initial?.imageAlt ?? ""}
                disabled={!storageEnabled}
              />
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveImage}
                >
                  <Trash2 />
                  {t("forms.removeImage")}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                {t("forms.imageFormatsHelp")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <button
            type="button"
            onClick={() => setShowUtm((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <CardTitle>{t("forms.utmSection")}</CardTitle>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showUtm && "rotate-180",
              )}
            />
          </button>
        </CardHeader>
        {showUtm && (
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["utmSource", t("forms.utmSource"), "google"],
                ["utmMedium", t("forms.utmMedium"), "cpc"],
                ["utmCampaign", t("forms.utmCampaign"), "summer_sale"],
                ["utmTerm", t("forms.utmTerm"), "running+shoes"],
                ["utmContent", t("forms.utmContent"), "logolink"],
              ] as const
            ).map(([name, label, ph]) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  placeholder={ph}
                  defaultValue={
                    (initial?.[name as keyof LinkFormData] as string) ?? ""
                  }
                />
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {mode === "edit" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("forms.statusSection")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {disabled ? t("forms.statusDisabled") : t("forms.statusActive")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {disabled
                    ? t("forms.statusDisabledDesc")
                    : t("forms.statusActiveDesc")}
                </p>
              </div>
              <Switch
                checked={!disabled}
                onCheckedChange={(v) => setDisabled(!v)}
              />
            </div>
            <input
              type="hidden"
              name="status"
              value={disabled ? "DISABLED" : "ACTIVE"}
            />
          </CardContent>
        </Card>
      )}

      {!state.ok && state.error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <SubmitButton mode={mode} />
        <Button asChild variant="ghost" type="button">
          <Link href={mode === "edit" && initial ? `/dashboard/links/${initial.slug}` : "/dashboard/links"}>
            <X />
            {t("forms.cancel")}
          </Link>
        </Button>
      </div>
    </form>
  );
}

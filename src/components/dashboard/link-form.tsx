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

/** Convert a stored UTC ISO instant to a `datetime-local` value in the
 * viewer's local timezone (YYYY-MM-DDTHH:mm). */
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

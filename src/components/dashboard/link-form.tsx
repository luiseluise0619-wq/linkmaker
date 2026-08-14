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
import {
  createLinkAction,
  updateLinkAction,
  removeImageAction,
  type ActionResult,
} from "@/lib/actions/links";
import { appUrl, cn } from "@/lib/utils";

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
  onCreated?: (data: { id: string; slug: string }) => void;
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Saving…"
        : mode === "create"
          ? "Create link"
          : "Save changes"}
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
  const action = mode === "create" ? createLinkAction : updateLinkAction;
  const [state, formAction] = useFormState<ActionResult, FormData>(action, {
    ok: false,
  });

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
      const data = state.data as { id: string; slug: string } | undefined;
      if (data) {
        toast("Link created", "success");
        onCreated?.(data);
      }
    } else {
      toast("Changes saved", "success");
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
        toast(res.error ?? "Could not remove image", "error");
        return;
      }
      toast("Image removed", "success");
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
          <CardTitle>Destination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destinationUrl">Destination URL *</Label>
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
              Where visitors are sent. You can change this later without
              changing the short link.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Custom slug (optional)</Label>
            <div className="flex items-center gap-2">
              <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
                {appUrl()}/go/
              </span>
              <Input
                id="slug"
                name="slug"
                placeholder="auto-generated"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                pattern="[a-zA-Z0-9_-]+"
              />
            </div>
            {slugChanged && (
              <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Changing the slug will break existing QR codes and shared URLs
                using the old slug.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Summer campaign"
              defaultValue={initial?.title ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional notes about this link"
              defaultValue={initial?.description ?? ""}
            />
          </div>

          {campaigns.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="campaignId">Campaign</Label>
              <select
                id="campaignId"
                name="campaignId"
                defaultValue={initial?.campaignId ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No campaign</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration date (optional)</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              defaultValue={
                initial?.expiresAt
                  ? new Date(initial.expiresAt).toISOString().slice(0, 16)
                  : ""
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image link (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!storageEnabled && (
            <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Image uploads are disabled. Set <code>BLOB_READ_WRITE_TOKEN</code>{" "}
              to enable them.
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Preview"
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
                placeholder="Alt text (for the embedded image)"
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
                  Remove image
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, WebP or GIF up to 5 MB.
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
            <CardTitle>UTM parameters (optional)</CardTitle>
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
                ["utmSource", "UTM Source", "google"],
                ["utmMedium", "UTM Medium", "cpc"],
                ["utmCampaign", "UTM Campaign", "summer_sale"],
                ["utmTerm", "UTM Term", "running+shoes"],
                ["utmContent", "UTM Content", "logolink"],
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
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {disabled ? "Disabled" : "Active"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {disabled
                    ? "This link will not redirect visitors."
                    : "This link is live and redirecting."}
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

      {state.error && (
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
            Cancel
          </Link>
        </Button>
      </div>
    </form>
  );
}

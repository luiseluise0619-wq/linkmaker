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
import { appUrl } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Creating…" : "Shorten"}
      {!pending && <ArrowRight />}
    </Button>
  );
}

export function PublicLinkCreator() {
  const [state, formAction] = useFormState<PublicLinkState, FormData>(
    createPublicLinkAction,
    { ok: false },
  );
  const [showSlug, setShowSlug] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);

  if (state.ok && state.data) {
    const { shortUrl, manageUrl, slug } = state.data;
    return (
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Your short link
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <code className="flex-1 truncate text-sm">{shortUrl}</code>
              <CopyButton value={shortUrl} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard">
                <LayoutDashboard />
                Open dashboard
              </Link>
            </Button>
            <CopyButton value={shortUrl} label="Copy" />
            <Button asChild variant="outline">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Open
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`/api/qr/${slug}?download=1`} download>
                Download QR
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your link is saved to a dashboard where you can edit the
            destination, track analytics and manage all your links.
          </p>

          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${slug}`}
              alt="QR code"
              width={160}
              height={160}
              className="rounded-lg border bg-white p-2"
            />
          </div>

          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Save your private stats link
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This link is the only way to view analytics for an anonymous link.
              Keep it private — anyone with it can see the stats.
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-md border bg-background p-2">
              <code className="flex-1 truncate text-xs">{manageUrl}</code>
              <CopyButton value={manageUrl} />
            </div>
            <div className="mt-2">
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <a href={manageUrl}>View analytics →</a>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="secondary"
              onClick={() => setResetKey((k) => k + 1)}
            >
              <Plus />
              Create another
            </Button>
            <p className="text-xs text-muted-foreground">
              Using a guest account.{" "}
              <Link href="/register" className="font-medium text-foreground hover:underline">
                Add email &amp; password
              </Link>{" "}
              to secure it &amp; access from other devices.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={resetKey}>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="destinationUrl"
              type="url"
              inputMode="url"
              required
              placeholder="Paste a long URL to shorten…"
              className="h-11 flex-1 text-base"
              aria-label="Destination URL"
            />
            <SubmitButton />
          </div>

          {showSlug ? (
            <div className="space-y-1.5">
              <Label htmlFor="pub-slug" className="text-xs text-muted-foreground">
                Custom link (optional)
              </Label>
              <div className="flex items-center gap-2">
                <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
                  {appUrl()}/go/
                </span>
                <Input
                  id="pub-slug"
                  name="slug"
                  placeholder="my-link"
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
              + Customize the link
            </button>
          )}

          {state.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            No account needed. Free, privacy-first, and editable if you sign up.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

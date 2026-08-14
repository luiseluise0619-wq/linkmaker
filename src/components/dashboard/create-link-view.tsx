"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, ExternalLink, Pencil, Plus, QrCode } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { QrDialog } from "@/components/qr-dialog";
import { LinkForm } from "@/components/dashboard/link-form";
import { shortUrl } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
}

export function CreateLinkView({
  campaigns,
  storageEnabled,
}: {
  campaigns: Campaign[];
  storageEnabled: boolean;
}) {
  const [created, setCreated] = React.useState<{
    id: string;
    slug: string;
  } | null>(null);

  if (created) {
    const url = shortUrl(created.slug);
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Your short link is ready</CardTitle>
          <CardDescription>
            Share it anywhere. You can edit the destination anytime without
            changing this URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <code className="flex-1 truncate text-sm">{url}</code>
            <CopyButton value={url} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={url} label="Copy" />
            <Button asChild variant="outline">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Open
              </a>
            </Button>
            <QrDialog
              linkId={created.id}
              shortUrl={url}
              trigger={
                <Button variant="outline">
                  <QrCode />
                  QR code
                </Button>
              }
            />
            <Button asChild variant="outline">
              <Link href={`/dashboard/links/${created.slug}/edit`}>
                <Pencil />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/links/${created.slug}`}>
                <BarChart3 />
                Analytics
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setCreated(null)} variant="secondary">
              <Plus />
              Create another
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/links">Go to links</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <LinkForm
        mode="create"
        campaigns={campaigns}
        storageEnabled={storageEnabled}
        onCreated={setCreated}
      />
    </div>
  );
}

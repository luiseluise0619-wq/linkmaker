"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";

export function EmbedSnippets({
  shortUrl,
  imageUrl,
  alt,
}: {
  shortUrl: string;
  imageUrl: string;
  alt: string;
}) {
  const html = `<a href="${shortUrl}">\n  <img src="${imageUrl}" alt="${alt}">\n</a>`;
  const markdown = `[![${alt}](${imageUrl})](${shortUrl})`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image embed</CardTitle>
        <CardDescription>
          Paste this where you want a clickable, trackable image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-48 rounded-lg border object-contain"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">HTML</p>
            <CopyButton value={html} label="Copy" />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs scrollbar-thin">
            {html}
          </pre>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Markdown</p>
            <CopyButton value={markdown} label="Copy" />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs scrollbar-thin">
            {markdown}
          </pre>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Image URL</p>
            <CopyButton value={imageUrl} label="Copy" />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs scrollbar-thin">
            {imageUrl}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

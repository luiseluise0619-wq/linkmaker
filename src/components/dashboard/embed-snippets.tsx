// 이미지 링크를 다른 사이트/블로그에 붙여넣을 수 있게 "복사용 코드 조각"을 보여준다.
// HTML(<a><img></a>)과 Markdown 두 형식으로 만들어 주고, 각각 복사 버튼을 붙인다.
// 코드 조각 자체는 번역하지 않는다(그대로 붙여넣어야 동작하므로).
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { useT } from "@/lib/i18n/client";

export function EmbedSnippets({
  shortUrl,
  imageUrl,
  alt,
}: {
  shortUrl: string;
  imageUrl: string;
  alt: string;
}) {
  const t = useT();
  const html = `<a href="${shortUrl}">\n  <img src="${imageUrl}" alt="${alt}">\n</a>`;
  const markdown = `[![${alt}](${imageUrl})](${shortUrl})`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("forms.embedTitle")}</CardTitle>
        <CardDescription>
          {t("forms.embedDesc")}
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
            <CopyButton value={html} label={t("forms.copy")} />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs scrollbar-thin">
            {html}
          </pre>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Markdown</p>
            <CopyButton value={markdown} label={t("forms.copy")} />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs scrollbar-thin">
            {markdown}
          </pre>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">{t("forms.embedImageUrlLabel")}</p>
            <CopyButton value={imageUrl} label={t("forms.copy")} />
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs scrollbar-thin">
            {imageUrl}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

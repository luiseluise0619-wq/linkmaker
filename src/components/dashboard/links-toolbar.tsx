// 링크 목록 위의 검색창 + 필터(상태별) + 정렬 선택 도구모음.
// 클라이언트 컴포넌트: 입력·선택을 주소의 쿼리스트링(?q=..&filter=..&sort=..)으로 바꾸면,
// 서버가 그 조건으로 목록을 다시 그려 준다.
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { Input } from "@/components/ui/input";

// value=실제 필터 값, labelKey=화면에 보일 문구의 번역 키.
const FILTERS = [
  { value: "all", labelKey: "links.filterAll" },
  { value: "active", labelKey: "links.filterActive" },
  { value: "disabled", labelKey: "links.filterDisabled" },
  { value: "expired", labelKey: "links.filterExpired" },
  { value: "high", labelKey: "links.filterHigh" },
  { value: "recent", labelKey: "links.filterRecent" },
];

const SORTS = [
  { value: "recent", labelKey: "links.sortNewest" },
  { value: "clicks", labelKey: "links.sortMostClicks" },
  { value: "oldest", labelKey: "links.sortOldest" },
];

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function LinksToolbar() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

  // 현재 쿼리스트링에 변경 항목을 반영해 새 주소로 이동한다.
  // 조건이 바뀌면 1페이지부터 봐야 하므로 page는 지운다.
  function push(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    router.push(`/dashboard/links?${sp.toString()}`);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    push({ q });
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={onSearchSubmit} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("links.searchPlaceholder")}
          className="pl-9"
        />
      </form>
      <div className="flex gap-2">
        <select
          className={selectClass}
          value={params.get("filter") ?? "all"}
          onChange={(e) => push({ filter: e.target.value })}
          aria-label={t("links.filterAria")}
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {t(f.labelKey)}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={params.get("sort") ?? "recent"}
          onChange={(e) => push({ sort: e.target.value })}
          aria-label={t("links.sortAria")}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {t(s.labelKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

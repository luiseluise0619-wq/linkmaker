"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { value: "all", label: "All links" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
  { value: "expired", label: "Expired" },
  { value: "high", label: "High traffic" },
  { value: "recent", label: "Recently created" },
];

const SORTS = [
  { value: "recent", label: "Newest" },
  { value: "clicks", label: "Most clicks" },
  { value: "oldest", label: "Oldest" },
];

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function LinksToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

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
          placeholder="Search by title, slug or destination…"
          className="pl-9"
        />
      </form>
      <div className="flex gap-2">
        <select
          className={selectClass}
          value={params.get("filter") ?? "all"}
          onChange={(e) => push({ filter: e.target.value })}
          aria-label="Filter"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={params.get("sort") ?? "recent"}
          onChange={(e) => push({ sort: e.target.value })}
          aria-label="Sort"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// 탭 버튼 묶음. 탭을 누르면 페이지를 새로 열지 않고 "주소의 쿼리스트링"만 바꾼다.
// 예: 분석 페이지의 기간(24h/7d/30d) 선택 → ?range=7d 로 바뀌고 서버가 그에 맞게 다시 렌더.
// 클라이언트 컴포넌트: 클릭에 반응해 주소를 바꿔야 하므로 브라우저에서 동작.
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// value = 실제 값(예: "7d"), label = 화면에 보일 글자(이미 번역된 문구가 들어옴).
interface Option {
  value: string;
  label: string;
}

export function ParamTabs({
  param,
  options,
  defaultValue,
}: {
  param: string;
  options: Option[];
  defaultValue: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get(param) ?? defaultValue;

  // 탭 선택 시: 기본값이면 쿼리에서 빼고(주소를 깔끔하게), 아니면 값을 넣는다.
  // scroll: false → 주소만 바꾸고 화면이 맨 위로 튀지 않게 한다.
  function select(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value === defaultValue) sp.delete(param);
    else sp.set(param, value);
    router.push(`?${sp.toString()}`, { scroll: false });
  }

  return (
    <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => select(opt.value)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            current === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// 파일 목적: 앱에서 예기치 못한 오류가 났을 때 보여주는 "에러 화면"입니다.
// app/error.tsx 라는 특별한 파일 이름을 쓰면, Next.js가 렌더링 중 오류를 잡아
// (다운되는 대신) 이 컴포넌트를 대신 보여줍니다. 일종의 안전망입니다.
//
// 맨 위 "use client" 때문에 이 파일은 "클라이언트 컴포넌트"입니다.
// 에러 화면은 브라우저 기능(useEffect로 오류 기록, 버튼 onClick으로 다시 시도)이
// 필요하기 때문에 반드시 클라이언트 컴포넌트여야 합니다.
// ============================================================================
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

// Next.js가 이 컴포넌트에 두 가지 props를 자동으로 넘겨줍니다:
//  - error: 발생한 오류 객체 (digest는 로그와 대조할 수 있는 식별 코드)
//  - reset: 다시 렌더링을 시도하는 함수 (버튼에 연결해 "다시 시도"에 사용)
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT(); // 클라이언트용 번역 훅 (t("키") -> 현재 언어 문구)
  // useEffect: 화면이 그려진 뒤 실행되는 코드. 여기서는 오류를 콘솔에 기록합니다.
  // 두 번째 인자 [error]는 "error 값이 바뀔 때마다 다시 실행하라"는 의존성 목록입니다.
  useEffect(() => {
    // 실제 서비스라면 여기서 오류 수집 서비스(Sentry 등)로 보냅니다.
    console.error(error);
  }, [error]);

  // 개발 환경인지 여부. 개발 중에만 자세한 오류 메시지를 보여주기 위한 판별값입니다.
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("misc.errorTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("misc.errorBody")}</p>

        {/* Show the underlying cause in development to aid debugging. In
            production only the digest is shown so it can be matched to logs. */}
        {isDev && error?.message && (
          <pre className="mt-4 overflow-x-auto rounded-md border bg-muted/40 p-3 text-left text-xs text-destructive scrollbar-thin">
            {error.message}
          </pre>
        )}
        {error?.digest && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("misc.errorReference", { digest: error.digest })}
          </p>
        )}

        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>{t("misc.tryAgain")}</Button>
          <Button variant="outline" asChild>
            <a href="/">{t("misc.goHome")}</a>
          </Button>
        </div>

        {isDev && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("misc.errorTipLead")}
            <code>/api/health</code>
            {t("misc.errorTipTail")}
          </p>
        )}
      </div>
    </div>
  );
}

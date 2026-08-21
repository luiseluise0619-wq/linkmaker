// ============================================================================
// 파일 목적: "개인정보 처리방침" 페이지입니다. 주소는 "/privacy".
// 어떤 데이터를 수집하고 무엇을 수집하지 않는지 설명하는 정적 문서입니다.
//
// 이 파일은 "서버 컴포넌트"입니다(상호작용 없음). 제목 목록과 문단만 렌더링합니다.
// ============================================================================
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";

// 이 페이지의 탭 제목/설명. 최종 제목은 "Privacy Policy · LinkMaker".
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What analytics data LinkMaker collects and how it is handled.",
};

// 데이터 보관 기간(일) — 환경변수에서 읽고 없으면 기본 "365"
const retention = process.env.ANALYTICS_RETENTION_DAYS || "365";

export default function PrivacyPage() {
  const t = getT(); // 번역 함수
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("landing.privacyPageTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("landing.privacyPageIntro")}
      </p>

      <div className="mt-8 max-w-none text-sm leading-relaxed">
        <h2 className="mt-8 text-xl font-semibold">
          {t("landing.privacyCollectHeading")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("landing.privacyCollectIntro")}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>{t("landing.privacyCollectTimestamp")}</li>
          <li>{t("landing.privacyCollectReferrer")}</li>
          <li>{t("landing.privacyCollectUserAgent")}</li>
          <li>{t("landing.privacyCollectLanguage")}</li>
          <li>{t("landing.privacyCollectGeo")}</li>
          <li>{t("landing.privacyCollectUtm")}</li>
          <li>{t("landing.privacyCollectQr")}</li>
          <li>{t("landing.privacyCollectBot")}</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">
          {t("landing.privacyDontHeading")}
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>{t("landing.privacyDontIps")}</li>
          <li>{t("landing.privacyDontCookies")}</li>
          <li>{t("landing.privacyDontFingerprint")}</li>
          <li>{t("landing.privacyDontClaim")}</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">
          {t("landing.privacyUniqueHeading")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("landing.privacyUniqueBody1")}
          <strong>{t("landing.privacyUniqueEstimates")}</strong>
          {t("landing.privacyUniqueBody2")}
        </p>

        <h2 className="mt-8 text-xl font-semibold">
          {t("landing.privacyBotHeading")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("landing.privacyBotBody1")}
          <strong>{t("landing.privacyBotStrong")}</strong>
          {t("landing.privacyBotBody2")}
        </p>

        <h2 className="mt-8 text-xl font-semibold">
          {t("landing.privacyRetentionHeading")}
        </h2>
        {/* { days: retention }: 번역문 속 자리표시자에 실제 보관일 수를 채워 넣습니다 */}
        <p className="mt-2 text-muted-foreground">
          {t("landing.privacyRetentionBody1", { days: retention })}
          <code>ANALYTICS_RETENTION_DAYS</code>
          {t("landing.privacyRetentionBody2")}
        </p>

        <h2 className="mt-8 text-xl font-semibold">
          {t("landing.privacyYourDataHeading")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("landing.privacyYourDataBody")}
        </p>
      </div>
    </div>
  );
}

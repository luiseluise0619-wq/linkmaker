// ============================================================================
// 파일 목적: "측정 방법론" 안내 페이지입니다. 주소는 "/methodology".
// (methodology 폴더 안의 page.tsx라서 그 경로의 페이지가 됩니다.)
// 클릭 수를 어떻게 세는지, 봇을 어떻게 걸러내는지 등을 방문자에게 설명하는 정적 문서입니다.
//
// 이 파일은 "서버 컴포넌트"입니다. 상호작용이 없는 설명 문서라 서버에서 HTML만 만들면 됩니다.
// ============================================================================
import type { Metadata } from "next";
import {
  Bot,
  Globe,
  MonitorSmartphone,
  MousePointerClick,
  Route,
  Shield,
  Users,
} from "lucide-react";
import { getT } from "@/lib/i18n/server";

// 이 페이지만의 메타데이터. 루트 레이아웃의 template("%s · LinkMaker") 덕분에
// 최종 탭 제목은 "How measurement works · LinkMaker"가 됩니다.
export const metadata: Metadata = {
  title: "How measurement works",
  description:
    "How LinkMaker counts clicks, detects bots, estimates unique visitors and identifies the incoming platform and referrer.",
};

// 데이터 보관 기간(일). 서버 환경변수에서 읽고, 값이 없으면 기본 "365"를 씁니다.
// process.env는 서버에서만 안전하게 읽을 수 있어 서버 컴포넌트에서 사용합니다.
const retention = process.env.ANALYTICS_RETENTION_DAYS || "365";

// Section: 아이콘 + 제목 + 본문으로 이루어진 재사용 가능한 구획 컴포넌트.
// "icon: Icon"은 props로 받은 icon을 Icon이라는 이름으로 바꿔 받는 것입니다.
// JSX 태그는 대문자로 시작해야 컴포넌트로 인식되므로 대문자 Icon으로 바꿔 씁니다.
// children: 이 컴포넌트 태그 사이(<Section>...여기...</Section>)에 넣은 내용
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

// MethodologyPage: 본체. 여러 개의 <Section>을 위에서 아래로 나열해 문서를 구성합니다.
export default function MethodologyPage() {
  const t = getT(); // 번역 함수
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("landing.methodTitle")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t("landing.methodIntro")}</p>

      {/* 각 Section에 아이콘과 제목을 props로 넘기고, 태그 사이에 본문 문단을 children으로 넣습니다.
          문장 중간에 코드/굵은 글씨를 끼워 넣기 위해 문구를 P1a/P1b처럼 조각으로 나눠 번역합니다.
          &lt; &gt; 는 화면에 그대로 '<' '>' 문자를 보여주기 위한 HTML 표기입니다. */}
      <Section icon={MousePointerClick} title={t("landing.methodClickTitle")}>
        <p>
          {t("landing.methodClickP1a")}
          <code>/go/&lt;slug&gt;</code>
          {t("landing.methodClickP1b")}
        </p>
        <p>{t("landing.methodClickP2")}</p>
      </Section>

      <Section icon={Bot} title={t("landing.methodBotTitle")}>
        <p>
          {t("landing.methodBotP1a")}
          <strong>{t("landing.methodBotUserAgent")}</strong>
          {t("landing.methodBotP1b")}
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>{t("landing.methodBotSearch")}</li>
          <li>{t("landing.methodBotSocial")}</li>
          <li>{t("landing.methodBotAi")}</li>
          <li>{t("landing.methodBotSeo")}</li>
          <li>{t("landing.methodBotScripts")}</li>
        </ul>
        <p className="rounded-md bg-muted/40 p-3">
          <strong>{t("landing.methodBotCalloutStrong")}</strong>
          {t("landing.methodBotCalloutBody1")}
          <strong>{t("landing.methodBotCalloutHuman")}</strong>
          {t("landing.methodBotCalloutBody2")}
        </p>
      </Section>

      <Section icon={Users} title={t("landing.methodUniqueTitle")}>
        <p>
          {t("landing.methodUniqueP1a")}
          <strong>{t("landing.methodUniqueRotates")}</strong>
          {t("landing.methodUniqueP1b")}
        </p>
        <p>
          {t("landing.methodUniqueP2a")}
          <strong>{t("landing.methodUniqueEstimates")}</strong>
          {t("landing.methodUniqueP2b")}
        </p>
      </Section>

      <Section
        icon={MonitorSmartphone}
        title={t("landing.methodPlatformTitle")}
      >
        <p>{t("landing.methodPlatformBody")}</p>
      </Section>

      <Section icon={Route} title={t("landing.methodReferrerTitle")}>
        <p>
          {t("landing.methodReferrerP1a")}
          <em>{t("landing.methodReferrerEm")}</em>
          {t("landing.methodReferrerP1b")}
          <code>instagram.com</code>, <code>t.co</code>
          {t("landing.methodReferrerP1c")}
        </p>
        <p className="rounded-md bg-muted/40 p-3">
          {t("landing.methodReferrerCalloutP1")}
          <strong>{t("landing.methodReferrerCalloutStrong")}</strong>
          {t("landing.methodReferrerCalloutP2")}
          <code>utm_source=instagram</code>
          {t("landing.methodReferrerCalloutP3")}
        </p>
      </Section>

      <Section icon={Globe} title={t("landing.methodLocationTitle")}>
        <p>{t("landing.methodLocationBody")}</p>
      </Section>

      {/* t()의 두 번째 인자 { days: retention }: 번역문 안의 자리표시자에 실제 값(보관일)을 끼워 넣습니다 */}
      <Section icon={Shield} title={t("landing.methodPrivacyTitle")}>
        <p>
          {t("landing.methodPrivacyBody1", { days: retention })}
          <a href="/privacy" className="text-primary hover:underline">
            {t("landing.methodPrivacyLink")}
          </a>
          {t("landing.methodPrivacyBody2")}
        </p>
      </Section>
    </div>
  );
}

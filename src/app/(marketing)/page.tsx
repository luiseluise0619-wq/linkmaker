// ============================================================================
// 파일 목적: 사이트의 첫 화면인 "랜딩 페이지"(주소 "/")입니다.
// app 폴더 안에서 page.tsx 라는 이름의 파일이 곧 하나의 "페이지"가 되며,
// 이 파일은 (marketing) 그룹 안에 있으므로 위의 marketing/layout.tsx(헤더+푸터)로
// 감싸진 채 URL "/"에 표시됩니다.
//
// 이 파일은 "서버 컴포넌트"입니다("use client" 없음). 서버에서 HTML을 만들어 보내므로
// 로딩이 빠르고 SEO(검색 노출)에 유리합니다. 실제 상호작용이 필요한 부분(링크 생성 폼)은
// 아래에서 별도의 클라이언트 컴포넌트 <PublicLinkCreator />로 분리했습니다.
//
// lucide-react: 아이콘 모음 라이브러리. 각 이름은 하나의 SVG 아이콘 컴포넌트입니다.
// ============================================================================
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Globe,
  ImageIcon,
  Link2,
  Lock,
  MousePointerClick,
  QrCode,
  Shield,
  Smartphone,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLinkCreator } from "@/components/public-link-creator";
import { getT } from "@/lib/i18n/server";

// 기능 소개 카드 데이터 목록입니다. 화면에 직접 쓰지 않고 배열로 모아 둔 뒤,
// 아래에서 .map()으로 반복하며 카드를 자동 생성합니다(중복 JSX를 줄이는 방법).
// titleKey/bodyKey에는 실제 문구 대신 번역 "키"만 담아두고, 렌더링할 때 t(키)로 변환합니다.
const features = [
  {
    icon: Link2,
    titleKey: "landing.featureEditableTitle",
    bodyKey: "landing.featureEditableBody",
  },
  {
    icon: BarChart3,
    titleKey: "landing.featureAnalyticsTitle",
    bodyKey: "landing.featureAnalyticsBody",
  },
  {
    icon: ImageIcon,
    titleKey: "landing.featureImageTitle",
    bodyKey: "landing.featureImageBody",
  },
  {
    icon: QrCode,
    titleKey: "landing.featureQrTitle",
    bodyKey: "landing.featureQrBody",
  },
  {
    icon: Target,
    titleKey: "landing.featureCampaignTitle",
    bodyKey: "landing.featureCampaignBody",
  },
  {
    icon: Shield,
    titleKey: "landing.featurePrivacyTitle",
    bodyKey: "landing.featurePrivacyBody",
  },
];

// SectionHeading: 여러 섹션에서 재사용하는 작은 "제목 묶음" 컴포넌트입니다.
// eyebrow(작은 윗줄), title(큰 제목), subtitle(설명)을 props로 받습니다.
// subtitle 뒤의 물음표(?)는 "있어도 되고 없어도 되는" 선택 props라는 뜻입니다.
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {/* {조건 && <JSX>}: 조건이 참일 때만 뒤의 요소를 그립니다.
          subtitle이 넘어온 경우에만 설명 문단을 표시합니다. */}
      {subtitle && (
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

// LandingPage: 이 페이지의 본체. 여러 섹션(히어로/기능/분석/이미지/개인정보/CTA)을
// 위에서 아래로 나열합니다.
export default function LandingPage() {
  const t = getT(); // 번역 함수 (t("키") -> 현재 언어 문구)
  return (
    // <> ... </> 는 "프래그먼트": 불필요한 div 없이 여러 요소를 하나로 묶는 빈 껍데기
    <>
      {/* Hero: 페이지 최상단의 큰 소개 영역(제목 + 부제 + 행동 유도 버튼) */}
      <section className="container py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-5">
            {t("landing.heroBadge")}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            {/* {" "}는 JSX에서 일부러 넣는 "공백 한 칸"입니다. 줄바꿈 때문에 사라지는
                단어 사이 띄어쓰기를 보장합니다. 뒤의 <span>은 강조(색상) 부분입니다. */}
            {t("landing.heroTitleLead")}{" "}
            <span className="text-primary">
              {t("landing.heroTitleEmphasis")}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#create">
                {t("landing.heroCta")}
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("landing.heroReassurance")}
          </p>
        </div>

        {/* 실제로 동작하는 데모: 로그인 없이 진짜 단축 링크를 만들 수 있는 폼입니다.
            id="create" 는 헤더의 "#create" 링크가 스크롤로 찾아오는 목적지입니다.
            PublicLinkCreator는 입력/제출이 필요한 클라이언트 컴포넌트라 따로 분리했습니다. */}
        <div id="create" className="mx-auto mt-14 max-w-2xl scroll-mt-24">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            {t("landing.heroCreatorPrompt")}
          </p>
          <PublicLinkCreator />
        </div>
      </section>

      {/* Features: 6개의 기능 카드를 격자로 보여주는 섹션 */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="container">
          <SectionHeading
            eyebrow={t("landing.featuresEyebrow")}
            title={t("landing.featuresTitle")}
            subtitle={t("landing.featuresSubtitle")}
          />
          {/* 위에서 정의한 features 배열을 .map()으로 돌며 카드를 하나씩 생성.
              key: React가 목록 항목을 구분하는 고유값(성능/정확성을 위해 필수) */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.titleKey}>
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {/* f.icon은 컴포넌트(대문자로 시작)이므로 <f.icon /> 처럼 태그로 씁니다 */}
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{t(f.titleKey)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(f.bodyKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics preview: 분석 기능 설명 + 오른쪽에 가짜 막대그래프 미리보기 */}
      <section id="analytics" className="container py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-primary">
              {t("landing.analyticsEyebrow")}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {t("landing.analyticsTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.analyticsBody")}
            </p>
            {/* 번역 키 배열을 바로 .map()으로 돌려 체크리스트 항목들을 만듭니다 */}
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "landing.analyticsPointVisitors",
                "landing.analyticsPointBots",
                "landing.analyticsPointAttribution",
                "landing.analyticsPointRetention",
              ].map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-primary" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
          <Card>
            <CardContent className="p-6">
              {/* 장식용 가짜 막대그래프. 숫자 배열의 각 값을 막대 높이(px)로 사용합니다.
                  aria-hidden: 실제 데이터가 아니므로 화면낭독기(스크린리더)는 무시하게 함.
                  (h, i) => h는 값(높이), i는 순번(index) — key로 사용 */}
              <div className="flex items-end gap-2" aria-hidden>
                {[35, 50, 40, 70, 55, 85, 60, 90, 65, 75, 45, 80].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/80"
                      style={{ height: `${h}px` }}
                    />
                  ),
                )}
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {t("landing.analyticsPreviewCaption")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Image links + QR: 이미지 링크와 QR 코드 기능을 나란히 소개하는 섹션 */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-8">
              <ImageIcon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">
                {t("landing.imageLinksTitle")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("landing.imageLinksBody")}
              </p>
              {/* <pre>는 입력한 그대로(줄바꿈/공백 유지) 보여주는 태그. 여기선 예시 HTML 코드.
                  중괄호 안의 백틱(``)은 여러 줄 문자열을 그대로 담기 위한 표기입니다. */}
              <pre className="mt-4 overflow-x-auto rounded-lg border bg-background p-3 text-xs">
                {`<a href="linkmaker.app/go/abc123">
  <img src="IMAGE_URL" alt="Campaign image">
</a>`}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8">
              <QrCode className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">
                {t("landing.qrTitle")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("landing.qrBody")}
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" /> {t("landing.qrActions")}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy: 개인정보 보호 원칙 3가지를 카드로 소개하는 섹션 */}
      <section id="privacy" className="container py-20">
        <SectionHeading
          eyebrow={t("landing.privacyEyebrow")}
          title={t("landing.privacyTitle")}
          subtitle={t("landing.privacySubtitle")}
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
          {[
            {
              icon: Lock,
              titleKey: "landing.privacyNoIpsTitle",
              bodyKey: "landing.privacyNoIpsBody",
            },
            {
              icon: Globe,
              titleKey: "landing.privacyGeoTitle",
              bodyKey: "landing.privacyGeoBody",
            },
            {
              icon: Shield,
              titleKey: "landing.privacyRetentionTitle",
              bodyKey: "landing.privacyRetentionBody",
            },
          ].map((p) => (
            <Card key={p.titleKey}>
              <CardContent className="p-6">
                <p.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold">{t(p.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(p.bodyKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA (Call To Action): 페이지 맨 아래에서 다시 한 번 링크 만들기를 유도하는 영역 */}
      <section className="border-t py-20">
        <div className="container">
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
                {t("landing.ctaTitle")}
              </h2>
              <p className="max-w-lg text-muted-foreground">
                {t("landing.ctaBody")}
              </p>
              <Button asChild size="lg">
                <Link href="#create">
                  {t("landing.ctaButton")}
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

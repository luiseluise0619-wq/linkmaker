// ============================================================================
// 파일 목적: 앱 전체의 "루트 레이아웃"(root layout) 입니다.
// Next.js App Router에서 app/layout.tsx는 모든 페이지를 감싸는 최상위 껍데기이며,
// <html>과 <body> 태그를 직접 렌더링하는 유일한 파일입니다.
//
// 이 파일은 "서버 컴포넌트"(server component)입니다. 파일 맨 위에 "use client"가
// 없으면 Next.js는 기본적으로 서버 컴포넌트로 취급합니다. 서버 컴포넌트는 서버에서만
// 실행되어 완성된 HTML을 만들어 보내므로, 브라우저 전용 기능(onClick, useState 등)은
// 쓸 수 없지만 대신 서버 자원(DB, 쿠키, 환경변수)에 바로 접근할 수 있습니다.
// ============================================================================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { appUrl } from "@/lib/utils";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { en } from "@/lib/i18n/dictionaries/en";

// Google 폰트 "Inter"를 불러와 CSS 변수(--font-sans)로 연결합니다.
// next/font는 빌드 시점에 폰트를 최적화해 로딩 성능을 높여줍니다.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const title = "LinkMaker — Create links. Track clicks. Understand your audience.";
const description =
  "A privacy-conscious link management and analytics platform. Create trackable short links, image links and QR codes, then measure what works.";

// 메타데이터(metadata): 브라우저 탭 제목, 검색엔진/SNS 미리보기(OpenGraph, Twitter)에
// 쓰이는 정보입니다. Next.js가 이 값을 읽어 자동으로 <head> 안의 태그로 만들어 줍니다.
// 여기서 정의한 값은 모든 하위 페이지의 기본값이 됩니다.
export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    // default: 개별 페이지가 제목을 지정하지 않았을 때 쓰는 기본 제목
    // template: 하위 페이지가 제목을 주면 "%s" 자리에 넣어 "제목 · LinkMaker" 형태로 만듭니다
    default: title,
    template: "%s · LinkMaker",
  },
  description,
  applicationName: "LinkMaker",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "LinkMaker",
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// RootLayout: 모든 페이지의 바깥 껍데기. children(props로 전달되는 자식 요소)에는
// 실제로 보여줄 페이지 내용이 들어옵니다. props는 부모가 자식 컴포넌트에게 넘겨주는
// "입력값"이라고 생각하면 됩니다.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 서버에서 쿠키를 읽어 현재 언어(locale)를 정하고, 그 언어의 번역 사전(dict)을 가져옵니다.
  // 이런 서버 전용 작업은 서버 컴포넌트라서 가능합니다.
  const locale = getLocale();
  const dict = getDictionary(locale);
  return (
    // suppressHydrationWarning: 서버가 만든 HTML과 브라우저가 처음 그린 화면이
    // 살짝 다를 수 있는데(테마 class 등), 그 경고를 이 태그에서만 끕니다.
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Providers: 테마/번역/토스트 같은 "전역 컨텍스트"를 앱 전체에 공급하는 클라이언트 컴포넌트.
            fallback: 현재 언어에 번역이 없을 때 대체로 쓸 사전(영어가 아니면 영어 사전을 넘김) */}
        <Providers
          locale={locale}
          dict={dict}
          fallback={locale === "en" ? {} : en}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { appUrl } from "@/lib/utils";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { en } from "@/lib/i18n/dictionaries/en";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const title = "LinkMaker — Create links. Track clicks. Understand your audience.";
const description =
  "A privacy-conscious link management and analytics platform. Create trackable short links, image links and QR codes, then measure what works.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
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

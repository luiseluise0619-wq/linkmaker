import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { warmDb } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fire-and-forget: kick off a DB wake-up on site entry (the connection
  // attempt starts the wake) WITHOUT blocking the landing page render on a
  // cold/suspended database. warmDb swallows its own errors.
  void warmDb();
  const user = await getSessionUser();
  const t = getT();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#features" className="hover:text-foreground">
              {t("landing.navFeatures")}
            </Link>
            <Link href="/#analytics" className="hover:text-foreground">
              {t("landing.navAnalytics")}
            </Link>
            <Link href="/#privacy" className="hover:text-foreground">
              {t("landing.navPrivacy")}
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              {t("landing.navPrivacyPolicy")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">{t("landing.navDashboard")}</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/#create">{t("landing.navCreateLink")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>
            {t("landing.footerCopyright", {
              year: new Date().getFullYear(),
            })}
          </p>
          <div className="flex gap-4">
            <Link href="/methodology" className="hover:text-foreground">
              {t("landing.footerHowItWorks")}
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              {t("landing.footerPrivacy")}
            </Link>
            <Link href="/#create" className="hover:text-foreground">
              {t("landing.footerCreateLink")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

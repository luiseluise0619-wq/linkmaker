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
      {subtitle && (
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const t = getT();
  return (
    <>
      {/* Hero */}
      <section className="container py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-5">
            {t("landing.heroBadge")}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
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

        {/* Live, working demo — create a real short link with no account. */}
        <div id="create" className="mx-auto mt-14 max-w-2xl scroll-mt-24">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            {t("landing.heroCreatorPrompt")}
          </p>
          <PublicLinkCreator />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="container">
          <SectionHeading
            eyebrow={t("landing.featuresEyebrow")}
            title={t("landing.featuresTitle")}
            subtitle={t("landing.featuresSubtitle")}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.titleKey}>
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

      {/* Analytics preview */}
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

      {/* Image links + QR */}
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

      {/* Privacy */}
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

      {/* CTA */}
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

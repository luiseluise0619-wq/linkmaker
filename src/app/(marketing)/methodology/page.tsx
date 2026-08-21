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

export const metadata: Metadata = {
  title: "How measurement works",
  description:
    "How LinkMaker counts clicks, detects bots, estimates unique visitors and identifies the incoming platform and referrer.",
};

const retention = process.env.ANALYTICS_RETENTION_DAYS || "365";

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

export default function MethodologyPage() {
  const t = getT();
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("landing.methodTitle")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t("landing.methodIntro")}</p>

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

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

const features = [
  {
    icon: Link2,
    title: "Editable short links",
    body: "The short URL is a permanent layer over the destination. Change where it points anytime — the link and its history never break.",
  },
  {
    icon: BarChart3,
    title: "Real analytics",
    body: "Every click is recorded with device, browser, OS, referrer, geography and UTM data — all from the request, no invasive fingerprinting.",
  },
  {
    icon: ImageIcon,
    title: "Image links",
    body: "Upload an image, wrap it in a trackable link, and copy ready-to-paste HTML or Markdown embed snippets.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    body: "Every link gets a QR code that encodes the short URL. Reprint destinations without reprinting the code.",
  },
  {
    icon: Target,
    title: "Campaign tracking",
    body: "Group links into campaigns and attach UTM parameters that are applied automatically on redirect.",
  },
  {
    icon: Shield,
    title: "Privacy-first",
    body: "No raw IPs stored. Unique visitors are estimated with short-lived, salted hashes. You control retention.",
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
  return (
    <>
      {/* Hero */}
      <section className="container py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-5">
            Link management &amp; analytics
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Create links. Track clicks.{" "}
            <span className="text-primary">Understand your audience.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Short links you can edit forever, image links, QR codes and
            privacy-conscious analytics — in one clean, fast dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start for free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required. Your data stays yours.
          </p>
        </div>

        {/* Live, working demo — create a real short link with no account. */}
        <div className="mx-auto mt-14 max-w-2xl">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            Try it now — no sign-up required
          </p>
          <PublicLinkCreator />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Everything you need"
            title="A complete link toolkit"
            subtitle="Built as an MVP you can actually ship — with the architecture to grow."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
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
            <p className="text-sm font-medium text-primary">Analytics</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Know what actually happened
            </h2>
            <p className="mt-3 text-muted-foreground">
              Timeline, hourly and weekday activity, device / browser / OS /
              country breakdowns, referrers and UTM performance. Total clicks
              are split into human-like and bot/crawler traffic — always
              labeled as an estimate.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Total, unique and returning visitors",
                "Bot detection with transparent estimates",
                "Referrer and UTM campaign attribution",
                "Configurable data retention",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-primary" />
                  {item}
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
                Schematic preview. Your dashboard shows only your real data.
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
              <h3 className="mt-4 text-xl font-semibold">Image links</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload an image, point it anywhere, and copy the embed:
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
              <h3 className="mt-4 text-xl font-semibold">QR codes</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every link ships with a downloadable QR code that points at the
                short URL — so you can change the destination after it&apos;s
                printed. QR scans are tracked as their own source.
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" /> Preview · Download PNG · Copy
                URL
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="container py-20">
        <SectionHeading
          eyebrow="Privacy"
          title="Analytics that respect people"
          subtitle="We collect only what the request already provides, minimize it, and never fingerprint."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
          {[
            {
              icon: Lock,
              title: "No raw IPs",
              body: "IPs are never stored. They're only used transiently to derive a rotating, salted visitor hash.",
            },
            {
              icon: Globe,
              title: "Coarse geo only",
              body: "Country/region come from edge headers when available. We don't claim data we can't see.",
            },
            {
              icon: Shield,
              title: "You set retention",
              body: "Configure how long events are kept. Old data can be pruned automatically.",
            },
          ].map((p) => (
            <Card key={p.title}>
              <CardContent className="p-6">
                <p.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
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
                Ship your first trackable link in under a minute
              </h2>
              <p className="max-w-lg text-muted-foreground">
                Create an account, paste a URL, and share a short link you can
                edit forever.
              </p>
              <Button asChild size="lg">
                <Link href="/register">
                  Get started
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

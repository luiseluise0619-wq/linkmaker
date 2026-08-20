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
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        How measurement works
      </h1>
      <p className="mt-3 text-muted-foreground">
        Plain-language explanation of how every number in your dashboard is
        produced. We only measure what the web request already provides, we
        never fingerprint, and we label estimates as estimates.
      </p>

      <Section icon={MousePointerClick} title="How a click is counted">
        <p>
          Every short link points at a server endpoint (
          <code>/go/&lt;slug&gt;</code>). When someone opens it, the server does
          three things in order: looks up where the link currently points,
          records one click event, and redirects the visitor to the
          destination. One request to that endpoint = one recorded click.
        </p>
        <p>
          Because the click is recorded server-side, it counts even if the
          visitor has JavaScript disabled — but it also means automated fetches
          (previews, crawlers) are recorded too, which is why we separate humans
          from bots below.
        </p>
      </Section>

      <Section icon={Bot} title="Human vs bot clicks">
        <p>
          Each click is classified using the visitor&apos;s{" "}
          <strong>User-Agent</strong> (the identification string every browser
          sends). A click is marked as a bot when the User-Agent is missing, or
          when it matches a known automated pattern:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Search engines — Googlebot, Bingbot, DuckDuckBot, Yandex, Baidu</li>
          <li>
            Social/messaging preview bots — Facebook, WhatsApp, Telegram,
            Slack, Discord, X/Twitter, LinkedIn, Pinterest
          </li>
          <li>AI crawlers — GPTBot, ClaudeBot, CCBot, PerplexityBot, Bytespider</li>
          <li>SEO tools — SEMrush, Ahrefs, MJ12bot, DotBot</li>
          <li>
            Scripts &amp; tools — curl, wget, python-requests, axios,
            node-fetch, headless browsers, uptime monitors
          </li>
        </ul>
        <p className="rounded-md bg-muted/40 p-3">
          <strong>Bot detection is estimated.</strong> A bot that disguises
          itself as a normal browser will not be caught, and one common case is
          worth knowing: when a link is shared in a chat app or on social media,
          that platform fetches the link to build a preview — which is correctly
          counted as a bot click, even though a human did the sharing. Your
          headline numbers use <strong>human clicks</strong> by default.
        </p>
      </Section>

      <Section icon={Users} title="Unique &amp; returning visitors (estimated)">
        <p>
          We never place a tracking cookie and never store a raw IP address. To
          estimate unique visitors, the server derives a one-way hash from a
          coarse request signal, the link, the current date and a secret salt.
          This hash <strong>rotates every day</strong> and cannot be reversed to
          identify a person.
        </p>
        <p>
          Because the identifier resets daily by design, unique and returning
          visitor counts are <strong>estimates</strong> — the same person seen
          on two different days may be counted twice. &quot;Returning&quot;
          reflects visitors who clicked more than once, a privacy-preserving
          lower bound.
        </p>
      </Section>

      <Section icon={MonitorSmartphone} title="Platform (device, OS, browser)">
        <p>
          Device type (mobile / desktop / tablet), operating system (iOS,
          Android, Windows, macOS, Linux) and browser are parsed from the same
          User-Agent string the browser sends. Nothing is probed on the
          visitor&apos;s device.
        </p>
      </Section>

      <Section icon={Route} title="Referrer — where visitors come from">
        <p>
          When a browser follows a link, it usually tells us which site it came
          from (the <em>referrer</em>). We store only the domain — for example{" "}
          <code>instagram.com</code>, <code>t.co</code>, or a blog&apos;s
          domain — and show it in the Referrers breakdown.
        </p>
        <p className="rounded-md bg-muted/40 p-3">
          Some sources hide the referrer — most notably in-app browsers like
          Instagram and TikTok, which often send nothing, so those clicks appear
          as &quot;Unknown&quot;. For reliable attribution, add{" "}
          <strong>UTM parameters</strong> to your link (e.g.{" "}
          <code>utm_source=instagram</code>); they are captured exactly and shown
          under UTM campaigns.
        </p>
      </Section>

      <Section icon={Globe} title="Location (coarse, when available)">
        <p>
          Country and region come from the hosting network&apos;s edge headers
          when they are available (for example on Vercel). They are
          country/region level only — never a precise location — and are simply
          left blank when the platform does not provide them. We don&apos;t
          claim data we can&apos;t see.
        </p>
      </Section>

      <Section icon={Shield} title="Privacy &amp; retention">
        <p>
          No raw IP addresses are stored, there are no cross-site cookies, and
          there is no device fingerprinting. Click events are retained for{" "}
          {retention} days by default and older data is pruned automatically.
          See the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>{" "}
          for the full list of what is collected.
        </p>
      </Section>
    </div>
  );
}

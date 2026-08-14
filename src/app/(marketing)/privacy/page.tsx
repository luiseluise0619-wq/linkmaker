import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What analytics data LinkMaker collects and how it is handled.",
};

const retention = process.env.ANALYTICS_RETENTION_DAYS || "365";

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This is a placeholder policy for the LinkMaker MVP. It describes what the
        software collects by default. It is not legal advice and makes no claim
        of regulatory compliance — adapt it to your jurisdiction before going to
        production.
      </p>

      <div className="mt-8 max-w-none text-sm leading-relaxed">
        <h2 className="mt-8 text-xl font-semibold">What we collect on a click</h2>
        <p className="mt-2 text-muted-foreground">
          When someone visits a short link, we record only information that the
          HTTP request and browser already provide:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Timestamp, and derived date / hour / weekday (UTC)</li>
          <li>Referrer URL and its domain, when sent by the browser</li>
          <li>
            User-agent string, and the browser, browser version, operating
            system and device type parsed from it
          </li>
          <li>Preferred language (from the Accept-Language header)</li>
          <li>
            Coarse country / region, when the hosting edge network provides it
          </li>
          <li>UTM parameters configured on the link</li>
          <li>Whether the click came from a QR code or a normal link</li>
          <li>An estimated bot/crawler classification</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">What we do not do</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>We do not store raw IP addresses.</li>
          <li>We do not use cookies to follow visitors across sites.</li>
          <li>We do not perform invasive device fingerprinting.</li>
          <li>
            We do not claim data (like screen size or precise location) that the
            request does not actually provide.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Unique visitor estimates</h2>
        <p className="mt-2 text-muted-foreground">
          To estimate unique and returning visitors without tracking people, we
          compute a one-way hash from a coarse request signal, the link, the
          current date and a server-side secret. This hash rotates every day and
          cannot be reversed to identify a person. Because of this, unique and
          returning visitor counts are <strong>estimates</strong>, not exact
          figures.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Bot detection</h2>
        <p className="mt-2 text-muted-foreground">
          We separate human-like clicks from bot/crawler clicks using
          user-agent heuristics. <strong>Bot detection is estimated</strong> and
          will never be perfect.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Data retention</h2>
        <p className="mt-2 text-muted-foreground">
          Click events are retained for {retention} days by default (configurable
          via the <code>ANALYTICS_RETENTION_DAYS</code> environment variable).
          Older events can be pruned automatically by the retention job.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Your data</h2>
        <p className="mt-2 text-muted-foreground">
          Each account can only access its own links, images, campaigns and
          analytics. Deleting a link deletes its associated events and image.
        </p>
      </div>
    </div>
  );
}

import { PrismaClient, Prisma, type DeviceType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash, randomInt } from "crypto";

const prisma = new PrismaClient();

/**
 * Development seed. Creates a demo account with links and synthetic click
 * events so the dashboard has something to show locally.
 *
 * This is DEV-ONLY sample data. The production dashboard reads only real
 * events from the database and never depends on this script.
 */

const DEMO_EMAIL = "demo@linkmaker.app";
const DEMO_PASSWORD = "demo12345";

const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Internet"];
const OSES = ["Windows", "macOS", "iOS", "Android", "Linux"];
const COUNTRIES = ["US", "GB", "DE", "FR", "CA", "IN", "BR", "JP", "AU"];
const REFERRERS = [
  null,
  "https://twitter.com/",
  "https://www.google.com/",
  "https://www.linkedin.com/",
  "https://news.ycombinator.com/",
  "https://www.instagram.com/",
];
const DEVICES: DeviceType[] = ["MOBILE", "DESKTOP", "TABLET"];
const BOT_UAS = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "facebookexternalhit/1.1",
];

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length)];
}

function extractDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Refusing to seed in production. Aborting.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: "Demo User", passwordHash },
  });

  // Reset the demo user's links (and cascaded events) for a clean seed.
  await prisma.link.deleteMany({ where: { userId: user.id } });

  const campaign = await prisma.campaign.upsert({
    where: { userId_name: { userId: user.id, name: "Summer 2026" } },
    update: {},
    create: {
      userId: user.id,
      name: "Summer 2026",
      description: "Seasonal launch campaign",
    },
  });

  const linkSeeds = [
    {
      slug: "summer2026",
      destinationUrl: "https://example.com/product-a",
      title: "Summer launch",
      campaignId: campaign.id,
      utmSource: "twitter",
      utmMedium: "social",
      utmCampaign: "summer2026",
    },
    {
      slug: "newsletter",
      destinationUrl: "https://example.com/subscribe",
      title: "Newsletter signup",
      utmSource: "email",
      utmMedium: "newsletter",
    },
    {
      slug: "docs",
      destinationUrl: "https://example.com/docs",
      title: "Documentation",
    },
    {
      slug: "webinar",
      destinationUrl: "https://example.com/webinar",
      title: "Webinar registration",
      campaignId: campaign.id,
    },
  ];

  const links = [];
  for (const seed of linkSeeds) {
    const link = await prisma.link.create({ data: { userId: user.id, ...seed } });
    links.push(link);
  }

  const now = Date.now();
  const events: Prisma.LinkEventCreateManyInput[] = [];

  for (const link of links) {
    const total = randomInt(40, 400);
    for (let i = 0; i < total; i++) {
      const daysAgo = randomInt(0, 30);
      const ts = new Date(
        now - daysAgo * 86400000 - randomInt(0, 86400000),
      );
      const date = new Date(
        Date.UTC(ts.getUTCFullYear(), ts.getUTCMonth(), ts.getUTCDate()),
      );
      const isBot = randomInt(0, 100) < 8;
      const referrer = pick(REFERRERS);
      const device = pick(DEVICES);
      // Mirror the real hashing model: a visitor hash is stable for a given
      // visitor within a single day and changes across days. Using the actual
      // date bucket (not daysAgo) keeps the seed consistent with production,
      // so unique/returning estimates behave realistically.
      const dateKey = date.toISOString().slice(0, 10);
      const visitorIdx = randomInt(0, Math.max(5, Math.floor(total / 4)));
      const visitorSeed = `${link.id}:${visitorIdx}:${dateKey}`;
      events.push({
        linkId: link.id,
        timestamp: ts,
        date,
        hour: ts.getUTCHours(),
        dayOfWeek: ts.getUTCDay(),
        referrer,
        referrerDomain: extractDomain(referrer),
        userAgent: isBot ? pick(BOT_UAS) : "Mozilla/5.0",
        browser: isBot ? null : pick(BROWSERS),
        os: isBot ? null : pick(OSES),
        deviceType: isBot ? "UNKNOWN" : device,
        isMobile: device !== "DESKTOP",
        language: pick(["en-US", "en-GB", "de-DE", "fr-FR", "pt-BR"]),
        country: pick(COUNTRIES),
        utmSource: link.utmSource,
        utmMedium: link.utmMedium,
        utmCampaign: link.utmCampaign,
        source: randomInt(0, 100) < 20 ? "QR" : "LINK",
        isBot,
        botReason: isBot ? "ua-pattern:seed" : null,
        visitorHash: isBot
          ? null
          : createHash("sha256").update(visitorSeed).digest("hex").slice(0, 32),
      });
    }
  }

  await prisma.linkEvent.createMany({ data: events });

  console.log(
    `Seeded demo user (${DEMO_EMAIL} / ${DEMO_PASSWORD}), ${links.length} links, ${events.length} events.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

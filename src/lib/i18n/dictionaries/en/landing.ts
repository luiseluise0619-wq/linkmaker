export const landing = {
  // Header nav
  "landing.navFeatures": "Features",
  "landing.navAnalytics": "Analytics",
  "landing.navPrivacy": "Privacy",
  "landing.navPrivacyPolicy": "Privacy Policy",
  "landing.navDashboard": "Dashboard",
  "landing.navCreateLink": "Create a link",

  // Footer
  "landing.footerCopyright": "© {year} LinkMaker. Built for the web.",
  "landing.footerHowItWorks": "How it works",
  "landing.footerPrivacy": "Privacy",
  "landing.footerCreateLink": "Create a link",

  // Features
  "landing.featureEditableTitle": "Editable short links",
  "landing.featureEditableBody":
    "The short URL is a permanent layer over the destination. Change where it points anytime — the link and its history never break.",
  "landing.featureAnalyticsTitle": "Real analytics",
  "landing.featureAnalyticsBody":
    "Every click is recorded with device, browser, OS, referrer, geography and UTM data — all from the request, no invasive fingerprinting.",
  "landing.featureImageTitle": "Image links",
  "landing.featureImageBody":
    "Upload an image, wrap it in a trackable link, and copy ready-to-paste HTML or Markdown embed snippets.",
  "landing.featureQrTitle": "QR codes",
  "landing.featureQrBody":
    "Every link gets a QR code that encodes the short URL. Reprint destinations without reprinting the code.",
  "landing.featureCampaignTitle": "Campaign tracking",
  "landing.featureCampaignBody":
    "Group links into campaigns and attach UTM parameters that are applied automatically on redirect.",
  "landing.featurePrivacyTitle": "Privacy-first",
  "landing.featurePrivacyBody":
    "No raw IPs stored. Unique visitors are estimated with short-lived, salted hashes. You control retention.",

  // Hero
  "landing.heroBadge": "Link management & analytics",
  "landing.heroTitleLead": "Create links. Track clicks.",
  "landing.heroTitleEmphasis": "Understand your audience.",
  "landing.heroSubtitle":
    "Short links you can edit forever, image links, QR codes and privacy-conscious analytics — in one clean, fast dashboard.",
  "landing.heroCta": "Create a link",
  "landing.heroReassurance": "No account, no credit card. Your data stays yours.",
  "landing.heroCreatorPrompt": "Paste a link — no sign-up required",

  // Features section heading
  "landing.featuresEyebrow": "Everything you need",
  "landing.featuresTitle": "A complete link toolkit",
  "landing.featuresSubtitle":
    "Built as an MVP you can actually ship — with the architecture to grow.",

  // Analytics section
  "landing.analyticsEyebrow": "Analytics",
  "landing.analyticsTitle": "Know what actually happened",
  "landing.analyticsBody":
    "Timeline, hourly and weekday activity, device / browser / OS / country breakdowns, referrers and UTM performance. Total clicks are split into human-like and bot/crawler traffic — always labeled as an estimate.",
  "landing.analyticsPointVisitors": "Total, unique and returning visitors",
  "landing.analyticsPointBots": "Bot detection with transparent estimates",
  "landing.analyticsPointAttribution": "Referrer and UTM campaign attribution",
  "landing.analyticsPointRetention": "Configurable data retention",
  "landing.analyticsPreviewCaption":
    "Schematic preview. Your dashboard shows only your real data.",

  // Image links + QR
  "landing.imageLinksTitle": "Image links",
  "landing.imageLinksBody":
    "Upload an image, point it anywhere, and copy the embed:",
  "landing.qrTitle": "QR codes",
  "landing.qrBody":
    "Every link ships with a downloadable QR code that points at the short URL — so you can change the destination after it's printed. QR scans are tracked as their own source.",
  "landing.qrActions": "Preview · Download PNG · Copy URL",

  // Privacy section
  "landing.privacyEyebrow": "Privacy",
  "landing.privacyTitle": "Analytics that respect people",
  "landing.privacySubtitle":
    "We collect only what the request already provides, minimize it, and never fingerprint.",
  "landing.privacyNoIpsTitle": "No raw IPs",
  "landing.privacyNoIpsBody":
    "IPs are never stored. They're only used transiently to derive a rotating, salted visitor hash.",
  "landing.privacyGeoTitle": "Coarse geo only",
  "landing.privacyGeoBody":
    "Country/region come from edge headers when available. We don't claim data we can't see.",
  "landing.privacyRetentionTitle": "You set retention",
  "landing.privacyRetentionBody":
    "Configure how long events are kept. Old data can be pruned automatically.",

  // CTA
  "landing.ctaTitle": "Ship your first trackable link in under a minute",
  "landing.ctaBody":
    "Create an account, paste a URL, and share a short link you can edit forever.",
  "landing.ctaButton": "Create a link",

  // Public link creator
  "landing.creatorCreating": "Creating…",
  "landing.creatorShorten": "Shorten",
  "landing.creatorOverlay": "Creating your link & dashboard…",
  "landing.creatorShortLinkLabel": "Your short link",
  "landing.creatorDashboardLabel": "Your dashboard link — save it",
  "landing.creatorDashboardNote":
    "No account needed. Open this link on any device to manage your links and see analytics. Anyone with it can access your dashboard, so keep it private.",
  "landing.creatorOpenDashboard": "Open dashboard",
  "landing.creatorCopyLink": "Copy link",
  "landing.creatorOpen": "Open",
  "landing.creatorDownloadQr": "Download QR",
  "landing.creatorQrAlt": "QR code",
  "landing.creatorStatsLabel": "Share-only stats link",
  "landing.creatorStatsNote":
    "A read-only analytics page for just this link (no dashboard access).",
  "landing.creatorCreateAnother": "Create another",
  "landing.creatorPlaceholder": "Paste a long URL to shorten…",
  "landing.creatorDestinationAria": "Destination URL",
  "landing.creatorCustomLabel": "Custom link (optional)",
  "landing.creatorSlugPlaceholder": "my-link",
  "landing.creatorCustomizeToggle": "+ Customize the link",
  "landing.creatorReassurance":
    "No account needed. You'll get a private dashboard link to manage everything.",

  // Methodology page
  "landing.methodTitle": "How measurement works",
  "landing.methodIntro":
    "Plain-language explanation of how every number in your dashboard is produced. We only measure what the web request already provides, we never fingerprint, and we label estimates as estimates.",
  "landing.methodClickTitle": "How a click is counted",
  "landing.methodClickP1a": "Every short link points at a server endpoint (",
  "landing.methodClickP1b":
    "). When someone opens it, the server does three things in order: looks up where the link currently points, records one click event, and redirects the visitor to the destination. One request to that endpoint = one recorded click.",
  "landing.methodClickP2":
    "Because the click is recorded server-side, it counts even if the visitor has JavaScript disabled — but it also means automated fetches (previews, crawlers) are recorded too, which is why we separate humans from bots below.",
  "landing.methodBotTitle": "Human vs bot clicks",
  "landing.methodBotP1a": "Each click is classified using the visitor's ",
  "landing.methodBotUserAgent": "User-Agent",
  "landing.methodBotP1b":
    " (the identification string every browser sends). A click is marked as a bot when the User-Agent is missing, or when it matches a known automated pattern:",
  "landing.methodBotSearch":
    "Search engines — Googlebot, Bingbot, DuckDuckBot, Yandex, Baidu",
  "landing.methodBotSocial":
    "Social/messaging preview bots — Facebook, WhatsApp, Telegram, Slack, Discord, X/Twitter, LinkedIn, Pinterest",
  "landing.methodBotAi":
    "AI crawlers — GPTBot, ClaudeBot, CCBot, PerplexityBot, Bytespider",
  "landing.methodBotSeo": "SEO tools — SEMrush, Ahrefs, MJ12bot, DotBot",
  "landing.methodBotScripts":
    "Scripts & tools — curl, wget, python-requests, axios, node-fetch, headless browsers, uptime monitors",
  "landing.methodBotCalloutStrong": "Bot detection is estimated.",
  "landing.methodBotCalloutBody1":
    " A bot that disguises itself as a normal browser will not be caught, and one common case is worth knowing: when a link is shared in a chat app or on social media, that platform fetches the link to build a preview — which is correctly counted as a bot click, even though a human did the sharing. Your headline numbers use ",
  "landing.methodBotCalloutHuman": "human clicks",
  "landing.methodBotCalloutBody2": " by default.",
  "landing.methodUniqueTitle": "Unique & returning visitors (estimated)",
  "landing.methodUniqueP1a":
    "We never place a tracking cookie and never store a raw IP address. To estimate unique visitors, the server derives a one-way hash from a coarse request signal, the link, the current date and a secret salt. This hash ",
  "landing.methodUniqueRotates": "rotates every day",
  "landing.methodUniqueP1b": " and cannot be reversed to identify a person.",
  "landing.methodUniqueP2a":
    "Because the identifier resets daily by design, unique and returning visitor counts are ",
  "landing.methodUniqueEstimates": "estimates",
  "landing.methodUniqueP2b":
    " — the same person seen on two different days may be counted twice. \"Returning\" reflects visitors who clicked more than once, a privacy-preserving lower bound.",
  "landing.methodPlatformTitle": "Platform (device, OS, browser)",
  "landing.methodPlatformBody":
    "Device type (mobile / desktop / tablet), operating system (iOS, Android, Windows, macOS, Linux) and browser are parsed from the same User-Agent string the browser sends. Nothing is probed on the visitor's device.",
  "landing.methodReferrerTitle": "Referrer — where visitors come from",
  "landing.methodReferrerP1a":
    "When a browser follows a link, it usually tells us which site it came from (the ",
  "landing.methodReferrerEm": "referrer",
  "landing.methodReferrerP1b": "). We store only the domain — for example ",
  "landing.methodReferrerP1c":
    ", or a blog's domain — and show it in the Referrers breakdown.",
  "landing.methodReferrerCalloutP1":
    "Some sources hide the referrer — most notably in-app browsers like Instagram and TikTok, which often send nothing, so those clicks appear as \"Unknown\". For reliable attribution, add ",
  "landing.methodReferrerCalloutStrong": "UTM parameters",
  "landing.methodReferrerCalloutP2": " to your link (e.g. ",
  "landing.methodReferrerCalloutP3":
    "); they are captured exactly and shown under UTM campaigns.",
  "landing.methodLocationTitle": "Location (coarse, when available)",
  "landing.methodLocationBody":
    "Country and region come from the hosting network's edge headers when they are available (for example on Vercel). They are country/region level only — never a precise location — and are simply left blank when the platform does not provide them. We don't claim data we can't see.",
  "landing.methodPrivacyTitle": "Privacy & retention",
  "landing.methodPrivacyBody1":
    "No raw IP addresses are stored, there are no cross-site cookies, and there is no device fingerprinting. Click events are retained for {days} days by default and older data is pruned automatically. See the ",
  "landing.methodPrivacyLink": "Privacy Policy",
  "landing.methodPrivacyBody2": " for the full list of what is collected.",

  // Privacy Policy page
  "landing.privacyPageTitle": "Privacy Policy",
  "landing.privacyPageIntro":
    "This is a placeholder policy for the LinkMaker MVP. It describes what the software collects by default. It is not legal advice and makes no claim of regulatory compliance — adapt it to your jurisdiction before going to production.",
  "landing.privacyCollectHeading": "What we collect on a click",
  "landing.privacyCollectIntro":
    "When someone visits a short link, we record only information that the HTTP request and browser already provide:",
  "landing.privacyCollectTimestamp":
    "Timestamp, and derived date / hour / weekday (UTC)",
  "landing.privacyCollectReferrer":
    "Referrer URL and its domain, when sent by the browser",
  "landing.privacyCollectUserAgent":
    "User-agent string, and the browser, browser version, operating system and device type parsed from it",
  "landing.privacyCollectLanguage":
    "Preferred language (from the Accept-Language header)",
  "landing.privacyCollectGeo":
    "Coarse country / region, when the hosting edge network provides it",
  "landing.privacyCollectUtm": "UTM parameters configured on the link",
  "landing.privacyCollectQr":
    "Whether the click came from a QR code or a normal link",
  "landing.privacyCollectBot": "An estimated bot/crawler classification",
  "landing.privacyDontHeading": "What we do not do",
  "landing.privacyDontIps": "We do not store raw IP addresses.",
  "landing.privacyDontCookies":
    "We do not use cookies to follow visitors across sites.",
  "landing.privacyDontFingerprint":
    "We do not perform invasive device fingerprinting.",
  "landing.privacyDontClaim":
    "We do not claim data (like screen size or precise location) that the request does not actually provide.",
  "landing.privacyUniqueHeading": "Unique visitor estimates",
  "landing.privacyUniqueBody1":
    "To estimate unique and returning visitors without tracking people, we compute a one-way hash from a coarse request signal, the link, the current date and a server-side secret. This hash rotates every day and cannot be reversed to identify a person. Because of this, unique and returning visitor counts are ",
  "landing.privacyUniqueEstimates": "estimates",
  "landing.privacyUniqueBody2": ", not exact figures.",
  "landing.privacyBotHeading": "Bot detection",
  "landing.privacyBotBody1":
    "We separate human-like clicks from bot/crawler clicks using user-agent heuristics. ",
  "landing.privacyBotStrong": "Bot detection is estimated",
  "landing.privacyBotBody2": " and will never be perfect.",
  "landing.privacyRetentionHeading": "Data retention",
  "landing.privacyRetentionBody1":
    "Click events are retained for {days} days by default (configurable via the ",
  "landing.privacyRetentionBody2":
    " environment variable). Older events can be pruned automatically by the retention job.",
  "landing.privacyYourDataHeading": "Your data",
  "landing.privacyYourDataBody":
    "Each account can only access its own links, images, campaigns and analytics. Deleting a link deletes its associated events and image.",
} as const;

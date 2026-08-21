/**
 * Best-effort bot / crawler detection based on User-Agent patterns and
 * missing-UA heuristics. This is an ESTIMATE, not a guarantee — it is labeled
 * as such everywhere it surfaces in the UI.
 */

const BOT_PATTERNS: RegExp[] = [
  // Match "…bot" as a crawler-name suffix (Googlebot, AhrefsBot, FooBot/1.0)
  // but not when it is the tail of a real device brand like CUBOT, which would
  // otherwise flag genuine phone traffic as a bot.
  /(?<!cu)bot\b/i,
  /crawl(er|ing)?/i,
  /spider/i,
  /slurp/i,
  /mediapartners/i,
  /facebookexternalhit/i,
  /facebot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /slackbot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterest/i,
  /embedly/i,
  /quora link preview/i,
  /redditbot/i,
  /applebot/i,
  /bingpreview/i,
  /google(bot|-inspectiontool|other)/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandex(bot|images)/i,
  /semrush/i,
  /ahrefs/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /gptbot/i,
  /claudebot/i,
  /ccbot/i,
  /anthropic/i,
  /perplexity/i,
  /headlesschrome/i,
  /phantomjs/i,
  /python-requests/i,
  /axios/i,
  /node-fetch/i,
  /go-http-client/i,
  /curl\//i,
  /wget/i,
  /libwww/i,
  /okhttp/i,
  /java\//i,
  /monitoring|uptime|pingdom|statuscake/i,
];

export interface BotResult {
  isBot: boolean;
  reason: string | null;
}

export function detectBot(userAgent: string | null | undefined): BotResult {
  if (!userAgent || userAgent.trim() === "") {
    return { isBot: true, reason: "missing-user-agent" };
  }
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, reason: `ua-pattern:${pattern.source}` };
    }
  }
  return { isBot: false, reason: null };
}

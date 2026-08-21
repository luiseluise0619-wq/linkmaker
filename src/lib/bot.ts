/**
 * 봇/크롤러(사람이 아닌 자동 프로그램) 추정.
 *
 * [왜 필요?] 링크를 카톡·페북 등에 붙이면 미리보기를 만들기 위해 그 회사의 봇이
 * 먼저 접속한다. 검색엔진 크롤러도 마찬가지. 이런 접속을 "사람 클릭"과 섞으면
 * 통계가 부풀려지므로 따로 표시한다.
 *
 * [방법] User-Agent(브라우저가 자기를 소개하는 문자열)에 아래 단어들이 들어있으면
 * 봇으로 본다. UA가 아예 없어도 의심스러우니 봇으로 취급한다.
 *
 * 이건 100% 정확한 판별이 아니라 "추정"이며, 화면 어디서나 "추정치"로 표시된다.
 */

// 봇으로 판단할 UA 패턴 목록(정규식). 검색엔진·소셜 미리보기·자동화 도구 등을 망라.
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

// UA 문자열을 받아 봇인지 아닌지 판단한다. reason에는 "왜 봇으로 봤는지"를 담는다.
export function detectBot(userAgent: string | null | undefined): BotResult {
  // 1) UA가 비어 있으면 정상 브라우저가 아닐 가능성이 높음 → 봇.
  if (!userAgent || userAgent.trim() === "") {
    return { isBot: true, reason: "missing-user-agent" };
  }
  // 2) 위 패턴 중 하나라도 걸리면 봇.
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, reason: `ua-pattern:${pattern.source}` };
    }
  }
  // 3) 아무것도 안 걸리면 사람으로 본다.
  return { isBot: false, reason: null };
}

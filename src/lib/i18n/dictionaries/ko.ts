import { nav } from "./ko/nav";
import { landing } from "./ko/landing";
import { dash } from "./ko/dash";
import { links } from "./ko/links";
import { forms } from "./ko/forms";
import { misc } from "./ko/misc";

/**
 * Korean dictionary, assembled from one file per feature area. Should cover
 * every key present in en.ts.
 */
export const ko: Record<string, string> = {
  "common.appName": "LinkMaker",
  "common.language": "언어",
  "common.english": "English",
  "common.korean": "한국어",
  ...nav,
  ...landing,
  ...dash,
  ...links,
  ...forms,
  ...misc,
};

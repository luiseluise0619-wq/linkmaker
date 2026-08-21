import { nav } from "./en/nav";
import { landing } from "./en/landing";
import { dash } from "./en/dash";
import { links } from "./en/links";
import { forms } from "./en/forms";
import { misc } from "./en/misc";

/**
 * English source dictionary. Flat dot-namespaced keys, assembled from one file
 * per feature area. This is the source of truth; every key here should also
 * exist in ko.ts (missing keys fall back to this English text).
 */
export const en: Record<string, string> = {
  "common.appName": "LinkMaker",
  "common.language": "Language",
  "common.english": "English",
  "common.korean": "한국어",
  ...nav,
  ...landing,
  ...dash,
  ...links,
  ...forms,
  ...misc,
};

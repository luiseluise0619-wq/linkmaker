import { customAlphabet } from "./nanoid";

// URL-safe, unambiguous alphabet (no 0/O/1/l/I).
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const generate = customAlphabet(ALPHABET, 7);

export const SLUG_MIN = 3;
export const SLUG_MAX = 64;
// Allowed characters for a user-provided custom slug.
export const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Slugs that would collide with app routes.
export const RESERVED_SLUGS = new Set([
  "api",
  "go",
  "dashboard",
  "login",
  "register",
  "logout",
  "privacy",
  "settings",
  "links",
  "analytics",
  "campaigns",
  "admin",
  "new",
  "static",
  "_next",
  "favicon.ico",
]);

export function randomSlug(): string {
  return generate();
}

export function isValidSlug(slug: string): boolean {
  return (
    slug.length >= SLUG_MIN &&
    slug.length <= SLUG_MAX &&
    SLUG_PATTERN.test(slug) &&
    !RESERVED_SLUGS.has(slug.toLowerCase())
  );
}

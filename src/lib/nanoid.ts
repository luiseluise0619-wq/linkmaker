import { randomBytes } from "crypto";

/**
 * Minimal, dependency-free nanoid-style generator using Node's CSPRNG.
 * Uses rejection sampling to avoid modulo bias.
 */
export function customAlphabet(alphabet: string, defaultSize: number) {
  const mask = (2 << Math.floor(Math.log2(alphabet.length - 1))) - 1;
  const step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length);

  return function (size = defaultSize): string {
    let id = "";
    while (true) {
      const bytes = randomBytes(step);
      for (let i = 0; i < step; i++) {
        const index = bytes[i] & mask;
        if (index < alphabet.length) {
          id += alphabet[index];
          if (id.length === size) return id;
        }
      }
    }
  };
}

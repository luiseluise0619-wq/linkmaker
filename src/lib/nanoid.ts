// 이 파일은 짧고 무작위한 ID 문자열(예: 슬러그 abc123)을 만드는 생성기다.
// nanoid라는 유명 라이브러리와 같은 방식을, 외부 의존성 없이 아주 작게 구현했다.
// randomBytes = Node.js가 제공하는 "암호학적으로 안전한 난수" 생성기(추측하기 어려움).
import { randomBytes } from "crypto";

/**
 * Minimal, dependency-free nanoid-style generator using Node's CSPRNG.
 * Uses rejection sampling to avoid modulo bias.
 */
// customAlphabet(사용할 글자들, 기본 길이) 를 주면, "그 글자들로 무작위 ID를 만드는 함수"를
// 돌려준다. 예: customAlphabet("abc123", 6) -> 호출할 때마다 6글자 무작위 ID 생성.
export function customAlphabet(alphabet: string, defaultSize: number) {
  // mask = 난수 바이트에서 필요한 아래 비트만 남기는 값(2의 거듭제곱-1 형태의 비트마스크).
  // 글자 개수에 딱 맞는 범위의 값을 뽑기 위한 준비다.
  const mask = (2 << Math.floor(Math.log2(alphabet.length - 1))) - 1;
  // step = 한 번에 몇 바이트의 난수를 뽑을지. 버려지는 값을 감안해 넉넉히 잡는다.
  const step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length);

  return function (size = defaultSize): string {
    let id = "";
    // 원하는 길이가 될 때까지 반복. randomBytes로 난수 바이트 뭉치를 받아 하나씩 본다.
    while (true) {
      const bytes = randomBytes(step);
      for (let i = 0; i < step; i++) {
        // mask로 자른 값(index)이 글자 개수 범위 안일 때만 채택한다.
        // 범위를 벗어난 값은 그냥 버린다(= rejection sampling). 이렇게 해야 특정 글자가
        // 더 자주 뽑히는 편향(modulo bias)이 없어 모든 글자가 고르게 나온다.
        const index = bytes[i] & mask;
        if (index < alphabet.length) {
          id += alphabet[index];
          if (id.length === size) return id;
        }
      }
    }
  };
}

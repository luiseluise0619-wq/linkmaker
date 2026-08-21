// 이 파일은 데이터를 CSV 파일로 만들어 내려받게 해 준다.
// CSV = 값을 쉼표(,)로 구분해 표처럼 저장하는 텍스트 형식. 엑셀/구글시트에서 열 수 있다.

// Cell = CSV 한 칸에 들어갈 수 있는 값의 종류(문자열/숫자/불리언/날짜/빈값).
type Cell = string | number | boolean | Date | null | undefined;

// BOM = 파일 맨 앞에 붙이는 눈에 안 보이는 표시. 이걸 넣어야 엑셀이 한글 같은
// 비영어 글자를 UTF-8로 올바르게 읽어 깨지지 않는다.
// UTF-8 byte order mark so Excel opens the file with the correct encoding.
const BOM = String.fromCharCode(0xfeff);

// 한 칸의 값을 CSV에 안전하게 넣을 수 있는 문자열로 변환한다.
function escapeCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  // 날짜는 표준 문자열(ISO 형식)로, 나머지는 그냥 문자열로 바꾼다.
  let s = value instanceof Date ? value.toISOString() : String(value);
  // Prevent CSV formula injection: a leading =, +, -, @ (or tab/CR) can make
  // Excel/Sheets execute a cell's content as a formula. Neutralize with a
  // leading apostrophe.
  // 정규식 /^[=+\-@\t\r]/ : 값이 = + - @ 또는 탭/줄바꿈으로 "시작"하는지 검사.
  // 이런 값은 엑셀이 수식(계산식)으로 오해해 실행할 수 있어(=CSV 수식 주입 공격),
  // 앞에 작은따옴표(')를 붙여 그냥 글자로만 취급되게 무력화한다.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  // 값 안에 큰따옴표/쉼표/줄바꿈이 있으면 CSV 칸 구분이 깨지므로,
  // 전체를 큰따옴표로 감싸고 내부의 " 는 "" 로 두 번 써서 안전하게 만든다.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Build a CSV string. Prepends a UTF-8 BOM so Excel opens it with the correct
 * encoding (important for non-ASCII text), and uses CRLF line endings.
 */
// 제목 줄(header)과 데이터 줄들(rows)을 받아 완성된 CSV 문자열을 만든다.
// 각 칸은 escapeCell로 안전하게 처리하고 쉼표로 잇고, 줄은 \r\n(CRLF)로 잇는다.
export function toCsv(header: string[], rows: Cell[][]): string {
  const lines = [header, ...rows].map((row) => row.map(escapeCell).join(","));
  return BOM + lines.join("\r\n");
}

// CSV 문자열을 "파일 다운로드"로 처리되게 하는 HTTP 응답을 만든다.
// Content-Disposition: attachment 헤더가 브라우저에게 화면에 열지 말고
// 파일로 저장하라고 지시한다. Cache-Control: no-store 는 캐시(임시 저장) 금지.
/** A Response that downloads as a CSV file. */
export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

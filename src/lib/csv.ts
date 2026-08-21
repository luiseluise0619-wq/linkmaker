type Cell = string | number | boolean | Date | null | undefined;

// UTF-8 byte order mark so Excel opens the file with the correct encoding.
const BOM = String.fromCharCode(0xfeff);

function escapeCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  let s = value instanceof Date ? value.toISOString() : String(value);
  // Prevent CSV formula injection: a leading =, +, -, @ (or tab/CR) can make
  // Excel/Sheets execute a cell's content as a formula. Neutralize with a
  // leading apostrophe.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Build a CSV string. Prepends a UTF-8 BOM so Excel opens it with the correct
 * encoding (important for non-ASCII text), and uses CRLF line endings.
 */
export function toCsv(header: string[], rows: Cell[][]): string {
  const lines = [header, ...rows].map((row) => row.map(escapeCell).join(","));
  return BOM + lines.join("\r\n");
}

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

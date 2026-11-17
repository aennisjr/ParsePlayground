/**
 * CSV / XML / HTML serialisers shared by the API (lib/api.ts) and the
 * build-time exports (scripts/generate-data.ts). No framework imports, so the
 * generator can load this file directly with Node.
 */

export const xmlEsc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function xmlNode(key: string, v: unknown): string {
  if (Array.isArray(v)) return `<${key}>${v.map((x) => xmlNode("item", x)).join("")}</${key}>`;
  if (v && typeof v === "object") return `<${key}>${Object.entries(v).map(([k, x]) => xmlNode(k, x)).join("")}</${key}>`;
  return v == null ? `<${key}/>` : `<${key}>${xmlEsc(String(v))}</${key}>`;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isTabular = (v: unknown) => v == null || typeof v !== "object" || (Array.isArray(v) && v.every((x) => x == null || typeof x !== "object"));

/** Turns nested objects into dotted keys: { address: { city } } → { "address.city" }. Arrays are left as they are. */
export function flattenRow(row: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (isPlainObject(v)) Object.assign(out, flattenRow(v, `${prefix}${k}.`));
    else out[`${prefix}${k}`] = v;
  }
  return out;
}

/**
 * Columns for a table view of the rows: nested objects become dotted columns,
 * arrays of scalars stay (joined later), and arrays of objects such as
 * reviews are left out because they don't fit in one cell.
 */
export function tableColumns(rows: Record<string, unknown>[]): { cols: string[]; flat: Record<string, unknown>[] } {
  const flat = rows.map((r) => flattenRow(r));
  const seen = new Set<string>();
  for (const r of flat) for (const k of Object.keys(r)) seen.add(k);
  const cols = [...seen].filter((k) => flat.every((r) => isTabular(r[k])));
  return { cols, flat };
}

/** RFC 4180-style CSV (LF line endings, UTF-8, no BOM). Arrays are joined with "|". */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const { cols, flat } = tableColumns(rows);
  const esc = (v: unknown) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("|") : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.map(esc).join(","), ...flat.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}

export const toXml = (root: string, item: string, rows: object[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>${rows.map((r) => xmlNode(item, r)).join("\n")}</${root}>\n`;

/** A standalone HTML page holding the rows in table#export, with one <th> per CSV column. */
export function toHtml(title: string, rows: Record<string, unknown>[], note = ""): string {
  const { cols, flat } = tableColumns(rows);
  const cell = (v: unknown) => xmlEsc(v == null ? "" : Array.isArray(v) ? v.join(", ") : String(v));
  const body = flat.map((r) => `<tr>${cols.map((c) => `<td>${cell(r[c])}</td>`).join("")}</tr>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${xmlEsc(title)} export</title>
<style>
body{font:14px/1.45 system-ui,sans-serif;margin:24px;color:#1e293b}
table{border-collapse:collapse;font-size:13px}
th,td{border:1px solid #e2e8f0;padding:4px 8px;text-align:left;vertical-align:top}
th{background:#f1f5f9;position:sticky;top:0}
caption{text-align:left;margin-bottom:8px;color:#64748b}
</style>
</head>
<body>
<h1>${xmlEsc(title)}</h1>
<table id="export">
<caption>${rows.length} rows${note ? `. ${xmlEsc(note)}` : ""}</caption>
<thead><tr>${cols.map((c) => `<th scope="col">${xmlEsc(c)}</th>`).join("")}</tr></thead>
<tbody>
${body}
</tbody>
</table>
</body>
</html>
`;
}

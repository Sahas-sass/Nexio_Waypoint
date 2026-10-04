/** First letter of a store name for avatar chips ("" when unknown). */
export function getStoreInitial(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "";
}

/** Supabase embeds a to-one relation as an object or a single-element array. */
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/** "08:30:00" → "08:30"; null passthrough. */
export function shortTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = /^(\d{1,2}:\d{2})/.exec(value);
  return m ? m[1].padStart(5, "0") : null;
}

/** Local calendar date as YYYY-MM-DD, offset by `days`. */
export function isoDate(date: Date, days = 0): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "2026-10-05" → "Mon, 5 Oct". */
export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** Human "x min ago" for an ISO timestamp relative to `now`. */
export function timeAgo(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "No updates yet";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "No updates yet";
  const mins = Math.max(0, Math.round((now.getTime() - t) / 60000));
  if (mins < 1) return "Updated just now";
  if (mins < 60) return `Last update ${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Last update ${hours} h ago`;
  return `Last update ${Math.round(hours / 24)} d ago`;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "08:30:00" → "8:30 AM". Returns null for empty / malformed input. */
export function formatClock(time: string | null | undefined): string | null {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  if (hours > 23) return null;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${match[2]} ${suffix}`;
}

/**
 * Store delivery window from start/end times, falling back to the order's
 * free-text window. Returns null when nothing is known.
 */
export function formatWindow(
  start: string | null | undefined,
  end: string | null | undefined,
  fallback?: string | null
): string | null {
  const s = formatClock(start);
  const e = formatClock(end);
  if (s && e) return `${s} – ${e}`;
  if (e) return `Before ${e}`;
  if (s) return `From ${s}`;
  return fallback?.trim() || null;
}

/** ISO timestamp → local "8:24 AM". */
export function formatTimestamp(iso: string | number | null | undefined): string | null {
  if (iso == null || iso === '') return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return formatClock(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`);
}

/** Date header parts: { fullDate: "Monday, 14 October", dayNumber: "14", shortMonth: "OCT" }. */
export function formatDateParts(date: Date = new Date()) {
  const monthName = MONTHS[date.getMonth()];
  return {
    fullDate: `${DAYS[date.getDay()]}, ${date.getDate()} ${monthName}`,
    dayNumber: String(date.getDate()),
    shortMonth: monthName.substring(0, 3).toUpperCase(),
  };
}

/** "2026-10-04" (a date column) → Date in local time. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** 1620.4 → "1,620 kg". */
export function formatKg(kg: number): string {
  return `${Math.round(kg).toLocaleString('en-US')} kg`;
}

/** Two-digit stop number: 2 → "02". */
export function padStop(sequence: number): string {
  return String(sequence).padStart(2, '0');
}

/** Initials for an avatar: "Kasun Perera" → "KP". */
export function initials(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

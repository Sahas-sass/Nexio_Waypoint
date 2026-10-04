/** Sri Lanka has a fixed UTC+05:30 offset (no DST). */
const COLOMBO_OFFSET_MIN = 330;
const CUTOFF_MINUTES = 16 * 60;
const TZ = "Asia/Colombo";

function shifted(now: Date): Date {
  return new Date(now.getTime() + COLOMBO_OFFSET_MIN * 60_000);
}

/** Today's date (YYYY-MM-DD) in Colombo. */
export function colomboToday(now: Date = new Date()): string {
  return shifted(now).toISOString().slice(0, 10);
}

/** Minutes since midnight in Colombo. */
export function colomboMinutes(now: Date = new Date()): number {
  const d = shifted(now);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Mirrors place_order: before 16:00 Colombo the earliest date is tomorrow, otherwise the day after. */
export function earliestDeliveryDate(now: Date = new Date()): string {
  return addDays(colomboToday(now), colomboMinutes(now) < CUTOFF_MINUTES ? 1 : 2);
}

export interface CutoffStatus {
  open: boolean;
  minutesRemaining: number;
  /** Share of the ordering day (00:00-16:00) already elapsed, 0..1. */
  progress: number;
  earliestDate: string;
}

export function cutoffStatus(now: Date = new Date()): CutoffStatus {
  const minutes = colomboMinutes(now);
  const open = minutes < CUTOFF_MINUTES;
  return {
    open,
    minutesRemaining: open ? CUTOFF_MINUTES - minutes : 0,
    progress: Math.min(1, minutes / CUTOFF_MINUTES),
    earliestDate: earliestDeliveryDate(now),
  };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Formats a date-only string (YYYY-MM-DD) without timezone shifting. */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ,
  });
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
}

/** "08:00:00" + "08:30:00" -> "08:00 – 08:30" */
export function formatWindow(start: string | null, end: string | null): string {
  if (!start || !end) return "Not set";
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

export function greeting(now: Date = new Date()): string {
  const hour = Math.floor(colomboMinutes(now) / 60);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** "SUNDAY • OCTOBER 4" */
export function headlineDate(now: Date = new Date()): string {
  const weekday = now.toLocaleDateString("en-US", { weekday: "long", timeZone: TZ });
  const monthDay = now.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: TZ });
  return `${weekday} • ${monthDay}`.toUpperCase();
}

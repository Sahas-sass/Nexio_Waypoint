/** True when at least `intervalMs` has passed since the last send (or nothing was sent yet). */
export function isDue(lastSentAt: number | null, now: number, intervalMs: number): boolean {
  return lastSentAt === null || now - lastSentAt >= intervalMs;
}

/** Sensor values such as speed/heading are -1 or null when unknown; drop those. */
export function nonNegativeOrUndefined(value: number | null | undefined): number | undefined {
  return value != null && value >= 0 ? value : undefined;
}

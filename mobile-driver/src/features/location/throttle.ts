/** True when at least `intervalMs` has passed since the last send (or nothing was sent yet). */
export function isDue(lastSentAt: number | null, now: number, intervalMs: number): boolean {
  return lastSentAt === null || now - lastSentAt >= intervalMs;
}

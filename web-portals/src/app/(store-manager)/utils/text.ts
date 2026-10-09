/** "Waypoint Fresh" -> "WF" */
export function initials(name: string | null | undefined, fallback = "ST"): string {
  const letters = (name ?? "")
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return letters || fallback;
}

/** First word of a full name, for greetings. */
export function firstName(fullName: string | null | undefined): string | null {
  const first = (fullName ?? "").trim().split(/\s+/)[0];
  return first || null;
}

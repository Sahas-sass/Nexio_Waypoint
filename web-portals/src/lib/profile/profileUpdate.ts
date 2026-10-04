/** Profile fields a user may change about themselves (camelCase request key → profiles column). */
const TEXT_FIELDS = {
  fullName: { column: "full_name", max: 100, required: true },
  phone: { column: "phone", max: 20 },
  department: { column: "department", max: 100 },
  outlet: { column: "outlet", max: 100 },
  shift: { column: "shift", max: 100 },
  station: { column: "station", max: 100 },
  assignedBay: { column: "assigned_bay", max: 100 },
  assignedMeta: { column: "assigned_meta", max: 200 },
} as const;

/** Privileged fields that only staff tooling / the service role may change. */
const FORBIDDEN_FIELDS = [
  "id", "role", "storeId", "store_id", "permissions", "isVerified", "is_verified",
  "status", "employeeId", "employee_id", "email",
];

const MAX_ACTIVITIES = 10;
const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;

export type ProfileUpdateResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string };

function sanitizeActivities(value: unknown): Record<string, string>[] | null {
  if (!Array.isArray(value) || value.length > MAX_ACTIVITIES) return null;
  const items: Record<string, string>[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const entry: Record<string, string> = {};
    for (const key of ["title", "meta", "type", "time"] as const) {
      const v = (item as Record<string, unknown>)[key];
      if (typeof v !== "string" || v.length > 200) return null;
      entry[key] = v;
    }
    items.push(entry);
  }
  return items;
}

/** Validates a self-service profile update request and converts it to a profiles row patch. */
export function sanitizeProfileUpdate(body: unknown): ProfileUpdateResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid request body" };
  }
  const input = body as Record<string, unknown>;

  const forbidden = FORBIDDEN_FIELDS.find((key) => input[key] !== undefined);
  if (forbidden) return { ok: false, error: `Field "${forbidden}" cannot be changed` };

  const payload: Record<string, unknown> = {};
  for (const [key, rule] of Object.entries(TEXT_FIELDS)) {
    const value = input[key];
    if (value === undefined) continue;
    if (value === null && !("required" in rule)) {
      payload[rule.column] = null;
      continue;
    }
    if (typeof value !== "string") return { ok: false, error: `${key} must be text` };
    const trimmed = value.trim();
    if ("required" in rule && trimmed.length === 0) return { ok: false, error: `${key} cannot be empty` };
    if (trimmed.length > rule.max) return { ok: false, error: `${key} is too long (max ${rule.max})` };
    if (key === "phone" && trimmed && !PHONE_PATTERN.test(trimmed)) {
      return { ok: false, error: "phone is not a valid phone number" };
    }
    payload[rule.column] = trimmed || null;
  }

  if (input.activities !== undefined) {
    const activities = sanitizeActivities(input.activities);
    if (!activities) return { ok: false, error: `activities must be a list of at most ${MAX_ACTIVITIES} entries` };
    payload.activities = activities;
  }

  if (Object.keys(payload).length === 0) return { ok: false, error: "No editable fields provided" };
  return { ok: true, payload };
}

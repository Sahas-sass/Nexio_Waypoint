import type { PlaceOrderInput, Priority, TempType } from "../types";
import { earliestDeliveryDate } from "./dates";

export interface OrderFormValues {
  targetDate: string;
  temp: string;
  weightKg: string;
  volumeM3: string;
  itemCount: string;
  priority: string;
  notes: string;
}

export type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>;

export const ORDER_LIMITS = { maxWeightKg: 20000, maxVolumeM3: 100, maxItems: 5000, maxNotes: 500 } as const;
const TEMPS: TempType[] = ["ambient", "chilled"];
const PRIORITIES: Priority[] = ["High", "Standard", "Low"];

export function emptyOrderForm(now: Date = new Date()): OrderFormValues {
  return { targetDate: earliestDeliveryDate(now), temp: "ambient", weightKg: "", volumeM3: "", itemCount: "", priority: "Standard", notes: "" };
}

function positiveNumber(raw: string, max: number, label: string, unit: string): [number | null, string | undefined] {
  if (!raw.trim()) return [null, `${label} is required`];
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return [null, `${label} must be greater than 0`];
  if (value > max) return [null, `${label} cannot exceed ${max} ${unit}`];
  return [value, undefined];
}

/** Validates the place-order form; returns either field errors or the RPC-ready input. */
export function validateOrderForm(
  values: OrderFormValues,
  now: Date = new Date(),
): { errors: OrderFormErrors; input: PlaceOrderInput | null } {
  const errors: OrderFormErrors = {};
  const earliest = earliestDeliveryDate(now);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.targetDate) || Number.isNaN(Date.parse(values.targetDate))) {
    errors.targetDate = "Choose a delivery date";
  } else if (values.targetDate < earliest) {
    errors.targetDate = `Cutoff rule: earliest delivery date is ${earliest}`;
  }
  if (!TEMPS.includes(values.temp as TempType)) errors.temp = "Choose ambient or chilled";
  if (!PRIORITIES.includes(values.priority as Priority)) errors.priority = "Choose a priority";

  const [weightKg, weightErr] = positiveNumber(values.weightKg, ORDER_LIMITS.maxWeightKg, "Weight", "kg");
  const [volumeM3, volumeErr] = positiveNumber(values.volumeM3, ORDER_LIMITS.maxVolumeM3, "Volume", "m³");
  const [itemCount, itemErr] = positiveNumber(values.itemCount, ORDER_LIMITS.maxItems, "Item count", "items");
  if (weightErr) errors.weightKg = weightErr;
  if (volumeErr) errors.volumeM3 = volumeErr;
  if (itemErr) errors.itemCount = itemErr;
  else if (itemCount !== null && !Number.isInteger(itemCount)) errors.itemCount = "Item count must be a whole number";

  const notes = values.notes.trim();
  if (notes.length > ORDER_LIMITS.maxNotes) errors.notes = `Notes cannot exceed ${ORDER_LIMITS.maxNotes} characters`;

  if (Object.keys(errors).length > 0) return { errors, input: null };
  return {
    errors,
    input: {
      targetDate: values.targetDate,
      temp: values.temp as TempType,
      weightKg: weightKg as number,
      volumeM3: volumeM3 as number,
      itemCount: itemCount as number,
      priority: values.priority as Priority,
      notes: notes || null,
    },
  };
}

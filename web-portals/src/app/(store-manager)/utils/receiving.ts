import type { ConfirmReceiptInput, IssueType } from "../types";

export const ISSUE_TYPES: { value: IssueType; label: string }[] = [
  { value: "shortage", label: "Shortage" },
  { value: "damaged", label: "Damaged goods" },
  { value: "wrong_item", label: "Wrong item" },
  { value: "temperature", label: "Temperature breach" },
  { value: "late", label: "Late delivery" },
  { value: "other", label: "Other" },
];

export function issueLabel(issue: string | null | undefined): string {
  if (!issue) return "None";
  return ISSUE_TYPES.find((i) => i.value === issue)?.label ?? issue;
}

export interface ReceiptFormValues {
  itemsReceived: string;
  issueType: string;
  issueNote: string;
}

export const MAX_ISSUE_NOTE = 500;

/** Validates the confirm-receipt form against the order's expected item count. */
export function validateReceiptForm(
  orderId: string,
  itemsExpected: number | null,
  values: ReceiptFormValues,
): { error: string | null; input: ConfirmReceiptInput | null } {
  const raw = values.itemsReceived.trim();
  const items = Number(raw);
  if (!raw || !Number.isInteger(items) || items < 0) return { error: "Items received must be a whole number of 0 or more", input: null };
  if (itemsExpected !== null && items > itemsExpected) return { error: `Items received cannot exceed the ${itemsExpected} ordered`, input: null };

  const issueType = values.issueType ? (values.issueType as IssueType) : null;
  if (issueType && !ISSUE_TYPES.some((i) => i.value === issueType)) return { error: "Choose a valid issue type", input: null };
  const note = values.issueNote.trim();
  if (note.length > MAX_ISSUE_NOTE) return { error: `Note cannot exceed ${MAX_ISSUE_NOTE} characters`, input: null };
  const shortfall = itemsExpected !== null && items < itemsExpected;
  if (shortfall && !issueType) return { error: "Select an issue type for the missing items", input: null };

  return { error: null, input: { orderId, itemsReceived: items, issueType, issueNote: note || null } };
}

/** True when an evidence reference is a storage object path rather than a full URL / data URI. */
export function isStoragePath(ref: string | null | undefined): ref is string {
  return !!ref && !/^(https?:|data:|blob:|file:)/i.test(ref);
}

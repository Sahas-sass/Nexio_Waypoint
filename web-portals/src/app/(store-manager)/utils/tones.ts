import type { Tone } from "../components/StatusPill";

const ORDER_TONES: Record<string, Tone> = {
  pending: "yellow", planning: "blue", assigned: "blue", deferred: "amber", delivered: "green",
};
const RECEIPT_TONES: Record<string, Tone> = { received: "green", partial: "amber", rejected: "red" };
const STOP_TONES: Record<string, Tone> = { PENDING: "yellow", IN_PROGRESS: "green", COMPLETED: "green", FAILED: "red" };

export const orderTone = (status: string): Tone => ORDER_TONES[status] ?? "neutral";
export const receiptTone = (status: string): Tone => RECEIPT_TONES[status] ?? "neutral";
export const stopTone = (status: string): Tone => STOP_TONES[status] ?? "neutral";
export const outcomeTone = (outcome: string): Tone => (outcome === "delivered" ? "green" : outcome === "partial" ? "amber" : "red");

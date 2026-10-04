import { supabase } from "@/lib/supabaseClient";
import type { ProofOfDelivery, TripStop } from "../types";
import { single, unwrap } from "../utils/errors";
import { isStoragePath } from "../utils/receiving";

const STOP_COLUMNS =
  "id, order_id, stop_sequence, status, estimated_arrival, completed_at, trip:trips(trip_number, trip_date, status, eta_time, vehicle:vehicles(registration_number, vehicle_type))";
const POD_COLUMNS =
  "id, stop_id, outcome, items_expected, items_delivered, signature_url, photo_url, notes, captured_offline, captured_at";
export const EVIDENCE_BUCKET = "pod-evidence";

type RawStop = Omit<TripStop, "trip"> & { trip: unknown };

function normaliseStop(raw: RawStop): TripStop {
  const trip = single(raw.trip as (TripStop["trip"] & { vehicle: unknown }) | null);
  return { ...raw, trip: trip ? { ...trip, vehicle: single(trip.vehicle as NonNullable<TripStop["trip"]>["vehicle"]) } : null };
}

/** Trip stops at the store with their trip and vehicle (RLS limits to the manager's store). */
export async function fetchStoreStops(storeId: string): Promise<TripStop[]> {
  const result = await supabase.from("trip_stops").select(STOP_COLUMNS).eq("store_id", storeId);
  return (unwrap(result, []) as RawStop[]).map(normaliseStop);
}

/** Proof of delivery per order id, looked up through the order's trip stop(s). */
export async function fetchProofsByOrder(orderIds: string[]): Promise<Map<string, ProofOfDelivery>> {
  const proofs = new Map<string, ProofOfDelivery>();
  if (orderIds.length === 0) return proofs;
  const result = await supabase
    .from("trip_stops")
    .select(`id, order_id, proof:proof_of_delivery(${POD_COLUMNS})`)
    .in("order_id", orderIds);
  const rows = unwrap(result, []) as { order_id: string; proof: unknown }[];
  for (const row of rows) {
    const proof = single(row.proof as ProofOfDelivery | ProofOfDelivery[] | null);
    if (proof) proofs.set(row.order_id, proof);
  }
  return proofs;
}

/** Resolves an evidence reference to a viewable URL (signed for private storage paths). */
export async function getEvidenceUrl(ref: string | null): Promise<string | null> {
  if (!ref) return null;
  if (!isStoragePath(ref)) return ref;
  const { data, error } = await supabase.storage.from(EVIDENCE_BUCKET).createSignedUrl(ref, 60 * 60);
  if (error || !data?.signedUrl) throw new Error("Could not load delivery evidence.");
  return data.signedUrl;
}

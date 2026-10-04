import { supabase } from "@/lib/supabaseClient";
import {
  TripVehicle,
  PastLogEntry,
  ExceptionSubmission,
  ExceptionReasonCode,
  ReeferTempCheck,
} from "../types";
import {
  mapTrip,
  mapLoadingLog,
  TripRow,
  StopRow,
  PalletRow,
  LoadingLogRow,
} from "../utils/tripMapping";
import { buildDispatchNotes } from "../utils/sealAndReefer";
import { tripProgress } from "../utils/tripQueueHelpers";

/**
 * Fetch all trips with vehicle, driver, stops and pallets from Supabase.
 */
export async function fetchTripsWithDetails(): Promise<TripVehicle[]> {
  const { data: tripsData, error: tripsErr } = await supabase
    .from("trips")
    .select(`
      id, trip_number, bay, status, departure_time, cutoff_time,
      vehicles:vehicle_id ( id, registration_number, vehicle_type, max_weight_kg, is_refrigerated ),
      driver:driver_id ( id, full_name, phone )
    `)
    .order("created_at", { ascending: true });

  if (tripsErr) throw tripsErr;
  const trips = (tripsData ?? []) as unknown as TripRow[];
  if (trips.length === 0) return [];

  const tripIds = trips.map((t) => t.id);

  const { data: stopsData, error: stopsErr } = await supabase
    .from("trip_stops")
    .select("id, trip_id, stop_sequence, order_id, store_id, stores:store_id ( id, name, address )")
    .in("trip_id", tripIds)
    .order("stop_sequence", { ascending: true });
  if (stopsErr) throw stopsErr;

  const { data: palletsData, error: palletsErr } = await supabase
    .from("pallets")
    .select("id, trip_id, stop_id, order_id, sku, name, category, temp_req, weight_kg, is_verified, verified_at")
    .in("trip_id", tripIds)
    .order("created_at", { ascending: true });
  if (palletsErr) throw palletsErr;

  const stops = (stopsData ?? []) as unknown as StopRow[];
  const pallets = (palletsData ?? []) as unknown as PalletRow[];
  return trips.map((t) => mapTrip(t, stops, pallets));
}

/**
 * Toggle pallet verification.
 */
export async function updatePalletVerification(
  palletId: string,
  newVerifiedStatus: boolean,
  userId?: string
): Promise<void> {
  const { error } = await supabase
    .from("pallets")
    .update({
      is_verified: newVerifiedStatus,
      verified_at: newVerifiedStatus ? new Date().toISOString() : null,
      verified_by: newVerifiedStatus ? userId ?? null : null,
    })
    .eq("id", palletId);

  if (error) throw error;
}

/**
 * Record a loader exception (shortfall/damage) for the Dispatcher & Store Manager.
 */
export async function createPalletException(submission: ExceptionSubmission): Promise<void> {
  const actionTaken = submission.palletSku
    ? `[${submission.palletSku}] ${submission.actionTaken}`
    : submission.actionTaken;

  const { error } = await supabase.from("exceptions").insert({
    order_id: submission.orderId ?? null,
    store_id: submission.storeId ?? null,
    reason_code: submission.reasonCode,
    action_taken: actionTaken,
    is_read: false,
  });

  if (error) throw error;
}

/**
 * Seal & dispatch a vehicle: sets the trip en_route with its seal, records an
 * exception if a discrepancy was reported, and writes the loading_logs audit row.
 */
export async function finalizeAndDispatchTrip(params: {
  trip: TripVehicle;
  sealNumber: string;
  hasDiscrepancy: boolean;
  discrepancyNote: string;
  discrepancyReason?: ExceptionReasonCode;
  signature: string;
  shift?: string;
  tempCheck?: ReeferTempCheck;
  userId?: string;
}): Promise<PastLogEntry> {
  const { trip, sealNumber, hasDiscrepancy, discrepancyNote, discrepancyReason, signature, shift, tempCheck, userId } =
    params;

  const fullNotes = buildDispatchNotes(discrepancyNote, tempCheck);
  const dispatchedAt = new Date().toISOString();

  const { error: tripErr } = await supabase
    .from("trips")
    .update({
      status: "en_route",
      security_seal: sealNumber,
      has_discrepancy: hasDiscrepancy,
      discrepancy_note: fullNotes || null,
      dispatched_at: dispatchedAt,
      loader_id: userId ?? null,
    })
    .eq("id", trip.id);
  if (tripErr) throw tripErr;

  if (hasDiscrepancy && trip.stops.length > 0) {
    const firstStop = trip.stops[0];
    await createPalletException({
      orderId: firstStop.orderId,
      storeId: firstStop.rawStoreId,
      reasonCode: discrepancyReason ?? "OTHER",
      actionTaken: fullNotes || `Exception noted by ${signature} at ${trip.bay}`,
    });
  }

  const { total: totalPallets, verified: verifiedPallets } = tripProgress(trip);
  const totalWeightKg = Math.round(trip.currentWeightTons * 1000);
  const storesSummary = trip.stops.map((s) => s.storeName).join(" • ");

  const logPayload = {
    trip_id: trip.id,
    trip_number: trip.tripNumber,
    bay: trip.bay,
    plate_number: trip.plateNumber,
    vehicle_model: trip.vehicleModel,
    vehicle_type: trip.vehicleType,
    driver_name: trip.driverName,
    driver_phone: trip.driverPhone || null,
    dispatched_at: dispatchedAt,
    ...(shift ? { shift } : {}),
    seal_number: sealNumber,
    total_pallets: totalPallets,
    verified_pallets: verifiedPallets,
    total_weight_kg: totalWeightKg,
    stores_count: trip.stops.length,
    stores_summary: storesSummary,
    status: "dispatched",
    signature,
    has_discrepancy: hasDiscrepancy,
    discrepancy_note: fullNotes || null,
  };

  const { data: logData, error: logErr } = await supabase
    .from("loading_logs")
    .insert(logPayload)
    .select()
    .single();
  if (logErr) throw logErr;

  return mapLoadingLog(logData as LoadingLogRow);
}

/**
 * Fetch past loading & dispatch audit logs, newest first.
 */
export async function fetchPastLogs(): Promise<PastLogEntry[]> {
  const { data, error } = await supabase
    .from("loading_logs")
    .select("*")
    .order("dispatched_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as LoadingLogRow[]).map(mapLoadingLog);
}

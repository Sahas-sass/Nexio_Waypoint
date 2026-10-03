import { supabase } from "@/lib/supabaseClient";
import { TripVehicle, StopGroup, PalletItem, PastLogEntry, ExceptionSubmission, ReeferTempCheck } from "../types";

// Vehicle image fallback mapping (Distinct verified photos for each vehicle)
const VEHICLE_IMAGES: Record<string, string> = {
  "TRK-024": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop", // Isuzu NPR Heavy Freight
  "VAN-012": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop", // Toyota HiAce Urban Express
  "TRK-019": "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop", // Mitsubishi Fuso Multi-Temp
  "TRK-031": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop", // Hino 500 Dual-Zone Reefer
  "VAN-008": "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop", // Nissan NV350 High-Roof Van
  "TRK-042": "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=1000&auto=format&fit=crop", // Isuzu Forward Chilled Liner
  "VAN-016": "https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=1000&auto=format&fit=crop", // Hyundai Porter Chilled Van
  "TRK-055": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1000&auto=format&fit=crop", // UD Quester Heavy Hauler
  default: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop"
};

/**
 * Fetch all active trips with vehicle, driver, stops, and pallets from Supabase
 */
export async function fetchTripsWithDetails(): Promise<TripVehicle[]> {
  try {
    // 1. Fetch Trips with Vehicles and Drivers
    const { data: tripsData, error: tripsErr } = await supabase
      .from("trips")
      .select(`
        id,
        trip_number,
        bay,
        status,
        departure_time,
        cutoff_time,
        security_seal,
        has_discrepancy,
        discrepancy_note,
        vehicles:vehicle_id (
          id,
          registration_number,
          vehicle_type,
          max_weight_kg,
          is_refrigerated
        ),
        driver:driver_id (
          id,
          full_name,
          phone
        )
      `)
      .order("created_at", { ascending: true });

    if (tripsErr) throw tripsErr;
    if (!tripsData || tripsData.length === 0) return [];

    const tripIds = tripsData.map((t) => t.id);

    // 2. Fetch Trip Stops with Store and Order Details
    const { data: stopsData, error: stopsErr } = await supabase
      .from("trip_stops")
      .select(`
        id,
        trip_id,
        stop_sequence,
        status,
        order_id,
        store_id,
        stores:store_id (
          id,
          name,
          address
        )
      `)
      .in("trip_id", tripIds)
      .order("stop_sequence", { ascending: true });

    if (stopsErr) throw stopsErr;

    // 3. Fetch Pallets
    const { data: palletsData, error: palletsErr } = await supabase
      .from("pallets")
      .select("*")
      .in("trip_id", tripIds)
      .order("created_at", { ascending: true });

    if (palletsErr) throw palletsErr;

    // 4. Transform and assemble into UI TripVehicle structure
    const results: TripVehicle[] = tripsData.map((t) => {
      const vehicle = Array.isArray(t.vehicles) ? t.vehicles[0] : t.vehicles;
      const driver = Array.isArray(t.driver) ? t.driver[0] : t.driver;

      const plateNumber = vehicle?.registration_number || "TRK-000";
      const vehicleType = vehicle?.vehicle_type || "Freight Truck";
      const maxWeightKg = vehicle?.max_weight_kg ? Number(vehicle.max_weight_kg) : 5000;
      const maxWeightTons = Number((maxWeightKg / 1000).toFixed(1));

      // Filter stops for this trip
      const tripStops = (stopsData || []).filter((s) => s.trip_id === t.id);
      const totalStops = tripStops.length;

      // Group into StopGroup items with LIFO sequence:
      // If there are 4 stops: Stop 4 is loaded first (loadSequence 1), Stop 1 loaded last (loadSequence 4)
      const stopGroups: StopGroup[] = tripStops.map((stop) => {
        const store = Array.isArray(stop.stores) ? stop.stores[0] : stop.stores;
        const stopNumber = stop.stop_sequence;
        const loadSequence = totalStops > 0 ? totalStops - stopNumber + 1 : 1;

        // Pallets for this stop
        const stopPallets: PalletItem[] = (palletsData || [])
          .filter((p) => p.stop_id === stop.id || (p.trip_id === t.id && !p.stop_id))
          .map((p) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category as "ambient" | "chilled" | "frozen",
            tempReq: p.temp_req,
            weightKg: Number(p.weight_kg),
            verified: Boolean(p.is_verified),
            verifiedAt: p.verified_at,
            orderId: p.order_id || stop.order_id,
            stopId: stop.id,
          }));

        return {
          stopNumber,
          loadSequence,
          storeId: store?.id ? store.id.slice(0, 7).toUpperCase() : "STR-00",
          storeName: store?.name || "Delivery Store",
          location: store?.address || "Colombo Hub",
          orderId: stop.order_id,
          rawStoreId: stop.store_id || store?.id,
          pallets: stopPallets,
        };
      });

      // Sort stops by loadSequence (1 = deep in cargo bed, 4 = door)
      stopGroups.sort((a, b) => a.loadSequence - b.loadSequence);

      // Calculate total weight
      const totalWeightKg = stopGroups
        .flatMap((s) => s.pallets)
        .reduce((sum, p) => sum + p.weightKg, 0);
      const currentWeightTons = Number((totalWeightKg / 1000).toFixed(2));

      // Derive human friendly statusText
      let statusText = "SCHEDULED";
      if (t.status === "loading") statusText = "LOADING IN PROGRESS";
      else if (t.status === "ready" || t.status === "planning") statusText = "READY TO LOAD";
      else if (t.status === "dispatched" || t.status === "en_route") statusText = "SEALED & DISPATCHED";
      else if (t.status === "completed") statusText = "COMPLETED";

      return {
        id: t.id,
        tripNumber: t.trip_number,
        bay: t.bay || "Bay 04",
        status: t.status as any,
        statusText,
        plateNumber,
        vehicleModel: `${plateNumber} (${vehicleType})`,
        vehicleType,
        driverName: driver?.full_name || "Assigned Driver",
        driverPhone: driver?.phone || "+94 77 123 4567",
        departureTime: t.departure_time || "06:30 AM",
        cutoffTime: t.cutoff_time || "05:45 AM",
        maxWeightTons,
        currentWeightTons,
        image: VEHICLE_IMAGES[plateNumber] || VEHICLE_IMAGES.default,
        stops: stopGroups,
      };
    });

    return results;
  } catch (err) {
    console.error("fetchTripsWithDetails error:", err);
    throw err;
  }
}

/**
 * Toggle pallet verification in Supabase
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
      verified_by: newVerifiedStatus ? userId || null : null,
    })
    .eq("id", palletId);

  if (error) {
    console.error("updatePalletVerification error:", error);
    throw error;
  }
}

/**
 * Record an exception in the public.exceptions table for Dispatcher & Store Manager
 */
export async function createPalletException(submission: ExceptionSubmission): Promise<void> {
  try {
    const { error } = await supabase.from("exceptions").insert({
      order_id: submission.orderId || null,
      store_id: submission.storeId || null,
      reason_code: submission.reasonCode,
      action_taken: submission.actionTaken,
      is_read: false,
    });

    if (error) {
      console.warn("Exception insert note:", error.message);
    }
  } catch (err) {
    console.error("createPalletException error:", err);
  }
}

/**
 * Seal & Dispatch Vehicle:
 * Updates trip status to 'en_route', seals the truck, marks remaining pallets verified,
 * inserts into loading_logs, and links exceptions if reported.
 */
export async function finalizeAndDispatchTrip(params: {
  trip: TripVehicle;
  sealNumber: string;
  hasDiscrepancy: boolean;
  discrepancyNote: string;
  signature: string;
  shift?: string;
  tempCheck?: ReeferTempCheck;
  userId?: string;
}): Promise<PastLogEntry> {
  const { trip, sealNumber, hasDiscrepancy, discrepancyNote, signature, shift, tempCheck, userId } = params;

  // Build combined audit notes (incorporating temp readings if refrigerated)
  let fullNotes = discrepancyNote;
  if (tempCheck) {
    const tempSummary = `Reefer Temp Log: Chill=${tempCheck.chilledTempC ?? "N/A"}°C, Frozen=${tempCheck.frozenTempC ?? "N/A"}°C.`;
    fullNotes = fullNotes ? `${fullNotes} | ${tempSummary}` : tempSummary;
  }

  // 1. Update trip in database
  const { error: tripErr } = await supabase
    .from("trips")
    .update({
      status: "en_route",
      security_seal: sealNumber,
      has_discrepancy: hasDiscrepancy,
      discrepancy_note: fullNotes || null,
      dispatched_at: new Date().toISOString(),
      loader_id: userId || null,
    })
    .eq("id", trip.id);

  if (tripErr) {
    console.error("Trip dispatch error:", tripErr);
    throw tripErr;
  }

  // 2. Mark all pallets of this trip verified
  await supabase
    .from("pallets")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: userId || null,
    })
    .eq("trip_id", trip.id);

  // 3. If discrepancy was reported, record in public.exceptions table for Dispatcher
  if (hasDiscrepancy && trip.stops.length > 0) {
    const firstStop = trip.stops[0];
    await createPalletException({
      orderId: firstStop.orderId,
      storeId: firstStop.rawStoreId,
      reasonCode: "CARTON_DAMAGED",
      actionTaken: fullNotes || `Exception noted by ${signature} at ${trip.bay}`,
    });
  }

  // 4. Insert audit record in loading_logs
  const totalPallets = trip.stops.flatMap((s) => s.pallets).length;
  const totalWeightKg = Math.round(trip.currentWeightTons * 1000);
  const storesSummary = trip.stops.map((s) => s.storeName).join(" • ");
  const activeShift = shift || "Morning Shift (06:00 - 14:00)";

  const logPayload = {
    trip_id: trip.id,
    trip_number: trip.tripNumber,
    bay: trip.bay,
    plate_number: trip.plateNumber,
    vehicle_model: trip.vehicleModel,
    vehicle_type: trip.vehicleType,
    driver_name: trip.driverName,
    driver_phone: trip.driverPhone,
    dispatched_at: new Date().toISOString(),
    shift: activeShift,
    seal_number: sealNumber,
    total_pallets: totalPallets,
    verified_pallets: totalPallets,
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

  if (logErr) {
    console.error("Insert loading_logs error:", logErr);
  }

  return {
    id: logData?.id || `log-${Date.now()}`,
    tripNumber: trip.tripNumber,
    bay: trip.bay,
    plateNumber: trip.plateNumber,
    vehicleModel: trip.vehicleModel,
    vehicleType: trip.vehicleType,
    driverName: trip.driverName,
    driverPhone: trip.driverPhone,
    dispatchedAt: "Today, Just now",
    shift: activeShift,
    sealNumber,
    totalPallets,
    verifiedPallets: totalPallets,
    totalWeightKg,
    storesCount: trip.stops.length,
    storesSummary,
    status: "dispatched",
    signature,
    hasDiscrepancy,
    discrepancyNote: fullNotes,
  };
}

/**
 * Fetch past loading & dispatch audit logs from Supabase
 */
export async function fetchPastLogs(): Promise<PastLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from("loading_logs")
      .select("*")
      .order("dispatched_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((d) => ({
      id: d.id,
      tripNumber: d.trip_number,
      bay: d.bay,
      plateNumber: d.plate_number,
      vehicleModel: d.vehicle_model,
      vehicleType: d.vehicle_type,
      driverName: d.driver_name,
      driverPhone: d.driver_phone || "+94 77 123 4567",
      dispatchedAt: new Date(d.dispatched_at).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      shift: d.shift || "Morning Shift (06:00 - 14:00)",
      sealNumber: d.seal_number,
      totalPallets: d.total_pallets,
      verifiedPallets: d.verified_pallets,
      totalWeightKg: Number(d.total_weight_kg),
      storesCount: d.stores_count,
      storesSummary: d.stores_summary || "",
      status: d.status as any,
      signature: d.signature,
      hasDiscrepancy: d.has_discrepancy,
      discrepancyNote: d.discrepancy_note,
    }));
  } catch (err) {
    console.error("fetchPastLogs error:", err);
    return [];
  }
}

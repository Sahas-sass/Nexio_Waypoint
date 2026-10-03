"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TripVehicle, PastLogEntry, ReeferTempCheck } from "../types";
import {
  fetchTripsWithDetails,
  updatePalletVerification,
  finalizeAndDispatchTrip,
  fetchPastLogs,
  createPalletException,
} from "../services/loaderService";
import { playScannerSound, triggerHapticFeedback } from "../utils/scannerFeedback";
import { recordUserActivity } from "@/app/profile/activityLogger";

export function useTripQueue(initialSelectedTripId?: string) {
  const [trips, setTrips] = useState<TripVehicle[]>([]);
  const [pastLogs, setPastLogs] = useState<PastLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // 1. Fetch live data from Supabase
  const loadDatabaseData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [fetchedTrips, fetchedLogs] = await Promise.all([
        fetchTripsWithDetails(),
        fetchPastLogs(),
      ]);

      setTrips(fetchedTrips);
      setPastLogs(fetchedLogs);
    } catch (err: any) {
      console.error("Error loading database data:", err);
      setErrorMsg(err.message || "Failed to fetch warehouse data from Supabase");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // 2. Realtime Supabase Subscription
  useEffect(() => {
    const channel = supabase
      .channel("warehouse-live-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pallets" },
        () => {
          loadDatabaseData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        () => {
          loadDatabaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDatabaseData]);

  // 3. Optimistic Pallet Toggle
  const togglePallet = async (
    trip: TripVehicle | undefined,
    palletId: string,
    profileId?: string
  ) => {
    if (!trip) return;

    const allPallets = trip.stops.flatMap((s) => s.pallets);
    const targetPallet = allPallets.find((p) => p.id === palletId);
    if (!targetPallet) return;

    const newStatus = !targetPallet.verified;

    // Optimistic UI state update
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== trip.id) return t;
        return {
          ...t,
          stops: t.stops.map((s) => ({
            ...s,
            pallets: s.pallets.map((p) =>
              p.id === palletId ? { ...p, verified: newStatus } : p
            ),
          })),
        };
      })
    );

    try {
      await updatePalletVerification(palletId, newStatus, profileId);
      if (newStatus && profileId && targetPallet) {
        recordUserActivity(profileId, {
          title: `Verified Pallet ${targetPallet.sku}`,
          meta: `${targetPallet.name} • ${trip.tripNumber}`,
          type: "check",
        });
      }
    } catch {
      // Revert on error
      loadDatabaseData();
      triggerToast("Failed to update pallet verification in database");
    }
  };

  // 4. Barcode Scan Handler
  const verifyBarcodeScan = async (
    trip: TripVehicle | undefined,
    skuInput: string,
    profileId?: string
  ) => {
    if (!trip) return;

    const allPallets = trip.stops.flatMap((s) => s.pallets);
    const matched = allPallets.find(
      (p) => p.sku.toLowerCase() === skuInput.toLowerCase().trim()
    );

    if (matched) {
      if (!matched.verified) {
        await togglePallet(trip, matched.id, profileId);
        playScannerSound("success");
        triggerHapticFeedback([100]);
        triggerToast(`Verified: ${matched.sku} • ${matched.name}`);
      } else {
        triggerToast(`Already verified: ${matched.sku}`);
      }
    } else {
      playScannerSound("error");
      triggerHapticFeedback([150, 100, 150]);
      triggerToast(`Invalid barcode "${skuInput}". SKU not in manifest.`);
    }
  };

  // 5. Submit Exception
  const submitException = async (
    trip: TripVehicle | undefined,
    data: {
      palletSku?: string;
      orderId?: string;
      storeId?: string;
      reasonCode: "CARTON_DAMAGED" | "LEAKAGE_DETECTED" | "TEMPERATURE_EXCURSION" | "MISSING_FROM_STAGING" | "OTHER";
      notes: string;
    },
    userId?: string
  ) => {
    if (!trip) return;

    try {
      await createPalletException({
        orderId: data.orderId,
        storeId: data.storeId,
        reasonCode: data.reasonCode,
        actionTaken: data.notes,
        palletSku: data.palletSku,
      });

      if (userId) {
        recordUserActivity(userId, {
          title: `Reported Issue: ${data.reasonCode.replace(/_/g, " ")}`,
          meta: `${data.palletSku || trip.tripNumber} • ${data.notes}`,
          type: "check",
        });
      }

      // Update trip state to record exception note
      setTrips((prev) =>
        prev.map((t) =>
          t.id === trip.id
            ? {
                ...t,
                hasDiscrepancy: true,
                discrepancyNote: data.notes,
              }
            : t
        )
      );

      triggerToast(`Exception logged and dispatched to Command Center!`);
    } catch (err: any) {
      console.error("Exception error:", err);
      triggerToast(err.message || "Failed to log exception");
    }
  };

  // 6. Seal and Dispatch
  const confirmSealAndDispatch = async (
    trip: TripVehicle | undefined,
    data: {
      sealNumber: string;
      hasDiscrepancy: boolean;
      discrepancyNote: string;
      signature: string;
      tempCheck?: ReeferTempCheck;
    },
    shift?: string,
    userId?: string
  ): Promise<PastLogEntry | null> => {
    if (!trip) return null;

    try {
      const logEntry = await finalizeAndDispatchTrip({
        trip,
        sealNumber: data.sealNumber,
        hasDiscrepancy: data.hasDiscrepancy,
        discrepancyNote: data.discrepancyNote,
        signature: data.signature,
        shift,
        tempCheck: data.tempCheck,
        userId,
      });

      if (userId) {
        const palletsCount = trip.stops.flatMap((s) => s.pallets).length;
        recordUserActivity(userId, {
          title: `Dispatched ${trip.tripNumber} (${trip.plateNumber})`,
          meta: `${palletsCount} pallets • Seal ${data.sealNumber}`,
          type: "truck",
        });
      }

      setPastLogs((prev) => [logEntry, ...prev]);
      triggerToast(`Truck ${trip.plateNumber} sealed with ${data.sealNumber} and dispatched!`);
      await loadDatabaseData();
      return logEntry;
    } catch (err: any) {
      console.error("Seal & dispatch error:", err);
      triggerToast(err.message || "Failed to dispatch vehicle in Supabase");
      return null;
    }
  };

  return {
    trips,
    pastLogs,
    isLoading,
    errorMsg,
    toastMessage,
    triggerToast,
    loadDatabaseData,
    togglePallet,
    verifyBarcodeScan,
    submitException,
    confirmSealAndDispatch,
  };
}

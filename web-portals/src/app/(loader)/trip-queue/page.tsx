"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";
import { TripVehicle, PastLogEntry, PalletItem, ReeferTempCheck } from "../types";
import { useUserProfile } from "@/app/profile/useUserProfile";
import { useTripQueue } from "../hooks/useTripQueue";

import TripQueueView from "../components/TripQueueView";
import VerificationChecklistView from "../components/VerificationChecklistView";
import LoadingLogsView from "../components/LoadingLogsView";
import CameraBarcodeScannerModal from "../components/CameraBarcodeScannerModal";
import SealTruckModal from "../components/SealTruckModal";
import DispatchGatepassModal from "../components/DispatchGatepassModal";
import AuditDetailsModal from "../components/AuditDetailsModal";
import PalletExceptionModal from "../components/PalletExceptionModal";

function TripQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // User Profile Hook
  const { profile } = useUserProfile();

  // Active View & Modals state
  const [currentView, setCurrentView] = useState<"queue" | "verify" | "logs">("queue");
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
  const [isGatepassModalOpen, setIsGatepassModalOpen] = useState(false);
  const [selectedLogForAudit, setSelectedLogForAudit] = useState<PastLogEntry | null>(null);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [selectedPalletForException, setSelectedPalletForException] = useState<PalletItem | null>(null);

  // Last dispatched trip details for Gatepass
  const [dispatchedPassData, setDispatchedPassData] = useState<{
    trip: TripVehicle;
    sealNumber: string;
    signature: string;
    hasDiscrepancy: boolean;
    discrepancyNote: string;
  } | null>(null);

  // Extracted Trip Queue Hook (Realtime, State, Mutations, Feedback)
  const {
    trips,
    pastLogs,
    isLoading,
    errorMsg,
    toastMessage,
    loadDatabaseData,
    togglePallet,
    verifyBarcodeScan,
    submitException,
    confirmSealAndDispatch,
  } = useTripQueue();

  // Sync tab query parameter with currentView
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "logs") {
      setCurrentView("logs");
    } else if (tab === "verify") {
      setCurrentView("verify");
    } else {
      setCurrentView("queue");
    }
  }, [searchParams]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const allPallets = selectedTrip ? selectedTrip.stops.flatMap((s) => s.pallets) : [];
  const unverifiedSkus = allPallets.filter((p) => !p.verified).map((p) => p.sku);

  // Dynamic user signature
  const defaultSignature = profile?.fullName
    ? `Loader ${profile.fullName} (${profile.employeeId || "LDR-004"})`
    : "Loader osal (LDR-004)";

  // Handlers delegated to useTripQueue hook
  const handleTogglePallet = async (palletId: string) => {
    await togglePallet(selectedTrip, palletId, profile?.id);
  };

  const handleBarcodeScan = async (skuInput: string) => {
    await verifyBarcodeScan(selectedTrip, skuInput, profile?.id);
  };

  const handleSubmitException = async (data: {
    palletSku?: string;
    orderId?: string;
    storeId?: string;
    reasonCode: "CARTON_DAMAGED" | "LEAKAGE_DETECTED" | "TEMPERATURE_EXCURSION" | "MISSING_FROM_STAGING" | "OTHER";
    notes: string;
  }) => {
    await submitException(selectedTrip, data);
  };

  const handleConfirmSealAndDispatch = async (data: {
    sealNumber: string;
    hasDiscrepancy: boolean;
    discrepancyNote: string;
    signature: string;
    tempCheck?: ReeferTempCheck;
  }) => {
    if (!selectedTrip) return;

    const logEntry = await confirmSealAndDispatch(
      selectedTrip,
      data,
      profile?.shift || undefined,
      profile?.id
    );

    if (logEntry) {
      setDispatchedPassData({
        trip: selectedTrip,
        sealNumber: data.sealNumber,
        signature: data.signature,
        hasDiscrepancy: data.hasDiscrepancy,
        discrepancyNote: data.discrepancyNote,
      });
      setIsGatepassModalOpen(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-waypoint-text text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-3 text-xs font-bold animate-bounce font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={loadDatabaseData}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold text-red-800 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 1: TRIP QUEUE VIEW (Vehicles List)                  */}
      {/* ========================================================= */}
      {currentView === "queue" && (
        <TripQueueView
          trips={trips}
          isLoading={isLoading}
          onRefresh={loadDatabaseData}
          assignedBay={profile?.assignedBay || "Bay 04"}
          stationName={profile?.station || "Station 04"}
          onSelectTrip={(id) => {
            setSelectedTripId(id);
            setCurrentView("verify");
          }}
        />
      )}

      {/* ========================================================= */}
      {/* SCREEN 2: LOADING VERIFICATION CHECKLIST (Reverse-Order)   */}
      {/* ========================================================= */}
      {currentView === "verify" && selectedTrip && (
        <VerificationChecklistView
          trip={selectedTrip}
          onBack={() => setCurrentView("queue")}
          onTogglePallet={handleTogglePallet}
          onScanBarcode={handleBarcodeScan}
          onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
          onOpenSealModal={() => setIsSealModalOpen(true)}
          onOpenReportException={(pallet) => {
            setSelectedPalletForException(pallet || null);
            setIsExceptionModalOpen(true);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* SCREEN 3: LOADING & DISPATCH LOGS VIEW                     */}
      {/* ========================================================= */}
      {currentView === "logs" && (
        <LoadingLogsView
          logs={pastLogs}
          onBackToQueue={() => {
            router.push("/trip-queue");
            setCurrentView("queue");
          }}
          onSelectLogForAudit={(log) => setSelectedLogForAudit(log)}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 1: LIVE CAMERA BARCODE SCANNER                       */}
      {/* ========================================================= */}
      <CameraBarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleBarcodeScan}
        availablePalletSkus={unverifiedSkus}
      />

      {/* ========================================================= */}
      {/* MODAL 2: CONFIRM LOADING & SEAL TRUCK DIALOG               */}
      {/* ========================================================= */}
      {selectedTrip && (
        <SealTruckModal
          isOpen={isSealModalOpen}
          onClose={() => setIsSealModalOpen(false)}
          trip={selectedTrip}
          defaultSignature={defaultSignature}
          onConfirm={handleConfirmSealAndDispatch}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DRIVER HANDOVER & GATEPASS QR PASS                */}
      {/* ========================================================= */}
      {dispatchedPassData && (
        <DispatchGatepassModal
          isOpen={isGatepassModalOpen}
          onClose={() => {
            setIsGatepassModalOpen(false);
            setDispatchedPassData(null);
            setCurrentView("queue");
          }}
          trip={dispatchedPassData.trip}
          sealNumber={dispatchedPassData.sealNumber}
          signature={dispatchedPassData.signature}
          hasDiscrepancy={dispatchedPassData.hasDiscrepancy}
          discrepancyNote={dispatchedPassData.discrepancyNote}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 4: AUDIT DETAILS MODAL                               */}
      {/* ========================================================= */}
      <AuditDetailsModal
        log={selectedLogForAudit}
        onClose={() => setSelectedLogForAudit(null)}
      />

      {/* ========================================================= */}
      {/* MODAL 5: PALLET & DOCK EXCEPTION REPORTING MODAL           */}
      {/* ========================================================= */}
      {selectedTrip && (
        <PalletExceptionModal
          isOpen={isExceptionModalOpen}
          onClose={() => {
            setIsExceptionModalOpen(false);
            setSelectedPalletForException(null);
          }}
          pallet={selectedPalletForException}
          trip={selectedTrip}
          onSubmitException={handleSubmitException}
        />
      )}
    </div>
  );
}

export default function TripQueuePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-waypoint-orange" />
        <span>Connecting to Warehouse Live Database...</span>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-500 font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-waypoint-orange" />
          <span>Connecting to Warehouse Live Database...</span>
        </div>
      }
    >
      <TripQueueContent />
    </Suspense>
  );
}

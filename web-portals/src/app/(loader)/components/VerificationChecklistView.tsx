"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Layers,
  Barcode,
  Camera,
  CheckCircle2,
  Check,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Flame,
  X,
} from "lucide-react";
import { TripVehicle, PalletItem } from "../types";
import { playScannerSound, triggerHapticFeedback } from "../utils/scannerFeedback";
import { useScannerGunWedge } from "../hooks/useScannerGunWedge";
import {
  findActiveLIFOStop,
  checkLIFOSequenceViolation,
  LIFOSequenceWarning,
} from "../utils/lifoSequence";

interface VerificationChecklistViewProps {
  trip: TripVehicle;
  onBack: () => void;
  onTogglePallet: (palletId: string) => void;
  onScanBarcode: (sku: string) => void;
  onOpenSealModal: () => void;
  onOpenReportException: (pallet?: PalletItem) => void;
  onOpenCameraScanner: () => void;
}

export default function VerificationChecklistView({
  trip,
  onBack,
  onTogglePallet,
  onScanBarcode,
  onOpenSealModal,
  onOpenReportException,
  onOpenCameraScanner,
}: VerificationChecklistViewProps) {
  const [scanInput, setScanInput] = useState("");
  const [sequenceWarning, setSequenceWarning] = useState<LIFOSequenceWarning | null>(null);

  // Hardware Scanner Gun Keyboard Buffer Listener
  useScannerGunWedge({ onScan: onScanBarcode });

  const allPallets = trip.stops.flatMap((s) => s.pallets);
  const verifiedCount = allPallets.filter((p) => p.verified).length;
  const totalCount = allPallets.length;
  const progressPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // Identify current active stop in reverse LIFO order via pure utility
  const currentActiveStop = findActiveLIFOStop(trip.stops);

  // Sequence verification check before toggling
  const handlePalletClick = (pallet: PalletItem, stopNumber: number, loadSequence: number) => {
    const violation = checkLIFOSequenceViolation(
      pallet,
      stopNumber,
      loadSequence,
      currentActiveStop
    );

    if (violation) {
      playScannerSound("error");
      triggerHapticFeedback([120, 80, 120]);
      setSequenceWarning(violation);
      return;
    }

    playScannerSound("success");
    triggerHapticFeedback([60]);
    onTogglePallet(pallet.id);
  };

  const handleConfirmSequenceOverride = () => {
    if (sequenceWarning) {
      playScannerSound("success");
      onTogglePallet(sequenceWarning.pendingPalletId);
      setSequenceWarning(null);
    }
  };

  const handleBarcodeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) {
      // Auto-scan next unverified pallet from active stop
      const nextUnverified =
        currentActiveStop?.pallets.find((p) => !p.verified) || allPallets.find((p) => !p.verified);
      if (nextUnverified) {
        onScanBarcode(nextUnverified.sku);
      }
      return;
    }
    onScanBarcode(scanInput.trim());
    setScanInput("");
  };

  const maxStopNum = Math.max(...trip.stops.map((s) => s.stopNumber), 1);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Bar: Back to Queue */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-waypoint-text bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trip Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Bay:</span>
          <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-extrabold">
            {trip.bay}
          </span>
        </div>
      </div>

      {/* Active Trip Header Card with Vehicle Picture */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={trip.image}
            alt={trip.vehicleModel}
            className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-waypoint-text">{trip.tripNumber}</h2>
              <span className="bg-[#FFF6D8] text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                {trip.plateNumber}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-600">{trip.vehicleModel}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span>
                Driver: <strong className="text-gray-800">{trip.driverName}</strong>
              </span>
              <span>•</span>
              <span>
                Depart: <strong className="text-amber-700">{trip.departureTime}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Completion Gauge */}
        <div className="w-full sm:w-auto bg-[#FAFAF7] border border-gray-200 rounded-2xl p-3.5 text-right min-w-[210px]">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verification</span>
            <span className="text-sm font-extrabold text-waypoint-text">
              {verifiedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent === 100 ? "bg-emerald-500" : "bg-waypoint-yellow"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* CRITICAL LOGISTICS BANNER: Enforce Reverse-Stop Loading (LIFO) */}
      <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
          <Layers className="w-4.5 h-4.5 text-amber-800" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Reverse-Stop Loading Enforced
              </h4>
              <span className="bg-amber-200 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                LIFO Sequence
              </span>
            </div>
            {currentActiveStop && (
              <span className="bg-amber-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Active: Stop {currentActiveStop.stopNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
            LIFO Sequence: Load Stop {currentActiveStop ? currentActiveStop.stopNumber : maxStopNum} first ({currentActiveStop?.storeName || "Staged Items"}).
          </p>
        </div>
      </div>

      {/* Quick Barcode Scanner Bar & Hardware Gun Hint */}
      <div className="space-y-2">
        <form
          onSubmit={handleBarcodeFormSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center gap-2.5"
        >
          <div className="relative w-full flex-1">
            <Barcode className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan or enter pallet barcode (e.g. CH-1048)..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-waypoint-yellow"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Live Camera Scanner Button */}
            <button
              type="button"
              onClick={onOpenCameraScanner}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Camera Scanner</span>
            </button>

            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text text-xs font-extrabold rounded-xl shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            >
              Verify Barcode
            </button>
          </div>
        </form>

        <p className="text-[10px] text-gray-400 text-center font-medium">
          Laser Gun: Scan pallets with your Bluetooth/USB scanner gun at any time.
        </p>
      </div>

      {/* Stops List (Sorted by Load Sequence 1 -> N) */}
      <div className="space-y-4">
        {trip.stops.map((stop) => {
          const stopAllDone = stop.pallets.length > 0 && stop.pallets.every((p) => p.verified);
          const stopVerifiedCount = stop.pallets.filter((p) => p.verified).length;
          const isStopActive = currentActiveStop?.storeId === stop.storeId;

          return (
            <div
              key={stop.storeId}
              className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-2xs ${
                stopAllDone
                  ? "border-emerald-200 bg-emerald-50/10"
                  : isStopActive
                  ? "border-amber-300 ring-2 ring-amber-300/20"
                  : "border-gray-200"
              }`}
            >
              {/* Stop Header */}
              <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      stopAllDone ? "bg-emerald-500 text-white" : "bg-waypoint-text text-white"
                    }`}
                  >
                    Step {stop.loadSequence}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-waypoint-text">{stop.storeName}</h3>
                      <span className="text-[10px] font-bold text-gray-400">({stop.storeId})</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">{stop.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[10px] font-bold text-gray-500">
                    Stop {stop.stopNumber} on Route
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      stopAllDone ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {stopVerifiedCount}/{stop.pallets.length} Loaded
                  </span>
                </div>
              </div>

              {/* Pallets Checklist */}
              <div className="divide-y divide-gray-100 p-2 sm:p-3">
                {stop.pallets.map((pallet) => (
                  <div
                    key={pallet.id}
                    onClick={() => handlePalletClick(pallet, stop.stopNumber, stop.loadSequence)}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      pallet.verified ? "bg-emerald-50/40 hover:bg-emerald-50/70" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Checkbox Icon */}
                      <div className="shrink-0">
                        {pallet.verified ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white" />
                        )}
                      </div>

                      {/* Item Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-extrabold ${
                              pallet.verified ? "text-gray-900 line-through opacity-70" : "text-gray-900"
                            }`}
                          >
                            {pallet.name}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">[{pallet.sku}]</span>
                        </div>

                        <div className="flex items-center gap-2.5 mt-1 text-[10px] font-bold">
                          {pallet.category === "frozen" && (
                            <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              <Thermometer className="w-3 h-3" /> Frozen ({pallet.tempReq || "-18°C"})
                            </span>
                          )}
                          {pallet.category === "chilled" && (
                            <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                              <Thermometer className="w-3 h-3" /> Chilled ({pallet.tempReq || "4°C"})
                            </span>
                          )}
                          {pallet.category === "ambient" && (
                            <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                              Ambient
                            </span>
                          )}

                          <span className="text-gray-500 font-medium">Weight: {pallet.weightKg} kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Exception Flag Button */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReportException(pallet);
                        }}
                        title="Report damage or shortfall for this pallet"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>

                      <div className="text-right">
                        {pallet.verified ? (
                          <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400">Tap to Verify</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-20 bg-white/95 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <ShieldCheck className="w-5 h-5 text-waypoint-orange" />
          <span>
            {verifiedCount === totalCount
              ? `All ${totalCount} Pallets verified! Ready to seal.`
              : `${totalCount - verifiedCount} items remaining to load.`}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onOpenReportException()}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition-colors cursor-pointer"
          >
            Report Exception
          </button>

          <button
            type="button"
            onClick={onOpenSealModal}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalize & Seal Truck</span>
          </button>
        </div>
      </div>

      {/* Out of Sequence Warning Modal */}
      {sequenceWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-800">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Out-of-Sequence Loading</h3>
                <p className="text-xs text-gray-500">Reverse LIFO Sequence Advisory</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
              Stop {sequenceWarning.activeStopNumber} (<strong>{sequenceWarning.activeStopName}</strong>) is currently the active reverse-loading stop. Loading Stop {sequenceWarning.targetStopNumber} now may cause cargo blocking when the driver delivers.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSequenceWarning(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel & Follow Order
              </button>
              <button
                type="button"
                onClick={handleConfirmSequenceOverride}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Override & Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

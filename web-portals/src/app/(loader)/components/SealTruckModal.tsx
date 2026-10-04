"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Check, X, AlertTriangle, Thermometer } from "lucide-react";
import { TripVehicle, ReeferTempCheck } from "../types";
import { generateSecuritySealTag, checkRefrigerationRequirements } from "../utils/sealAndReefer";

interface SealTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripVehicle;
  onConfirm: (data: {
    sealNumber: string;
    hasDiscrepancy: boolean;
    discrepancyNote: string;
    signature: string;
    tempCheck?: ReeferTempCheck;
  }) => Promise<void>;
  defaultSignature?: string;
}

export default function SealTruckModal({
  isOpen,
  onClose,
  trip,
  onConfirm,
  defaultSignature = "Loader osal (LDR-004)",
}: SealTruckModalProps) {
  // Generate random fresh seal number if not set
  const [securitySeal, setSecuritySeal] = useState("");
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [discrepancyReason, setDiscrepancyReason] = useState("CARTON_DAMAGED");
  const [discrepancyNote, setDiscrepancyNote] = useState("");
  const [signatureName, setSignatureName] = useState(defaultSignature);

  // Cold-chain temp readings
  const [chilledTemp, setChilledTemp] = useState("3.8");
  const [frozenTemp, setFrozenTemp] = useState("-18.2");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-generate fresh tamper seal tag via pure utility
      setSecuritySeal(generateSecuritySealTag());
      setSignatureName(defaultSignature);
    }
  }, [isOpen, defaultSignature]);

  if (!isOpen) return null;

  const allPallets = trip.stops.flatMap((s) => s.pallets);
  const verifiedCount = allPallets.filter((p) => p.verified).length;
  const totalCount = allPallets.length;

  // Evaluate cold-chain requirements via pure utility
  const { hasChilled, hasFrozen, isRefrigerated } = checkRefrigerationRequirements(allPallets);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securitySeal.trim()) return;

    setIsSubmitting(true);
    try {
      const combinedDiscrepancyNote = hasDiscrepancy
        ? `[${discrepancyReason}] ${discrepancyNote.trim()}`
        : "";

      const tempCheck: ReeferTempCheck | undefined = isRefrigerated
        ? {
            chilledTempC: hasChilled ? parseFloat(chilledTemp) : undefined,
            frozenTempC: hasFrozen ? parseFloat(frozenTemp) : undefined,
            isCompliant: true,
          }
        : undefined;

      await onConfirm({
        sealNumber: securitySeal.trim(),
        hasDiscrepancy,
        discrepancyNote: combinedDiscrepancyNote,
        signature: signatureName,
        tempCheck,
      });
      onClose();
    } catch (err) {
      console.error("Seal truck error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <p className="text-waypoint-orange text-[10px] font-extrabold tracking-widest uppercase">
              Dock Clearance
            </p>
            <h3 className="text-xl font-extrabold text-waypoint-text">
              Complete Vehicle Loading
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {trip.tripNumber} • {trip.plateNumber} ({trip.vehicleModel})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Stat Summary Badges */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Verified Pallets</span>
            <span className="text-base font-extrabold text-emerald-600">
              {verifiedCount} / {totalCount} Items
            </span>
          </div>
          <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Weight</span>
            <span className="text-base font-extrabold text-waypoint-text">
              {trip.currentWeightTons}T / {trip.maxWeightTons}T
            </span>
          </div>
          <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Compartment Type</span>
            <span className="text-base font-extrabold text-blue-600">
              {isRefrigerated ? "Multi-Temp Reefer" : "Ambient Dry Freight"}
            </span>
          </div>
          <div className="bg-[#FAFAF7] border border-gray-200 p-3 rounded-2xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Loading Bay</span>
            <span className="text-base font-extrabold text-amber-700">{trip.bay}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cold Chain Chamber Readings (if refrigerated) */}
          {isRefrigerated && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                <Thermometer className="w-4 h-4 text-blue-600" />
                <span>Cold-Chain Reefer Thermometer Readings</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {hasChilled && (
                  <div>
                    <label className="text-[10px] font-bold text-blue-800 uppercase block mb-1">
                      Chilled Zone (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={chilledTemp}
                      onChange={(e) => setChilledTemp(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                    <span className="text-[9px] text-blue-600">Req: 0°C to 5°C</span>
                  </div>
                )}
                {hasFrozen && (
                  <div>
                    <label className="text-[10px] font-bold text-blue-800 uppercase block mb-1">
                      Frozen Zone (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={frozenTemp}
                      onChange={(e) => setFrozenTemp(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                    <span className="text-[9px] text-blue-600">Req: ≤ -15°C</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Seal Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span>Security Seal Tag</span>
              <span className="text-[10px] text-amber-600 font-semibold">Auto-generated • Required for Gate</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={securitySeal}
                onChange={(e) => setSecuritySeal(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-waypoint-yellow"
                placeholder="e.g. SL-892301-X"
                required
              />
            </div>
          </div>

          {/* Discrepancy Toggle & Reason Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">Any Discrepancies or Damage?</label>
              <button
                type="button"
                onClick={() => setHasDiscrepancy(!hasDiscrepancy)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  hasDiscrepancy ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {hasDiscrepancy ? "Exception Logged" : "No Issues"}
              </button>
            </div>

            {hasDiscrepancy && (
              <div className="space-y-2 bg-red-50/50 border border-red-200 p-3 rounded-2xl">
                <div>
                  <label className="text-[10px] font-bold text-red-800 uppercase block mb-1">
                    Exception Reason
                  </label>
                  <select
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none"
                  >
                    <option value="CARTON_DAMAGED">Carton Damaged / Packaging Crushed</option>
                    <option value="LEAKAGE_DETECTED">Liquid Leakage / Container Staining</option>
                    <option value="TEMPERATURE_EXCURSION">Temperature Excursion Deviance</option>
                    <option value="MISSING_FROM_STAGING">Pallet Missing from Staging Bay</option>
                    <option value="OTHER">Other Discrepancy</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  placeholder="Detail damage, quantity shortfall, or action taken..."
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  className="w-full p-2.5 bg-white border border-red-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                  required={hasDiscrepancy}
                />
              </div>
            )}
          </div>

          {/* Digital Signature Confirmation */}
          <div className="bg-[#FFF9E6] border border-amber-200/80 p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-waypoint-orange shrink-0" />
              <div>
                <p className="font-extrabold text-amber-950">Loader Sign-off</p>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="text-[10px] text-amber-900 bg-transparent font-medium border-b border-amber-300 focus:outline-none"
                />
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-700 font-bold">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel / Edit
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? "Dispatching..." : "Confirm & Dispatch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AlertTriangle, X, Check } from "lucide-react";
import { PalletItem, TripVehicle, ExceptionReasonCode } from "../types";
import { errorMessage } from "../utils/errorMessage";

interface PalletExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pallet?: PalletItem | null;
  trip: TripVehicle;
  onSubmitException: (data: {
    palletSku?: string;
    orderId?: string;
    storeId?: string;
    reasonCode: ExceptionReasonCode;
    notes: string;
  }) => Promise<void>;
}

export default function PalletExceptionModal({
  isOpen,
  onClose,
  pallet,
  trip,
  onSubmitException,
}: PalletExceptionModalProps) {
  const [reasonCode, setReasonCode] = useState<ExceptionReasonCode>("CARTON_DAMAGED");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Find stop related to pallet if available
  const relatedStop = pallet
    ? trip.stops.find((s) => s.pallets.some((p) => p.id === pallet.id))
    : trip.stops[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmitException({
        palletSku: pallet?.sku,
        orderId: relatedStop?.orderId,
        storeId: relatedStop?.rawStoreId,
        reasonCode,
        notes: notes.trim(),
      });
      setNotes("");
      onClose();
    } catch (err) {
      setSubmitError(errorMessage(err, "Failed to log exception"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-red-700">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Report Dock Exception</h3>
              <p className="text-xs text-gray-400">
                {pallet ? `Pallet [${pallet.sku}] • ${pallet.name}` : `Trip ${trip.tripNumber}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Pallet or Stop context */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Delivery Target</span>
            <span className="font-bold text-gray-800 block mt-0.5">
              {relatedStop ? `${relatedStop.storeName} (${relatedStop.storeId})` : "No delivery stop on this trip"}
            </span>
          </div>

          {/* Reason Code Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Exception Reason</label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value as ExceptionReasonCode)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="CARTON_DAMAGED">Crushed Box / Torn Carton</option>
              <option value="LEAKAGE_DETECTED">Liquid Spill / Leaking Bottle</option>
              <option value="TEMPERATURE_EXCURSION">Temperature Excursion (Thawed/Warm)</option>
              <option value="MISSING_FROM_STAGING">Item Missing from Staging Bay</option>
              <option value="OTHER">Other Warehouse Discrepancy</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Description & Action Taken</label>
            <textarea
              rows={3}
              placeholder="e.g. 2 cartons of milk leaking; held back in cold storage for replacement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-red-50/50 border border-red-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          {submitError && (
            <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5">
              {submitError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? "Submitting..." : "Log Exception"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

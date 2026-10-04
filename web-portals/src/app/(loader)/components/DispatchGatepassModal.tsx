"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2, Truck, X, Printer, Download } from "lucide-react";
import { TripVehicle } from "../types";
import { createGatepassPayload, generateGatepassQrDataUrl } from "../utils/gatepass";

interface DispatchGatepassModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripVehicle;
  sealNumber: string;
  signature: string;
  hasDiscrepancy: boolean;
  discrepancyNote?: string;
}

export default function DispatchGatepassModal({
  isOpen,
  onClose,
  trip,
  sealNumber,
  signature,
  hasDiscrepancy,
  discrepancyNote,
}: DispatchGatepassModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    const qrPayload = createGatepassPayload(trip, sealNumber, signature, hasDiscrepancy);

    generateGatepassQrDataUrl(qrPayload)
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [isOpen, trip, sealNumber, signature, hasDiscrepancy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                Cleared For Gatepass
              </span>
              <h3 className="text-xl font-extrabold text-waypoint-text mt-0.5">
                Dispatch Clearance Pass
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gatepass Certificate Card */}
        <div className="bg-[#FAF9F5] border-2 border-dashed border-[#E3E2DA] rounded-3xl p-5 space-y-4">
          {/* Top Pass Badges */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-gray-200/80">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manifest Trip</p>
              <p className="font-extrabold text-base text-gray-900">{trip.tripNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Loading Station</p>
              <p className="font-extrabold text-amber-800">{trip.bay}</p>
            </div>
          </div>

          {/* QR Code Centerpiece */}
          <div className="flex flex-col items-center justify-center py-2 text-center">
            {qrDataUrl ? (
              <div className="p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <img src={qrDataUrl} alt="Gatepass QR Code" className="w-44 h-44 rounded-xl" />
              </div>
            ) : (
              <div className="w-44 h-44 bg-gray-100 rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400">
                Generating QR...
              </div>
            )}
            <p className="text-[11px] font-mono font-bold text-gray-600 mt-2">
              Security Seal: <strong className="text-blue-700">{sealNumber}</strong>
            </p>
            <p className="text-[10px] text-gray-400">Scan at Outbound Guard Gate</p>
          </div>

          {/* Vehicle & Driver Summary */}
          <div className="grid grid-cols-2 gap-2.5 text-xs bg-white p-3 rounded-2xl border border-gray-200/70">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle</span>
              <span className="font-bold text-gray-800">{trip.plateNumber}</span>
              <span className="text-[10px] text-gray-500 block">{trip.vehicleType}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Assigned Driver</span>
              <span className="font-bold text-gray-800">{trip.driverName}</span>
              <span className="text-[10px] text-gray-500 block">{trip.driverPhone}</span>
            </div>
          </div>

          {/* Sign-off badge */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-gray-500">
              Verified by: <strong className="text-gray-800">{signature}</strong>
            </span>
            <span className="font-mono text-gray-400">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {hasDiscrepancy && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <strong className="block font-bold">Discrepancy Logged:</strong>
              <span>{discrepancyNote || "Items reported with exception at bay."}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text text-xs sm:text-sm font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done & Return to Queue
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { X, FileText, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { PastLogEntry } from "../types";

interface AuditDetailsModalProps {
  log: PastLogEntry | null;
  onClose: () => void;
}

export default function AuditDetailsModal({ log, onClose }: AuditDetailsModalProps) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-[32px] max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-waypoint-orange flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Dispatch Audit: {log.tripNumber}
              </h3>
              <p className="text-xs text-gray-400">
                Plate: {log.plateNumber} • {log.bay}
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

        <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Departure Timestamp</span>
            <p className="font-bold text-gray-800 mt-0.5">{log.dispatchedAt}</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Security Seal Tag</span>
            <p className="font-mono font-bold text-blue-700 mt-0.5 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {log.sealNumber}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Driver Assigned</span>
            <p className="font-bold text-gray-800 mt-0.5">
              {log.driverName} ({log.driverPhone})
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Loader Signature</span>
            <p className="font-bold text-amber-900 mt-0.5">{log.signature}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Delivery Stores Breakdown ({log.storesCount})
          </h4>
          <p className="text-xs text-gray-700 bg-[#FAF9F5] p-3.5 rounded-xl border border-gray-200/60 leading-relaxed font-medium">
            {log.storesSummary}
          </p>
        </div>

        {log.hasDiscrepancy && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-xs text-red-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Discrepancy / Damage Exception:</span>
              <p className="mt-0.5">{log.discrepancyNote || "Exception recorded during sequence loading."}</p>
            </div>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-emerald-900">
              {log.verifiedPallets} Pallets 100% Reverse-Loaded & Verified
            </span>
          </div>
          <span className="font-bold text-emerald-700">
            {log.totalWeightKg.toLocaleString()} kg Total
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-waypoint-text text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Close Audit Record
          </button>
        </div>
      </div>
    </div>
  );
}

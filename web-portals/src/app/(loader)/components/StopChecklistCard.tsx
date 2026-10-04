"use client";

import { Check, CheckCircle2, Thermometer, AlertTriangle } from "lucide-react";
import { PalletItem, StopGroup } from "../types";

interface StopChecklistCardProps {
  stop: StopGroup;
  isActive: boolean;
  onPalletClick: (pallet: PalletItem) => void;
  onReportPallet: (pallet: PalletItem) => void;
}

export default function StopChecklistCard({ stop, isActive, onPalletClick, onReportPallet }: StopChecklistCardProps) {
  const stopAllDone = stop.pallets.length > 0 && stop.pallets.every((p) => p.verified);
  const stopVerifiedCount = stop.pallets.filter((p) => p.verified).length;

  return (
    <div
      className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-2xs ${
        stopAllDone
          ? "border-emerald-200 bg-emerald-50/10"
          : isActive
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
            onClick={() => onPalletClick(pallet)}
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
                      <Thermometer className="w-3 h-3" /> Frozen{pallet.tempReq && ` (${pallet.tempReq})`}
                    </span>
                  )}
                  {pallet.category === "chilled" && (
                    <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                      <Thermometer className="w-3 h-3" /> Chilled{pallet.tempReq && ` (${pallet.tempReq})`}
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
                  onReportPallet(pallet);
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
}

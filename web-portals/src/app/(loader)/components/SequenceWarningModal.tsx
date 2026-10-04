"use client";

import { AlertTriangle } from "lucide-react";
import { LIFOSequenceWarning } from "../utils/lifoSequence";

interface SequenceWarningModalProps {
  warning: LIFOSequenceWarning;
  onCancel: () => void;
  onOverride: () => void;
}

export default function SequenceWarningModal({ warning, onCancel, onOverride }: SequenceWarningModalProps) {
  return (
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
          Stop {warning.activeStopNumber} (<strong>{warning.activeStopName}</strong>) is currently the active reverse-loading stop. Loading Stop {warning.targetStopNumber} now may cause cargo blocking when the driver delivers.
        </p>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Cancel & Follow Order
          </button>
          <button
            type="button"
            onClick={onOverride}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Override & Load
          </button>
        </div>
      </div>
    </div>
  );
}

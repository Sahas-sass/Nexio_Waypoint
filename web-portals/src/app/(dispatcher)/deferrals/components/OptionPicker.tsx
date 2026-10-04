"use client";

import { useState, type ReactNode } from "react";

interface OptionPickerProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  icon: ReactNode;
  widthClass?: string;
}

export default function OptionPicker({ label, value, options, onChange, icon, widthClass = "w-44" }: OptionPickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer"
      >
        <span>{value}</span>
        {icon}
      </button>
      {open && (
        <div className={`absolute bottom-full mb-2 left-0 ${widthClass} bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-40`}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors ${value === opt ? "bg-amber-50 text-amber-800 font-bold" : "text-gray-700"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

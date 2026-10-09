import type { ReactNode } from "react";

export const inputClass =
  "w-full bg-[#F7F6F2] border border-[#ECEAE4] rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#F5C242] focus:bg-white transition-colors";

export function FormField({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}

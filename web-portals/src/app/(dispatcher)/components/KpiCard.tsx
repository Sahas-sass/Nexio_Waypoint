import type { ReactNode } from "react";

interface KpiCardProps {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: ReactNode;
  caption: string;
  dotClass: string;
}

export default function KpiCard({ icon, iconClass, label, value, caption, dotClass }: KpiCardProps) {
  return (
    <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-31.5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>{icon}</div>
        <p className="text-xs font-semibold text-waypoint-secondary">{label}</p>
      </div>
      <div className="mt-2.5">
        <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">{value}</p>
        <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
          <span className={`w-2 h-2 rounded-full inline-block ${dotClass}`}></span>
          {caption}
        </p>
      </div>
    </div>
  );
}

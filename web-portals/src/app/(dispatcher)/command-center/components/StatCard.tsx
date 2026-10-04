import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: ReactNode;
  caption: string;
  dotClass: string;
  onClick?: () => void;
}

export default function StatCard({ icon, iconClass, label, value, caption, dotClass, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex min-h-31 p-4.5 items-start gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] ${onClick ? "cursor-pointer hover:border-amber-300 transition-colors" : ""}`}
    >
      <div className={`p-3 rounded-2xl shrink-0 ${iconClass}`}>{icon}</div>
      <div className="flex flex-col pt-0.5">
        <p className="text-[13px] font-medium text-waypoint-secondary mb-1">{label}</p>
        <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">{value}</p>
        <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span> {caption}
        </p>
      </div>
    </div>
  );
}

import { NEAR_CAPACITY_PERCENT } from "../utils/constants";

export default function CapacityBar({ label, percent, compact = false }: { label: string; percent: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${compact ? "text-[10px] w-10" : "text-[11px] w-12"} font-medium text-gray-400`}>{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${percent > NEAR_CAPACITY_PERCENT ? "bg-waypoint-orange" : "bg-waypoint-yellow"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={`${compact ? "text-[10px] w-6" : "text-[11px] w-8"} font-bold text-waypoint-text text-right`}>{percent}%</span>
    </div>
  );
}

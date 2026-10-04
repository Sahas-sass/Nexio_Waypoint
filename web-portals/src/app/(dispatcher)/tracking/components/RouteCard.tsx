import { ChevronRight } from "lucide-react";
import type { LiveTrackingVehicle } from "../../services/types";

const STATUS_COLOR = {
  "on-schedule": { dot: "#16A34A", text: "#16A34A" },
  delayed: { dot: "#F59E0B", text: "#D97706" },
  "connectivity-issue": { dot: "#EA580C", text: "#EA580C" },
} as const;

export default function RouteCard({ vehicle, isSelected, onSelect }: { vehicle: LiveTrackingVehicle; isSelected: boolean; onSelect: () => void }) {
  const color = STATUS_COLOR[vehicle.status];
  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
        isSelected ? "border-2 border-waypoint-yellow bg-white shadow-xs ring-4 ring-[#FFF8E6]/60" : "border border-gray-200 hover:border-gray-300 bg-white shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 shadow-2xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold text-waypoint-text leading-tight">{vehicle.name}</h4>
          <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
            {vehicle.driverName} · {vehicle.stopsCount} Stops
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
      </div>
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color.dot }} />
          <span className="text-[11px] font-bold" style={{ color: color.text }}>
            {vehicle.statusText}
            {vehicle.delayMinutes > 0 ? ` · ${vehicle.delayMinutes} min` : ""}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-gray-400">{vehicle.etaOrUpdate}</span>
      </div>
    </div>
  );
}

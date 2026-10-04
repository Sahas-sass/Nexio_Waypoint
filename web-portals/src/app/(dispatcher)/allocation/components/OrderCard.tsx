import { GripVertical, Clock, AlertTriangle } from "lucide-react";
import type { DispatcherOrder } from "../../services/types";

interface OrderCardProps {
  order: DispatcherOrder;
  selected: boolean;
  deferralReason?: string;
  onSelect: () => void;
}

export default function OrderCard({ order, selected, deferralReason, onSelect }: OrderCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex gap-3 p-4 rounded-2xl transition-all cursor-pointer shadow-sm ${
        selected ? "bg-white border-2 border-waypoint-yellow ring-4 ring-[#FFF8E6]/60" : "bg-white border border-gray-200 hover:border-gray-300"
      }`}
    >
      <GripVertical className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-start mb-2.5">
          <div>
            <h4 className="text-[14px] font-bold text-waypoint-text leading-tight">{order.storeName}</h4>
            <p className="text-[11px] font-medium text-gray-400 mt-0.5">{order.orderNumber}</p>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${order.priority === "High" ? "bg-[#FFF8E6] text-waypoint-orange" : "bg-gray-100 text-gray-500"}`}>
            {order.priority}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-waypoint-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[12px] font-bold">
            {order.windowStart && order.windowEnd ? `${order.windowStart} - ${order.windowEnd}` : order.deliveryWindow}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${order.tempRequirement === "chilled" ? "bg-[#EAF5FF] text-[#3B82F6]" : "bg-gray-100 text-gray-500"}`}>
            {order.tempRequirement === "chilled" ? "Chilled" : "Ambient"}
          </span>
          {order.isVanOnly && <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-50 text-purple-600">Van only</span>}
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{order.totalWeightKg} kg</span>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{order.totalVolumeM3} m³</span>
          {order.itemCount != null && <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{order.itemCount} items</span>}
        </div>

        {deferralReason && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Deferred · {deferralReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}

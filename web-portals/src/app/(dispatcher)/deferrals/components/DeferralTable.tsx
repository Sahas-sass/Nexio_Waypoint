import { AlertTriangle, Check } from "lucide-react";
import type { DeferredOrder } from "../../utils/allocation";

interface DeferralTableProps {
  items: DeferredOrder[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

export default function DeferralTable({ items, selectedIds, onToggle, onToggleAll }: DeferralTableProps) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
          <th className="py-3 px-3 w-10">
            <input
              type="checkbox"
              aria-label="Select all"
              checked={selectedIds.length === items.length && items.length > 0}
              onChange={onToggleAll}
              className="w-4 h-4 rounded border-gray-300 accent-waypoint-yellow cursor-pointer"
            />
          </th>
          <th className="py-3 px-3">STORE</th>
          <th className="py-3 px-3">PRIORITY</th>
          <th className="py-3 px-3">DELIVERY WINDOW</th>
          <th className="py-3 px-3">LOAD</th>
          <th className="py-3 px-3">REASON</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map(({ order, reason }) => {
          const isSelected = selectedIds.includes(order.id);
          return (
            <tr
              key={order.id}
              onClick={() => onToggle(order.id)}
              className={`group transition-colors cursor-pointer ${isSelected ? "bg-[#FEFCE8]/30" : "hover:bg-gray-50/70"}`}
            >
              <td className="py-4 px-3 w-10">
                <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-colors border ${isSelected ? "bg-waypoint-yellow border-waypoint-yellow text-waypoint-text" : "border-gray-300 bg-white"}`}>
                  {isSelected && <Check className="w-3 h-3 stroke-3" />}
                </div>
              </td>
              <td className="py-4 px-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF8E6] text-amber-700 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200/50">
                    {order.storeInitial}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-waypoint-text leading-tight">{order.storeName}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{order.orderNumber}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-3">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${order.priority === "High" ? "bg-[#FFF8E6] text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                  {order.priority}
                </span>
              </td>
              <td className="py-4 px-3">
                <span className="text-xs font-semibold text-gray-600">{order.deliveryWindow}</span>
              </td>
              <td className="py-4 px-3">
                <span className="text-xs font-bold text-waypoint-text">
                  {order.totalVolumeM3} m³ · {order.totalWeightKg} kg
                </span>
              </td>
              <td className="py-4 px-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{reason}</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

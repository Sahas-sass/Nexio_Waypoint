import type { Order } from "../../types";
import { formatDate } from "../../utils/dates";
import { formatQuantity } from "../../utils/orders";
import { orderTone } from "../../utils/tones";
import { StatusPill } from "../StatusPill";

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-400">
            {["Order", "Status", "Target date", "Temp", "Weight", "Volume", "Items", "Priority"].map((h) => (
              <th key={h} className="px-2 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ECEAE4]">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-[#FAF9F6]">
              <td className="px-2 py-3">
                <div className="font-bold text-neutral-900">{o.order_number}</div>
                {o.status === "deferred" && o.deferral_reason && (
                  <div className="text-[11px] text-amber-700">{o.deferral_reason}{o.rescheduled_run ? ` · ${o.rescheduled_run}` : ""}</div>
                )}
                {o.notes && <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">{o.notes}</div>}
              </td>
              <td className="px-2 py-3"><StatusPill tone={orderTone(o.status)}>{o.status}</StatusPill></td>
              <td className="px-2 py-3 text-neutral-700">{formatDate(o.target_delivery_date)}</td>
              <td className="px-2 py-3 capitalize text-neutral-700">{o.temp_requirement ?? "—"}</td>
              <td className="px-2 py-3 text-neutral-700">{formatQuantity(o.total_weight_kg, "kg")}</td>
              <td className="px-2 py-3 text-neutral-700">{formatQuantity(o.total_volume_m3, "m³")}</td>
              <td className="px-2 py-3 text-neutral-700">{o.item_count ?? "—"}</td>
              <td className="px-2 py-3 text-neutral-700">{o.priority ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

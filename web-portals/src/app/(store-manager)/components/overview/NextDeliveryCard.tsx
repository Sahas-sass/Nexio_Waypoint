import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import type { Order, TripStop } from "../../types";
import { formatTime } from "../../utils/dates";
import { stopStatusLabel, tripStatusLabel } from "../../utils/deliveries";
import { stopTone } from "../../utils/tones";
import { Panel } from "../Panel";
import { EmptyState } from "../States";
import { StatusPill } from "../StatusPill";

export function NextDeliveryCard({ stops, orders }: { stops: TripStop[]; orders: Order[] }) {
  const next = stops[0];
  const order = next ? orders.find((o) => o.id === next.order_id) : undefined;

  return (
    <Panel
      title="Today's delivery"
      subtitle="Live arrival information for your receiving team"
      action={next && <StatusPill tone={stopTone(next.status)}>{stopStatusLabel(next.status)}</StatusPill>}
    >
      {!next ? (
        <EmptyState title="No delivery scheduled for today" hint="Stops planned by dispatch for your store will appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-[#ECEAE4] bg-[#FCFBF9]">
          <div className="md:col-span-4 min-h-[160px] bg-[#1C1C1C] flex flex-col items-center justify-center gap-2 text-white">
            <Truck className="w-10 h-10 text-[#F5C242]" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-300">{tripStatusLabel(next.trip?.status)}</span>
          </div>
          <div className="md:col-span-8 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  {next.trip?.trip_number ?? "Trip"} · Stop {next.stop_sequence}
                </div>
                <div className="text-xl font-bold text-neutral-900 mt-0.5">{next.trip?.vehicle?.registration_number ?? "Vehicle not assigned"}</div>
                {next.trip?.vehicle?.vehicle_type && <div className="text-[11px] text-neutral-400">{next.trip.vehicle.vehicle_type}</div>}
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">ETA</div>
                <div className="text-lg font-bold text-neutral-900 mt-0.5">
                  {next.estimated_arrival ? formatTime(next.estimated_arrival) : next.trip?.eta_time ?? "—"}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-neutral-500">
              {order ? `${order.order_number} · ${order.item_count ?? "?"} items · ${order.temp_requirement ?? "ambient"}` : "Order details unavailable"}
              {stops.length > 1 && ` · ${stops.length - 1} more stop${stops.length > 2 ? "s" : ""} today`}
            </div>
            <div className="flex justify-end">
              <Link
                href="/receiving"
                className="px-4 py-2 rounded-xl bg-[#F5C242] hover:bg-[#eab308] text-xs font-semibold text-neutral-900 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Go to receiving</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

import { CalendarClock, TriangleAlert } from "lucide-react";
import type { StoreAlert } from "../utils/alerts";
import { formatDateTime } from "../utils/dates";
import { StatusPill } from "./StatusPill";

export function AlertsList({ alerts }: { alerts: StoreAlert[] }) {
  return (
    <div className="divide-y divide-[#ECEAE4]">
      {alerts.map((a) => {
        const Icon = a.kind === "deferral" ? CalendarClock : TriangleAlert;
        return (
          <div key={a.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.kind === "deferral" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">{a.title}</div>
                <div className="text-[11px] text-neutral-600 mt-0.5 capitalize">{a.reason.toLowerCase()}</div>
                {a.detail && <div className="text-[11px] text-neutral-400 mt-0.5">{a.detail}</div>}
                <div className="text-[10px] text-neutral-400 mt-1">{formatDateTime(a.at)}</div>
              </div>
            </div>
            <StatusPill tone={a.kind === "deferral" ? "amber" : "red"}>
              {a.kind === "deferral" ? "Deferred" : a.unread ? "New exception" : "Exception"}
            </StatusPill>
          </div>
        );
      })}
    </div>
  );
}

import { MapPin } from "lucide-react";
import type { Store } from "../../types";
import { formatWindow } from "../../utils/dates";
import { Panel } from "../Panel";

export function StoreInfoCard({ store }: { store: Store }) {
  const rows: [string, string][] = [
    ["Brand", store.brand ?? "—"],
    ["Address", store.address ?? "—"],
    ["District", store.district ?? "—"],
    ["Delivery window", formatWindow(store.delivery_window_start, store.delivery_window_end)],
    ["Access", store.access_conditions ?? "—"],
    ["Vehicle access", store.is_van_only ? "Van only" : "All vehicles"],
  ];
  return (
    <Panel title={store.name} subtitle="Store details" action={<MapPin className="w-4 h-4 text-neutral-400" />}>
      <dl className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-xs">
            <dt className="text-neutral-400">{label}</dt>
            <dd className="font-medium text-neutral-800 text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

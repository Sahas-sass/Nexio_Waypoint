import Link from "next/link";
import { ArrowRight, Check, ShoppingBag, TriangleAlert } from "lucide-react";
import type { ActivityItem, ActivityKind } from "../../utils/activity";
import { formatDateTime } from "../../utils/dates";
import { orderTone } from "../../utils/tones";
import { Panel } from "../Panel";
import { EmptyState } from "../States";
import { StatusPill, type Tone } from "../StatusPill";

const ICONS: Record<ActivityKind, { icon: typeof Check; cls: string }> = {
  received: { icon: Check, cls: "bg-emerald-50 text-emerald-600" },
  deferred: { icon: TriangleAlert, cls: "bg-amber-50 text-amber-600" },
  issue: { icon: TriangleAlert, cls: "bg-red-50 text-red-600" },
  submitted: { icon: ShoppingBag, cls: "bg-[#FDF6E2] text-amber-700" },
};

function tone(item: ActivityItem): Tone {
  if (item.kind === "received") return "green";
  if (item.kind === "issue") return "red";
  if (item.kind === "deferred") return "amber";
  return orderTone(item.status);
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Panel
      title="Recent activity"
      subtitle="Your most recent store operations"
      action={
        <Link href="/history" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors">
          <span>View history</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {items.length === 0 ? (
        <EmptyState title="No activity yet" hint="Orders, deliveries and receipts will show up here." />
      ) : (
        <div className="divide-y divide-[#ECEAE4]">
          {items.map((item) => {
            const { icon: Icon, cls } = ICONS[item.kind];
            return (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl ${cls} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{item.title}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{item.subtitle} · {formatDateTime(item.at)}</div>
                  </div>
                </div>
                <StatusPill tone={tone(item)}>{item.status}</StatusPill>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

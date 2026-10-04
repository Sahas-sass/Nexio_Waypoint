import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { cutoffStatus, formatDate, formatDuration } from "../utils/dates";

/** Shows the 16:00 (Asia/Colombo) order cutoff for next-day delivery. */
export function CutoffCard({ now, showAction = true }: { now: Date; showAction?: boolean }) {
  const cutoff = cutoffStatus(now);
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between">
        <div className="bg-[#F5C242] text-neutral-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs">
          <Clock className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${cutoff.open ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {cutoff.open ? "Open" : "Closed"}
        </span>
      </div>
      <div className="mt-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">ORDER CUTOFF · 4:00 PM</div>
        <div className="text-xl font-bold text-neutral-900 mt-1">
          {cutoff.open ? `${formatDuration(cutoff.minutesRemaining)} remaining` : "Cutoff passed"}
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">
          Orders placed now can be delivered from {formatDate(cutoff.earliestDate)}
        </p>
        <div className="w-full h-1.5 bg-[#EFECE6] rounded-full my-4 overflow-hidden">
          <div className="h-full bg-[#F5C242] rounded-full" style={{ width: `${Math.round(cutoff.progress * 100)}%` }} />
        </div>
        {showAction && (
          <Link
            href="/orders"
            className="w-full py-2.5 rounded-xl bg-[#F5C242] hover:bg-[#eab308] text-neutral-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
          >
            <span>Start an order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

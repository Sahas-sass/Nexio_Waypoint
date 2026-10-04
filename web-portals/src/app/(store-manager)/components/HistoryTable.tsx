import type { ReceiptWithOrder } from "../types";
import { formatDate, formatDateTime } from "../utils/dates";
import { issueLabel } from "../utils/receiving";
import { receiptTone } from "../utils/tones";
import { StatusPill } from "./StatusPill";

export function HistoryTable({ receipts }: { receipts: ReceiptWithOrder[] }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-400">
            {["Order", "Received", "Status", "Expected", "Received items", "Issue"].map((h) => (
              <th key={h} className="px-2 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ECEAE4]">
          {receipts.map((r) => (
            <tr key={r.id} className="hover:bg-[#FAF9F6]">
              <td className="px-2 py-3">
                <div className="font-bold text-neutral-900">{r.order?.order_number ?? "—"}</div>
                <div className="text-[11px] text-neutral-400">
                  Target {formatDate(r.order?.target_delivery_date)} · <span className="capitalize">{r.order?.temp_requirement ?? "—"}</span>
                </div>
              </td>
              <td className="px-2 py-3 text-neutral-700">{formatDateTime(r.received_at)}</td>
              <td className="px-2 py-3"><StatusPill tone={receiptTone(r.status)}>{r.status}</StatusPill></td>
              <td className="px-2 py-3 text-neutral-700">{r.items_expected ?? "—"}</td>
              <td className="px-2 py-3 text-neutral-700">{r.items_received ?? "—"}</td>
              <td className="px-2 py-3 text-neutral-700">
                <div>{issueLabel(r.issue_type)}</div>
                {r.issue_note && <div className="text-[11px] text-neutral-400 max-w-[240px]">{r.issue_note}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

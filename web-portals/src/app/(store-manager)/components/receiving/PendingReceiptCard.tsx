import type { PendingReceipt } from "../../types";
import { formatDate } from "../../utils/dates";
import { formatQuantity } from "../../utils/orders";
import { Panel } from "../Panel";
import { ConfirmReceiptForm } from "./ConfirmReceiptForm";
import { ProofOfDeliveryPanel } from "./ProofOfDeliveryPanel";

export function PendingReceiptCard({ item, onConfirmed }: { item: PendingReceipt; onConfirmed: () => void }) {
  const { order, proof } = item;
  return (
    <Panel
      title={order.order_number}
      subtitle={`Target ${formatDate(order.target_delivery_date)} · ${order.temp_requirement ?? "ambient"} · ${formatQuantity(order.total_weight_kg, "kg")} · ${order.item_count ?? "?"} items`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Driver proof of delivery</h3>
          <ProofOfDeliveryPanel proof={proof} />
        </div>
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Confirm what arrived</h3>
          <ConfirmReceiptForm order={order} defaultItems={proof?.items_delivered ?? null} onConfirmed={onConfirmed} />
        </div>
      </div>
    </Panel>
  );
}

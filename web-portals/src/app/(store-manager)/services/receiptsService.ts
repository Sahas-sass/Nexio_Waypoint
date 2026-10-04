import { supabase } from "@/lib/supabaseClient";
import type { ConfirmReceiptInput, ReceiptWithOrder, StoreReceipt } from "../types";
import { single, unwrap } from "../utils/errors";

const RECEIPT_COLUMNS = "id, order_id, status, items_expected, items_received, issue_type, issue_note, received_at";

/** Store receipts (newest first) joined with their order. */
export async function fetchStoreReceipts(storeId: string): Promise<ReceiptWithOrder[]> {
  const result = await supabase
    .from("store_receipts")
    .select(`${RECEIPT_COLUMNS}, order:orders(order_number, target_delivery_date, temp_requirement)`)
    .eq("store_id", storeId)
    .order("received_at", { ascending: false });
  const rows = unwrap(result, []) as (StoreReceipt & { order: unknown })[];
  return rows.map((r) => ({ ...r, order: single(r.order as ReceiptWithOrder["order"] | ReceiptWithOrder["order"][]) }));
}

export async function confirmReceipt(input: ConfirmReceiptInput): Promise<StoreReceipt> {
  const result = await supabase.rpc("confirm_order_receipt", {
    p_order_id: input.orderId,
    p_items_received: input.itemsReceived,
    p_issue_type: input.issueType,
    p_issue_note: input.issueNote,
  });
  return unwrap(result) as StoreReceipt;
}

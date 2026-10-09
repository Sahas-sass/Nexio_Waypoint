import type { DeferralLog, Order, PendingReceipt, StoreException, StoreReceipt, TripStop } from "../types";
import { awaitingReceipt } from "../utils/orders";
import { fetchDeferralLogs, fetchStoreExceptions } from "./alertsService";
import { fetchProofsByOrder, fetchStoreStops } from "./deliveriesService";
import { fetchStoreOrders } from "./ordersService";
import { fetchStoreReceipts } from "./receiptsService";

export interface OverviewData {
  orders: Order[];
  receipts: StoreReceipt[];
  deferrals: DeferralLog[];
  stops: TripStop[];
}

export async function loadOverviewData(storeId: string): Promise<OverviewData> {
  const [orders, receipts, deferrals, stops] = await Promise.all([
    fetchStoreOrders(storeId),
    fetchStoreReceipts(storeId),
    fetchDeferralLogs(storeId),
    fetchStoreStops(storeId),
  ]);
  return { orders, receipts, deferrals, stops };
}

/** Delivered orders without a store receipt, each with the driver's proof of delivery (if any). */
export async function loadPendingReceipts(storeId: string): Promise<PendingReceipt[]> {
  const [orders, receipts] = await Promise.all([fetchStoreOrders(storeId), fetchStoreReceipts(storeId)]);
  const pending = awaitingReceipt(orders, receipts);
  const proofs = await fetchProofsByOrder(pending.map((o) => o.id));
  return pending.map((order) => ({ order, proof: proofs.get(order.id) ?? null }));
}

export interface AlertsData {
  deferrals: DeferralLog[];
  orders: Order[];
  exceptions: StoreException[];
}

export async function loadAlertsData(storeId: string): Promise<AlertsData> {
  const [deferrals, orders, exceptions] = await Promise.all([
    fetchDeferralLogs(storeId),
    fetchStoreOrders(storeId),
    fetchStoreExceptions(storeId),
  ]);
  return { deferrals, orders, exceptions };
}

export type OrderStatus = "pending" | "planning" | "assigned" | "deferred" | "delivered";
export type TempType = "ambient" | "chilled";
export type Priority = "High" | "Standard" | "Low";
export type ReceiptStatus = "received" | "partial" | "rejected";
export type IssueType = "shortage" | "damaged" | "wrong_item" | "temperature" | "late" | "other";
export type StopStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type PodOutcome = "delivered" | "partial" | "failed";

export interface Store {
  id: string;
  name: string;
  brand: string | null;
  address: string | null;
  district: string | null;
  access_conditions: string | null;
  delivery_window_start: string | null;
  delivery_window_end: string | null;
  is_van_only: boolean | null;
}

export interface StoreContextData {
  userId: string;
  fullName: string | null;
  store: Store;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  target_delivery_date: string | null;
  temp_requirement: TempType | null;
  total_weight_kg: number | null;
  total_volume_m3: number | null;
  item_count: number | null;
  priority: Priority | null;
  delivery_window: string | null;
  deferral_reason: string | null;
  deferred_at: string | null;
  rescheduled_run: string | null;
  notes: string | null;
  created_at: string;
}

export interface Vehicle {
  registration_number: string;
  vehicle_type: string | null;
}

export interface Trip {
  trip_number: string;
  trip_date: string;
  status: string;
  eta_time: string | null;
  vehicle: Vehicle | null;
}

export interface TripStop {
  id: string;
  order_id: string | null;
  stop_sequence: number;
  status: StopStatus;
  estimated_arrival: string | null;
  completed_at: string | null;
  trip: Trip | null;
}

export interface ProofOfDelivery {
  id: string;
  stop_id: string;
  outcome: PodOutcome;
  items_expected: number | null;
  items_delivered: number | null;
  signature_url: string | null;
  photo_url: string | null;
  notes: string | null;
  captured_offline: boolean | null;
  captured_at: string | null;
}

export interface StoreReceipt {
  id: string;
  order_id: string;
  status: ReceiptStatus;
  items_expected: number | null;
  items_received: number | null;
  issue_type: IssueType | null;
  issue_note: string | null;
  received_at: string;
}

export interface ReceiptWithOrder extends StoreReceipt {
  order: Pick<Order, "order_number" | "target_delivery_date" | "temp_requirement"> | null;
}

export interface PendingReceipt {
  order: Order;
  proof: ProofOfDelivery | null;
}

export interface DeferralLog {
  id: string;
  order_id: string | null;
  order_number: string | null;
  reason: string | null;
  rescheduled_run: string | null;
  deferred_at: string;
  notes: string | null;
}

export interface StoreException {
  id: string;
  order_id: string | null;
  reason_code: string | null;
  action_taken: string | null;
  is_read: boolean | null;
  created_at: string;
}

export interface PlaceOrderInput {
  targetDate: string;
  temp: TempType;
  weightKg: number;
  volumeM3: number;
  itemCount: number;
  priority: Priority;
  notes: string | null;
}

export interface ConfirmReceiptInput {
  orderId: string;
  itemsReceived: number;
  issueType: IssueType | null;
  issueNote: string | null;
}

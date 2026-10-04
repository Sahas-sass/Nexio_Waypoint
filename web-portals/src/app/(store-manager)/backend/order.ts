import { supabase } from "@/lib/supabaseClient";

export async function getProductsCatalog() {
  const { data: products, error } = await supabase
    .from('Product')
    .select('*')
    .order('category', { ascending: true });

  if (error) throw new Error(error.message);
  return products;
}

export async function createOrder(storeId: string, payload: {
  type: string;
  targetDelivery: string;
  items: { productId: string, quantity: number }[];
  totalVolume?: number;
  totalWeight?: number;
}) {
  const displayId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // 1. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('Order')
    .insert({
      displayId,
      storeId,
      type: payload.type,
      status: 'PLANNING',
      targetDelivery: payload.targetDelivery,
      totalVolume: payload.totalVolume,
      totalWeight: payload.totalWeight
    })
    .select('id')
    .single();

  if (orderError || !order) throw new Error(orderError?.message || "Failed to create order");

  // 2. Insert Order Items
  const orderItems = payload.items.map(item => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity
  }));

  const { error: itemsError } = await supabase
    .from('OrderItem')
    .insert(orderItems);

  if (itemsError) throw new Error(itemsError.message);

  return { success: true, orderId: order.id, displayId };
}
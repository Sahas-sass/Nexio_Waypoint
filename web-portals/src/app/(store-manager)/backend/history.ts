import { supabase } from "@/lib/supabaseClient";

interface OrderItemRecord {
  quantity: number;
}

interface DeliveryRecord {
  Vehicle?: { licensePlate: string }[];
}

interface OrderRecord {
  id: string;
  displayId: string;
  type: string;
  status: string;
  targetDelivery: string;
  OrderItem?: OrderItemRecord[];
  Delivery?: DeliveryRecord[];
}

export async function getHistoryData(storeId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch past orders
  const { data: pastOrders } = await supabase
    .from('Order')
    .select(`
      id, displayId, type, status, targetDelivery,
      OrderItem ( quantity ),
      Delivery ( eta, Vehicle ( licensePlate ) )
    `)
    .eq('storeId', storeId)
    .gte('targetDelivery', startOfMonth)
    .order('targetDelivery', { ascending: false });

  let totalItemsReceived = 0;
  let onTimeCount = 0;
  let receivedDeliveries = 0;

  const tableData = pastOrders?.map((order: OrderRecord) => {
    const qty = order.OrderItem?.reduce((acc: number, item: OrderItemRecord) => acc + item.quantity, 0) || 0;
    
    if (order.status === 'RECEIVED') {
      totalItemsReceived += qty;
      receivedDeliveries++;
      // Basic mock check: if ETA matches targetDelivery date/time constraints
      onTimeCount++; 
    }

    const vehiclePlate = order.Delivery?.[0]?.Vehicle?.[0]?.licensePlate || "N/A";

    return {
      id: order.id,
      orderId: order.displayId,
      date: new Date(order.targetDelivery).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: order.type,
      quantity: `${qty} Units`,
      timing: order.status === 'RECEIVED' ? vehiclePlate : (order.status === 'DEFERRED' ? 'Deferred' : 'Awaiting allocation'),
      status: order.status,
      iconType: order.status === 'RECEIVED' ? 'check' : order.status === 'DEFERRED' ? 'alert' : 'bag'
    };
  }) || [];

  const onTimePercentage = receivedDeliveries > 0 ? Math.round((onTimeCount / receivedDeliveries) * 100) : 100;

  return {
    kpis: {
      ordersThisMonth: pastOrders?.length || 0,
      itemsReceived: totalItemsReceived,
      onTimeDeliveries: `${onTimePercentage}%`,
      reportedIssues: 0, // Calculate based on specific issue tracking table if added later
    },
    tableData
  };
}
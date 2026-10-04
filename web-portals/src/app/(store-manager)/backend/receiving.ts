import { supabase } from "@/lib/supabaseClient";

interface OrderItemRecord {
  quantity: number;
}

interface OrderRecord {
  displayId: string;
  type: string;
  OrderItem?: OrderItemRecord[];
}

interface DeliveryRecord {
  id: string;
  eta: string;
  distanceKm: number | null;
  status: string;
  Order?: OrderRecord[];
  Vehicle?: { licensePlate: string }[];
}

interface TimelineItem {
  id: string;
  time: string;
  vehicle: string;
  destination: string;
  statusText: string;
  badge: string;
  items: string;
  rawEta: string;
  status: string;
}

export async function getReceivingData(storeId: string) {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // Fetch all deliveries for today
  const { data: todaysDeliveriesData } = await supabase
    .from('Delivery')
    .select(`
      id, eta, distanceKm, status,
      Order ( displayId, type, OrderItem ( quantity ) ),
      Vehicle ( licensePlate )
    `)
    .eq('storeId', storeId)
    .gte('eta', startOfToday)
    .lte('eta', endOfToday)
    .order('eta', { ascending: true });

  const timeline: TimelineItem[] = todaysDeliveriesData?.map((delivery: DeliveryRecord) => {
    const totalItems = delivery.Order?.reduce((sum: number, o: OrderRecord) => sum + (o.OrderItem?.reduce((acc: number, i: OrderItemRecord) => acc + i.quantity, 0) || 0), 0) || 0;
    return {
      id: delivery.id,
      time: new Date(delivery.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicle: delivery.Vehicle?.[0]?.licensePlate || "Pending",
      destination: delivery.Order?.[0]?.displayId || "Unknown",
      statusText: delivery.distanceKm ? `${delivery.distanceKm} km away` : 'Planned route',
      badge: delivery.status.replace('_', ' '),
      items: `${totalItems} items`,
      rawEta: delivery.eta,
      status: delivery.status
    };
  }) || [];

  // Determine active/next delivery
  const nowIso = new Date().toISOString();
  const activeDelivery = timeline.find((d: TimelineItem) => d.rawEta >= nowIso && d.status !== 'DELIVERED');

  const receivedCount = timeline.filter((d: TimelineItem) => d.status === 'DELIVERED').length;

  return {
    kpis: {
      todaysDeliveries: timeline.length,
      received: receivedCount,
      pending: timeline.length - receivedCount
    },
    timeline,
    activeDelivery: activeDelivery || null
  };
}
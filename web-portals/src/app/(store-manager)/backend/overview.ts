/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabaseClient";

export async function getOverviewData(storeId: string) {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfWeekIso = new Date(startOfWeek.setHours(0, 0, 0, 0)).toISOString();

  const [
    { count: todaysDeliveries },
    { count: receivedThisWeek },
    { count: needsAttention },
    { data: nextDeliveryData },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from('Delivery').select('*', { count: 'exact', head: true })
      .eq('storeId', storeId).gte('eta', startOfToday).lte('eta', endOfToday),
    
    supabase.from('Delivery').select('*', { count: 'exact', head: true })
      .eq('storeId', storeId).eq('status', 'DELIVERED')
      .gte('eta', startOfWeekIso).lte('eta', endOfToday),
    
    supabase.from('Alert').select('*', { count: 'exact', head: true })
      .eq('storeId', storeId).eq('isRead', false),

    supabase.from('Delivery').select(`
      id, eta, distanceKm, status,
      Order ( type, OrderItem ( quantity ) ), Vehicle ( licensePlate )
    `).eq('storeId', storeId).in('status', ['UPCOMING', 'ON_THE_WAY', 'ON_SCHEDULE'])
      .gte('eta', new Date().toISOString()).order('eta', { ascending: true }).limit(1).single(),

    supabase.from('Order').select(`
      id, displayId, status, type, targetDelivery, OrderItem ( quantity )
    `).eq('storeId', storeId).order('targetDelivery', { ascending: false }).limit(5)
  ]);

  let nextDelivery = null;
  if (nextDeliveryData) {
    const totalCases = (nextDeliveryData as any).Order?.reduce((sum: number, order: any) => sum + (order.OrderItem?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0), 0) || 0;
    nextDelivery = {
      id: (nextDeliveryData as any).id,
      eta: new Date((nextDeliveryData as any).eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicle: (nextDeliveryData as any).Vehicle?.[0]?.licensePlate || "Pending",
      distanceKm: (nextDeliveryData as any).distanceKm,
      status: (nextDeliveryData as any).status,
      type: (nextDeliveryData as any).Order?.[0]?.type,
      cases: totalCases,
    };
  }

  const activities = (recentOrders as any[])?.map((order: any) => ({
    id: order.id,
    title: `Order ${order.displayId} ${order.status.toLowerCase()}`,
    subtitle: `${order.type} • ${order.OrderItem?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0} cases`,
    status: order.status === 'RECEIVED' ? 'Complete' : order.status === 'DEFERRED' ? 'Review' : 'Planning',
    type: order.status === 'RECEIVED' ? 'received' : order.status === 'DEFERRED' ? 'deferred' : 'submitted',
    details: `Target delivery: ${new Date(order.targetDelivery).toLocaleString()}`,
  })) || [];

  return {
    kpis: {
      todaysDeliveries: todaysDeliveries || 0,
      receivedThisWeek: receivedThisWeek || 0,
      needsAttention: needsAttention || 0,
    },
    nextDelivery,
    activities
  };
}
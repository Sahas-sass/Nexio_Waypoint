import { supabase } from "@/lib/supabaseClient";

export async function getAlertsData(storeId: string) {
  const { data: alerts, error } = await supabase
    .from('Alert')
    .select('*')
    .eq('storeId', storeId)
    .order('createdAt', { ascending: false });

  if (error) throw new Error(error.message);

  const unreadAlerts = alerts?.filter(a => !a.isRead) || [];
  const deferredOrders = alerts?.filter(a => a.type === 'DEFERRED') || [];
  const deliveryIssues = alerts?.filter(a => a.type === 'UPDATED') || []; // Example mapping for 'issues'

  const formattedAlerts = alerts?.map(a => ({
    id: a.id,
    title: a.title,
    subtitle: a.message,
    timeInfo: new Date(a.createdAt).toLocaleString(),
    type: a.type.toLowerCase(),
    unread: !a.isRead,
  })) || [];

  return {
    kpis: {
      newAlerts: unreadAlerts.length,
      deferredOrders: deferredOrders.length,
      deliveryIssues: deliveryIssues.length,
    },
    alerts: formattedAlerts
  };
}

export async function markAlertAsRead(alertId: string) {
  const { error } = await supabase
    .from('Alert')
    .update({ isRead: true })
    .eq('id', alertId);

  if (error) throw new Error(error.message);
  return { success: true };
}
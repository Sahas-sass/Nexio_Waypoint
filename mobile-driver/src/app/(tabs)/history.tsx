import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getFormattedHeaderDate, Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Card, Label, TitleRow } from '@/components/waypoint/ui';
import { db, type StopRecord } from '@/database/schema';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

const FILTERS = ['All', 'Completed', 'Exceptions'] as const;
type FilterType = (typeof FILTERS)[number];

interface DeliveryHistoryItem {
  id: string;
  stop: string;
  store: string;
  city: string;
  time: string;
  items: string;
  type: 'Chilled' | 'Ambient';
  status: 'Complete' | 'Shortfall';
  isDb?: boolean;
}

const STATIC_DELIVERIES: DeliveryHistoryItem[] = [
  {
    id: 'hist-2',
    stop: 'Stop 02',
    store: 'Fresh Store #22',
    city: 'Nugegoda',
    time: '8:24 AM',
    items: '28/28 items',
    type: 'Chilled',
    status: 'Complete',
  },
  {
    id: 'hist-1',
    stop: 'Stop 01',
    store: 'Fresh Store #18',
    city: 'Colombo 07',
    time: '7:10 AM',
    items: '16/16 items',
    type: 'Chilled',
    status: 'Complete',
  },
  {
    id: 'hist-6',
    stop: 'Stop 06',
    store: 'Urban Market #05',
    city: 'Rajagiriya',
    time: 'Yesterday · 1:42 PM',
    items: '21/22 items',
    type: 'Ambient',
    status: 'Shortfall',
  },
  {
    id: 'hist-5',
    stop: 'Stop 05',
    store: 'Daily Market #14',
    city: 'Battaramulla',
    time: 'Yesterday · 12:18 PM',
    items: '34/34 items',
    type: 'Ambient',
    status: 'Complete',
  },
];

export default function HistoryScreen() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [dbCompletedStops, setDbCompletedStops] = useState<StopRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load completed stops from SQLite
  const loadCompletedStops = useCallback(() => {
    try {
      const rows = db.getAllSync<StopRecord>(
        "SELECT * FROM stops WHERE status = 'COMPLETED' ORDER BY stop_number ASC;"
      );
      setDbCompletedStops(rows ?? []);
    } catch (err) {
      console.warn('[HistoryScreen] Failed to read completed stops:', err);
    }
  }, []);

  useEffect(() => {
    loadCompletedStops();
  }, [loadCompletedStops]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      loadCompletedStops();
    } finally {
      setRefreshing(false);
    }
  }, [loadCompletedStops]);

  // Merge SQLite completed stops with history
  const allDeliveries = useMemo<DeliveryHistoryItem[]>(() => {
    // If SQLite has completed stops, integrate them dynamically
    const dbItems: DeliveryHistoryItem[] = dbCompletedStops.map((s) => ({
      id: `db-${s.id}`,
      stop: `Stop ${String(s.stop_number).padStart(2, '0')}`,
      store: s.store_name,
      city: s.address,
      time: s.stop_number === 1 ? '7:10 AM' : '8:24 AM',
      items: `${s.items_count}/${s.items_count} items`,
      type: s.is_chilled === 1 ? 'Chilled' : 'Ambient',
      status: 'Complete',
      isDb: true,
    }));

    // Avoid duplicate stops if DB already has Stop 01 or Stop 02
    const filteredStatic = STATIC_DELIVERIES.filter(
      (sd) => !dbItems.some((di) => di.store.toLowerCase() === sd.store.toLowerCase())
    );

    return [...dbItems, ...filteredStatic];
  }, [dbCompletedStops]);

  // Apply segmented tab filter
  const filteredDeliveries = useMemo(() => {
    if (filter === 'Completed') {
      return allDeliveries.filter((d) => d.status === 'Complete');
    }
    if (filter === 'Exceptions') {
      return allDeliveries.filter((d) => d.status === 'Shortfall');
    }
    return allDeliveries;
  }, [allDeliveries, filter]);

  const todayDeliveries = useMemo(
    () => filteredDeliveries.filter((d) => !d.time.startsWith('Yesterday')),
    [filteredDeliveries]
  );

  const yesterdayDeliveries = useMemo(
    () => filteredDeliveries.filter((d) => d.time.startsWith('Yesterday')),
    [filteredDeliveries]
  );

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primaryYellow}
          colors={[Colors.primaryYellow]}
        />
      }>
      {/* 1. Top Header */}
      <TitleRow
        eyebrow="DELIVERY RECORDS"
        title="History"
        subtitle="Your recent completed stops"
        aside={
          <View style={styles.shiftCounterPill}>
            <Text style={styles.shiftCounterNumber}>12</Text>
            <Text style={styles.shiftCounterLabel}>THIS WEEK</Text>
          </View>
        }
      />

      {/* 2. Performance KPI Cards (3-column layout) */}
      <View style={styles.kpiContainer}>
        {/* Card 1: Completed Stops */}
        <Card style={styles.kpiCard}>
          <Label size={8} spacing={0.07}>
            COMPLETED
          </Label>
          <Text style={styles.kpiValue}>11</Text>
          <View style={styles.kpiSubRow}>
            <Text style={styles.kpiSubText}>92% success</Text>
          </View>
        </Card>

        {/* Card 2: Cargo Delivered */}
        <Card style={styles.kpiCard}>
          <Label size={8} spacing={0.07}>
            CARGO DELIVERED
          </Label>
          <Text style={styles.kpiValue}>286</Text>
          <View style={styles.kpiSubRow}>
            <Text style={styles.kpiSubText}>2,840 kg total</Text>
          </View>
        </Card>

        {/* Card 3: Punctuality / On-Time Rate */}
        <Card style={styles.kpiCard}>
          <Label size={8} spacing={0.07}>
            ON-TIME RATE
          </Label>
          <Text style={styles.kpiValue}>96%</Text>
          <View style={styles.kpiSubRow}>
            <Icon name="check" size={10} color={W.greenDark} />
            <Text style={[styles.kpiSubText, { color: W.greenDark }]}>
              +3% this week
            </Text>
          </View>
        </Card>
      </View>

      {/* 3. Filter Tabs (Segmented Pill Filter) */}
      <View style={styles.filterBar}>
        {FILTERS.map((tab) => {
          const active = tab === filter;
          return (
            <Pressable
              key={tab}
              onPress={() => setFilter(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[
                styles.filterPill,
                active && styles.filterPillActive,
              ]}>
              <Text
                style={[
                  styles.filterPillText,
                  active && styles.filterPillTextActive,
                ]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 4. Grouped Delivery Activity */}
      {/* Section: Today */}
      {todayDeliveries.length > 0 && (
        <View style={styles.dateSection}>
          <View style={styles.dateHeaderRow}>
            <Text style={styles.dateSectionTitle}>Today</Text>
            <Text style={styles.dateSectionMeta}>{getFormattedHeaderDate()}</Text>
          </View>

          <View style={styles.activityList}>
            {todayDeliveries.map((item) => (
              <DeliveryCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      )}

      {/* Section: Yesterday */}
      {yesterdayDeliveries.length > 0 && (
        <View style={styles.dateSection}>
          <View style={styles.dateHeaderRow}>
            <Text style={styles.dateSectionTitle}>Yesterday</Text>
            <Text style={styles.dateSectionMeta}>Sunday, 13 October</Text>
          </View>

          <View style={styles.activityList}>
            {yesterdayDeliveries.map((item) => (
              <DeliveryCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      )}

      {/* 5. Bottom Sync Status Footer */}
      <View style={styles.syncFooter}>
        <View style={styles.syncIconCircle}>
          <Icon name="cloud" size={17} color={W.greenDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.syncFooterTitle}>All records synchronized</Text>
          <Text style={styles.syncFooterSubtitle}>
            Last synced today at 8:25 AM
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function DeliveryCard({ item }: { item: DeliveryHistoryItem }) {
  const isShortfall = item.status === 'Shortfall';

  return (
    <Card style={styles.deliveryCard}>
      {/* Status Icon */}
      <View
        style={[
          styles.statusIconBox,
          isShortfall && styles.statusIconBoxException,
        ]}>
        <Icon
          name={isShortfall ? 'alert' : 'check'}
          size={18}
          color={isShortfall ? '#B45309' : W.greenDark}
        />
      </View>

      {/* Delivery Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.cardTopRow}>
          <View style={styles.stopTag}>
            <Text style={styles.stopTagText}>{item.stop.toUpperCase()}</Text>
          </View>
          <Text style={styles.deliveryTimeText}>{item.time}</Text>
        </View>

        <Text style={styles.storeNameText} numberOfLines={1}>
          {item.store}
        </Text>

        <View style={styles.cityRow}>
          <Icon name="pin" size={12} color={Colors.textSecondary} />
          <Text style={styles.cityText} numberOfLines={1}>
            {item.city}
          </Text>
        </View>

        {/* Badges Row */}
        <View style={styles.chipsRow}>
          {/* Items count */}
          <View style={styles.itemBadge}>
            <Text style={styles.itemBadgeText}>{item.items}</Text>
          </View>

          {/* Temperature Badge */}
          <View
            style={[
              styles.tempBadge,
              item.type === 'Chilled' ? styles.tempBadgeChilled : styles.tempBadgeAmbient,
            ]}>
            {item.type === 'Chilled' && (
              <Icon name="snow" size={12} color="#08759E" />
            )}
            <Text
              style={[
                styles.tempBadgeText,
                item.type === 'Chilled' ? { color: '#08759E' } : { color: Colors.textSecondary },
              ]}>
              {item.type}
            </Text>
          </View>

          {/* Exception Warning if Shortfall */}
          {isShortfall && (
            <View style={styles.shortfallBadge}>
              <Icon name="alert" size={11} color="#B45309" />
              <Text style={styles.shortfallBadgeText}>Shortfall Reported</Text>
            </View>
          )}
        </View>
      </View>

      <Icon name="chevron" size={16} color="#CBD5E1" />
    </Card>
  );
}

const styles = StyleSheet.create({
  shiftCounterPill: {
    width: 60,
    height: 54,
    borderRadius: 15,
    backgroundColor: '#FFF8DC',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  shiftCounterNumber: {
    ...font(800),
    fontSize: 20,
    lineHeight: 23,
    color: Colors.textPrimary,
  },
  shiftCounterLabel: {
    ...font(700),
    fontSize: 7.5,
    color: '#8A5900',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: Shadow.sm,
  },
  kpiValue: {
    ...font(800),
    fontSize: 22,
    lineHeight: 26,
    color: Colors.textPrimary,
    marginTop: 6,
  },
  kpiSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  kpiSubText: {
    ...font(700),
    fontSize: 9,
    color: Colors.textSecondary,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  filterPillActive: {
    backgroundColor: Colors.primaryYellow,
    borderColor: '#F59E0B',
  },
  filterPillText: {
    ...font(700),
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.textPrimary,
    ...font(800),
  },
  dateSection: {
    marginBottom: 18,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  dateSectionTitle: {
    ...font(800),
    fontSize: 15,
    color: Colors.textPrimary,
  },
  dateSectionMeta: {
    ...font(600),
    fontSize: 11,
    color: Colors.textSecondary,
  },
  activityList: {
    gap: 10,
  },
  deliveryCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: Shadow.sm,
  },
  statusIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: W.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconBoxException: {
    backgroundColor: '#FEF3C7',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopTag: {
    backgroundColor: '#FFF8DC',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  stopTagText: {
    ...font(800),
    fontSize: 8.5,
    color: '#8A5900',
  },
  deliveryTimeText: {
    ...font(600),
    fontSize: 10,
    color: Colors.textSecondary,
  },
  storeNameText: {
    ...font(800),
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  cityText: {
    ...font(500),
    fontSize: 10,
    color: Colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  itemBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  itemBadgeText: {
    ...font(700),
    fontSize: 9,
    color: Colors.textPrimary,
  },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tempBadgeChilled: {
    backgroundColor: '#E0F2FE',
  },
  tempBadgeAmbient: {
    backgroundColor: '#F3F4F6',
  },
  tempBadgeText: {
    ...font(700),
    fontSize: 9,
  },
  shortfallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
  },
  shortfallBadgeText: {
    ...font(800),
    fontSize: 9,
    color: '#B45309',
  },
  syncFooter: {
    minHeight: 56,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: Shadow.sm,
  },
  syncIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncFooterTitle: {
    ...font(800),
    fontSize: 12,
    color: '#15803D',
  },
  syncFooterSubtitle: {
    ...font(500),
    fontSize: 10,
    color: '#166534',
    marginTop: 1,
  },
});

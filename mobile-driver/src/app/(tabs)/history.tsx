import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Card, Label, TitleRow } from '@/components/waypoint/ui';
import {
  buildHistory,
  filterHistory,
  itemsLabel,
  summarizeHistory,
  type HistoryFilter,
  type HistoryItem,
} from '@/features/history/utils/deliveryHistory';
import { useSyncStore } from '@/features/sync/store/syncStore';
import { TripStateView } from '@/features/trip/components/TripStateView';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { reloadTrip } from '@/features/trip/services/tripController';
import { formatDateParts, formatKg, formatTimestamp, padStop, parseDateOnly } from '@/utils/formatters';
import { Colors, font, Shadow, W } from '@/utils/theme';

const FILTERS: HistoryFilter[] = ['All', 'Completed', 'Exceptions'];

export default function HistoryScreen() {
  const [filter, setFilter] = useState<HistoryFilter>('All');
  const [refreshing, setRefreshing] = useState(false);
  const { status, error, trip, stops, downloadedAt } = useTrip();
  const outbox = useSyncStore((s) => s.outbox);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadTrip();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const history = useMemo(() => buildHistory(stops, outbox), [stops, outbox]);
  const visible = useMemo(() => filterHistory(history, filter), [history, filter]);
  const summary = useMemo(() => summarizeHistory(history), [history]);
  const tripDate = formatDateParts(parseDateOnly(trip?.tripDate) ?? new Date()).fullDate;
  const lastSynced = formatTimestamp(lastSyncedAt ?? downloadedAt);

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
      <TitleRow
        eyebrow="DELIVERY RECORDS"
        title="History"
        subtitle={trip ? `Closed stops on ${trip.tripNumber}` : 'Your closed stops'}
        aside={
          <View style={styles.shiftCounterPill}>
            <Text style={styles.shiftCounterNumber}>{summary.closed}</Text>
            <Text style={styles.shiftCounterLabel}>CLOSED</Text>
          </View>
        }
      />

      {!trip ? (
        <TripStateView
          kind={status === 'error' ? 'error' : status === 'ready' ? 'empty' : 'loading'}
          message={status === 'error' ? error : undefined}
          onRetry={handleRefresh}
        />
      ) : (
        <>
          <View style={styles.kpiContainer}>
            <Card style={styles.kpiCard}>
              <Label size={8} spacing={0.07}>
                COMPLETED
              </Label>
              <Text style={styles.kpiValue}>{summary.completed}</Text>
              <View style={styles.kpiSubRow}>
                <Text style={styles.kpiSubText}>{summary.successPercent}% success</Text>
              </View>
            </Card>

            <Card style={styles.kpiCard}>
              <Label size={8} spacing={0.07}>
                CARGO DELIVERED
              </Label>
              <Text style={styles.kpiValue}>{summary.itemsDelivered}</Text>
              <View style={styles.kpiSubRow}>
                <Text style={styles.kpiSubText}>{formatKg(summary.weightKg)} total</Text>
              </View>
            </Card>

            <Card style={styles.kpiCard}>
              <Label size={8} spacing={0.07}>
                EXCEPTIONS
              </Label>
              <Text style={styles.kpiValue}>{summary.exceptions}</Text>
              <View style={styles.kpiSubRow}>
                <Text style={styles.kpiSubText}>shortfall / failed</Text>
              </View>
            </Card>
          </View>

          <View style={styles.filterBar}>
            {FILTERS.map((tab) => {
              const active = tab === filter;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setFilter(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.filterPill, active && styles.filterPillActive]}>
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{tab}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.dateSection}>
            <View style={styles.dateHeaderRow}>
              <Text style={styles.dateSectionTitle}>{trip.tripNumber}</Text>
              <Text style={styles.dateSectionMeta}>{tripDate}</Text>
            </View>

            {visible.length === 0 ? (
              <TripStateView
                kind="empty"
                title={history.length === 0 ? 'No deliveries closed yet' : 'Nothing matches this filter'}
                message={history.length === 0 ? 'Completed stops will appear here after proof of delivery.' : null}
              />
            ) : (
              <View style={styles.activityList}>
                {visible.map((item) => (
                  <DeliveryCard key={item.id} item={item} />
                ))}
              </View>
            )}
          </View>
        </>
      )}

      <View style={styles.syncFooter}>
        <View style={styles.syncIconCircle}>
          <Icon name="cloud" size={17} color={pendingCount > 0 ? '#B45309' : W.greenDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.syncFooterTitle}>
            {pendingCount > 0
              ? `${pendingCount} record${pendingCount === 1 ? '' : 's'} waiting to sync`
              : 'All records synchronized'}
          </Text>
          {lastSynced ? <Text style={styles.syncFooterSubtitle}>Last synced at {lastSynced}</Text> : null}
        </View>
      </View>
    </Screen>
  );
}

function DeliveryCard({ item }: { item: HistoryItem }) {
  const isException = item.status !== 'Complete';
  const chilled = item.temp === 'chilled';
  const time = formatTimestamp(item.completedAt);

  return (
    <Card style={styles.deliveryCard}>
      <View style={[styles.statusIconBox, isException && styles.statusIconBoxException]}>
        <Icon
          name={item.status === 'Failed' ? 'x' : isException ? 'alert' : 'check'}
          size={18}
          color={isException ? '#B45309' : W.greenDark}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.cardTopRow}>
          <View style={styles.stopTag}>
            <Text style={styles.stopTagText}>STOP {padStop(item.sequence)}</Text>
          </View>
          {time ? <Text style={styles.deliveryTimeText}>{time}</Text> : null}
        </View>

        <Text style={styles.storeNameText} numberOfLines={1}>
          {item.storeName}
        </Text>

        {item.address ? (
          <View style={styles.cityRow}>
            <Icon name="pin" size={12} color={Colors.textSecondary} />
            <Text style={styles.cityText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        ) : null}

        <View style={styles.chipsRow}>
          <View style={styles.itemBadge}>
            <Text style={styles.itemBadgeText}>{itemsLabel(item)}</Text>
          </View>

          <View style={[styles.tempBadge, chilled ? styles.tempBadgeChilled : styles.tempBadgeAmbient]}>
            {chilled && <Icon name="snow" size={12} color="#08759E" />}
            <Text style={[styles.tempBadgeText, { color: chilled ? '#08759E' : Colors.textSecondary }]}>
              {chilled ? 'Chilled' : 'Ambient'}
            </Text>
          </View>

          {isException && (
            <View style={styles.shortfallBadge}>
              <Icon name="alert" size={11} color="#B45309" />
              <Text style={styles.shortfallBadgeText}>
                {item.status === 'Failed' ? 'Delivery Failed' : 'Shortfall Reported'}
              </Text>
            </View>
          )}

          {item.synced === false && (
            <View style={styles.itemBadge}>
              <Text style={styles.itemBadgeText}>Waiting to sync</Text>
            </View>
          )}
        </View>
      </View>
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

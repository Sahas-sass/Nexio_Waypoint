import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Card, Label } from '@/components/waypoint/ui';
import { useLocationStore } from '@/features/location/locationStore';
import { useSyncStore } from '@/features/sync/store/syncStore';
import { TripStateView } from '@/features/trip/components/TripStateView';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { reloadTrip } from '@/features/trip/services/tripController';
import type { TripStop } from '@/features/trip/types';
import { stopKind, stopKindLabel } from '@/features/trip/utils/stopProgress';
import { formatDateParts, formatKg, formatTimestamp, padStop, parseDateOnly } from '@/utils/formatters';
import { distanceLabel } from '@/utils/haversine';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

export default function RouteScreen() {
  const isOnline = useSyncStore((state) => state.isOnline);
  const coords = useLocationStore((state) => state.coords);
  const { status, error, driver, trip, stops, activeIndex, activeStop, progress } = useTrip();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadTrip();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const { dayNumber, shortMonth } = formatDateParts(parseDateOnly(trip?.tripDate) ?? new Date());
  const vehicleName = trip?.vehicle?.registrationNumber ?? null;
  const departedAt = trip?.departureTime ?? formatTimestamp(trip?.dispatchedAt);

  const handleOpenStop = (stop: TripStop) => {
    router.navigate({ pathname: '/current-stop', params: { stopId: stop.id } });
  };

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
      {/* Top Header & Connectivity Status */}
      <View style={styles.topHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerEyebrow}>DAILY ITINERARY</Text>
          <Text style={styles.headerTitle}>Today&apos;s Route</Text>
          {trip ? (
            <Text style={styles.headerSubtitle}>
              {[trip.tripNumber, vehicleName].filter(Boolean).join(' • ')}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => router.push('/offline')}
          accessibilityRole="button"
          accessibilityLabel="Network status"
          style={[
            styles.networkBadge,
            {
              backgroundColor: isOnline ? W.greenSoft : W.orangeSoft,
              borderColor: isOnline ? '#bbf7d0' : '#fed7aa',
            },
          ]}>
          <View
            style={[styles.networkDot, { backgroundColor: isOnline ? Colors.successGreen : Colors.warningOrange }]}
          />
          <Text style={[styles.networkBadgeText, { color: isOnline ? W.greenDark : Colors.offlineText }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </Pressable>

        <View style={styles.dateTile}>
          <Text style={styles.dateDayText}>{dayNumber}</Text>
          <Text style={styles.dateMonthText}>{shortMonth}</Text>
        </View>
      </View>

      {!trip ? (
        <TripStateView
          kind={status === 'error' ? 'error' : status === 'ready' ? 'empty' : 'loading'}
          message={status === 'error' ? error : undefined}
          onRetry={handleRefresh}
        />
      ) : (
        <>
          {/* Route Summary Card */}
          <View style={styles.vehicleCard}>
            <LinearGradient
              colors={['#3a3b3d', '#26272a', 'rgba(17,18,18,0.98)']}
              locations={[0, 0.35, 1]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(255,200,61,0.3)', 'rgba(255,200,61,0)']}
              locations={[0, 0.55]}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 0.8 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.vehicleTop}>
              <View style={styles.truckBadge}>
                <Icon name="route" size={13} color={Colors.textPrimary} />
                <Text style={styles.truckBadgeText}>
                  {[vehicleName, trip.vehicle?.vehicleType].filter(Boolean).join(' - ') || trip.tripNumber}
                </Text>
              </View>
              <Text style={styles.photoCredit}>
                {trip.tripNumber} • {progress.total} Stops
              </Text>
            </View>

            <View style={styles.vehicleContent}>
              <View style={styles.vehicleMetaGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>DRIVER</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {driver?.fullName ?? '—'}
                  </Text>
                </View>
                <View style={{ flex: 1.3 }}>
                  <Text style={styles.metaLabel}>LOAD</Text>
                  <Text style={styles.metaValue}>
                    {progress.totalItems} Items • {formatKg(progress.totalWeightKg)}
                  </Text>
                </View>
              </View>

              {departedAt || trip.bay ? (
                <View style={styles.departureBar}>
                  <Icon name="clock" size={16} color={Colors.surfaceWhite} />
                  <Text style={styles.departureText}>
                    {departedAt ? `Departure ${departedAt}` : `Bay ${trip.bay}`}
                  </Text>
                  {trip.status === 'en_route' ? (
                    <View style={styles.scheduleBadge}>
                      <View style={styles.scheduleDot} />
                      <Text style={styles.scheduleText}>En route</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>

          {/* Route Progress Card */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeaderRow}>
              <View>
                <Label size={9} spacing={0.11}>
                  ROUTE PROGRESS
                </Label>
                <Text style={styles.progressTitle}>
                  {progress.closed} of {progress.total} Stops Completed
                </Text>
              </View>
              <Text style={styles.progressPercentage}>{progress.percent}%</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress.percent}%` }]} />
            </View>

            <View style={styles.stepDotsRow}>
              {stops.map((stop, index) => {
                const kind = stopKind(stops, index);
                const isClosed = kind === 'done' || kind === 'failed';
                return (
                  <View
                    key={stop.id}
                    style={[
                      styles.stepDot,
                      isClosed && styles.stepDotDone,
                      kind === 'current' && styles.stepDotCurrent,
                    ]}>
                    {isClosed ? (
                      <Icon name={kind === 'failed' ? 'x' : 'check'} size={11} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.stepDotNumber, kind === 'current' && styles.stepDotNumberCurrent]}>
                        {stop.sequence}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {activeStop ? (
              <View style={styles.progressFooter}>
                <Icon name="clock" size={15} color={Colors.textSecondary} />
                <Text style={styles.progressFooterLabel}>Next delivery window</Text>
                <Text style={styles.progressFooterValue}>{activeStop.window ?? 'Not set'}</Text>
              </View>
            ) : null}
          </Card>

          {/* Sequential Stop List */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Sequential Stops</Text>
            <Text style={styles.sectionMeta}>{progress.remaining} remaining</Text>
          </View>

          <View style={styles.stopsList}>
            {stops.map((stop, index) => {
              const kind = stopKind(stops, index);
              const isDone = kind === 'done' || kind === 'failed';
              const isCurrent = kind === 'current';
              const isPending = kind === 'upcoming';
              const distance = isDone ? null : distanceLabel(coords, stop);
              const chilled = stop.temp === 'chilled';

              return (
                <Pressable
                  key={stop.id}
                  onPress={() => handleOpenStop(stop)}
                  accessibilityRole="button"
                  accessibilityLabel={`Stop ${stop.sequence}: ${stop.storeName}`}
                  style={({ pressed }) => [
                    styles.stopCardWrapper,
                    isCurrent && styles.stopCardCurrent,
                    isDone && styles.stopCardDone,
                    pressed && { opacity: 0.93 },
                  ]}>
                  <View style={styles.stopCardInner}>
                    <View style={styles.stopIndexColumn}>
                      <Text style={styles.stopIndexLabel}>STOP</Text>
                      <Text
                        style={[
                          styles.stopIndexNumber,
                          isCurrent && { color: '#8A5900' },
                          isDone && { color: kind === 'failed' ? Colors.warningOrange : W.greenDark },
                        ]}>
                        {padStop(stop.sequence)}
                      </Text>
                    </View>

                    <View style={styles.stopContentColumn}>
                      <View style={styles.stopTitleRow}>
                        <View style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                          <Text style={styles.storeNameText} numberOfLines={1}>
                            {stop.storeName}
                          </Text>
                          {stop.address || distance ? (
                            <View style={styles.addressRow}>
                              <Icon name="pin" size={13} color={Colors.textSecondary} />
                              <Text style={styles.addressText} numberOfLines={1}>
                                {[stop.address, distance].filter(Boolean).join(' • ')}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            isDone && styles.statusBadgeCompleted,
                            isCurrent && styles.statusBadgeCurrent,
                            isPending && styles.statusBadgePending,
                          ]}>
                          {kind === 'done' && <Icon name="check" size={12} color={W.greenDark} />}
                          <Text
                            style={[
                              styles.statusBadgeText,
                              isDone && styles.statusBadgeTextCompleted,
                              isCurrent && styles.statusBadgeTextCurrent,
                              isPending && styles.statusBadgeTextPending,
                            ]}>
                            {stopKindLabel(kind)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.badgesRow}>
                        {stop.window ? (
                          <View style={[styles.chipBadge, styles.chipNeutral]}>
                            <Icon name="clock" size={13} color={Colors.textPrimary} />
                            <Text style={styles.chipText}>{stop.window}</Text>
                          </View>
                        ) : null}

                        <View style={[styles.chipBadge, chilled ? styles.chipChilled : styles.chipAmbient]}>
                          <Icon
                            name={chilled ? 'snow' : 'box'}
                            size={chilled ? 14 : 13}
                            color={chilled ? '#08759E' : Colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.chipText,
                              chilled ? { color: '#08759E', ...font(800) } : { color: Colors.textSecondary },
                            ]}>
                            {chilled ? 'Chilled' : 'Ambient'}
                          </Text>
                        </View>

                        <View style={[styles.chipBadge, styles.chipNeutral]}>
                          <Text style={styles.chipText}>
                            {stop.itemCount} items • {formatKg(stop.weightKg)}
                          </Text>
                        </View>
                      </View>

                      {isCurrent && index === activeIndex && (
                        <View style={styles.openStopButton}>
                          <Text style={styles.openStopButtonText}>Open Stop</Text>
                          <Icon name="chevron" size={16} color={Colors.textPrimary} />
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  headerEyebrow: {
    ...font(800),
    fontSize: 10,
    color: '#8A5900',
    letterSpacing: 1.1,
  },
  headerTitle: {
    ...font(800),
    fontSize: 24,
    lineHeight: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  headerSubtitle: {
    ...font(500),
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkBadgeText: {
    ...font(800),
    fontSize: 10,
  },
  dateTile: {
    width: 48,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  dateDayText: {
    ...font(800),
    fontSize: 19,
    lineHeight: 21,
    color: Colors.textPrimary,
  },
  dateMonthText: {
    ...font(800),
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  vehicleCard: {
    height: 238,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    boxShadow: Shadow.md,
    marginBottom: 16,
    backgroundColor: Colors.textPrimary,
  },
  vehicleTop: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  truckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryYellow,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
  },
  truckBadgeText: {
    ...font(800),
    fontSize: 11,
    color: Colors.textPrimary,
  },
  photoCredit: {
    ...font(600),
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.85)',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  vehicleContent: {
    ...StyleSheet.absoluteFill,
    padding: 16,
    justifyContent: 'flex-end',
  },
  vehicleMetaGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  metaLabel: {
    ...font(700),
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  metaValue: {
    ...font(700),
    fontSize: 13,
    color: Colors.surfaceWhite,
    marginTop: 2,
  },
  departureBar: {
    minHeight: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
  },
  departureText: {
    ...font(600),
    fontSize: 11,
    color: Colors.surfaceWhite,
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 'auto',
  },
  scheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#86efac',
  },
  scheduleText: {
    ...font(700),
    fontSize: 11,
    color: '#86efac',
  },
  progressCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: Shadow.sm,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressTitle: {
    ...font(800),
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 3,
  },
  progressPercentage: {
    ...font(800),
    fontSize: 20,
    color: '#B45309',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#EAEAE6',
    borderRadius: 999,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryYellow,
    borderRadius: 999,
  },
  stepDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F5F5F2',
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.successGreen,
    borderColor: Colors.successGreen,
  },
  stepDotCurrent: {
    backgroundColor: Colors.primaryYellow,
    borderColor: '#D97706',
    boxShadow: '0px 0px 0px 4px rgba(255, 200, 61, 0.35)',
  },
  stepDotNumber: {
    ...font(700),
    fontSize: 9,
    color: Colors.textSecondary,
  },
  stepDotNumberCurrent: {
    color: Colors.textPrimary,
    ...font(800),
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0EB',
  },
  progressFooterLabel: {
    ...font(500),
    fontSize: 11,
    color: Colors.textSecondary,
  },
  progressFooterValue: {
    ...font(700),
    fontSize: 11,
    color: Colors.textPrimary,
    marginLeft: 'auto',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    ...font(800),
    fontSize: 16,
    color: Colors.textPrimary,
  },
  sectionMeta: {
    ...font(600),
    fontSize: 12,
    color: Colors.textSecondary,
  },
  stopsList: {
    gap: 12,
    marginBottom: 20,
  },
  stopCardWrapper: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    boxShadow: Shadow.sm,
    padding: 14,
  },
  stopCardCurrent: {
    borderColor: Colors.primaryYellow,
    backgroundColor: '#FFFEFA',
    boxShadow: '0px 8px 24px rgba(245, 158, 11, 0.16)',
  },
  stopCardDone: {
    opacity: 0.88,
    backgroundColor: '#FAFAF7',
  },
  stopCardInner: {
    flexDirection: 'row',
    gap: 12,
  },
  stopIndexColumn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: '#EBEBE6',
    paddingRight: 8,
  },
  stopIndexLabel: {
    ...font(800),
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  stopIndexNumber: {
    ...font(800),
    fontSize: 22,
    lineHeight: 26,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  stopContentColumn: {
    flex: 1,
    minWidth: 0,
  },
  stopTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  storeNameText: {
    ...font(800),
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  addressText: {
    ...font(500),
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeCompleted: {
    backgroundColor: W.greenSoft,
  },
  statusBadgeCurrent: {
    backgroundColor: Colors.primaryYellow,
  },
  statusBadgePending: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    ...font(800),
    fontSize: 9,
  },
  statusBadgeTextCompleted: {
    color: W.greenDark,
  },
  statusBadgeTextCurrent: {
    color: '#713F12',
  },
  statusBadgeTextPending: {
    color: Colors.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  chipNeutral: {
    backgroundColor: '#F3F4F6',
  },
  chipWarning: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  chipChilled: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  chipAmbient: {
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    ...font(700),
    fontSize: 10,
    color: Colors.textPrimary,
  },
  openStopButton: {
    minHeight: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    boxShadow: '0px 2px 8px rgba(245, 158, 11, 0.25)',
  },
  openStopButtonText: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
  },
});
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon, type IconName } from '@/components/waypoint/icon';
import {
  Card,
  Label,
  SafetyNote,
  SectionHeading,
  TitleRow,
} from '@/components/waypoint/ui';
import { useLocationStore } from '@/features/location/locationStore';
import { StopEmptyState } from '@/features/pod/components/StopEmptyState';
import { StopMap } from '@/features/pod/components/StopMap';
import { findStop } from '@/features/pod/utils/findStop';
import { navigationUrl, phoneUrl, webMapsUrl } from '@/features/pod/utils/stopLinks';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { startCurrentStop } from '@/features/trip/services/tripController';
import { stopStatusLabel } from '@/features/trip/utils/stopProgress';
import { distanceLabel } from '@/utils/haversine';
import { initials, padStop } from '@/utils/formatters';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';


export default function CurrentStopScreen() {
  const params = useLocalSearchParams<{ stopId?: string }>();
  const { stops, activeStop, trip, status, error } = useTrip();
  const liveCoords = useLocationStore((state) => state.coords);

  const stop = findStop(stops, params.stopId, activeStop);

  if (!stop) {
    if (status === 'loading' || status === 'idle') {
      return (
        <Screen>
          <StopEmptyState icon="clock" title="Loading your stop" message="Fetching today's trip…" showRouteLink={false} />
        </Screen>
      );
    }
    if (status === 'error') {
      return (
        <Screen>
          <StopEmptyState icon="alert" title="Trip unavailable" message={error ?? 'Could not load your trip.'} />
        </Screen>
      );
    }
    return (
      <Screen>
        <StopEmptyState
          icon="check"
          title={trip ? 'All stops completed' : 'No active trip'}
          message={
            trip
              ? 'Every stop on this trip has a proof of delivery.'
              : 'Dispatch has not assigned you a loading or en-route trip yet.'
          }
        />
      </Screen>
    );
  }

  const stopNumberStr = padStop(stop.sequence);
  const isChilled = stop.temp === 'chilled';
  const isClosed = stop.status === 'COMPLETED' || stop.status === 'FAILED';
  const distance = distanceLabel(liveCoords, stop);
  const navUrl = navigationUrl(stop, Platform.OS);
  const telUrl = phoneUrl(stop.managerPhone);

  const handleOpenNavigation = () => {
    if (!navUrl) return;
    Linking.openURL(navUrl).catch(() => {
      const fallback = webMapsUrl(stop);
      if (fallback) Linking.openURL(fallback).catch(() => undefined);
    });
  };

  const handleCallManager = () => {
    if (!telUrl) return;
    Linking.openURL(telUrl).catch((err) => {
      console.warn('Cannot open phone dialer:', err);
    });
  };

  const handlePrimary = () => {
    if (isClosed) {
      router.navigate({ pathname: '/pod/complete', params: { stopId: stop.id } });
      return;
    }
    if (stop.status === 'PENDING') startCurrentStop(stop.id);
    router.navigate({ pathname: '/pod/[stopId]', params: { stopId: stop.id } });
  };

  const primaryLabel = isClosed
    ? 'View Delivery Summary'
    : stop.status === 'IN_PROGRESS'
      ? 'Continue Proof of Delivery'
      : 'Start Delivery';

  return (
    <Screen
      footer={
        <View style={styles.footerContainer}>
          <Pressable
            onPress={handlePrimary}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            style={({ pressed }) => [
              styles.startDeliveryButton,
              pressed && styles.startDeliveryButtonPressed,
            ]}>
            <Text style={styles.startDeliveryButtonText}>{primaryLabel}</Text>
            <Icon name="chevron" size={18} color={Colors.textPrimary} />
          </Pressable>
          <SafetyNote>Only interact when safely parked.</SafetyNote>
        </View>
      }>
      <TitleRow
        center
        eyebrow={`CURRENT DELIVERY · STOP ${stopNumberStr}`}
        title={stop.storeName}
        subtitle={stop.address ?? 'Address not set'}
        subtitleIcon="pin"
        aside={
          <View style={styles.stopCounterBadge}>
            <Text style={styles.stopCounterNumber}>{stopNumberStr}</Text>
            <Text style={styles.stopCounterTotal}>OF {stops.length}</Text>
          </View>
        }
      />

      <LinearGradient
        colors={[Colors.primaryYellow, Colors.brightYellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.windowCard}>
        <View style={{ flex: 1 }}>
          <Label size={9} spacing={0.08} color={Colors.textPrimary}>
            DELIVERY WINDOW
          </Label>
          <Text style={styles.windowTimeText}>{stop.window ?? 'Not specified'}</Text>
        </View>

        <View style={styles.onTimePill}>
          <View style={styles.onTimeDot} />
          <Text style={styles.onTimeText}>{stopStatusLabel(stop.status)}</Text>
        </View>
      </LinearGradient>

      <Card style={[styles.mapCard, { padding: 0 }]}>
        <View style={styles.mapContainer}>
          <StopMap stop={stop} driver={liveCoords} />
        </View>

        <View style={styles.locationDetailRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.locationStoreTitle} numberOfLines={1}>
              {stop.storeName}
            </Text>
            {stop.address ? (
              <Text style={styles.locationAddressText} numberOfLines={1}>
                {stop.address}
              </Text>
            ) : null}
          </View>
          {distance && (
            <View style={styles.proximityBadge}>
              <Icon name="navigation" size={13} color="#8A5900" />
              <Text style={styles.proximityText}>{distance} away</Text>
            </View>
          )}
        </View>

        {navUrl && (
          <Pressable
            onPress={handleOpenNavigation}
            accessibilityRole="button"
            accessibilityLabel="Open Navigation"
            style={({ pressed }) => [
              styles.openNavButton,
              pressed && { backgroundColor: '#F0F0EB' },
            ]}>
            <Icon name="navigation" size={17} color={Colors.textPrimary} />
            <Text style={styles.openNavButtonText}>Open Navigation</Text>
          </Pressable>
        )}
      </Card>

      {(stop.accessConditions || stop.isVanOnly) && (
        <>
          <SectionHeading title="Access conditions" />
          <View style={styles.accessGrid}>
            {stop.accessConditions ? (
              <AccessCard icon="pin" title="Site access" detail={stop.accessConditions} wide />
            ) : null}
            {stop.isVanOnly && (
              <AccessCard icon="alert" title="Van access only" detail="Large trucks cannot enter this site." important wide />
            )}
          </View>
        </>
      )}

      {stop.managerName || stop.managerPhone ? (
        <View style={styles.contactCard}>
          <View style={styles.managerAvatar}>
            <Text style={styles.managerInitials}>{initials(stop.managerName) || '—'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.managerRoleLabel}>STORE MANAGER</Text>
            {stop.managerName ? <Text style={styles.managerName}>{stop.managerName}</Text> : null}
            {stop.managerPhone ? <Text style={styles.managerPhone}>{stop.managerPhone}</Text> : null}
          </View>
          {telUrl && (
            <Pressable
              onPress={handleCallManager}
              accessibilityRole="button"
              accessibilityLabel="Call Store Manager"
              style={({ pressed }) => [
                styles.callButton,
                pressed && { backgroundColor: '#FFF4DD', opacity: 0.9 },
              ]}>
              <Icon name="phone" size={15} color="#8A5900" />
              <Text style={styles.callButtonText}>Call</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <SectionHeading title={stop.orderNumber ? `Delivery summary · ${stop.orderNumber}` : 'Delivery summary'} />
      <Card style={styles.summaryCard}>
        <View style={styles.summaryMetricsRow}>
          <SummaryMetricCol icon="box" value={String(stop.itemCount)} unit="Items" />
          <SummaryMetricCol icon="weight" value={String(Math.round(stop.weightKg))} unit="kg" />
          <SummaryMetricCol icon="box" value={String(stop.volumeM3)} unit="m³" last />
        </View>

        {isChilled ? (
          <View style={styles.temperatureBannerChilled}>
            <View style={styles.tempIconCircle}>
              <Icon name="snow" size={18} color="#08759E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tempBannerTitleChilled}>Keep Refrigerated</Text>
              <Text style={styles.tempBannerSubtextChilled}>
                Chilled load • Transfer directly to store cold-room
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.temperatureBannerAmbient}>
            <View style={[styles.tempIconCircle, { backgroundColor: '#E5E7EB' }]}>
              <Icon name="box" size={18} color={Colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tempBannerTitleAmbient}>Ambient Storage</Text>
              <Text style={styles.tempBannerSubtextAmbient}>
                Standard dry cargo handling • Keep protected from moisture
              </Text>
            </View>
          </View>
        )}
      </Card>
    </Screen>
  );
}

function AccessCard({
  icon,
  title,
  detail,
  important,
  wide,
}: {
  icon: IconName;
  title: string;
  detail: string;
  important?: boolean;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        styles.accessCardBox,
        important && styles.accessCardImportant,
        wide && styles.accessCardWide,
      ]}>
      <Icon
        name={icon}
        size={19}
        color={important ? '#A65F00' : '#8A5900'}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.accessCardTitle}>{title}</Text>
        <Text style={styles.accessCardDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function SummaryMetricCol({
  icon,
  value,
  unit,
  last,
}: {
  icon: IconName;
  value: string;
  unit: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.metricColumn,
        !last && styles.metricColumnDivider,
      ]}>
      <Icon name={icon} size={18} color="#8A5900" />
      <Text style={styles.metricValueText}>{value}</Text>
      <Text style={styles.metricUnitText}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    gap: 8,
  },
  startDeliveryButton: {
    minHeight: 52,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    boxShadow: Shadow.yellow,
  },
  startDeliveryButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  startDeliveryButtonText: {
    ...font(800),
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  stopCounterBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFF8DC',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  stopCounterNumber: {
    ...font(800),
    fontSize: 20,
    lineHeight: 23,
    color: Colors.textPrimary,
  },
  stopCounterTotal: {
    ...font(700),
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  windowCard: {
    padding: 16,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    boxShadow: '0px 8px 24px rgba(245, 158, 11, 0.22)',
  },
  windowTimeText: {
    ...font(800),
    fontSize: 21,
    lineHeight: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: 3,
  },
  onTimePill: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
  },
  onTimeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.successGreen,
  },
  onTimeText: {
    ...font(800),
    fontSize: 11,
    color: W.greenDark,
  },
  mapCard: {
    padding: 10,
    marginBottom: 20,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: Shadow.sm,
  },
  mapContainer: {
    height: 144,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E8ECE4',
  },
  locationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  locationStoreTitle: {
    ...font(800),
    fontSize: 14,
    color: Colors.textPrimary,
  },
  locationAddressText: {
    ...font(500),
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  proximityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF4DD',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  proximityText: {
    ...font(800),
    fontSize: 11,
    color: '#8A5900',
  },
  openNavButton: {
    minHeight: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
    boxShadow: Shadow.sm,
  },
  openNavButtonText: {
    ...font(700),
    fontSize: 13,
    color: Colors.textPrimary,
  },
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  accessCardBox: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 82,
    padding: 12,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    boxShadow: Shadow.sm,
  },
  accessCardImportant: {
    backgroundColor: '#FFF4DD',
    borderColor: '#FDE68A',
  },
  accessCardWide: {
    flexBasis: '100%',
    minHeight: 66,
    alignItems: 'center',
  },
  accessCardTitle: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
  },
  accessCardDetail: {
    ...font(500),
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  contactCard: {
    minHeight: 66,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    boxShadow: Shadow.sm,
  },
  managerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  managerInitials: {
    ...font(800),
    fontSize: 13,
    color: Colors.textPrimary,
  },
  managerRoleLabel: {
    ...font(800),
    fontSize: 8,
    color: '#8A5900',
    letterSpacing: 0.8,
  },
  managerName: {
    ...font(800),
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  managerPhone: {
    ...font(500),
    fontSize: 10,
    color: Colors.textSecondary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF8DC',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  callButtonText: {
    ...font(800),
    fontSize: 12,
    color: '#8A5900',
  },
  summaryCard: {
    padding: 14,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: Shadow.sm,
    marginBottom: 16,
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  metricColumnDivider: {
    borderRightWidth: 1,
    borderRightColor: '#F0F0EB',
  },
  metricValueText: {
    ...font(800),
    fontSize: 20,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricUnitText: {
    ...font(600),
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  temperatureBannerChilled: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#E8F8FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tempIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempBannerTitleChilled: {
    ...font(800),
    fontSize: 12,
    color: '#08759E',
  },
  tempBannerSubtextChilled: {
    ...font(500),
    fontSize: 10,
    color: '#08759E',
    marginTop: 1,
  },
  temperatureBannerAmbient: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#F5F5F2',
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tempBannerTitleAmbient: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
  },
  tempBannerSubtextAmbient: {
    ...font(500),
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

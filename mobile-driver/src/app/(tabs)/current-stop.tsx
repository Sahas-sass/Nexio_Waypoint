import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

// react-native-maps is native-only; lazy-require to avoid web crash
let MapView: any = View;
let Marker: any = View;
let Polyline: any = View;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}

import { Screen } from '@/components/waypoint/chrome';
import { Icon, type IconName } from '@/components/waypoint/icon';
import {
  Card,
  Label,
  SafetyNote,
  SectionHeading,
  TitleRow,
} from '@/components/waypoint/ui';
import { db, initDatabase, type StopRecord, type StoreManagerRecord } from '@/database/schema';
import { enqueueSyncItem } from '@/database/syncManager';
import { useLocationStore } from '@/store/locationStore';
import { useQueueStore } from '@/store/queueStore';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

const mapStyleDark = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

export default function CurrentStopScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ stop?: string; stopId?: string }>();

  const [stop, setStop] = useState<StopRecord | null>(null);
  const [manager, setManager] = useState<StoreManagerRecord | null>(null);
  const [totalStopsCount, setTotalStopsCount] = useState<number>(6);
  const [distanceKm, setDistanceKm] = useState<string>('...');

  // Reactively use the global GPS location
  const liveCoords = useLocationStore((state) => state.coords);

  // Subscribe to dataVersion so we re-read SQLite when Supabase sync completes
  const dataVersion = useQueueStore((state) => state.dataVersion);

  // Load stop dynamically from SQLite based on query parameter or active/pending status
  const loadStopData = useCallback(() => {
    try {
      const requestedId = params.stopId ?? params.stop;

      let foundStop: StopRecord | null = null;

      if (requestedId) {
        foundStop = db.getFirstSync<StopRecord>(
          'SELECT * FROM stops WHERE id = ? OR stop_number = ? LIMIT 1;',
          [requestedId, Number(requestedId) || 0]
        );
      }

      // If no explicit param or not found, locate the first in_progress or pending stop
      if (!foundStop) {
        foundStop = db.getFirstSync<StopRecord>(
          "SELECT * FROM stops WHERE status = 'IN_PROGRESS' ORDER BY stop_number ASC LIMIT 1;"
        );
      }

      if (!foundStop) {
        foundStop = db.getFirstSync<StopRecord>(
          "SELECT * FROM stops WHERE status = 'PENDING' ORDER BY stop_number ASC LIMIT 1;"
        );
      }

      if (!foundStop) {
        // Fallback: seed if table is empty
        initDatabase();
        foundStop = db.getFirstSync<StopRecord>(
          'SELECT * FROM stops ORDER BY stop_number ASC LIMIT 1;'
        );
      }

      setStop(foundStop);

      if (foundStop?.manager_id) {
        console.log(`[CurrentStop] Looking up manager_id: "${foundStop.manager_id}"`);
        const mgr = db.getFirstSync<StoreManagerRecord>(
          'SELECT * FROM store_managers WHERE id = ?;',
          [foundStop.manager_id]
        );
        console.log(`[CurrentStop] Found manager: ${mgr ? mgr.name : 'NULL'}`);
        setManager(mgr);
      } else {
        console.log('[CurrentStop] No manager_id on this stop, setting manager to null');
        setManager(null);
      }

      const countRow = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM stops;'
      );
      if (countRow) {
        setTotalStopsCount(Math.max(countRow.count, 6));
      }
    } catch (err) {
      console.error('[CurrentStop] Failed to query stop from SQLite:', err);
    }
  }, [params.stop, params.stopId, dataVersion]);

  useFocusEffect(
    useCallback(() => {
      loadStopData();
    }, [loadStopData])
  );

  // Calculate distance reactively from the shared location store
  useEffect(() => {
    if (liveCoords && stop?.latitude && stop?.longitude) {
      const R = 6371;
      const dLat = (stop.latitude - liveCoords.latitude) * Math.PI / 180;
      const dLon = (stop.longitude - liveCoords.longitude) * Math.PI / 180;
      const lat1 = liveCoords.latitude * Math.PI / 180;
      const lat2 = stop.latitude * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      setDistanceKm((R * c).toFixed(1));
    }
  }, [liveCoords, stop]);

  // Fallback defaults if SQLite row is loading
  const stopNumberStr = stop ? String(stop.stop_number).padStart(2, '0') : '02';
  const storeName = stop?.store_name ?? 'Fresh Store #22';
  const locationCity = stop?.address ?? 'Nugegoda';
  const deliveryWindow = stop?.window ?? '8:00 - 8:30 AM';
  const isChilled = stop ? stop.is_chilled === 1 : true;
  const itemsCount = stop?.items_count ?? 28;
  const weightKg = stop?.weight_kg ?? 420;
  const volumeM3 = stop?.volume_m3 ?? 2.4;
  const accessNotes =
    stop?.access_notes ??
    'Rear Dock, Enter from Chapel Lane, Van Access Only, Bay 3 reserved';

  // Address for navigation
  const fullAddress = locationCity.includes('High Level')
    ? locationCity
    : `155 High Level Rd, ${locationCity}`;

  // Launch native mapping navigation
  const handleOpenNavigation = () => {
    const encodedDestination = encodeURIComponent(`${storeName}, ${fullAddress}`);
    const navUrl = Platform.select({
      ios: `maps:0,0?q=${encodedDestination}`,
      android: `geo:0,0?q=${encodedDestination}`,
      default: `https://maps.google.com/?q=${encodedDestination}`,
    });

    Linking.openURL(navUrl).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${encodedDestination}`);
    });
  };

  // Launch phone dialer for store manager
  const handleCallManager = () => {
    const phoneNumber = manager?.phone ?? '+94771234567';
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
      console.warn('Cannot open phone dialer:', err);
    });
  };

  // Start Delivery button action
  const handleStartDelivery = () => {
    if (stop) {
      // Update local stop status to IN_PROGRESS in SQLite
      try {
        db.runSync("UPDATE stops SET status = 'IN_PROGRESS' WHERE id = ?;", [
          stop.id,
        ]);

        // Enqueue the offline sync action for Supabase
        enqueueSyncItem(stop.id, 'STATUS_UPDATE', { status: 'IN_PROGRESS' });
      } catch (err) {
        console.error('[CurrentStop] Failed to update stop to IN_PROGRESS:', err);
      }
    }

    // Navigate to Proof of Delivery flow
    router.navigate({
      pathname: '/pod/[stopId]',
      params: { stopId: stop?.id ?? stopNumberStr },
    });
  };

  return (
    <Screen
      footer={
        <View style={styles.footerContainer}>
          <Pressable
            onPress={handleStartDelivery}
            accessibilityRole="button"
            accessibilityLabel="Start Delivery"
            style={({ pressed }) => [
              styles.startDeliveryButton,
              pressed && styles.startDeliveryButtonPressed,
            ]}>
            <Text style={styles.startDeliveryButtonText}>Start Delivery</Text>
            <Icon name="chevron" size={18} color={Colors.textPrimary} />
          </Pressable>
          <SafetyNote>Only interact when safely parked.</SafetyNote>
        </View>
      }>
      {/* 2. Top Stop Bar */}
      <TitleRow
        center
        eyebrow={`CURRENT DELIVERY · STOP ${stopNumberStr}`}
        title={storeName}
        subtitle={locationCity}
        subtitleIcon="pin"
        aside={
          <View style={styles.stopCounterBadge}>
            <Text style={styles.stopCounterNumber}>{stopNumberStr}</Text>
            <Text style={styles.stopCounterTotal}>OF {totalStopsCount}</Text>
          </View>
        }
      />

      {/* Prominent Delivery Window Status Box */}
      <LinearGradient
        colors={[Colors.primaryYellow, Colors.brightYellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.windowCard}>
        <View>
          <Label size={9} spacing={0.08} color={Colors.textPrimary}>
            DELIVERY WINDOW
          </Label>
          <Text style={styles.windowTimeText}>{deliveryWindow}</Text>
        </View>

        <View style={styles.onTimePill}>
          <View style={styles.onTimeDot} />
          <Text style={styles.onTimeText}>On Time</Text>
        </View>
      </LinearGradient>

      {/* 3. Map Snapshot & Direct Navigation */}
      <Card style={[styles.mapCard, { padding: 0 }]}>
        <View style={styles.mapContainer}>
          {(stop?.latitude && stop?.longitude) ? (
            <MapView
              style={StyleSheet.absoluteFill}
              showsUserLocation={false}
              showsMyLocationButton={false}
              customMapStyle={mapStyleDark}
              region={{
                latitude: stop.latitude,
                longitude: stop.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
            >
              {liveCoords && (
                <Marker
                  coordinate={{
                    latitude: liveCoords.latitude,
                    longitude: liveCoords.longitude,
                  }}
                  title="You"
                  description="Your current location"
                >
                  <View style={styles.driverMarker}>
                    <View style={styles.driverMarkerInner}>
                      <Icon name="navigation" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                </Marker>
              )}
              <Marker
                coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                title={storeName}
                pinColor={Colors.primaryYellow}
              />
              {liveCoords && (
                <Polyline
                  coordinates={[
                    { latitude: liveCoords.latitude, longitude: liveCoords.longitude },
                    { latitude: stop.latitude, longitude: stop.longitude }
                  ]}
                  strokeColor={Colors.primaryYellow}
                  strokeWidth={3}
                  lineDashPattern={[6, 4]}
                />
              )}
            </MapView>
          ) : (
            <View style={{ flex: 1, backgroundColor: '#E8ECE4', alignItems: 'center', justifyContent: 'center' }}>
              <Text>Location Unavailable</Text>
            </View>
          )}
        </View>

        {/* Location Copy & Proximity */}
        <View style={styles.locationDetailRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.locationStoreTitle} numberOfLines={1}>
              {storeName}
            </Text>
            <Text style={styles.locationAddressText} numberOfLines={1}>
              {fullAddress}
            </Text>
          </View>
          <View style={styles.proximityBadge}>
            <Icon name="navigation" size={13} color="#8A5900" />
            <Text style={styles.proximityText}>{distanceKm} km away</Text>
          </View>
        </View>

        {/* Direct Navigation Button */}
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
      </Card>

      {/* Store Manager Contact Card */}
      <View style={styles.contactCard}>
        <View style={styles.managerAvatar}>
          <Text style={styles.managerInitials}>
            {manager?.name ? manager.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'NR'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.managerRoleLabel}>STORE MANAGER</Text>
          <Text style={styles.managerName}>{manager?.name ?? 'Nimal Rathnayake'}</Text>
          <Text style={styles.managerPhone}>{manager?.phone ?? '+94 77 123 4567'}</Text>
        </View>
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
      </View>

      {/* 5. Delivery Summary & Handling Constraints */}
      <SectionHeading title="Delivery summary" />
      <Card style={styles.summaryCard}>
        {/* 3-column metric cards */}
        <View style={styles.summaryMetricsRow}>
          <SummaryMetricCol
            icon="box"
            value={String(itemsCount)}
            unit="Items"
          />
          <SummaryMetricCol
            icon="weight"
            value={String(weightKg)}
            unit="kg"
          />
          <SummaryMetricCol
            icon="box"
            value={String(volumeM3)}
            unit="m³"
            last
          />
        </View>

        {/* Temperature specification banner */}
        {isChilled ? (
          <View style={styles.temperatureBannerChilled}>
            <View style={styles.tempIconCircle}>
              <Icon name="snow" size={18} color="#08759E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tempBannerTitleChilled}>Keep Refrigerated</Text>
              <Text style={styles.tempBannerSubtextChilled}>
                2–5°C chilled load • Transfer directly to store cold-room
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
  mapRoad: {
    position: 'absolute',
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: '#D4DDD0',
  },
  mapRoadMain: {
    width: '125%',
    height: 16,
    left: '-12%',
    top: '52%',
    transform: [{ rotate: '-8deg' }],
  },
  mapRoadCross: {
    height: '130%',
    width: 14,
    left: '28%',
    top: '-15%',
    transform: [{ rotate: '18deg' }],
  },
  mapRoadDiagonal: {
    height: '140%',
    width: 11,
    right: '22%',
    top: '-18%',
    transform: [{ rotate: '-35deg' }],
  },
  destinationPin: {
    position: 'absolute',
    left: '58%',
    top: '32%',
    width: 40,
    height: 40,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 4,
    backgroundColor: Colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
    boxShadow: '0px 6px 14px rgba(32, 33, 36, 0.25)',
  },
  destinationPinIcon: {
    transform: [{ rotate: '45deg' }],
  },
  youPositionBadge: {
    position: 'absolute',
    left: '16%',
    bottom: '16%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceWhite,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    boxShadow: Shadow.sm,
  },
  youPositionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3B82F6',
  },
  youPositionText: {
    ...font(800),
    fontSize: 9,
    color: Colors.textPrimary,
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
  driverMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1f2835',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
  },
});

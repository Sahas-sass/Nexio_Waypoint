import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon, type IconName } from '@/components/waypoint/icon';
import { Button, Card, Label, SectionHeading, TitleRow } from '@/components/waypoint/ui';
import { signOut } from '@/features/auth/services/session';
import { useSyncStore } from '@/features/sync/store/syncStore';
import { TripStateView } from '@/features/trip/components/TripStateView';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { formatKg, initials } from '@/utils/formatters';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

const TRIP_STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  loading: 'Loading',
  en_route: 'En route',
  completed: 'Completed',
};

export default function MoreScreen() {
  const { status, error, driver, trip, progress } = useTrip();
  const isOnline = useSyncStore((state) => state.isOnline);
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const [signingOut, setSigningOut] = useState(false);

  const vehicle = trip?.vehicle ?? null;
  const nextContact = trip?.stops.find((s) => s.managerPhone && (s.status === 'PENDING' || s.status === 'IN_PROGRESS'));
  const appVersion = Constants.expoConfig?.version;

  const doSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (pendingCount === 0) {
      void doSignOut();
      return;
    }
    Alert.alert(
      'Unsynced deliveries',
      `${pendingCount} record${pendingCount === 1 ? ' has' : 's have'} not synced yet and will be lost if you sign out. Connect to the internet and sync first if possible.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out anyway', style: 'destructive', onPress: () => void doSignOut() },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => Alert.alert('Call', `Unable to start a call to ${phone}.`));
  };

  return (
    <Screen>
      <TitleRow
        eyebrow="DRIVER HUB"
        title="More"
        subtitle="Your profile, vehicle and sync status"
        aside={
          <View style={styles.settingsIconBox}>
            <Icon name="more" size={22} color={Colors.textSecondary} />
          </View>
        }
      />

      {!driver ? (
        <TripStateView
          kind={status === 'error' ? 'error' : 'loading'}
          title={status === 'error' ? 'Could not load your profile' : 'Loading your profile…'}
          message={status === 'error' ? error : undefined}
        />
      ) : (
        <LinearGradient
          colors={[Colors.primaryYellow, Colors.brightYellow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}>
          <View style={styles.patternLarge} />
          <View style={styles.patternSmall} />

          <View style={styles.profileTopRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarInitials}>{initials(driver.fullName)}</Text>
              <View style={[styles.avatarOnlineDot, !isOnline && { backgroundColor: Colors.warningOrange }]} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.driverTagPill}>
                <Text style={styles.driverTagText}>
                  {driver.employeeId ? `DRIVER ${driver.employeeId}` : 'DRIVER'}
                </Text>
              </View>
              <Text style={styles.driverNameText}>{driver.fullName ?? 'Driver'}</Text>
              {driver.station ? <Text style={styles.fleetLabelText}>{driver.station}</Text> : null}
            </View>

            {trip ? (
              <View style={styles.shiftStatusChip}>
                <View style={styles.shiftStatusDot} />
                <Text style={styles.shiftStatusText}>{TRIP_STATUS_LABELS[trip.status] ?? trip.status}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricItemLabel}>STOPS</Text>
              <Text style={styles.metricItemValue}>
                {progress.closed}/{progress.total}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricItemLabel}>ITEMS</Text>
              <Text style={styles.metricItemValue}>{progress.totalItems}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricItemLabel}>LOAD</Text>
              <Text style={styles.metricItemValue}>{formatKg(progress.totalWeightKg)}</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {driver && (driver.phone || driver.shift) ? (
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleThumbnailBox}>
            <Icon name="user" size={24} color="#8A5900" />
          </View>
          <View style={{ flex: 1, minWidth: 0, paddingLeft: 2 }}>
            <Label size={7.5} spacing={0.08}>
              YOUR DETAILS
            </Label>
            {driver.phone ? <Text style={styles.vehicleIdText}>{driver.phone}</Text> : null}
            {driver.shift ? <Text style={styles.vehicleDetailText}>{driver.shift}</Text> : null}
          </View>
        </Card>
      ) : null}

      {vehicle && trip ? (
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleThumbnailBox}>
            <Icon name="route" size={24} color="#8A5900" />
          </View>
          <View style={{ flex: 1, minWidth: 0, paddingLeft: 2 }}>
            <Label size={7.5} spacing={0.08}>
              YOUR VEHICLE • {trip.tripNumber}
            </Label>
            <Text style={styles.vehicleIdText}>{vehicle.registrationNumber}</Text>
            <Text style={styles.vehicleDetailText}>
              {[vehicle.vehicleType, vehicle.isRefrigerated ? 'Refrigerated' : 'Ambient', trip.bay]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </View>
          <View style={styles.vehicleCheckBadge}>
            <Icon name={vehicle.isRefrigerated ? 'snow' : 'box'} size={15} color={W.greenDark} />
          </View>
        </Card>
      ) : null}

      <SectionHeading title="Sync & account" />
      <View style={styles.quickGrid}>
        <Pressable
          onPress={() => router.push('/offline')}
          accessibilityRole="button"
          accessibilityLabel="Offline and sync status"
          style={styles.quickGridCell}>
          <LinearGradient
            colors={['#E8F8FF', Colors.surfaceWhite]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.quickCardBox, { borderColor: '#BAE6FD' }]}>
            <View style={styles.quickCardTop}>
              <View style={[styles.tileIconBox, { backgroundColor: '#F0F9FF' }]}>
                <Icon name="cloud" size={19} color="#08759E" />
              </View>
              <View style={styles.syncStatusBadge}>
                <View
                  style={[
                    styles.syncStatusDot,
                    { backgroundColor: isOnline ? Colors.successGreen : Colors.warningOrange },
                  ]}
                />
                <Text style={[styles.syncStatusText, { color: isOnline ? W.greenDark : Colors.offlineText }]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            <Text style={styles.quickTitleText}>Offline & Sync Status</Text>
            <Text style={styles.quickSubtitleText}>
              {pendingCount === 0 ? 'All records synced' : `${pendingCount} records queued`}
            </Text>
          </LinearGradient>
        </Pressable>

        {nextContact?.managerPhone ? (
          <QuickActionCell
            icon="phone"
            title="Call next store"
            subtitle={[nextContact.storeName, nextContact.managerName].filter(Boolean).join(' • ')}
            onPress={() => handleCall(nextContact.managerPhone!)}
          />
        ) : null}
      </View>

      <Button variant="secondary" icon="lock" onPress={handleSignOut} disabled={signingOut}>
        {signingOut ? 'Signing out…' : 'Sign out'}
      </Button>

      {appVersion ? (
        <View style={styles.versionRow}>
          <Icon name="shield" size={13} color={Colors.textSecondary} />
          <Text style={styles.versionText}>Waypoint Driver v{appVersion}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

function QuickActionCell({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={styles.quickGridCell}>
      <Card style={styles.quickCardBox}>
        <View style={styles.quickCardTop}>
          <View style={styles.tileIconBox}>
            <Icon name={icon} size={18} color="#8A5900" />
          </View>
        </View>
        <Text style={styles.quickTitleText} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.quickSubtitleText} numberOfLines={2}>
          {subtitle}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  profileCard: {
    minHeight: 200,
    borderRadius: Radius.lg,
    padding: 16,
    overflow: 'hidden',
    marginBottom: 14,
    justifyContent: 'space-between',
    boxShadow: '0px 10px 26px rgba(245, 158, 11, 0.22)',
  },
  patternLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 40,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    right: -80,
    top: -85,
  },
  patternSmall: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 20,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    right: 80,
    top: 35,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(118, 79, 0, 0.12)',
  },
  avatarInitials: {
    ...font(800),
    fontSize: 20,
    color: Colors.textPrimary,
  },
  avatarOnlineDot: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    right: -2,
    bottom: -2,
    backgroundColor: Colors.successGreen,
    borderWidth: 2,
    borderColor: Colors.surfaceWhite,
  },
  driverTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4DD',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  driverTagText: {
    ...font(800),
    fontSize: 8.5,
    color: '#8A5900',
    letterSpacing: 0.6,
  },
  driverNameText: {
    ...font(800),
    fontSize: 18,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  fleetLabelText: {
    ...font(600),
    fontSize: 9,
    color: '#7B5B13',
    marginTop: 1,
  },
  shiftStatusChip: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    boxShadow: Shadow.sm,
  },
  shiftStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.successGreen,
  },
  shiftStatusText: {
    ...font(800),
    fontSize: 9,
    color: W.greenDark,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricItemLabel: {
    ...font(800),
    fontSize: 8,
    color: '#795500',
    letterSpacing: 0.7,
  },
  metricItemValue: {
    ...font(800),
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: 3,
  },
  metricDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(121, 85, 0, 0.15)',
    alignSelf: 'center',
  },
  vehicleCard: {
    minHeight: 76,
    borderRadius: 18,
    padding: 10,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    boxShadow: Shadow.sm,
  },
  vehicleThumbnailBox: {
    width: 76,
    height: 58,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    backgroundColor: Colors.primaryYellow,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  assignedBadgeText: {
    ...font(800),
    fontSize: 7.5,
    color: Colors.textPrimary,
  },
  vehicleIdText: {
    ...font(800),
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  vehicleDetailText: {
    ...font(500),
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vehicleCheckBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: W.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickGridCell: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  quickCardBox: {
    minHeight: 126,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    backgroundColor: Colors.surfaceWhite,
    padding: 12,
    justifyContent: 'space-between',
    boxShadow: Shadow.sm,
  },
  quickCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFF8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  syncStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncStatusText: {
    ...font(800),
    fontSize: 8.5,
  },
  quickTitleText: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  quickSubtitleText: {
    ...font(500),
    fontSize: 9.5,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  versionText: {
    ...font(500),
    fontSize: 9,
    color: Colors.textSecondary,
  },
});

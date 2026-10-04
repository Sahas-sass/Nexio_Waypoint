import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon, type IconName } from '@/components/waypoint/icon';
import { Card, Label, SectionHeading, TitleRow } from '@/components/waypoint/ui';
import { truckPhoto } from '@/data/mock';
import { useQueueStore } from '@/store/queueStore';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

export default function MoreScreen() {
  const driverName = useQueueStore((state) => state.driverName) || 'Kasun Perera';
  const currentVehicle =
    useQueueStore((state) => state.currentVehicle) || 'TRK-024';
  const isOnline = useQueueStore((state) => state.isOnline);
  const pendingCount = useQueueStore((state) => state.pendingCount);

  // Compute initials
  const initials = driverName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleCallDispatch = () => {
    Linking.openURL('tel:+94112345678').catch((err) => {
      console.warn('Unable to dial dispatch:', err);
      Alert.alert(
        'Call Dispatch',
        'Direct dispatch helpline: +94 11 234 5678\n(Operating 24/7 for Colombo Regional Fleet)'
      );
    });
  };

  const handleOpenInfo = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const handleSignOut = () => {
    Alert.alert(
      'End Shift & Sign Out',
      'Are you sure you want to end your current shift and return to the login screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <Screen>
      {/* Screen Title Row */}
      <TitleRow
        eyebrow="DRIVER HUB"
        title="More"
        subtitle="Your shift, vehicle and settings"
        aside={
          <View style={styles.settingsIconBox}>
            <Icon name="more" size={22} color={Colors.textSecondary} />
          </View>
        }
      />

      {/* 1. Top Profile Card */}
      <LinearGradient
        colors={[Colors.primaryYellow, Colors.brightYellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}>
        {/* Subtle decorative circles */}
        <View style={styles.patternLarge} />
        <View style={styles.patternSmall} />

        <View style={styles.profileTopRow}>
          {/* Avatar with initials "KP" */}
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitials}>{initials}</Text>
            <View style={styles.avatarOnlineDot} />
          </View>

          {/* Driver identity */}
          <View style={{ flex: 1 }}>
            <View style={styles.driverTagPill}>
              <Text style={styles.driverTagText}>DRIVER D-1084</Text>
            </View>
            <Text style={styles.driverNameText}>{driverName}</Text>
            <Text style={styles.fleetLabelText}>Colombo Regional Fleet</Text>
          </View>

          {/* Shift status chip */}
          <View style={styles.shiftStatusChip}>
            <View style={styles.shiftStatusDot} />
            <Text style={styles.shiftStatusText}>On shift</Text>
          </View>
        </View>

        {/* Shift metrics row: Today, On-Time, Driving */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricItemLabel}>TODAY</Text>
            <Text style={styles.metricItemValue}>
              2 <Text style={styles.metricItemUnit}>/ 6 stops</Text>
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricItemLabel}>ON-TIME</Text>
            <Text style={styles.metricItemValue}>96%</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricItemLabel}>DRIVING</Text>
            <Text style={styles.metricItemValue}>2h 18m</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 2. Assigned Vehicle Card */}
      <Card style={styles.vehicleCard}>
        <View style={styles.vehicleThumbnailBox}>
          <Image
            source={{ uri: truckPhoto }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel={`Assigned vehicle ${currentVehicle}`}
          />
          <View style={styles.assignedBadge}>
            <Icon name="route" size={10} color={Colors.textPrimary} />
            <Text style={styles.assignedBadgeText}>Assigned</Text>
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 0, paddingLeft: 2 }}>
          <Label size={7.5} spacing={0.08}>
            YOUR VEHICLE
          </Label>
          <Text style={styles.vehicleIdText}>{currentVehicle}</Text>
          <Text style={styles.vehicleDetailText}>
            Heavy Freight Truck • 78% fuel
          </Text>
        </View>

        <View style={styles.vehicleCheckBadge}>
          <Icon name="check" size={15} color={W.greenDark} />
        </View>
      </Card>

      {/* 3. Quick Access Menu */}
      <SectionHeading title="Quick access & tools" />
      <View style={styles.quickGrid}>
        {/* Offline & Sync Status tile */}
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
                    {
                      backgroundColor: isOnline
                        ? Colors.successGreen
                        : Colors.warningOrange,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.syncStatusText,
                    { color: isOnline ? W.greenDark : Colors.offlineText },
                  ]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            <Text style={styles.quickTitleText}>Offline & Sync Status</Text>
            <Text style={styles.quickSubtitleText}>
              {pendingCount === 0
                ? 'All records synced'
                : `${pendingCount} records queued`}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Report Issue */}
        <QuickActionCell
          icon="alert"
          title="Report Issue / Route Support"
          subtitle="Vehicle or delivery flags"
          onPress={() =>
            handleOpenInfo(
              'Report Issue',
              'Report active route discrepancies or vehicle issues directly to dispatcher.'
            )
          }
        />

        {/* Documents & Permits */}
        <QuickActionCell
          icon="history"
          title="Documents & Permits"
          subtitle="Waybills & cargo manifests"
          onPress={() =>
            handleOpenInfo(
              'Documents & Permits',
              'Access digital cargo waybills, vehicle road permits, and transport licenses.'
            )
          }
        />

        {/* Vehicle Checks & Inspection */}
        <QuickActionCell
          icon="box"
          title="Vehicle Checks & Inspection"
          subtitle="Pre-trip walkaround complete"
          badge="Verified"
          onPress={() =>
            handleOpenInfo(
              'Vehicle Inspection',
              'Daily 14-point safety walkaround verified for TRK-024.'
            )
          }
        />

        {/* Shift Activity Logs */}
        <QuickActionCell
          icon="clock"
          title="Shift Activity Logs"
          subtitle="Driving & rest compliance"
          onPress={() =>
            handleOpenInfo(
              'Shift Activity',
              'Driving time: 2h 18m. On shift: 6h 24m. Rest period due in 1h 42m.'
            )
          }
        />

        {/* Safety Centre */}
        <QuickActionCell
          icon="shield"
          title="Safety Centre"
          subtitle="Procedures & emergency protocols"
          onPress={() =>
            handleOpenInfo(
              'Safety Centre',
              'Access cold-chain breakdown SOPs, collision procedures, and emergency response guides.'
            )
          }
        />
      </View>

      {/* 4. Emergency Support Card */}
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emergencyCard}>
        <View style={styles.emergencyIconBox}>
          <Icon name="navigation" size={20} color={Colors.textPrimary} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.emergencyTagText}>NEED ASSISTANCE?</Text>
          <Text style={styles.emergencyTitleText}>Dispatch Control</Text>
          <Text style={styles.emergencySubtitleText}>
            {currentVehicle} • Shift A • Response &lt; 2 mins
          </Text>
        </View>

        <Pressable
          onPress={handleCallDispatch}
          accessibilityRole="button"
          accessibilityLabel="Call Dispatch"
          style={({ pressed }) => [
            styles.callDispatchButton,
            pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
          ]}>
          <Icon name="phone" size={14} color={Colors.textPrimary} />
          <Text style={styles.callDispatchText}>Call</Text>
        </Pressable>
      </LinearGradient>

      {/* 5. End Shift & Sign Out */}
      <Pressable
        onPress={handleSignOut}
        accessibilityRole="button"
        accessibilityLabel="End Shift and Sign Out"
        style={({ pressed }) => [
          styles.signOutButton,
          pressed && styles.signOutButtonPressed,
        ]}>
        <Icon name="logout" size={17} color="#DC2626" />
        <Text style={styles.signOutButtonText}>End Shift &amp; Sign Out</Text>
      </Pressable>

      {/* Version Tag */}
      <View style={styles.versionRow}>
        <Icon name="shield" size={13} color={Colors.textSecondary} />
        <Text style={styles.versionText}>
          Waypoint Driver v2.8.4 • Fleet Security Certified
        </Text>
      </View>
    </Screen>
  );
}

function QuickActionCell({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={styles.quickGridCell}>
      <Card style={styles.quickCardBox}>
        <View style={styles.quickCardTop}>
          <View style={styles.tileIconBox}>
            <Icon name={icon} size={18} color="#8A5900" />
          </View>
          {badge && (
            <View style={styles.badgePill}>
              <Icon name="check" size={10} color={W.greenDark} />
              <Text style={styles.badgePillText}>{badge}</Text>
            </View>
          )}
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
  metricItemUnit: {
    ...font(700),
    fontSize: 9,
    color: '#795500',
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
    backgroundColor: '#E5E7EB',
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
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: W.greenSoft,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgePillText: {
    ...font(800),
    fontSize: 8.5,
    color: W.greenDark,
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
  emergencyCard: {
    minHeight: 76,
    borderRadius: Radius.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: Shadow.md,
    marginBottom: 16,
  },
  emergencyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTagText: {
    ...font(800),
    fontSize: 8,
    color: Colors.primaryYellow,
    letterSpacing: 0.9,
  },
  emergencyTitleText: {
    ...font(800),
    fontSize: 13,
    color: Colors.surfaceWhite,
    marginTop: 1,
  },
  emergencySubtitleText: {
    ...font(500),
    fontSize: 9.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  callDispatchButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    boxShadow: Shadow.sm,
  },
  callDispatchText: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
  },
  signOutButton: {
    minHeight: 48,
    borderRadius: Radius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 6,
  },
  signOutButtonPressed: {
    backgroundColor: '#FEE2E2',
    transform: [{ scale: 0.99 }],
  },
  signOutButtonText: {
    ...font(800),
    fontSize: 13,
    color: '#DC2626',
    letterSpacing: -0.2,
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

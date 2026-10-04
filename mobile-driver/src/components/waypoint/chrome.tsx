import type { BottomTabBarProps } from 'expo-router/tabs';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/waypoint/icon';
import { StatusDot, WText } from '@/components/waypoint/ui';
import { useSyncStore } from '@/features/sync/store/syncStore';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { formatDateParts, initials } from '@/utils/formatters';
import { W } from '@/utils/theme';

export function AppHeader({
  online,
  onStatus,
}: {
  online?: boolean;
  onStatus: () => void;
}) {
  const storeOnline = useSyncStore((state) => state.isOnline);
  const { driver } = useTrip();
  const driverInitials = initials(driver?.fullName);
  const isOnline = online !== undefined ? online : storeOnline;
  const insets = useSafeAreaInsets();
  const statusColor = isOnline ? W.greenDark : '#a85d00';
  const currentDate = formatDateParts().fullDate;

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12, height: insets.top + 72 }]}>
      <LinearGradient
        colors={[W.yellow, W.brightYellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}>
        {driverInitials ? (
          <WText size={13} weight={800}>
            {driverInitials}
          </WText>
        ) : (
          <Icon name="user" size={18} />
        )}
        <View style={[styles.avatarDot, { backgroundColor: isOnline ? W.green : '#a85d00' }]} />
      </LinearGradient>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <WText size={14} weight={800} numberOfLines={1}>
          {driver?.fullName ?? 'Today\'s Route'}
        </WText>
        <WText size={10} weight={600} color={W.gray} style={{ marginTop: 2 }}>
          {currentDate}
        </WText>
      </View>
      <Pressable
        onPress={onStatus}
        accessibilityRole="button"
        accessibilityLabel="Open connection status"
        style={[styles.statusPill, { backgroundColor: isOnline ? W.greenSoft : W.orangeSoft }]}>
        <StatusDot color={statusColor} />
        <WText size={11} weight={800} color={statusColor}>
          {isOnline ? 'Online' : 'Offline'}
        </WText>
      </Pressable>
    </View>
  );
}

const navItems: { name: string; label: string; icon: IconName }[] = [
  { name: 'route', label: 'Route', icon: 'route' },
  { name: 'current-stop', label: 'Current Stop', icon: 'pin' },
  { name: 'history', label: 'History', icon: 'history' },
  { name: 'more', label: 'More', icon: 'more' },
];

function activeTab(routeName: string) {
  // Proof of delivery and completion belong to the current stop flow.
  if (routeName.startsWith('pod/')) return 'current-stop';
  return routeName;
}

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const active = activeTab(state.routes[state.index].name);
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(9, insets.bottom), height: 78 + insets.bottom }]}>
      {navItems.map((item) => {
        const selected = item.name === active;
        const color = selected ? W.amberDark : '#8a8e95';
        return (
          <Pressable
            key={item.name}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => navigation.navigate(item.name)}
            style={styles.navItem}>
            {selected && <View style={styles.navIndicator} />}
            <Icon name={item.icon} size={21} color={color} />
            <WText size={9} weight={700} color={color}>
              {item.label}
            </WText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Scrollable screen body with an optional action bar pinned above the tab bar. */
export function Screen({
  children,
  footer,
  background,
  contentStyle,
  refreshControl,
}: {
  children: ReactNode;
  footer?: ReactNode;
  background?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  return (
    <View style={styles.screen}>
      {background}
      <ScrollView
        contentContainerStyle={[styles.content, footer ? { paddingBottom: 116 } : null, contentStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}>
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,231,235,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: W.green,
    borderWidth: 2,
    borderColor: W.white,
  },
  statusPill: {
    minHeight: 36,
    borderRadius: 99,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nav: {
    flexDirection: 'row',
    paddingTop: 9,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,231,235,0.8)',
    boxShadow: '0px -8px 26px rgba(32,33,36,0.06)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIndicator: {
    position: 'absolute',
    top: -9,
    width: 30,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: W.yellow,
  },
  screen: {
    flex: 1,
    backgroundColor: W.offWhite,
  },
  content: {
    paddingTop: 22,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,231,235,0.7)',
  },
});

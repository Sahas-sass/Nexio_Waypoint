import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/waypoint/icon';
import { flushSyncQueue } from '@/database/syncManager';
import { useQueueStore } from '@/store/queueStore';
import { Colors, font } from '@/utils/theme';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const isOnline = useQueueStore((state) => state.isOnline);
  const pendingCount = useQueueStore((state) => state.pendingCount);
  const setIsOnline = useQueueStore((state) => state.setIsOnline);

  const handleSimulateRestored = useCallback(async () => {
    setIsOnline(true);
    await flushSyncQueue();
  }, [setIsOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
        },
      ]}>
      <View style={styles.innerContent}>
        <View style={styles.messageRow}>
          <View style={styles.iconCircle}>
            <Icon name="wifiOff" size={17} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>You&apos;re Offline</Text>
            <Text style={styles.subtext}>
              Your delivery data is being saved securely on this device • {pendingCount} records pending sync.
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={handleSimulateRestored}
            style={({ pressed }) => [
              styles.pillButton,
              pressed && styles.pillButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Simulate Connection Restored"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="cloud" size={13} color="#92400E" />
            <Text style={styles.pillButtonText}>Simulate Connection Restored</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export default OfflineBanner;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 99999, // Required for Android
    backgroundColor: Colors.warningOrange, // #F59E0B
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    boxShadow: '0px 4px 14px rgba(245, 158, 11, 0.35)',
  },
  innerContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 11,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...font(800),
    fontSize: 14,
    lineHeight: 18,
    color: Colors.surfaceWhite,
    letterSpacing: -0.2,
  },
  subtext: {
    ...font(500),
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 38,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceWhite,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
  },
  pillButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  pillButtonText: {
    ...font(700),
    fontSize: 11,
    color: '#92400E',
    letterSpacing: 0.1,
  },
});

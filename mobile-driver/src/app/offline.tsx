// Offline mode and sync status.
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Button, IconTile, Label, PageTitle, SectionHeading, WText } from '@/components/waypoint/ui';
import { syncQueue } from '@/data/mock';
import { Radius, Shadow, W } from '@/utils/theme';

const keepWorking = [
  "View today's itinerary",
  'View stop details',
  'Record delivery results',
  'Capture proof of delivery',
  'Add notes and shortfalls',
];

export default function OfflineScreen() {
  const insets = useSafeAreaInsets();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!restored) return;
    const timer = setTimeout(() => router.navigate('/route'), 1800);
    return () => clearTimeout(timer);
  }, [restored]);

  const tone = restored ? W.greenDark : W.offlineText;

  return (
    <View style={{ flex: 1, backgroundColor: W.offWhite }}>
      <AppHeader online={restored} onStatus={() => router.back()} />
      <Screen
        contentStyle={{ paddingBottom: 28 + insets.bottom }}
        background={
          <LinearGradient
            colors={[restored ? W.greenSoft : W.orangeSoft, W.offWhite]}
            style={styles.backdrop}
          />
        }>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, restored && { backgroundColor: W.green }]}>
            <Icon name={restored ? 'check' : 'wifiOff'} size={30} color={W.white} />
          </View>
          <View style={{ flex: 1 }}>
            <PageTitle>{restored ? 'Connection Restored' : "You're Offline"}</PageTitle>
            <WText size={10} color={W.gray} style={styles.heroText}>
              {restored
                ? 'Syncing your delivery records…'
                : 'Your delivery data is being saved securely on this device.'}
            </WText>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.rowBetween}>
            <Label size={9} spacing={0.11}>
              OFFLINE MODE
            </Label>
            <View style={[styles.tag, { backgroundColor: restored ? W.greenSoft : W.orangeSoft }]}>
              <WText size={9} weight={800} color={tone}>
                {restored ? 'Connected' : 'Working locally'}
              </WText>
            </View>
          </View>
          <View style={styles.connection}>
            <IconTile
              icon={restored ? 'cloud' : 'wifiOff'}
              size={45}
              iconSize={25}
              radius={14}
              background={restored ? W.greenSoft : W.orangeSoft}
              color={tone}
            />
            <View>
              <Label spacing={0.09}>CONNECTION</Label>
              <WText size={12} weight={700} style={{ marginTop: 3 }}>
                {restored ? 'Internet restored' : 'No Internet Connection'}
              </WText>
            </View>
          </View>
          <View style={styles.stats}>
            <View style={{ flex: 1 }}>
              <Label spacing={0.09}>LOCAL DATA</Label>
              <View style={[styles.inline, { marginTop: 4 }]}>
                <Icon name="check" size={15} color={W.greenDark} />
                <WText size={11} weight={700} color={W.greenDark}>
                  Saved
                </WText>
              </View>
            </View>
            <View style={styles.statRight}>
              <Label spacing={0.09}>PENDING SYNC</Label>
              <WText size={11} weight={700} style={{ marginTop: 4 }}>
                {restored ? '0 records' : `${syncQueue.length} records`}
              </WText>
            </View>
          </View>
          {restored && <SyncProgress total={syncQueue.length} />}
        </View>

        {restored ? (
          <View style={styles.success}>
            <View style={styles.successRing}>
              <Icon name="check" size={36} color={W.white} />
            </View>
            <PageTitle>All records synchronized</PageTitle>
            <WText size={11} color={W.gray} style={{ marginTop: 10 }}>
              Your dispatcher has the latest delivery data.
            </WText>
          </View>
        ) : (
          <>
            <View style={styles.continueCard}>
              <SectionHeading title="You can keep working" />
              <WText size={10} color={W.gray} style={styles.continueText}>
                Everything stays available and will sync automatically when you&apos;re back online.
              </WText>
              <View style={{ gap: 9 }}>
                {keepWorking.map((item) => (
                  <View key={item} style={[styles.inline, { gap: 8 }]}>
                    <IconTile icon="check" size={21} iconSize={14} radius={7} background={W.greenSoft} color={W.greenDark} />
                    <WText size={10} weight={700}>
                      {item}
                    </WText>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 15 }}>
              <SectionHeading
                title="Waiting to sync"
                meta={
                  <View style={[styles.inline, { gap: 5 }]}>
                    <PulseDot />
                    <WText size={10} weight={700} color={W.offlineText}>
                      Waiting for connection
                    </WText>
                  </View>
                }
              />
              {syncQueue.map((item) => (
                <View key={item.name} style={styles.queueItem}>
                  <IconTile icon="cloud" size={37} iconSize={18} background={W.yellowSoft} color={W.offlineText} />
                  <View style={{ flex: 1 }}>
                    <WText size={10} weight={700}>
                      {item.name}
                    </WText>
                    <WText size={8} color={W.gray} style={{ marginTop: 3 }}>
                      Saved securely on device
                    </WText>
                  </View>
                  <WText size={8} color={W.gray}>
                    {item.time}
                  </WText>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.protected}>
          <Icon name="shield" color="#6c7780" />
          <View>
            <WText size={10} weight={700} style={{ marginBottom: 2 }}>
              Your work is protected
            </WText>
            <WText size={8} color="#6c7780">
              Safe to close or continue using the app.
            </WText>
          </View>
        </View>
        {!restored && (
          <Button variant="secondary" onPress={() => setRestored(true)}>
            Simulate Connection Restored
          </Button>
        )}
      </Screen>
    </View>
  );
}

function PulseDot() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.35, { duration: 750 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.pulseDot, style]} />;
}

function SyncProgress({ total }: { total: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1200 });
  }, [progress]);
  const style = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View style={{ marginTop: 14 }}>
      <View style={styles.rowBetween}>
        <WText size={9} color={W.gray}>
          Sync complete
        </WText>
        <WText size={9} weight={700} color={W.greenDark}>
          {total} / {total} synced
        </WText>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.trackFill, style]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 330,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  heroIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: W.orange,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 9px 22px rgba(245,158,11,0.24)',
  },
  heroText: {
    lineHeight: 15,
    marginTop: 5,
    maxWidth: 250,
  },
  statusCard: {
    borderRadius: Radius.lg,
    padding: 17,
    marginBottom: 17,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    boxShadow: Shadow.md,
  },
  tag: {
    minHeight: 25,
    borderRadius: 99,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  connection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginVertical: 18,
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: W.lightGray,
    paddingTop: 13,
  },
  statRight: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: W.lightGray,
    paddingLeft: 16,
  },
  track: {
    height: 7,
    backgroundColor: '#e7ebe7',
    borderRadius: 99,
    marginTop: 7,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: W.green,
  },
  success: {
    alignItems: 'center',
    paddingTop: 34,
    paddingBottom: 24,
  },
  successRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: W.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: `0px 0px 0px 10px ${W.greenSoft}`,
  },
  continueCard: {
    padding: 15,
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
    borderRadius: Radius.md,
    marginBottom: 17,
  },
  continueText: {
    lineHeight: 15,
    marginBottom: 12,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: W.orange,
  },
  queueItem: {
    minHeight: 65,
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
    borderRadius: 15,
    marginBottom: 7,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  protected: {
    minHeight: 57,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 11,
  },
});

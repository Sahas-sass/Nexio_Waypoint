import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusDot, WText } from '@/components/waypoint/ui';
import { useAuthStore } from '@/features/auth/store/authStore';
import { W } from '@/utils/theme';

const SPLASH_DURATION = 2600;

export default function SplashRoute() {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const authStatus = useAuthStore((s) => s.status);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    progress.value = withDelay(150, withTiming(1, { duration: 2350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    const timer = setTimeout(() => setIntroDone(true), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [progress, pulse]);

  // Leave the splash once the intro played and the stored session was checked.
  useEffect(() => {
    if (!introDone || authStatus === 'loading') return;
    router.replace(authStatus === 'signedIn' ? '/route' : '/login');
  }, [introDone, authStatus]);

  const loaderStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.05 }],
    opacity: 1 - pulse.value * 0.45,
  }));

  return (
    <Pressable
      style={styles.screen}
      onPress={() => setIntroDone(true)}
      accessibilityRole="button"
      accessibilityLabel="Continue to Waypoint Delivery">
      <LinearGradient
        colors={[W.brightYellow, W.yellow, '#f7ac1f']}
        locations={[0, 0.43, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(118,76,0,0.08)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orbit, styles.orbitOne]} />
      <View style={[styles.orbit, styles.orbitTwo]} />
      <View style={styles.route}>
        <View style={[styles.routeDot, { left: '17%', top: -5 }]} />
        <View style={[styles.routeDot, { left: '54%', top: 16 }]} />
        <View style={[styles.routeDot, { right: '12%', top: 66 }]} />
      </View>

      <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.brand}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.logoGlow, glowStyle]} />
          <Image
            source={require('@/assets/images/waypoint/logo.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Waypoint product icon"
          />
        </View>
        <View style={styles.wordmark}>
          <WText size={32} weight={800} spacing={-0.045}>
            Waypoint
          </WText>
          <WText size={22} weight={500} spacing={-0.045}>
            Delivery
          </WText>
        </View>
        <WText size={11} weight={800} spacing={0.15} color="rgba(32,33,36,0.7)" style={{ marginTop: 8 }}>
          NAVIGATE. DELIVER. SYNC.
        </WText>
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(350).duration(700)}
        style={[styles.footer, { bottom: Math.max(39, insets.bottom) }]}>
        <View style={styles.loader}>
          <Animated.View style={[styles.loaderFill, loaderStyle]} />
        </View>
        <View style={styles.footerRow}>
          <StatusDot color={W.green} size={7} />
          <WText size={9} weight={800} color="rgba(32,33,36,0.7)">
            Preparing today&apos;s route
          </WText>
        </View>
        <WText size={8} color="rgba(32,33,36,0.5)" style={{ marginTop: 6 }}>
          Fleet execution, connected
        </WText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: W.yellow,
  },
  orbit: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  orbitOne: {
    width: 370,
    height: 370,
    left: -220,
    top: -100,
    boxShadow: '0px 0px 0px 54px rgba(255,255,255,0.06), 0px 0px 0px 108px rgba(255,255,255,0.035)',
  },
  orbitTwo: {
    width: 290,
    height: 290,
    right: -190,
    bottom: -65,
    boxShadow: '0px 0px 0px 45px rgba(113,72,0,0.035), 0px 0px 0px 90px rgba(113,72,0,0.025)',
  },
  route: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: '27%',
    height: 240,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(87,61,0,0.12)',
    borderRadius: 999,
    transform: [{ rotate: '-14deg' }],
  },
  routeDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.55)',
    boxShadow: '0px 0px 0px 5px rgba(255,255,255,0.11)',
  },
  brand: {
    alignItems: 'center',
    marginTop: -52,
  },
  logoWrap: {
    width: 116,
    height: 116,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.26)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    boxShadow: '0px 24px 48px rgba(102,65,0,0.19)',
  },
  logoGlow: {
    position: 'absolute',
    top: -18,
    left: -18,
    right: -18,
    bottom: -18,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 24,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  footer: {
    position: 'absolute',
    left: 34,
    right: 34,
    alignItems: 'center',
  },
  loader: {
    width: '100%',
    height: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.37)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  loaderFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: W.charcoal,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
});

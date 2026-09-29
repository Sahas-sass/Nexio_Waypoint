import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
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
import { W } from '@/utils/theme';

const SPLASH_DURATION = 2600;

export default function SplashRoute() {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(150, withTiming(1, { duration: 2350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    const timer = setTimeout(() => router.replace('/login'), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [progress, pulse]);

  const loaderStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.05 }],
    opacity: 1 - pulse.value * 0.45,
  }));

  return (
    <Pressable
      style={styles.screen}
      onPress={() => router.replace('/login')}
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
<<<<<<< HEAD
    backgroundColor: '#FFCF3A', // Vibrant yellow from image
    overflow: 'hidden',
  },
  // Abstract background elements to mimic the faint curves
  bgCircle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    top: -width * 0.8,
    left: -width * 0.5,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 1.8,
    height: width * 1.8,
    borderRadius: width * 0.9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -width * 0.6,
    right: -width * 0.8,
  },
  bgCircle3: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: height * 0.1,
    right: -width * 0.2,
  },
  dashedCurveContainer: {
    position: 'absolute',
    top: height * 0.25,
    left: 0,
    right: 0,
    height: 100,
    alignItems: 'center',
  },
  dashedCurve: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    top: 20,
  },
  connectionPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -height * 0.1, // Shift up slightly from center
  },
  logoContainer: {
    marginBottom: 24,
  },
  glassPlate: {
    width: 130,
    height: 130,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  logoSquircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoInnerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFCF3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E1E1E',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleBold: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  titleRegular: {
    fontSize: 32,
    fontWeight: '400',
    color: '#4A4A4A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 2.5,
    opacity: 0.8,
  },
  bottomArea: {
    paddingHorizontal: 40,
    paddingBottom: height * 0.08,
    width: '100%',
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1.5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 1.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759', // Green dot
    marginRight: 8,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  statusSubtext: {
    fontSize: 12,
    color: 'rgba(51, 51, 51, 0.5)',
    fontWeight: '500',
=======
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
>>>>>>> 10224c9e5f222ab3ec148e0a616311123a47a101
  },
});

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 300);
      }
    });

    // Pulse animation for the green dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background Graphic Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />
      
      {/* Curved dashed line representation */}
      <View style={styles.dashedCurveContainer}>
        <View style={styles.dashedCurve} />
        {/* Connection points on the curve */}
        <View style={[styles.connectionPoint, { left: width * 0.15, top: 40 }]} />
        <View style={[styles.connectionPoint, { left: width * 0.5 - 4, top: 10 }]} />
        <View style={[styles.connectionPoint, { left: width * 0.85, top: 40 }]} />
      </View>

      <View style={styles.content}>
        
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.glassPlate}>
            <View style={styles.logoSquircle}>
              <View style={styles.logoInnerCircle}>
                <View style={styles.logoDot} />
              </View>
            </View>
          </View>
        </View>

        {/* Brand Text */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleBold}>Waypoint</Text>
          <Text style={styles.titleRegular}> Delivery</Text>
        </View>
        <Text style={styles.subtitle}>NAVIGATE. DELIVER. SYNC.</Text>

      </View>

      {/* Bottom Loading Area */}
      <View style={styles.bottomArea}>
        
        {/* Progress Bar Container */}
        <View style={styles.progressBarTrack}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }) 
              }
            ]} 
          />
        </View>

        <View style={styles.statusContainer}>
          <Animated.View style={[styles.statusDot, { opacity: pulseAnim }]} />
          <Text style={styles.statusText}>Preparing today's route</Text>
        </View>
        
        <Text style={styles.statusSubtext}>Fleet execution, connected</Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
});

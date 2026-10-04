import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/waypoint/icon';
import { Button, WText } from '@/components/waypoint/ui';
import { signInDriver } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSyncStore } from '@/features/sync/store/syncStore';
import { supabase } from '@/lib/supabaseClient';
import { Colors, font, Radius, W } from '@/utils/theme';

const APP_VERSION = Constants.expoConfig?.version;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const isOnline = useSyncStore((s) => s.isOnline);
  const notice = useAuthStore((s) => s.notice);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'id' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const message = error ?? notice;

  const signIn = async () => {
    if (!isOnline) {
      setError('You are offline. Connect to the internet to sign in.');
      return;
    }
    setLoading(true);
    setError(null);
    useAuthStore.getState().clearNotice();
    try {
      const profile = await signInDriver(supabase, identifier, password);
      setPassword('');
      useAuthStore.getState().setSignedIn(profile.id);
      router.replace('/route');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: Math.max(28, insets.bottom + 12) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Yellow Brand Top Section */}
        <LinearGradient
          colors={[Colors.brightYellow, Colors.primaryYellow]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.brandHeader, { paddingTop: insets.top + 24 }]}>
          {/* Subtle decorative background ring */}
          <View style={styles.orbitRing} />

          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Image
                source={require('@/assets/images/waypoint/logo.png')}
                style={styles.logoImage}
                accessibilityLabel="Waypoint product icon"
              />
            </View>
            <View style={styles.brandWordmark}>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitleWaypoint}>Waypoint</Text>
                <Text style={styles.brandTitleDelivery}>Delivery</Text>
              </View>
              <Text style={styles.brandTagline}>NAVIGATE. DELIVER. SYNC.</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Rounded Surface Container */}
        <View style={styles.surfaceCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>DRIVER ACCESS</Text>
          </View>

          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>
            Sign in to view today&apos;s route and begin your shift.
          </Text>

          {/* Driver ID or email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Driver ID or email</Text>
            <View style={[styles.inputWrapper, focusedInput === 'id' && styles.inputWrapperFocused]}>
              <Icon name="user" size={19} color="#8A6B10" />
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="e.g. driver or driver@waypoint.com"
                placeholderTextColor={Colors.textSecondary}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                accessibilityLabel="Driver ID or email"
                onFocus={() => setFocusedInput('id')}
                onBlur={() => setFocusedInput(null)}
                style={styles.inputControl}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabelRow}>
              <WText size={9} weight={800} color="#4f5154">
                Password
              </WText>
            </View>
            <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
              <Icon name="lock" size={19} color="#8A6B10" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                accessibilityLabel="Password"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                onSubmitEditing={signIn}
                returnKeyType="go"
                style={styles.inputControl}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.pinVisibilityButton}>
                <Icon name="eye" size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {message && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Icon name="alert" size={15} color="#A65F00" />
              <Text style={styles.errorText}>{message}</Text>
            </View>
          )}

          <Button onPress={signIn} trailingIcon="chevron" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in to Waypoint'}
          </Button>

          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <Icon name="shield" size={15} color={W.greenDark} />
            <Text style={styles.trustBadgeText}>
              Driver accounts only • Your session stays on this device for offline work
            </Text>
          </View>
        </View>

        {/* Bottom Status Indicator */}
        <View style={styles.bottomStatusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? Colors.successGreen : Colors.warningOrange },
            ]}
          />
          <Text style={[styles.statusText, { color: isOnline ? W.greenDark : Colors.warningOrange }]}>
            {isOnline ? 'Online • Secure connection' : 'Offline • Connect to sign in'}
          </Text>
        </View>

        {APP_VERSION && <Text style={styles.versionText}>Waypoint Delivery v{APP_VERSION}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.canvasBackground,
  },
  brandHeader: {
    minHeight: 210,
    paddingHorizontal: 22,
    paddingBottom: 42,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  orbitRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 48,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    right: -110,
    top: -90,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 18px rgba(99, 64, 0, 0.12)',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  brandWordmark: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  brandTitleWaypoint: {
    ...font(800),
    fontSize: 21,
    lineHeight: 25,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandTitleDelivery: {
    ...font(600),
    fontSize: 15,
    lineHeight: 20,
    color: '#6E4E00',
    letterSpacing: -0.3,
  },
  brandTagline: {
    ...font(700),
    fontSize: 9,
    lineHeight: 13,
    color: '#7A5700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  surfaceCard: {
    marginTop: -22,
    marginHorizontal: 16,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 22,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: Radius.lg,
    boxShadow: '0px 16px 36px rgba(32, 33, 36, 0.1)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4DD',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    ...font(800),
    fontSize: 9,
    color: '#8A5900',
    letterSpacing: 0.9,
  },
  cardTitle: {
    ...font(800),
    fontSize: 26,
    lineHeight: 32,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    ...font(500),
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  fieldLabel: {
    ...font(700),
    fontSize: 11,
    color: '#3B3D42',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: '#FAFAF7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
  },
  inputWrapperFocused: {
    borderColor: Colors.primaryYellow,
    backgroundColor: Colors.surfaceWhite,
    boxShadow: '0px 0px 0px 4px rgba(255, 200, 61, 0.28)',
  },
  inputControl: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    color: Colors.textPrimary,
    fontSize: 14,
    ...font(700),
  },
  pinVisibilityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: W.orangeSoft,
  },
  errorText: {
    ...font(700),
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#8A5900',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  trustBadgeText: {
    ...font(500),
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    ...font(700),
    fontSize: 11,
  },
  versionText: {
    ...font(500),
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
  },
});
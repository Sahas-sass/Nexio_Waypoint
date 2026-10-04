import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/waypoint/icon';
import { Button, Eyebrow, PageTitle, StatusDot, WText } from '@/components/waypoint/ui';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';
import { supabase } from '@/lib/supabaseClient';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [driverId, setDriverId] = useState('driver');
  const [pin, setPin] = useState('248600');
  const [showPin, setShowPin] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [focusedInput, setFocusedInput] = useState<'id' | 'pin' | 'otp' | null>(null);
  const [loading, setLoading] = useState(false);
  
  // OTP States
  const [otpMode, setOtpMode] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const isOnline = true; // TODO: replace with actual network status hook

  const sendOtp = async () => {
    if (!driverId) {
      Alert.alert('Error', 'Please enter your Driver ID or Email first.');
      return;
    }

    setLoading(true);
    try {
      const normalizedInput = driverId.replace(/[-()\s]/g, '');
      const isMobile = /^\+?[0-9]{10,15}$/.test(normalizedInput);
      
      const targetEmail = isMobile ? '' : (driverId.includes('@') ? driverId.trim() : `${driverId.toLowerCase().trim()}@waypoint.com`);

      if (isMobile) {
        Alert.alert('Notice', 'Mobile SMS OTP is not yet configured. Using email OTP instead.');
        setLoading(false);
        return;
      }

      // Call our custom Node.js backend
      // Note: Use your machine's IP address (like http://192.168.1.5:5000) if testing on a physical phone!
      const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:5000' : 'http://10.190.72.195:5000';
      
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Send Failed', data.error || 'Failed to send OTP');
      } else {
        setOtpSentTo(targetEmail);
        setOtpMode(true);
        Alert.alert('Success', `OTP sent to ${targetEmail}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the backend server. Is it running on port 3000?');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpToken) {
      Alert.alert('Error', 'Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:5000' : 'http://10.190.72.195:5000';
      
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpSentTo, token: otpToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Verification Failed', data.error || 'Invalid OTP');
      } else {
        // Successfully verified with Node backend! 
        // Note: We bypass Supabase Auth here because we are using our custom logic.
        router.replace('/route');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    if (otpMode) {
      return verifyOtp();
    }

    if (!driverId || !pin) {
      Alert.alert('Error', 'Please enter your Driver ID or Mobile Number, and your PIN.');
      return;
    }

    setLoading(true);
    try {
      const normalizedInput = driverId.replace(/[-()\s]/g, '');
      const isMobile = /^\+?[0-9]{10,15}$/.test(normalizedInput);
      
      let result;
      if (isMobile) {
        result = await supabase.auth.signInWithPassword({
          phone: normalizedInput,
          password: pin,
        });
      } else {
        const email = driverId.includes('@') ? driverId.trim() : `${driverId.toLowerCase().trim()}@waypoint.com`;
        result = await supabase.auth.signInWithPassword({
          email,
          password: pin,
        });
      }

      if (result.error) {
        Alert.alert('Sign In Failed', result.error.message);
      } else {
        router.replace('/route');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during sign in.');
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
          {/* Category Tag & Header */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>DRIVER ACCESS</Text>
          </View>

          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>
            Sign in to view today&apos;s route and begin your shift.
          </Text>

          {/* Input 1: Driver ID or mobile number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Driver ID or mobile number</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === 'id' && styles.inputWrapperFocused,
              ]}>
              <Icon name="user" size={19} color="#8A6B10" />
              <TextInput
                value={driverId}
                onChangeText={setDriverId}
                placeholder="Enter driver ID or mobile"
                placeholderTextColor={Colors.textSecondary}
                autoComplete="username"
                autoCapitalize="characters"
                accessibilityLabel="Driver ID or mobile number"
                onFocus={() => setFocusedInput('id')}
                onBlur={() => setFocusedInput(null)}
                style={styles.inputControl}
              />
              {driverId.length > 0 && (
                <View style={styles.validCheckBadge}>
                  <Icon name="check" size={12} color={W.greenDark} />
                </View>
              )}
            </View>
          </View>

          {/* Dynamic Input: Secure PIN vs OTP Token */}
          {!otpMode ? (
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <WText size={9} weight={800} color="#4f5154">
                  Secure PIN
                </WText>
                <WText size={8} weight={600} color={W.gray}>
                  6 digits
                </WText>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'pin' && styles.inputWrapperFocused,
                ]}>
                <Icon name="lock" size={19} color="#8A6B10" />
                <TextInput
                  value={pin}
                  onChangeText={setPin}
                  secureTextEntry={!showPin}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="current-password"
                  accessibilityLabel="Secure PIN"
                  onFocus={() => setFocusedInput('pin')}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.inputControl}
                />
                <Pressable
                  onPress={() => setShowPin(!showPin)}
                  accessibilityLabel={showPin ? 'Hide PIN' : 'Show PIN'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.pinVisibilityButton}>
                  <Icon name="eye" size={18} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <WText size={9} weight={800} color="#4f5154">
                  Email OTP Code
                </WText>
                <WText size={8} weight={600} color={W.gray}>
                  Sent to {otpSentTo}
                </WText>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'otp' && styles.inputWrapperFocused,
                ]}>
                <Icon name="mail" size={19} color="#8A6B10" />
                <TextInput
                  value={otpToken}
                  onChangeText={setOtpToken}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={Colors.textSecondary}
                  accessibilityLabel="OTP Code"
                  onFocus={() => setFocusedInput('otp')}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.inputControl}
                />
              </View>
            </View>
          )}

          {/* Checkbox Row: Remember this device + Forgot PIN */}
          <View style={styles.optionsRow}>
            <Pressable
              onPress={() => setRememberDevice(!rememberDevice)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberDevice }}
              style={styles.checkboxWrapper}>
              <View
                style={[
                  styles.checkboxBox,
                  rememberDevice && styles.checkboxBoxChecked,
                ]}>
                {rememberDevice && <Icon name="check" size={12} color="#4A3400" />}
              </View>
              <Text style={styles.checkboxLabel}>Remember this device</Text>
            </Pressable>

            <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.forgotPinText}>Forgot PIN?</Text>
            </Pressable>
          </View>

          <Button onPress={signIn} trailingIcon="chevron" disabled={loading}>
            {loading ? 'Processing...' : (otpMode ? 'Verify OTP & Sign In' : 'Sign in to Waypoint')}
          </Button>

          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <Icon name="shield" size={15} color={W.greenDark} />
            <Text style={styles.trustBadgeText}>
              Secure driver access • Your credentials are encrypted on this device
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
          </View>

          {/* Secondary Action Button */}
          {!otpMode ? (
            <Pressable
              onPress={sendOtp}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Email OTP"
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}>
              <Icon name="mail" size={17} color={Colors.textPrimary} />
              <Text style={styles.secondaryButtonText}>Sign in with Email OTP</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setOtpMode(false)}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancel OTP Login"
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}>
              <Icon name="x" size={17} color={Colors.textPrimary} />
              <Text style={styles.secondaryButtonText}>Back to PIN Login</Text>
            </Pressable>
          )}

          {/* Help Link */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>Having trouble signing in? </Text>
            <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.contactDispatchText}>Contact Dispatch</Text>
            </Pressable>
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
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? W.greenDark : Colors.warningOrange },
            ]}>
            {isOnline
              ? 'Online • Secure connection'
              : 'Offline mode • Local storage active'}
          </Text>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Waypoint Delivery v2.8.4</Text>
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
  pinHint: {
    ...font(600),
    fontSize: 10,
    color: Colors.textSecondary,
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
  validCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: W.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinVisibilityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 20,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#C4C7CC',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceWhite,
  },
  checkboxBoxChecked: {
    borderColor: Colors.primaryYellow,
    backgroundColor: Colors.primaryYellow,
  },
  checkboxLabel: {
    ...font(600),
    fontSize: 12,
    color: Colors.textSecondary,
  },
  forgotPinText: {
    ...font(700),
    fontSize: 12,
    color: '#8C6200',
  },
  primaryButton: {
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
  primaryButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  primaryButtonText: {
    ...font(800),
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
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
  dividerContainer: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ECECE7',
  },
  dividerText: {
    ...font(600),
    fontSize: 11,
    color: '#9CA3AF',
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 12,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    boxShadow: Shadow.sm,
  },
  secondaryButtonPressed: {
    backgroundColor: '#F7F7F4',
    transform: [{ scale: 0.985 }],
  },
  secondaryButtonText: {
    ...font(700),
    fontSize: 13,
    color: Colors.textPrimary,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  helpText: {
    ...font(500),
    fontSize: 11,
    color: Colors.textSecondary,
  },
  contactDispatchText: {
    ...font(800),
    fontSize: 11,
    color: '#8C6200',
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
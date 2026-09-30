// Driver ID and PIN login screen.
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/waypoint/icon';
import { Button, Eyebrow, PageTitle, StatusDot, WText } from '@/components/waypoint/ui';
import { font, Radius, W } from '@/utils/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [driverId, setDriverId] = useState('D-1084');
  const [pin, setPin] = useState('2486');
  const [showPin, setShowPin] = useState(false);
  const [remember, setRemember] = useState(true);
  const [focused, setFocused] = useState<'id' | 'pin' | null>(null);

  const signIn = () => router.replace('/route');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
        keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[W.brightYellow, W.yellow]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.top, { paddingTop: insets.top + 28 }]}>
          <View style={styles.orbit} />
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Image
                source={require('@/assets/images/waypoint/logo.png')}
                style={styles.logoImage}
                accessibilityLabel="Waypoint product icon"
              />
            </View>
            <View style={styles.wordmark}>
              <WText size={18} weight={800} spacing={-0.035}>
                Waypoint
              </WText>
              <WText size={13} weight={600} spacing={-0.035}>
                Delivery
              </WText>
            </View>
          </View>
          <View style={styles.intro}>
            <Eyebrow color="#785400">DRIVER ACCESS</Eyebrow>
            <PageTitle size={28}>Welcome back</PageTitle>
            <WText size={11} weight={600} color="#725817" style={styles.introText}>
              Sign in to view today&apos;s route and begin your shift.
            </WText>
          </View>
        </LinearGradient>

        <View style={styles.panel}>
          <View style={styles.field}>
            <WText size={9} weight={800} color="#4f5154">
              Driver ID or mobile number
            </WText>
            <View style={[styles.input, focused === 'id' && styles.inputFocused]}>
              <Icon name="user" size={19} color="#9b7a20" />
              <TextInput
                value={driverId}
                onChangeText={setDriverId}
                placeholder="Enter your driver ID"
                placeholderTextColor="#b2b4b8"
                autoComplete="username"
                autoCapitalize="characters"
                accessibilityLabel="Driver ID or mobile number"
                onFocus={() => setFocused('id')}
                onBlur={() => setFocused(null)}
                style={styles.inputText}
              />
              {driverId.length > 0 && (
                <View style={styles.inputValid}>
                  <Icon name="check" size={12} color={W.greenDark} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <WText size={9} weight={800} color="#4f5154">
                Secure PIN
              </WText>
              <WText size={8} weight={600} color={W.gray}>
                4 digits
              </WText>
            </View>
            <View style={[styles.input, focused === 'pin' && styles.inputFocused]}>
              <Icon name="lock" size={19} color="#9b7a20" />
              <TextInput
                value={pin}
                onChangeText={setPin}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                maxLength={4}
                autoComplete="current-password"
                accessibilityLabel="Secure PIN"
                onFocus={() => setFocused('pin')}
                onBlur={() => setFocused(null)}
                style={styles.inputText}
              />
              <Pressable
                onPress={() => setShowPin(!showPin)}
                accessibilityLabel={showPin ? 'Hide PIN' : 'Show PIN'}
                style={styles.pinToggle}>
                <Icon name="eye" size={18} color={W.gray} />
              </Pressable>
            </View>
          </View>

          <View style={styles.options}>
            <Pressable
              onPress={() => setRemember(!remember)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: remember }}
              style={styles.optionButton}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                {remember && <Icon name="check" size={12} color="#5a4200" />}
              </View>
              <WText size={9} weight={700} color={W.gray}>
                Remember this device
              </WText>
            </Pressable>
            <Pressable style={styles.optionButton}>
              <WText size={9} weight={700} color={W.amberDark}>
                Forgot PIN?
              </WText>
            </Pressable>
          </View>

          <Button onPress={signIn} trailingIcon="chevron">
            Sign in to Waypoint
          </Button>

          <View style={styles.secure}>
            <Icon name="shield" size={16} color={W.greenDark} />
            <View>
              <WText size={8} weight={700} color="#55585c" style={{ marginBottom: 1 }}>
                Secure driver access
              </WText>
              <WText size={7} color={W.gray}>
                Your route data is encrypted on this device.
              </WText>
            </View>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <WText size={8} color="#a1a4a9" style={styles.dividerText}>
              or
            </WText>
          </View>

          <Button variant="secondary" icon="phone" height={46} textSize={11}>
            Sign in with mobile OTP
          </Button>

          <View style={styles.help}>
            <WText size={8} color={W.gray}>
              Having trouble signing in?
            </WText>
            <Pressable style={{ padding: 5 }}>
              <WText size={8} weight={800} color="#8b6100">
                Contact Dispatch
              </WText>
            </Pressable>
          </View>
        </View>

        <View style={styles.network}>
          <StatusDot color={W.green} size={7} />
          <WText size={8} weight={800} color={W.greenDark}>
            Online · Secure connection
          </WText>
        </View>
        <WText size={7} color="#a0a3a7" style={{ textAlign: 'center', marginTop: 6 }}>
          Waypoint Delivery v2.8.4
        </WText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: W.offWhite,
  },
  top: {
    minHeight: 292,
    paddingHorizontal: 22,
    paddingBottom: 34,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  orbit: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 45,
    borderColor: 'rgba(255,255,255,0.12)',
    right: -126,
    top: -105,
    boxShadow: '0px 0px 0px 45px rgba(255,255,255,0.06)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 16px rgba(99,64,0,0.1)',
  },
  logoImage: {
    width: 37,
    height: 37,
    borderRadius: 11,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  intro: {
    marginTop: 39,
  },
  introText: {
    maxWidth: 290,
    marginTop: 7,
    lineHeight: 11 * 1.55,
  },
  panel: {
    marginTop: -20,
    marginHorizontal: 16,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 17,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: Radius.lg,
    boxShadow: '0px 18px 40px rgba(32,33,36,0.11)',
  },
  field: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    height: 52,
    marginTop: 7,
    borderWidth: 1.5,
    borderColor: W.lightGray,
    borderRadius: 14,
    backgroundColor: '#fbfbf8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: W.yellow,
    boxShadow: `0px 0px 0px 4px ${W.yellowSoft}`,
  },
  inputText: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    color: W.charcoal,
    fontSize: 13,
    ...font(700),
  },
  inputValid: {
    width: 21,
    height: 21,
    borderRadius: 7,
    backgroundColor: W.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinToggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -1,
    marginBottom: 17,
  },
  optionButton: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderWidth: 1.5,
    borderColor: '#c9cbd0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: W.yellow,
    backgroundColor: W.yellow,
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 12,
    marginBottom: 2,
  },
  divider: {
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#eeeeea',
  },
  dividerText: {
    backgroundColor: W.white,
    paddingHorizontal: 9,
  },
  help: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
  },
  network: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
});
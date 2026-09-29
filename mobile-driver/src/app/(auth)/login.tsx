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

<<<<<<< HEAD
          {/* PIN Input */}
          <View style={styles.inputGroup}>
            <View style={styles.pinLabelRow}>
              <Text style={styles.inputLabel}>Secure PIN</Text>
              <Text style={styles.pinHint}>4 digits</Text>
            </View>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                value={pin}
                onChangeText={setPin}
                placeholder="••••"
                placeholderTextColor="#C7C7CC"
                secureTextEntry={secureText}
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <Feather name={secureText ? "eye" : "eye-off"} size={20} color="#8E8E93" style={styles.inputIconRight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember & Forgot Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Feather name="check" size={14} color="#1C1C1E" />}
              </View>
              <Text style={styles.rememberText}>Remember this device</Text>
            </TouchableOpacity>
            
            <TouchableOpacity hitSlop={{top:10, bottom:10, left:10, right:10}}>
              <Text style={styles.forgotText}>Forgot PIN?</Text>
            </TouchableOpacity>
          </View>

          {/* Main Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin} 
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Signing in...' : 'Sign in to Waypoint'}</Text>
            {!loading && <Feather name="chevron-right" size={20} color="#1C1C1E" style={styles.buttonIcon} />}
          </TouchableOpacity>

          {/* Secure Note */}
          <View style={styles.secureNoteRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#34C759" />
            <View style={styles.secureNoteTextCol}>
              <Text style={styles.secureNoteTitle}>Secure driver access</Text>
              <Text style={styles.secureNoteSubtitle}>Your route data is encrypted on this device.</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Secondary Button */}
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
            <Feather name="smartphone" size={18} color="#1C1C1E" />
            <Text style={styles.secondaryButtonText}>Sign in with mobile OTP</Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Having trouble signing in? </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Contact Dispatch</Text>
            </TouchableOpacity>
          </View>

        </View>
=======
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
>>>>>>> 10224c9e5f222ab3ec148e0a616311123a47a101
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    minHeight: 280, // ensures it has enough space before card
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20, // relative to safe area
    left: 24,
  },
  miniGlassPlate: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniLogoSquircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFCF3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1E1E1E',
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleBold: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  headerTitleRegular: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1C1C1E',
  },
  welcomeContainer: {
    paddingRight: 40,
    marginTop: 60, 
  },
  driverAccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A87900', // darker yellow/brown
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 8,
  },
  pinLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinHint: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconRight: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    height: '100%',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F8F0', // faint green
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#FFCF3A',
    borderColor: '#FFCF3A',
  },
  rememberText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    color: '#A87900', // same as driver access text
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#FFCF3A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  buttonIcon: {
    position: 'absolute',
    right: 20,
  },
  secureNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  secureNoteTextCol: {
    marginLeft: 10,
  },
  secureNoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  secureNoteSubtitle: {
    fontSize: 11,
    color: '#C7C7CC',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F2F2F7',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#C7C7CC',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A87900',
  }
=======
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
>>>>>>> 10224c9e5f222ab3ec148e0a616311123a47a101
});

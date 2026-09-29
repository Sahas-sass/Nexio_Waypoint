import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabaseClient';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [driverId, setDriverId] = useState('D-1084');
  const [pin, setPin] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const handleLogin = async () => {
    if (!driverId || !pin) {
      Alert.alert('Validation Error', 'Please enter your Driver ID and PIN');
      return;
    }
    
    setLoading(true);
    try {
      const email = driverId.includes('@') ? driverId : `${driverId.toLowerCase()}@waypoint.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/(tabs)/route');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FFCF3A' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Yellow Section */}
        <View style={[styles.topSection, { paddingTop: Math.max(insets.top, 20), minHeight: height * 0.38 }]}>
          {/* Header / Logo */}
          <View style={styles.header}>
            <View style={styles.miniGlassPlate}>
              <View style={styles.miniLogoSquircle}>
                <View style={styles.miniLogoInner}>
                  <View style={styles.miniLogoDot} />
                </View>
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitleBold}>Waypoint</Text>
              <Text style={styles.headerTitleRegular}> Delivery</Text>
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.driverAccessText}>DRIVER ACCESS</Text>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to view today's route and begin your shift.</Text>
          </View>
        </View>

        {/* Bottom White Section */}
        <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 24), minHeight: height * 0.62 }]}>
          
          {/* Driver ID Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Driver ID or mobile number</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                value={driverId}
                onChangeText={setDriverId}
                placeholder="Enter ID"
                placeholderTextColor="#C7C7CC"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {driverId.length > 0 && (
                <View style={styles.checkCircle}>
                  <Feather name="check" size={12} color="#34C759" />
                </View>
              )}
            </View>
          </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
});

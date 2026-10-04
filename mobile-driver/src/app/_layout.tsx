import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { initDatabase } from '@/database/schema';
import { downloadTripData } from '@/database/syncManager';
import { useNetworkState } from '@/hooks/useNetworkState';
import { W } from '@/utils/theme';
import { locationService } from '@/services/LocationService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useNetworkState();

  useEffect(() => {
    try {
      initDatabase();
      // Fetch fresh data from Supabase!
      downloadTripData().catch(console.error);
      
      // Initialize Socket.io connection and start GPS tracking
      locationService.initialize();
      locationService.startTracking('driver_123').catch(console.error);
    } catch (err) {
      console.error('Failed to initialize database or location service:', err);
    }
  }, []);

  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.offWhite } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="offline" />
      </Stack>
      {/* Mounted after Stack so absolute positioning renders on top in the paint hierarchy */}
      <OfflineBanner />
    </SafeAreaProvider>
  );
}

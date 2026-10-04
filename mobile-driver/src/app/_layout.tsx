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
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNetworkState } from '@/features/sync/hooks/useNetworkState';
import { useTripLifecycle } from '@/features/trip/hooks/useTripLifecycle';
import { W } from '@/utils/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useNetworkState();
  useAuthBootstrap();
  useTripLifecycle();
  const authStatus = useAuthStore((s) => s.status);

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

  const signedIn = authStatus === 'signedIn';

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.offWhite } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="offline" />
        </Stack.Protected>
      </Stack>
      {/* Mounted after Stack so absolute positioning renders on top in the paint hierarchy */}
      {signedIn && <OfflineBanner />}
    </SafeAreaProvider>
  );
}

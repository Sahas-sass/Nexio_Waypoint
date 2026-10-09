import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { AppHeader, BottomNav } from '@/components/waypoint/chrome';
import { W } from '@/utils/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        header: () => <AppHeader onStatus={() => router.push('/offline')} />,
        sceneStyle: { backgroundColor: W.offWhite },
      }}>
      <Tabs.Screen name="route" />
      <Tabs.Screen name="current-stop" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="more" />
      <Tabs.Screen name="pod/[stopId]" options={{ href: null }} />
      <Tabs.Screen name="pod/complete" options={{ href: null }} />
    </Tabs>
  );
}

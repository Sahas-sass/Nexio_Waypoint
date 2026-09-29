import { Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#A87900', // Yellow/Gold
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F2F2F7',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="route"
        options={{
          title: 'Route',
          tabBarIcon: ({ color }) => <Feather name="map" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="current-stop"
        options={{
          title: 'Current Stop',
          tabBarIcon: ({ color }) => <Ionicons name="location-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Feather name="more-horizontal" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

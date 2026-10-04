import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/waypoint/icon';
import { Card } from '@/components/waypoint/ui';
import { Colors, font, Radius } from '@/utils/theme';

/** Loading / empty / error placeholder for stop screens. */
export function StopEmptyState({
  icon,
  title,
  message,
  showRouteLink = true,
}: {
  icon: IconName;
  title: string;
  message: string;
  showRouteLink?: boolean;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={24} color="#8A5900" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {showRouteLink && (
        <Pressable
          onPress={() => router.navigate('/route')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}>
          <Text style={styles.buttonText}>Back to route</Text>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 18, marginTop: 12 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF4DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { ...font(800), fontSize: 17, color: Colors.textPrimary, textAlign: 'center' },
  message: { ...font(500), fontSize: 13, lineHeight: 18, color: Colors.textSecondary, textAlign: 'center', marginTop: 6 },
  button: {
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { ...font(800), fontSize: 14, color: Colors.textPrimary },
});

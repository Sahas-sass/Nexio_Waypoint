import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/waypoint/icon';
import { Colors, font } from '@/utils/theme';

export function MapPlaceholder({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Icon name="pin" size={22} color={Colors.textSecondary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8ECE4', alignItems: 'center', justifyContent: 'center', gap: 6 },
  text: { ...font(600), fontSize: 12, color: Colors.textSecondary },
});

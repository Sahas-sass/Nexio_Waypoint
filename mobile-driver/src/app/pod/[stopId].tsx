import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PodScreen() {
  const { stopId } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Proof of Delivery for Stop: {stopId}</Text>
    </View>
  );
}

// Delivered goods photo capture component.
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/waypoint/icon';
import { Button, Card, WText } from '@/components/waypoint/ui';
import { deliveryPhoto } from '@/data/mock';
import { Shadow, W } from '@/utils/theme';

import { podStyles } from './styles';

// TODO: open the device camera instead of attaching the sample photo.
export function CameraCapture({ captured, onCapture }: { captured: boolean; onCapture: () => void }) {
  return (
    <Card style={podStyles.card}>
      <View style={podStyles.cardTitle}>
        <Icon name="camera" color={W.amber} />
        <View>
          <WText size={12} weight={700}>
            Delivery Photo
          </WText>
          <WText size={9} color={W.gray} style={{ marginTop: 2 }}>
            Capture goods at the outlet
          </WText>
        </View>
      </View>
      {captured ? (
        <View style={styles.preview}>
          <Image
            source={{ uri: deliveryPhoto }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel="Delivery proof showing the freight vehicle at the loading bay"
          />
          <View style={styles.stamp}>
            <Icon name="check" size={15} color={W.greenDark} />
            <WText size={8} weight={800} color={W.greenDark}>
              Photo added · 8:23 AM
            </WText>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <View style={styles.cameraIcon}>
            <Icon name="camera" size={27} color={W.amber} />
          </View>
          <WText size={11} weight={700} style={{ marginTop: 7 }}>
            Add delivery photo
          </WText>
          <WText size={8} color={W.gray} style={{ marginTop: 3 }}>
            Make sure the delivered goods are visible
          </WText>
        </View>
      )}
      <Button variant="secondary" icon="camera" height={42} textSize={11} onPress={onCapture}>
        {captured ? 'Retake Photo' : 'Take Photo'}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {
    minHeight: 110,
    borderRadius: 14,
    backgroundColor: W.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  cameraIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: W.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  preview: {
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 9,
  },
  stamp: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

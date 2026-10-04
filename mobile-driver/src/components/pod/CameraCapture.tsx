import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Icon } from '@/components/waypoint/icon';
import { toCapturedPhoto, type CapturedPhoto } from '@/features/pod/utils/photoAsset';
import { formatTimestamp } from '@/utils/formatters';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

export interface CameraCaptureProps {
  onCapture: (photo: CapturedPhoto | null) => void;
  photo: CapturedPhoto | null;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.5,
  base64: true,
  allowsEditing: false,
};

export function CameraCapture({ onCapture, photo }: CameraCaptureProps) {
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const isCaptured = Boolean(photo);

  const accept = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const captured = toCapturedPhoto(result.assets?.[0]);
    if (!captured) {
      Alert.alert('Photo unavailable', 'The selected image could not be read. Please try again.');
      return;
    }
    setCapturedAt(formatTimestamp(Date.now()));
    onCapture(captured);
  };

  const capturePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera access needed',
          'Allow camera access in your device settings to photograph the delivery, or choose a photo from the library.'
        );
        return;
      }
      accept(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
    } catch (err) {
      Alert.alert('Camera unavailable', err instanceof Error ? err.message : 'Could not open the camera.');
    }
  };

  const chooseFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo library access needed', 'Allow photo library access in your device settings.');
        return;
      }
      accept(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
    } catch (err) {
      Alert.alert('Photo library unavailable', err instanceof Error ? err.message : 'Could not open the photo library.');
    }
  };

  const handlePrompt = () => {
    Alert.alert('Delivery Photo', 'Choose source for delivery verification photo:', [
      { text: 'Take Photo with Camera', onPress: capturePhoto },
      { text: 'Choose from Photo Library', onPress: chooseFromGallery },
      ...(isCaptured ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => onCapture(null) }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Icon name="camera" size={17} color="#8A5900" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Delivery Photo</Text>
          <Text style={styles.headerSubtitle}>Capture goods at the outlet</Text>
        </View>

        {isCaptured && (
          <View style={styles.verifiedTag}>
            <Icon name="check" size={12} color={W.greenDark} />
            <Text style={styles.verifiedTagText}>Photo Attached</Text>
          </View>
        )}
      </View>

      {photo ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel="Captured proof of delivery photo"
          />
          <View style={styles.photoStamp}>
            <Icon name="check" size={13} color={W.greenDark} />
            <Text style={styles.photoStampText}>
              {capturedAt ? `Photo captured • ${capturedAt}` : 'Photo captured'}
            </Text>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={handlePrompt}
          accessibilityRole="button"
          accessibilityLabel="Add delivery photo"
          style={({ pressed }) => [
            styles.emptyStateContainer,
            pressed && { backgroundColor: '#F3F4F1' },
          ]}>
          <View style={styles.cameraIconBadge}>
            <Icon name="camera" size={24} color="#8A5900" />
          </View>
          <Text style={styles.emptyTitle}>Add delivery photo</Text>
          <Text style={styles.emptySubtitle}>
            Make sure delivered goods and dock bay are clearly visible
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={handlePrompt}
        accessibilityRole="button"
        accessibilityLabel={isCaptured ? 'Retake Photo' : 'Take Photo'}
        style={({ pressed }) => [
          styles.actionButton,
          pressed && { backgroundColor: '#F0F0EB' },
        ]}>
        <Icon name="camera" size={16} color={Colors.textPrimary} />
        <Text style={styles.actionButtonText}>
          {isCaptured ? 'Retake Photo' : 'Take Photo'}
        </Text>
      </Pressable>
    </View>
  );
}

export default CameraCapture;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 14,
    boxShadow: Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...font(800),
    fontSize: 13,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...font(500),
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: W.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedTagText: {
    ...font(800),
    fontSize: 10,
    color: W.greenDark,
  },
  emptyStateContainer: {
    minHeight: 124,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginBottom: 12,
  },
  cameraIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
    marginBottom: 8,
  },
  emptyTitle: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...font(500),
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
    maxWidth: 240,
  },
  previewContainer: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 12,
  },
  photoStamp: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    boxShadow: Shadow.sm,
  },
  photoStampText: {
    ...font(800),
    fontSize: 10,
    color: W.greenDark,
  },
  actionButton: {
    minHeight: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: Shadow.sm,
  },
  actionButtonText: {
    ...font(700),
    fontSize: 12,
    color: Colors.textPrimary,
  },
});

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Icon } from '@/components/waypoint/icon';
import { deliveryPhoto } from '@/data/mock';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

export interface CameraCaptureProps {
  onCapture: (imageUri: string) => void;
  imageUri?: string | null;
  // Compatibility with existing screen
  captured?: boolean;
}

export function CameraCapture({
  onCapture,
  imageUri: propImageUri,
  captured: propCaptured,
}: CameraCaptureProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(
    propImageUri ?? (propCaptured ? deliveryPhoto : null)
  );
  const [timestamp, setTimestamp] = useState<string | null>(
    propCaptured ? '8:23 AM' : null
  );

  useEffect(() => {
    setPhotoUri(propImageUri ?? (propCaptured ? deliveryPhoto : null));
    if (!propImageUri && !propCaptured) {
      setTimestamp(null);
    }
  }, [propImageUri, propCaptured]);

  const isCaptured = Boolean(photoUri || propCaptured);

  const capturePhoto = async () => {
    try {
      // Request camera permissions
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      let result: ImagePicker.ImagePickerResult;

      if (permission.granted) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: false,
        });
      } else {
        // Fallback to media library if camera permission is not granted
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const now = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setPhotoUri(uri);
        setTimestamp(now);
        onCapture(uri);
      }
    } catch (err) {
      console.warn('[CameraCapture] Camera unavailable, using demo photo fallback:', err);
      // Graceful fallback for simulators without camera hardware
      const fallbackUri = deliveryPhoto;
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setPhotoUri(fallbackUri);
      setTimestamp(now);
      onCapture(fallbackUri);
    }
  };

  const chooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const now = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setPhotoUri(uri);
        setTimestamp(now);
        onCapture(uri);
      }
    } catch (err) {
      console.warn('[CameraCapture] Gallery error:', err);
    }
  };

  const handlePrompt = () => {
    Alert.alert(
      'Delivery Photo',
      'Choose source for delivery verification photo:',
      [
        { text: 'Take Photo with Camera', onPress: capturePhoto },
        { text: 'Choose from Photo Library', onPress: chooseFromGallery },
        { text: 'Use Sample Verification Photo', onPress: () => {
          setPhotoUri(deliveryPhoto);
          setTimestamp('Just now');
          onCapture(deliveryPhoto);
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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

      {/* Captured Image Preview or Empty State */}
      {isCaptured && photoUri ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photoUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel="Captured proof of delivery photo"
          />
          <View style={styles.photoStamp}>
            <Icon name="check" size={13} color={W.greenDark} />
            <Text style={styles.photoStampText}>
              Photo captured • {timestamp ?? 'Verified'}
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

      {/* CTA Button */}
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

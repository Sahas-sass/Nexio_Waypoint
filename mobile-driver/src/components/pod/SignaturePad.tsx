import { useEffect, useMemo, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/waypoint/icon';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

export interface SignaturePadProps {
  onConfirm: (svgData: string) => void;
  isConfirmed?: boolean;
  // Compatibility with existing screen
  signed?: boolean;
  onChange?: (signed: boolean) => void;
}

export function SignaturePad({
  onConfirm,
  isConfirmed: propConfirmed,
  signed,
  onChange,
}: SignaturePadProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(
    Boolean(propConfirmed || signed)
  );

  useEffect(() => {
    const isNowConfirmed = Boolean(propConfirmed || signed);
    setConfirmed(isNowConfirmed);
    if (!isNowConfirmed) {
      setPaths([]);
      setCurrentPath('');
    }
  }, [propConfirmed, signed]);

  const isLocked = confirmed || Boolean(propConfirmed || signed);

  // PanResponder to track touch/stylus movement and generate SVG path commands
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isLocked,
        onMoveShouldSetPanResponder: () => !isLocked,
        onPanResponderGrant: (evt) => {
          if (isLocked) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath(`M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`);
        },
        onPanResponderMove: (evt) => {
          if (isLocked) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) =>
            prev ? `${prev} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}` : `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`
          );
        },
        onPanResponderRelease: () => {
          if (isLocked) return;
          setCurrentPath((prev) => {
            if (prev) {
              setPaths((prevPaths) => [...prevPaths, prev]);
            }
            return '';
          });
        },
      }),
    [isLocked]
  );

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    setConfirmed(false);
    onChange?.(false);
    onConfirm('');
  };

  const handleConfirm = () => {
    const allPaths = [...paths, ...(currentPath ? [currentPath] : [])];
    if (allPaths.length === 0) return;
    const combinedSvg = allPaths.join(' ');
    setConfirmed(true);
    onChange?.(true);
    onConfirm(combinedSvg);
  };

  const hasStrokes = paths.length > 0 || Boolean(currentPath);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Icon name="signature" size={17} color="#8A5900" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Store Manager Signature</Text>
          <Text style={styles.headerSubtitle}>Required for delivery completion</Text>
        </View>

        {isLocked && (
          <View style={styles.verifiedTag}>
            <Icon name="check" size={12} color={W.greenDark} />
            <Text style={styles.verifiedTagText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Touch Signature Area */}
      <View
        {...panResponder.panHandlers}
        style={[
          styles.canvasArea,
          isLocked && styles.canvasAreaConfirmed,
        ]}>
        {/* Render smooth SVG paths */}
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((p, index) => (
            <Path
              key={index}
              d={p}
              stroke="#1F2937"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke="#1F2937"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : null}
        </Svg>

        {/* Placeholder guidance when empty */}
        {!hasStrokes && !isLocked && (
          <View style={styles.placeholderContainer} pointerEvents="none">
            <Icon name="signature" size={32} color="#9CA3AF" />
            <Text style={styles.placeholderText}>Sign here with finger or stylus</Text>
          </View>
        )}

        {/* Lock indicator overlay when confirmed */}
        {isLocked && (
          <View style={styles.lockOverlay} pointerEvents="none">
            <View style={styles.lockPill}>
              <Icon name="lock" size={13} color="#15803D" />
              <Text style={styles.lockPillText}>Signature locked & timestamped</Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear signature"
          style={({ pressed }) => [
            styles.clearButton,
            pressed && { backgroundColor: '#F3F4F6' },
          ]}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>

        <Pressable
          onPress={handleConfirm}
          disabled={!hasStrokes || isLocked}
          accessibilityRole="button"
          accessibilityLabel="Confirm signature"
          style={({ pressed }) => [
            styles.confirmButton,
            (!hasStrokes || isLocked) && styles.confirmButtonDisabled,
            pressed && hasStrokes && !isLocked && { opacity: 0.9, transform: [{ scale: 0.985 }] },
          ]}>
          {isLocked ? (
            <>
              <Icon name="check" size={15} color={W.greenDark} />
              <Text style={[styles.confirmButtonText, { color: W.greenDark }]}>
                Signature Confirmed
              </Text>
            </>
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Signature</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default SignaturePad;

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
  canvasArea: {
    height: 128,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#FCFCF9',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasAreaConfirmed: {
    borderColor: '#86EFAC',
    borderStyle: 'solid',
    backgroundColor: '#F0FDF4',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderText: {
    ...font(600),
    fontSize: 11,
    color: '#9CA3AF',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  lockPillText: {
    ...font(700),
    fontSize: 9,
    color: '#15803D',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  clearButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: Radius.sm,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    ...font(700),
    fontSize: 12,
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxShadow: Shadow.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: '#F3F4F6',
    boxShadow: undefined,
  },
  confirmButtonText: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
  },
});

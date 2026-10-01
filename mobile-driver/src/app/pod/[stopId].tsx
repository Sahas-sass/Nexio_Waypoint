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
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraCapture } from '@/components/pod/CameraCapture';
import { SignaturePad } from '@/components/pod/SignaturePad';
import { Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import {
  Card,
  Label,
  Pill,
  SafetyNote,
  TitleRow,
} from '@/components/waypoint/ui';
import { db, initDatabase, type StopRecord } from '@/database/schema';
import { enqueueSyncItem, flushSyncQueue } from '@/database/syncManager';
import { useQueueStore } from '@/store/queueStore';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

export default function PodScreen() {
  const insets = useSafeAreaInsets();
  const { stopId } = useLocalSearchParams<{ stopId?: string }>();

  // Query stop details dynamically from SQLite
  const stop = useMemo<StopRecord | null>(() => {
    try {
      let found: StopRecord | null = null;
      if (stopId) {
        found = db.getFirstSync<StopRecord>(
          'SELECT * FROM stops WHERE id = ? OR stop_number = ? LIMIT 1;',
          [stopId, Number(stopId) || 0]
        );
      }
      if (!found) {
        found = db.getFirstSync<StopRecord>(
          "SELECT * FROM stops WHERE status = 'IN_PROGRESS' ORDER BY stop_number ASC LIMIT 1;"
        );
      }
      if (!found) {
        initDatabase();
        found = db.getFirstSync<StopRecord>(
          'SELECT * FROM stops ORDER BY stop_number ASC LIMIT 1;'
        );
      }
      return found;
    } catch (err) {
      console.error('[PodScreen] Error loading stop from SQLite:', err);
      return null;
    }
  }, [stopId]);

  // Form states
  const [checklistConfirmed, setChecklistConfirmed] = useState(true);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState('Goods received and checked by store manager.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Resolved stop attributes
  const stopNumberStr = stop ? String(stop.stop_number).padStart(2, '0') : '02';
  const storeName = stop?.store_name ?? 'Fresh Store #22';
  const itemsCount = stop?.items_count ?? 28;
  const isChilled = stop?.is_chilled === 1;

  // Complete Delivery Action
  const handleCompleteDelivery = () => {
    if (!checklistConfirmed) {
      Alert.alert(
        'Checklist Incomplete',
        'Please verify that all items were delivered in good condition before completing delivery.'
      );
      return;
    }

    if (!signatureData) {
      Alert.alert(
        'Signature Required',
        'Please obtain the store manager signature and tap "Confirm Signature" before completing delivery.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const activeStopId = stop?.id ?? stopId ?? '02';

      const payload = {
        stopId: activeStopId,
        storeName,
        checklistConfirmed: true,
        signatureData,
        photoUri,
        note,
        completedAt: new Date().toISOString(),
      };

      // 1. Update SQLite stops table: UPDATE stops SET status = 'COMPLETED' WHERE id = ?
      // 2. Insert into SQLite sync_queue: action_type = 'POD_COMPLETE'
      // 3. Update pendingCount in useQueueStore
      // 4. Trigger flushSyncQueue() if online
      enqueueSyncItem(activeStopId, 'POD_COMPLETE', payload);

      // Trigger sync in background
      void flushSyncQueue();

      // Query the next pending stop from SQLite
      const nextPendingStop = db.getFirstSync<StopRecord>(
        "SELECT id FROM stops WHERE status = 'PENDING' ORDER BY stop_number ASC LIMIT 1;"
      );

      // Navigate directly to the delivery complete and next stop handover screen
      router.replace({
        pathname: '/pod/complete',
        params: {
          completedStopId: activeStopId,
          nextStopId: nextPendingStop?.id,
        },
      });
    } catch (err) {
      console.error('[PodScreen] Error saving PoD:', err);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save delivery record. Please try again.');
    }
  };

  return (
    <Screen
      contentStyle={{ paddingBottom: Math.max(140, insets.bottom + 110) }}
      footer={
        <View style={styles.footerContainer}>
          <Pressable
            onPress={handleCompleteDelivery}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Complete Delivery"
            style={({ pressed }) => [
              styles.completeButton,
              isSubmitting && { opacity: 0.7 },
              pressed && !isSubmitting && styles.completeButtonPressed,
            ]}>
            <Text style={styles.completeButtonText}>
              {isSubmitting ? 'Saving…' : 'Complete Delivery ✓'}
            </Text>
          </Pressable>
          <SafetyNote>This notifies the Dispatcher and Store Manager</SafetyNote>
        </View>
      }>
      {/* Header Bar */}
      <TitleRow
        center
        eyebrow={`STOP ${stopNumberStr} · ${storeName.toUpperCase()}`}
        title="Proof of Delivery"
        subtitle="Confirm delivery details below"
        aside={
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeNumber}>2/3</Text>
            <Text style={styles.stepBadgeLabel}>STEPS</Text>
          </View>
        }
      />

      {/* Step 1: Delivery Checklist */}
      <Card style={styles.checklistCard}>
        <View style={styles.rowBetween}>
          <Label size={9} spacing={0.11}>
            STEP 1 · DELIVERY CHECKLIST
          </Label>
          <Pill
            background={W.greenSoft}
            color={W.greenDark}
            icon="check"
            iconSize={13}>
            Verified
          </Pill>
        </View>

        <View style={[styles.rowBetween, { marginTop: 12, marginBottom: 12 }]}>
          <View>
            <Text style={styles.itemCountBig}>
              {itemsCount}{' '}
              <Text style={styles.itemCountTotal}>/ {itemsCount}</Text>
            </Text>
            <Text style={styles.itemCountLabel}>Items Delivered</Text>
          </View>

          <View style={styles.bigCheckCircle}>
            <Icon name="check" size={24} color={Colors.surfaceWhite} />
          </View>
        </View>

        {/* Tappable Condition Checkbox */}
        <Pressable
          onPress={() => setChecklistConfirmed(!checklistConfirmed)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: checklistConfirmed }}
          style={[
            styles.conditionCheckbox,
            checklistConfirmed && styles.conditionCheckboxActive,
          ]}>
          <View
            style={[
              styles.checkIconBox,
              checklistConfirmed && styles.checkIconBoxChecked,
            ]}>
            {checklistConfirmed && (
              <Icon name="check" size={13} color={Colors.surfaceWhite} />
            )}
          </View>
          <Text style={styles.conditionText}>
            All items delivered in good condition
          </Text>
          {isChilled && (
            <View style={styles.tempBadge}>
              <Icon name="snow" size={11} color="#08759E" />
              <Text style={styles.tempBadgeText}>2.8°C</Text>
            </View>
          )}
        </Pressable>
      </Card>

      {/* Step 2: Store Manager Signature */}
      <View style={styles.stepSection}>
        <SignaturePad
          onConfirm={(svg) => setSignatureData(svg)}
          isConfirmed={Boolean(signatureData)}
        />
      </View>

      {/* Step 3: Delivery Photo */}
      <View style={styles.stepSection}>
        <CameraCapture
          onCapture={(uri) => setPhotoUri(uri)}
          imageUri={photoUri}
        />
      </View>

      {/* Optional Delivery Notes */}
      <View style={styles.notesCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.notesTitle}>Delivery note</Text>
          <Text style={styles.notesOptional}>Optional</Text>
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Goods received and checked by store manager"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          accessibilityLabel="Delivery note (optional)"
          style={styles.notesInput}
        />
      </View>

      {/* Celebration Completion Modal */}
      <Modal
        visible={showCelebration}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.celebrationOverlay}>
          <Animated.View
            entering={ZoomIn.duration(400)}
            style={styles.celebrationCard}>
            <View style={styles.celebrationRing}>
              <Icon name="check" size={42} color={Colors.surfaceWhite} />
            </View>
            <Text style={styles.celebrationTitle}>Delivery Completed!</Text>
            <Text style={styles.celebrationStore}>{storeName}</Text>
            <Text style={styles.celebrationSubtext}>
              Proof of delivery captured & saved to offline queue.
            </Text>
            <View style={styles.syncedPill}>
              <Icon name="shield" size={13} color={W.greenDark} />
              <Text style={styles.syncedPillText}>Local SQLite Record Queued</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    gap: 8,
  },
  completeButton: {
    minHeight: 52,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    boxShadow: Shadow.yellow,
  },
  completeButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  completeButtonText: {
    ...font(800),
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  stepBadge: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: '#FFF8DC',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  stepBadgeNumber: {
    ...font(800),
    fontSize: 19,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  stepBadgeLabel: {
    ...font(700),
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  checklistCard: {
    padding: 16,
    marginBottom: 14,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: Shadow.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCountBig: {
    ...font(800),
    fontSize: 28,
    lineHeight: 34,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  itemCountTotal: {
    ...font(700),
    fontSize: 18,
    color: '#9CA3AF',
  },
  itemCountLabel: {
    ...font(700),
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bigCheckCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: Colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 16px rgba(34, 197, 94, 0.28)',
  },
  conditionCheckbox: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  conditionCheckboxActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceWhite,
  },
  checkIconBoxChecked: {
    backgroundColor: Colors.successGreen,
    borderColor: Colors.successGreen,
  },
  conditionText: {
    flex: 1,
    ...font(700),
    fontSize: 11,
    color: '#15803D',
  },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tempBadgeText: {
    ...font(800),
    fontSize: 9,
    color: '#08759E',
  },
  stepSection: {
    marginBottom: 2,
  },
  notesCard: {
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 16,
    boxShadow: Shadow.sm,
  },
  notesTitle: {
    ...font(800),
    fontSize: 12,
    color: Colors.textPrimary,
  },
  notesOptional: {
    ...font(600),
    fontSize: 10,
    color: Colors.textSecondary,
  },
  notesInput: {
    minHeight: 70,
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEA',
    padding: 12,
    fontSize: 12,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    marginTop: 10,
    ...font(500),
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    boxShadow: Shadow.md,
  },
  celebrationRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    boxShadow: '0px 0px 0px 10px #EDFBF2',
  },
  celebrationTitle: {
    ...font(800),
    fontSize: 21,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  celebrationStore: {
    ...font(700),
    fontSize: 13,
    color: '#8A5900',
    marginTop: 4,
  },
  celebrationSubtext: {
    ...font(500),
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  syncedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: W.greenSoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 18,
  },
  syncedPillText: {
    ...font(700),
    fontSize: 10,
    color: W.greenDark,
  },
});

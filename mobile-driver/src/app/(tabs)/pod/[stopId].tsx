import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
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
import { ItemsStepper } from '@/features/pod/components/ItemsStepper';
import { StopEmptyState } from '@/features/pod/components/StopEmptyState';
import { findStop } from '@/features/pod/utils/findStop';
import type { CapturedPhoto } from '@/features/pod/utils/photoAsset';
import { useSyncStore } from '@/features/sync/store/syncStore';
import { buildPodPayload, podOutcome } from '@/features/sync/utils/payloads';
import { useTrip } from '@/features/trip/hooks/useTrip';
import { submitProofOfDelivery } from '@/features/trip/services/tripController';
import { padStop } from '@/utils/formatters';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

const OUTCOME_PILL = {
    delivered: { label: 'Full delivery', background: W.greenSoft, color: W.greenDark },
    partial: { label: 'Shortfall', background: W.orangeSoft, color: Colors.offlineText },
    failed: { label: 'Failed', background: '#FDECEC', color: '#B42318' },
} as const;

export default function PodScreen() {
    const insets = useSafeAreaInsets();
    const { stopId } = useLocalSearchParams<{ stopId?: string }>();
    const { stops, activeStop } = useTrip();
    const isOnline = useSyncStore((s) => s.isOnline);
    const stop = findStop(stops, stopId, activeStop);

    const [itemsDelivered, setItemsDelivered] = useState<number | null>(null);
    const [failed, setFailed] = useState(false);
    const [signaturePng, setSignaturePng] = useState<string | null>(null);
    const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!stop) {
        return (
            <Screen>
                <StopEmptyState icon="alert" title="Stop not found" message="This stop is not on your current trip." />
            </Screen>
        );
    }

    if (stop.status === 'COMPLETED' || stop.status === 'FAILED') {
        return (
            <Screen>
                <StopEmptyState
                    icon="check"
                    title="Proof of delivery recorded"
                    message={`${stop.storeName} is already closed.`}
                />
            </Screen>
        );
    }

    const itemsExpected = stop.itemCount;
    const delivered = failed ? 0 : itemsDelivered ?? itemsExpected;
    const outcome = podOutcome(itemsExpected, delivered, failed);
    const noteRequired = outcome !== 'delivered';
    const pill = OUTCOME_PILL[outcome];

    const handleCompleteDelivery = () => {
        setIsSubmitting(true);
        try {
            const payload = buildPodPayload({
                stopId: stop.id,
                itemsExpected,
                itemsDelivered: delivered,
                failed,
                notes: note,
                photo: photo ? { base64: photo.base64, mimeType: photo.mimeType } : null,
                signaturePng,
                isOnline,
            });
            submitProofOfDelivery(payload);
            router.replace({ pathname: '/pod/complete', params: { stopId: stop.id } });
        } catch (err) {
            setIsSubmitting(false);
            Alert.alert('Cannot complete delivery', err instanceof Error ? err.message : 'Please try again.');
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
                        accessibilityLabel={failed ? 'Record Failed Delivery' : 'Complete Delivery'}
                        style={({ pressed }) => [
                            styles.completeButton,
                            isSubmitting && { opacity: 0.7 },
                            pressed && !isSubmitting && styles.completeButtonPressed,
                        ]}>
                        <Text style={styles.completeButtonText}>
                            {isSubmitting ? 'Saving…' : failed ? 'Record Failed Delivery' : 'Complete Delivery ✓'}
                        </Text>
                    </Pressable>
                    <SafetyNote>
                        {isOnline
                            ? 'This notifies the Dispatcher and Store Manager'
                            : 'Offline – saved on this device and synced when back online'}
                    </SafetyNote>
                </View>
            }>
            <TitleRow
                center
                eyebrow={`STOP ${padStop(stop.sequence)} · ${stop.storeName.toUpperCase()}`}
                title="Proof of Delivery"
                subtitle={stop.orderNumber ? `Order ${stop.orderNumber}` : 'Confirm delivery details below'}
            />

            {/* Step 1: Items handed over */}
            <Card style={styles.checklistCard}>
                <View style={styles.rowBetween}>
                    <Label size={9} spacing={0.11}>
                        STEP 1 · ITEMS DELIVERED
                    </Label>
                    <Pill background={pill.background} color={pill.color} iconSize={13}>
                        {pill.label}
                    </Pill>
                </View>

                <View style={[styles.rowBetween, { marginTop: 12, marginBottom: 12 }]}>
                    <ItemsStepper
                        value={delivered}
                        max={itemsExpected}
                        disabled={failed}
                        onChange={setItemsDelivered}
                    />
                    {stop.temp === 'chilled' && (
                        <View style={styles.tempBadge}>
                            <Icon name="snow" size={11} color="#08759E" />
                            <Text style={styles.tempBadgeText}>Chilled</Text>
                        </View>
                    )}
                </View>

                <Pressable
                    onPress={() => setFailed(!failed)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: failed }}
                    style={[styles.conditionCheckbox, failed && styles.conditionCheckboxActive]}>
                    <View style={[styles.checkIconBox, failed && styles.checkIconBoxChecked]}>
                        {failed && <Icon name="check" size={13} color={Colors.surfaceWhite} />}
                    </View>
                    <Text style={styles.conditionText}>Delivery failed (store closed, refused…)</Text>
                </Pressable>
            </Card>

            {!failed && (
                <View style={styles.stepSection}>
                    <SignaturePad onConfirm={setSignaturePng} isConfirmed={Boolean(signaturePng)} />
                </View>
            )}

            <View style={styles.stepSection}>
                <CameraCapture onCapture={setPhoto} photo={photo} />
            </View>

            <View style={styles.notesCard}>
                <View style={styles.rowBetween}>
                    <Text style={styles.notesTitle}>Delivery note</Text>
                    <Text style={styles.notesOptional}>{noteRequired ? 'Required' : 'Optional'}</Text>
                </View>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={noteRequired ? 'Explain the shortfall or failure' : 'e.g. Goods checked by store manager'}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    maxLength={500}
                    numberOfLines={3}
                    accessibilityLabel="Delivery note"
                    style={styles.notesInput}
                />
            </View>
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
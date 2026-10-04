import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Card, Label, Pill } from '@/components/waypoint/ui';
import { stopDetails } from '@/data/mock';
import { db, initDatabase, type StopRecord } from '@/database/schema';
import { useQueueStore } from '@/store/queueStore';
import { Colors, font, Radius, Shadow, W } from '@/utils/theme';

export default function DeliveryCompleteScreen() {
    const insets = useSafeAreaInsets();
    const { completedStopId, nextStopId, stopId } = useLocalSearchParams<{
        completedStopId?: string;
        nextStopId?: string;
        stopId?: string;
    }>();

    const isOnline = useQueueStore((state) => state.isOnline);
    const pendingCount = useQueueStore((state) => state.pendingCount);

    const activeCompletedId = completedStopId ?? stopId;

    // Query completed stop from SQLite
    const completedStop = useMemo<StopRecord | null>(() => {
        try {
            if (activeCompletedId) {
                const found = db.getFirstSync<StopRecord>(
                    'SELECT * FROM stops WHERE id = ? OR stop_number = ? LIMIT 1;',
                    [activeCompletedId, Number(activeCompletedId) || 0]
                );
                if (found) return found;
            }
            // Fallback: latest completed stop
            return (
                db.getFirstSync<StopRecord>(
                    "SELECT * FROM stops WHERE status = 'COMPLETED' ORDER BY stop_number DESC LIMIT 1;"
                ) ??
                db.getFirstSync<StopRecord>(
                    'SELECT * FROM stops ORDER BY stop_number ASC LIMIT 1;'
                )
            );
        } catch (err) {
            console.warn('[CompleteScreen] Error querying completed stop:', err);
            return null;
        }
    }, [completedStopId]);

    // Query next pending stop from SQLite
    const nextStop = useMemo<StopRecord | null>(() => {
        try {
            if (nextStopId) {
                const found = db.getFirstSync<StopRecord>(
                    "SELECT * FROM stops WHERE (id = ? OR stop_number = ?) AND status = 'PENDING' LIMIT 1;",
                    [nextStopId, Number(nextStopId) || 0]
                );
                if (found) return found;
            }
            // Query the first pending stop in sequence
            return db.getFirstSync<StopRecord>(
                "SELECT * FROM stops WHERE status = 'PENDING' ORDER BY stop_number ASC LIMIT 1;"
            );
        } catch (err) {
            console.warn('[CompleteScreen] Error querying next stop:', err);
            return null;
        }
    }, [nextStopId]);

    // Formatted labels & timestamps
    const completedStopNumber = completedStop
        ? String(completedStop.stop_number).padStart(2, '0')
        : '02';
    const completedStore = completedStop?.store_name ?? 'Fresh Store #22';
    const completedItems = completedStop?.items_count ?? 28;

    const timestamp = useMemo(
        () =>
            new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        []
    );

    // Next stop metadata
    const nextStopNumber = nextStop
        ? String(nextStop.stop_number).padStart(2, '0')
        : null;
    const nextDetails = nextStop ? stopDetails[nextStopNumber ?? '03'] : null;
    const nextDistance = nextDetails?.distance ?? '4.8 km';

    // Dynamic ETA: Current time + 24 minutes
    const nextEta = useMemo(() => {
        const etaDate = new Date();
        etaDate.setMinutes(etaDate.getMinutes() + 24);
        return etaDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const handleViewNextStop = () => {
        if (!nextStop) return;
        router.navigate({
            pathname: '/current-stop',
            params: {
                stop: String(nextStop.stop_number).padStart(2, '0'),
                stopId: nextStop.id,
            },
        });
    };

    return (
        <Screen
            background={
                <LinearGradient
                    colors={[W.greenSoft, Colors.canvasBackground]}
                    locations={[0, 0.45]}
                    style={styles.backdropGradient}
                />
            }
            contentStyle={{ paddingBottom: Math.max(32, insets.bottom + 20) }}>
            {/* Section 1: Top Confirmation Badge */}
            <View style={styles.confirmationHero}>
                <View style={styles.celebrationRings}>
                    <View style={styles.celebrationCircle}>
                        <Icon name="check" size={38} color={Colors.surfaceWhite} />
                    </View>
                </View>

                <View style={styles.heroTagPill}>
                    <Text style={styles.heroTagText}>
                        STOP {completedStopNumber} • {timestamp}
                    </Text>
                </View>

                <Text style={styles.heroTitle}>Delivery Complete</Text>
                <Text style={styles.heroSubtitle}>{completedStore}</Text>
            </View>

            {/* Section 2: Delivery Summary Card */}
            <Card style={styles.summaryCard}>
                <View style={styles.summaryCardHead}>
                    <View style={{ flex: 1 }}>
                        <Label spacing={0.1}>DELIVERY SUMMARY</Label>
                        <Text style={styles.summaryStoreTitle}>{completedStore}</Text>
                    </View>
                    <Pill
                        background={W.greenSoft}
                        color={W.greenDark}
                        icon="check"
                        textSize={8.5}
                        height={26}>
                        Complete
                    </Pill>
                </View>

                {/* Row 1: Items delivered */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryRowLeft}>
                        <Icon name="box" size={17} color={Colors.textSecondary} />
                        <Text style={styles.summaryRowLabel}>Items delivered</Text>
                    </View>
                    <View style={styles.summaryRowRight}>
                        <Text style={styles.summaryRowValue}>
                            {completedItems} / {completedItems}
                        </Text>
                        <View style={styles.statusCheckSmall}>
                            <Icon name="check" size={12} color={W.greenDark} />
                        </View>
                    </View>
                </View>

                {/* Row 2: Signature */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryRowLeft}>
                        <Icon name="signature" size={17} color={Colors.textSecondary} />
                        <Text style={styles.summaryRowLabel}>Signature</Text>
                    </View>
                    <View style={styles.summaryRowRight}>
                        <Text style={styles.summaryRowValue}>Received</Text>
                        <View style={styles.statusCheckSmall}>
                            <Icon name="check" size={12} color={W.greenDark} />
                        </View>
                    </View>
                </View>

                {/* Row 3: Delivery photo */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryRowLeft}>
                        <Icon name="camera" size={17} color={Colors.textSecondary} />
                        <Text style={styles.summaryRowLabel}>Delivery photo</Text>
                    </View>
                    <View style={styles.summaryRowRight}>
                        <Text style={styles.summaryRowValue}>
                            {isOnline ? 'Uploaded' : 'Saved locally'}
                        </Text>
                        <View style={styles.statusCheckSmall}>
                            <Icon name="check" size={12} color={W.greenDark} />
                        </View>
                    </View>
                </View>

                {/* Row 4: Dispatcher sync */}
                <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                    <View style={styles.summaryRowLeft}>
                        <Icon
                            name={isOnline ? 'cloud' : 'clock'}
                            size={17}
                            color={isOnline ? W.greenDark : Colors.warningOrange}
                        />
                        <Text style={styles.summaryRowLabel}>Dispatcher sync</Text>
                    </View>
                    <View style={styles.summaryRowRight}>
                        {isOnline ? (
                            <>
                                <Text style={[styles.summaryRowValue, { color: W.greenDark }]}>
                                    Synced
                                </Text>
                                <View style={styles.statusCheckSmall}>
                                    <Icon name="check" size={12} color={W.greenDark} />
                                </View>
                            </>
                        ) : (
                            <View style={styles.syncPendingPill}>
                                <View style={styles.syncPendingDot} />
                                <Text style={styles.syncPendingText}>
                                    Pending sync ({pendingCount} in queue)
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Card>

            {/* Section 3: Next Stop Handover Card OR Route Complete */}
            {nextStop ? (
                <LinearGradient
                    colors={['#FFFBEB', Colors.surfaceWhite]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.nextStopCard}>
                    <View style={styles.nextStopHead}>
                        <View style={styles.nextStopBadge}>
                            <Text style={styles.nextStopBadgeText}>
                                UP NEXT • STOP {nextStopNumber}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.nextStoreRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nextStoreTitle}>{nextStop.store_name}</Text>
                            <View style={styles.nextStoreCityRow}>
                                <Icon name="pin" size={14} color={Colors.textSecondary} />
                                <Text style={styles.nextStoreCityText}>{nextStop.address}</Text>
                            </View>
                        </View>

                        <View style={styles.nextChevronBox}>
                            <Icon name="chevron" size={18} color={Colors.textPrimary} />
                        </View>
                    </View>

                    {/* 3-Column Metadata Bar */}
                    <View style={styles.nextMetricsBar}>
                        <View style={[styles.nextMetricItem, { flex: 1.3 }]}>
                            <Text style={styles.nextMetricLabel}>WINDOW</Text>
                            <Text style={styles.nextMetricValue}>{nextStop.window}</Text>
                        </View>

                        <View style={styles.nextMetricDivider} />

                        <View style={styles.nextMetricItem}>
                            <Text style={styles.nextMetricLabel}>DISTANCE</Text>
                            <Text style={styles.nextMetricValue}>{nextDistance}</Text>
                        </View>

                        <View style={styles.nextMetricDivider} />

                        <View style={styles.nextMetricItem}>
                            <Text style={styles.nextMetricLabel}>ETA</Text>
                            <Text style={[styles.nextMetricValue, { color: '#8A5900' }]}>
                                {nextEta}
                            </Text>
                        </View>
                    </View>

                    {/* Primary CTA Button */}
                    <Pressable
                        onPress={handleViewNextStop}
                        accessibilityRole="button"
                        accessibilityLabel="View Next Stop"
                        style={({ pressed }) => [
                            styles.viewNextButton,
                            pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
                        ]}>
                        <Text style={styles.viewNextButtonText}>View Next Stop</Text>
                        <Icon name="chevron" size={17} color={Colors.textPrimary} />
                    </Pressable>
                </LinearGradient>
            ) : (
                /* All Stops Completed State */
                <Card style={styles.allCompletedCard}>
                    <View style={styles.allCompletedCircle}>
                        <Icon name="route" size={28} color={W.greenDark} />
                    </View>
                    <Text style={styles.allCompletedTitle}>
                        Route Complete! All stops delivered.
                    </Text>
                    <Text style={styles.allCompletedSubtext}>
                        You have successfully completed all scheduled delivery drops for this shift.
                    </Text>
                    <Pressable
                        onPress={() => router.navigate('/history')}
                        accessibilityRole="button"
                        accessibilityLabel="Return to Shift Summary"
                        style={({ pressed }) => [
                            styles.viewNextButton,
                            { marginTop: 14 },
                            pressed && { opacity: 0.9 },
                        ]}>
                        <Text style={styles.viewNextButtonText}>Return to Shift Summary</Text>
                    </Pressable>
                </Card>
            )}

            {/* Section 4: Secondary Action & Safety Disclaimer */}
            <Pressable
                onPress={() => router.navigate('/route')}
                accessibilityRole="button"
                accessibilityLabel="Back to Route"
                style={({ pressed }) => [
                    styles.backToRouteButton,
                    pressed && { backgroundColor: '#F3F4F1' },
                ]}>
                <Text style={styles.backToRouteButtonText}>Back to Route</Text>
            </Pressable>

            <View style={styles.safetyPromptRow}>
                <Icon name="navigation" size={15} color={Colors.textSecondary} />
                <Text style={styles.safetyPromptText}>
                    Set up navigation before you start driving.
                </Text>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    backdropGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 340,
    },
    confirmationHero: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 20,
    },
    celebrationRings: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    celebrationCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.successGreen,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 8px 24px rgba(34, 197, 94, 0.35)',
    },
    heroTagPill: {
        backgroundColor: '#DCFCE7',
        paddingVertical: 3,
        paddingHorizontal: 9,
        borderRadius: 999,
        marginBottom: 6,
    },
    heroTagText: {
        ...font(800),
        fontSize: 9.5,
        color: '#15803D',
        letterSpacing: 0.6,
    },
    heroTitle: {
        ...font(800),
        fontSize: 24,
        lineHeight: 28,
        color: Colors.textPrimary,
        letterSpacing: -0.4,
    },
    heroSubtitle: {
        ...font(700),
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    summaryCard: {
        padding: 16,
        borderRadius: Radius.md,
        backgroundColor: Colors.surfaceWhite,
        borderWidth: 1,
        borderColor: Colors.border,
        boxShadow: Shadow.sm,
        marginBottom: 16,
    },
    summaryCardHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0EB',
        borderStyle: 'dashed',
    },
    summaryStoreTitle: {
        ...font(800),
        fontSize: 14,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    summaryRow: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F0',
    },
    summaryRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    summaryRowLabel: {
        ...font(600),
        fontSize: 11,
        color: Colors.textSecondary,
    },
    summaryRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryRowValue: {
        ...font(700),
        fontSize: 11,
        color: Colors.textPrimary,
    },
    statusCheckSmall: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: W.greenSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncPendingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    syncPendingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.warningOrange,
    },
    syncPendingText: {
        ...font(700),
        fontSize: 10,
        color: '#B45309',
    },
    nextStopCard: {
        borderRadius: Radius.lg,
        padding: 16,
        borderWidth: 1.5,
        borderColor: Colors.primaryYellow,
        boxShadow: '0px 10px 28px rgba(245, 158, 11, 0.16)',
        marginBottom: 12,
    },
    nextStopHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    nextStopBadge: {
        backgroundColor: '#FFF4DD',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    nextStopBadgeText: {
        ...font(800),
        fontSize: 9,
        color: '#8A5900',
        letterSpacing: 0.8,
    },
    nextStoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    nextStoreTitle: {
        ...font(800),
        fontSize: 18,
        lineHeight: 22,
        color: Colors.textPrimary,
    },
    nextStoreCityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 3,
    },
    nextStoreCityText: {
        ...font(500),
        fontSize: 11,
        color: Colors.textSecondary,
    },
    nextChevronBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: Colors.surfaceWhite,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        boxShadow: Shadow.sm,
    },
    nextMetricsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceWhite,
        borderWidth: 1,
        borderColor: '#F0E6CC',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginBottom: 14,
    },
    nextMetricItem: {
        flex: 1,
        paddingHorizontal: 6,
    },
    nextMetricDivider: {
        width: 1,
        height: '75%',
        backgroundColor: '#EBE2CC',
    },
    nextMetricLabel: {
        ...font(800),
        fontSize: 8,
        color: '#8A5900',
        letterSpacing: 0.8,
    },
    nextMetricValue: {
        ...font(700),
        fontSize: 11,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    viewNextButton: {
        minHeight: 48,
        borderRadius: Radius.sm,
        backgroundColor: Colors.primaryYellow,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        boxShadow: Shadow.yellow,
    },
    viewNextButtonText: {
        ...font(800),
        fontSize: 14,
        color: Colors.textPrimary,
    },
    allCompletedCard: {
        padding: 20,
        borderRadius: Radius.md,
        backgroundColor: Colors.surfaceWhite,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        marginBottom: 12,
        boxShadow: Shadow.sm,
    },
    allCompletedCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: W.greenSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    allCompletedTitle: {
        ...font(800),
        fontSize: 16,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    allCompletedSubtext: {
        ...font(500),
        fontSize: 11,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    backToRouteButton: {
        minHeight: 44,
        borderRadius: Radius.sm,
        backgroundColor: Colors.surfaceWhite,
        borderWidth: 1.5,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        boxShadow: Shadow.sm,
    },
    backToRouteButtonText: {
        ...font(700),
        fontSize: 13,
        color: Colors.textPrimary,
    },
    safetyPromptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 14,
    },
    safetyPromptText: {
        ...font(500),
        fontSize: 11,
        color: Colors.textSecondary,
    },
});
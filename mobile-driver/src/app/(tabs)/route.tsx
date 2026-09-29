// Daily itinerary view.
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Button, Card, Label, SectionHeading, TitleRow, WText } from '@/components/waypoint/ui';
import { driver, routeStops, truckPhoto, type StopKind } from '@/data/mock';
import { Radius, Shadow, W } from '@/utils/theme';

const TOTAL_STOPS = 6;
const COMPLETED = 2;

const statusStyle: Record<StopKind, { bg: string; fg: string }> = {
  done: { bg: W.greenSoft, fg: W.greenDark },
  current: { bg: W.yellow, fg: '#725000' },
  upcoming: { bg: '#f4f4f1', fg: W.gray },
};

export default function RouteScreen() {
  return (
    <Screen>
      <TitleRow
        eyebrow="DAILY ITINERARY"
        title="Today's Route"
        subtitle={`${driver.truck} · ${TOTAL_STOPS} Stops`}
        aside={
          <View style={styles.dateTile}>
            <WText size={20} weight={800} style={{ lineHeight: 22 }}>
              14
            </WText>
            <WText size={9} weight={800} color={W.gray} style={{ marginTop: 4 }}>
              OCT
            </WText>
          </View>
        }
      />

      <View style={styles.vehicleCard}>
        <Image
          source={{ uri: truckPhoto }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={{ top: '57%' }}
          accessibilityLabel="White TRK-024 freight truck on its route"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.06)', 'rgba(16,18,18,0.15)', 'rgba(17,18,18,0.92)']}
          locations={[0, 0.38, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255,200,61,0.35)', 'rgba(255,200,61,0)']}
          locations={[0, 0.52]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.vehicleTop}>
          <View style={styles.truckId}>
            <WText size={12} weight={800}>
              {driver.truck}
            </WText>
          </View>
          <WText size={8} color="rgba(255,255,255,0.8)" style={styles.credit}>
            Photo: A. Balashevsky
          </WText>
        </View>
        <View style={styles.vehicleCopy}>
          <WText size={20} weight={800} spacing={-0.02} color={W.white} style={{ marginBottom: 9 }}>
            Heavy Freight Truck
          </WText>
          <View style={styles.vehicleMeta}>
            <View style={{ flex: 1 }}>
              <Label spacing={0.12} color="rgba(255,255,255,0.65)">
                DRIVER
              </Label>
              <WText size={12} weight={700} color={W.white} style={{ marginTop: 2 }}>
                {driver.name}
              </WText>
            </View>
            <View style={{ flex: 1.35 }}>
              <Label spacing={0.12} color="rgba(255,255,255,0.65)">
                LOAD
              </Label>
              <WText size={12} weight={700} color={W.white} style={{ marginTop: 2 }}>
                28 Items · 420 kg
              </WText>
            </View>
          </View>
          <View style={styles.departure}>
            <Icon name="clock" size={17} color={W.white} />
            <WText size={10} color={W.white}>
              Departed 06:30 AM
            </WText>
            <WText size={10} weight={700} color="#a6f4bf" style={{ marginLeft: 'auto' }}>
              On schedule
            </WText>
          </View>
        </View>
      </View>

      <Card style={styles.progressCard}>
        <View style={styles.progressHead}>
          <View>
            <Label size={9} spacing={0.11}>
              ROUTE PROGRESS
            </Label>
            <WText size={14} weight={700} style={{ marginTop: 3 }}>
              {COMPLETED} of {TOTAL_STOPS} Stops Completed
            </WText>
          </View>
          <WText size={19} weight={800} color={W.amber}>
            {Math.round((COMPLETED / TOTAL_STOPS) * 100)}%
          </WText>
        </View>
        <View style={styles.routeLine}>
          <View style={styles.track} />
          <View style={[styles.track, styles.trackDone]} />
          {Array.from({ length: TOTAL_STOPS }, (_, i) => i + 1).map((i) => (
            <View
              key={i}
              style={[styles.dot, i <= COMPLETED && styles.dotDone, i === COMPLETED + 1 && styles.dotNext]}>
              {i <= COMPLETED && <Icon name="check" size={12} color={W.white} />}
            </View>
          ))}
        </View>
        <View style={styles.nextTime}>
          <Icon name="clock" size={16} color={W.gray} />
          <WText size={11} color={W.gray}>
            Next delivery
          </WText>
          <WText size={11} weight={700} style={{ marginLeft: 'auto' }}>
            7:10 AM
          </WText>
        </View>
      </Card>

      <SectionHeading title="Today's stops" meta="4 remaining" />
      <View style={{ gap: 10 }}>
        {routeStops.map((stop) => {
          const status = statusStyle[stop.kind];
          const card = (
            <>
              <View style={styles.stopNumber}>
                <Label spacing={0.1}>STOP</Label>
                <WText size={20} weight={700} style={{ marginTop: 3 }}>
                  {stop.no}
                </WText>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.stopTitleRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <WText size={14} weight={700} numberOfLines={1}>
                      {stop.store}
                    </WText>
                    <View style={styles.inline}>
                      <Icon name="pin" size={14} color={W.gray} />
                      <WText size={10} color={W.gray}>
                        {stop.city}
                      </WText>
                    </View>
                  </View>
                  <View style={[styles.stopStatus, { backgroundColor: status.bg }]}>
                    {stop.kind === 'done' && <Icon name="check" size={13} color={status.fg} />}
                    <WText size={8} weight={800} color={status.fg}>
                      {stop.status}
                    </WText>
                  </View>
                </View>
                <View style={styles.stopDetails}>
                  <View style={styles.detailChip}>
                    <Icon name="clock" size={15} />
                    <WText size={9} weight={700}>
                      {stop.time}
                    </WText>
                  </View>
                  <View style={[styles.detailChip, stop.temp === 'Chilled' && { backgroundColor: W.blueSoft }]}>
                    {stop.temp === 'Chilled' && <Icon name="snow" size={15} color={W.blueText} />}
                    <WText size={9} weight={700} color={stop.temp === 'Chilled' ? W.blueText : W.charcoal}>
                      {stop.temp}
                    </WText>
                  </View>
                </View>
                {stop.kind === 'current' && (
                  <Button
                    onPress={() => router.navigate({ pathname: '/current-stop', params: { stop: stop.no } })}
                    trailingIcon="chevron"
                    height={42}
                    textSize={12}
                    style={{ marginTop: 12 }}>
                    Open Stop
                  </Button>
                )}
              </View>
            </>
          );
          return stop.kind === 'current' ? (
            <LinearGradient
              key={stop.no}
              colors={[W.yellowSoft, W.white]}
              locations={[0, 0.6]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.stopCard, styles.stopCurrent]}>
              {card}
            </LinearGradient>
          ) : (
            <Card key={stop.no} style={[styles.stopCard, stop.kind === 'done' && { opacity: 0.8 }]}>
              {card}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFCF3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStatusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FAFAFA',
  },
  headerTextCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D9345',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A87900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dateBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dateBadgeNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  dateBadgeMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  truckCardContainer: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  truckCardBg: {
    width: '100%',
    height: '100%',
  },
  truckCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
  },
  truckCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  yellowBadge: {
    backgroundColor: '#FFCF3A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  yellowBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  photoCredit: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  truckCardContent: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  truckTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  truckStatsRow: {
    flexDirection: 'row',
  },
  truckStatCol: {
    marginRight: 24,
  },
  truckStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
    letterSpacing: 1,
  },
  truckStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  truckCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  departedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  statusBadgeGreen: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#76E49A',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  eyebrowTextGray: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  progressPercent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#A87900',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  stepCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineCompleted: {
    flex: 1,
    height: 3,
    backgroundColor: '#34C759',
  },
  stepCurrentOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFCF3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCurrentInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
  },
  lineUpcoming: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E5EA',
  },
  stepUpcoming: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  nextDeliveryRow: {
=======
  dateTile: {
    width: 48,
    height: 54,
    borderRadius: 15,
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.lightGray,
    boxShadow: Shadow.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCard: {
    height: 235,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    boxShadow: Shadow.md,
    marginBottom: 14,
    backgroundColor: W.charcoal,
  },
  vehicleTop: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  truckId: {
    backgroundColor: W.yellow,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  credit: {
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  vehicleCopy: {
    ...StyleSheet.absoluteFill,
    padding: 18,
    justifyContent: 'flex-end',
  },
  vehicleMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  departure: {
    minHeight: 35,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
  },
  progressCard: {
    padding: 17,
    marginBottom: 21,
  },
  progressHead: {
>>>>>>> 10224c9e5f222ab3ec148e0a616311123a47a101
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
<<<<<<< HEAD
  nextDeliveryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDeliveryText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  nextDeliveryTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  stopsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  stopsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  stopsRemaining: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 2,
  },
  stopsList: {
    paddingBottom: 20,
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stopIndexCol: {
    width: 50,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  stopIndexLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C7C7CC',
    letterSpacing: 1,
    marginBottom: 4,
  },
  stopIndexNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  stopCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stopCardCurrent: {
    borderColor: '#FFCF3A',
    shadowColor: '#FFCF3A',
    shadowOpacity: 0.15,
  },
  stopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  stopBadgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopBadgeCompletedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D9345',
    marginLeft: 4,
  },
  stopBadgeCurrent: {
    backgroundColor: '#FFCF3A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopBadgeCurrentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A87900',
  },
  stopBadgeUpcoming: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopBadgeUpcomingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  stopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopLocationText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  stopTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stopTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stopTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  stopTagChilled: {
    backgroundColor: '#E5F1FF',
  },
  stopTagAmbient: {
    backgroundColor: '#F2F2F7',
  },
  openStopButton: {
    backgroundColor: '#FFCF3A',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 16,
  },
  openStopButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginRight: 4,
  }
=======
  routeLine: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
    marginHorizontal: 3,
  },
  track: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: W.lightGray,
  },
  trackDone: {
    right: undefined,
    width: '30%',
    backgroundColor: W.green,
  },
  dot: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: W.lightGray,
    backgroundColor: W.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: W.green,
    borderColor: W.green,
  },
  dotNext: {
    borderColor: W.yellow,
    boxShadow: `0px 0px 0px 4px ${W.yellowSoft}`,
  },
  nextTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stopCard: {
    padding: 14,
    flexDirection: 'row',
    gap: 11,
  },
  stopCurrent: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: W.yellow,
    boxShadow: '0px 9px 24px rgba(245,158,11,0.12)',
  },
  stopNumber: {
    width: 43,
    borderRightWidth: 1,
    borderRightColor: W.lightGray,
  },
  stopTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 7,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stopStatus: {
    height: 23,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 99,
    paddingHorizontal: 7,
  },
  stopDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },
  detailChip: {
    minHeight: 26,
    paddingHorizontal: 7,
    borderRadius: 7,
    backgroundColor: W.muted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
>>>>>>> 10224c9e5f222ab3ec148e0a616311123a47a101
});

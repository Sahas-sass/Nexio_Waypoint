// Active stop details and access conditions.
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { Screen } from '@/components/waypoint/chrome';
import { Icon, type IconName } from '@/components/waypoint/icon';
import {
  Button,
  Card,
  Label,
  SafetyNote,
  SectionHeading,
  StatusDot,
  TitleRow,
  WText,
} from '@/components/waypoint/ui';
import { stopDetails } from '@/data/mock';
import { Radius, Shadow, W } from '@/utils/theme';

export default function CurrentStopScreen() {
  const params = useLocalSearchParams<{ stop?: string }>();
  const stop = stopDetails[params.stop ?? '02'] ?? stopDetails['02'];

  return (
    <Screen
      footer={
        <Button
          onPress={() => router.navigate({ pathname: '/pod/[stopId]', params: { stopId: stop.number } })}
          trailingIcon="chevron">
          Start Delivery
        </Button>
      }>
      <TitleRow
        center
        eyebrow={`CURRENT DELIVERY · STOP ${stop.number}`}
        title={stop.store}
        subtitle={stop.city}
        subtitleIcon="pin"
        aside={
          <View style={styles.stopBadge}>
            <WText size={19} weight={800}>
              {stop.number}
            </WText>
            <WText size={8} color={W.gray}>
              OF 6
            </WText>
          </View>
        }
      />

      <LinearGradient
        colors={[W.yellow, W.brightYellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.windowCard}>
        <View>
          <Label size={9} spacing={0.08} color={W.charcoal}>
            DELIVERY WINDOW
          </Label>
          <WText size={20} weight={700} style={{ marginTop: 4 }}>
            {stop.window}
          </WText>
        </View>
        <View style={styles.onTime}>
          <StatusDot color={W.green} />
          <WText size={10} weight={800} color={W.greenDark}>
            On Time
          </WText>
        </View>
      </LinearGradient>

      <Card style={styles.mapCard}>
        <View style={styles.map}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <Path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={1} />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grid)" />
          </Svg>
          <View style={[styles.road, styles.roadA]} />
          <View style={[styles.road, styles.roadB]} />
          <View style={[styles.road, styles.roadC]} />
          <View style={styles.mapPin}>
            <View style={{ transform: [{ rotate: '45deg' }] }}>
              <Icon name="pin" size={20} />
            </View>
          </View>
          <View style={styles.youAreHere}>
            <View style={styles.youDot} />
            <WText size={8} weight={800}>
              You
            </WText>
          </View>
        </View>
        <View style={styles.locationCopy}>
          <View style={{ flex: 1 }}>
            <WText size={13} weight={700}>
              {stop.store}
            </WText>
            <WText size={9} color={W.gray} style={{ marginTop: 3 }}>
              {stop.address}
            </WText>
          </View>
          <WText size={11} weight={800}>
            {stop.distance}
          </WText>
        </View>
        <Button variant="secondary" icon="navigation" height={43}>
          Open Navigation
        </Button>
      </Card>

      <SectionHeading title="Access conditions" meta="Read before arrival" />
      <View style={styles.accessGrid}>
        <AccessCard icon="alert" title="Rear Dock" detail="Enter from Chapel Lane" important />
        <AccessCard icon="navigation" title="Van Access Only" detail="Height restriction" />
        <AccessCard
          icon="clock"
          title="Loading Bay: 7:45–8:30 AM"
          detail="Bay 3 reserved for your vehicle"
          wide
        />
      </View>

      <View style={styles.contactRow}>
        <View style={styles.contactAvatar}>
          <WText size={11} weight={800}>
            NR
          </WText>
        </View>
        <View style={{ flex: 1 }}>
          <Label spacing={0.08}>STORE MANAGER</Label>
          <WText size={11} weight={700} style={{ marginTop: 2 }}>
            Nimal Rathnayake
          </WText>
        </View>
        <Button variant="ghost" height={40} style={{ width: 60, paddingHorizontal: 0 }}>
          Call
        </Button>
      </View>

      <SectionHeading title="Delivery summary" />
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <SummaryStat icon="box" value="28" unit="Items" />
          <SummaryStat icon="weight" value="420" unit="kg" />
          <SummaryStat icon="box" value="2.4" unit="m³" last />
        </View>
        <View style={styles.refrigerated}>
          <Icon name="snow" color={W.blueText} />
          <View>
            <WText size={11} weight={700} color={W.blueText}>
              Keep Refrigerated
            </WText>
            <WText size={9} color={W.blueText}>
              2–5°C chilled load
            </WText>
          </View>
        </View>
      </Card>

      <SafetyNote>Only interact when safely parked.</SafetyNote>
    </Screen>
  );
}

function AccessCard({
  icon,
  title,
  detail,
  important,
  wide,
}: {
  icon: IconName;
  title: string;
  detail: string;
  important?: boolean;
  wide?: boolean;
}) {
  return (
    <View style={[styles.accessCard, important && styles.accessImportant, wide && styles.accessWide]}>
      <Icon name={icon} color="#b26b00" />
      <View style={{ flex: 1 }}>
        <WText size={11} weight={700}>
          {title}
        </WText>
        <WText size={9} color={W.gray} style={{ marginTop: 3, lineHeight: 9 * 1.4 }}>
          {detail}
        </WText>
      </View>
    </View>
  );
}

function SummaryStat({
  icon,
  value,
  unit,
  last,
}: {
  icon: IconName;
  value: string;
  unit: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.summaryStat, !last && styles.summaryDivider]}>
      <Icon name={icon} color="#a66b00" />
      <WText size={16} weight={700} style={{ marginTop: 3 }}>
        {value}
      </WText>
      <WText size={9} color={W.gray}>
        {unit}
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  stopBadge: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: W.yellowSoft,
    borderWidth: 1,
    borderColor: '#f7dfa0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowCard: {
    padding: 17,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 10px 25px rgba(245,158,11,0.17)',
  },
  onTime: {
    minHeight: 31,
    paddingHorizontal: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapCard: {
    padding: 8,
    marginBottom: 20,
  },
  map: {
    height: 140,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#edf1e9',
  },
  road: {
    position: 'absolute',
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: '#dce2d8',
    boxShadow: '0px 0px 0px 2px rgba(255,255,255,0.5)',
  },
  roadA: {
    width: '120%',
    height: 14,
    left: '-10%',
    top: '55%',
    transform: [{ rotate: '-7deg' }],
  },
  roadB: {
    height: '120%',
    width: 12,
    left: '27%',
    top: '-10%',
    transform: [{ rotate: '19deg' }],
  },
  roadC: {
    height: '140%',
    width: 10,
    right: '19%',
    top: '-12%',
    transform: [{ rotate: '-33deg' }],
  },
  mapPin: {
    position: 'absolute',
    left: '57%',
    top: '36%',
    width: 38,
    height: 38,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomLeftRadius: 4,
    backgroundColor: W.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
    boxShadow: '0px 7px 15px rgba(32,33,36,0.2)',
  },
  youAreHere: {
    position: 'absolute',
    left: '20%',
    bottom: '19%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: W.white,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 99,
    boxShadow: Shadow.sm,
  },
  youDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4e9bf5',
    boxShadow: '0px 0px 0px 3px rgba(78,155,245,0.2)',
  },
  locationCopy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 7,
  },
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  accessCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 80,
    padding: 12,
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  accessImportant: {
    backgroundColor: W.orangeSoft,
    borderColor: '#f8dca9',
  },
  accessWide: {
    flexBasis: '100%',
    minHeight: 64,
    alignItems: 'center',
  },
  contactRow: {
    minHeight: 64,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 16,
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 20,
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ecece8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 5,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    borderRightWidth: 1,
    borderRightColor: W.lightGray,
  },
  refrigerated: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: W.blueSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
});

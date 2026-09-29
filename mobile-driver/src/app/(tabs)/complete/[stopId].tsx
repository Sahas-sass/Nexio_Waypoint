// Delivery completion summary and hand-off to the next stop.
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon, type IconName } from '@/components/waypoint/icon';
import { Button, Card, Eyebrow, Label, PageTitle, Pill, SafetyNote, WText } from '@/components/waypoint/ui';
import { stopDetails } from '@/data/mock';
import { Radius, Shadow, W } from '@/utils/theme';

const receipt: { icon: IconName; label: string; value: string; check?: boolean }[] = [
  { icon: 'box', label: 'Items delivered', value: '28 / 28' },
  { icon: 'signature', label: 'Signature', value: 'Received', check: true },
  { icon: 'camera', label: 'Delivery photo', value: 'Uploaded', check: true },
  { icon: 'cloud', label: 'Dispatcher sync', value: 'Synced', check: true },
];

export default function CompleteScreen() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>();
  const stop = stopDetails[stopId] ?? stopDetails['02'];
  const next = stopDetails['03'];

  return (
    <Screen
      background={
        <LinearGradient
          colors={[W.greenSoft, W.offWhite]}
          locations={[0, 1]}
          style={styles.backdrop}
        />
      }>
      <View style={styles.hero}>
        <View style={styles.rings}>
          <View style={styles.ringInner}>
            <Icon name="check" size={40} color={W.white} />
          </View>
        </View>
        <Eyebrow color={W.greenDark}>STOP {stop.number} · 8:24 AM</Eyebrow>
        <PageTitle>Delivery Complete</PageTitle>
        <WText size={13} weight={700} color={W.gray} style={{ marginTop: 5 }}>
          {stop.store}
        </WText>
      </View>

      <Card style={styles.receipt}>
        <View style={styles.receiptHead}>
          <View>
            <Label spacing={0.1}>DELIVERY SUMMARY</Label>
            <WText size={13} weight={700} style={{ marginTop: 3 }}>
              {stop.store}
            </WText>
          </View>
          <Pill background={W.greenSoft} color={W.greenDark} icon="check" textSize={8} height={25}>
            Complete
          </Pill>
        </View>
        {receipt.map((row, index) => (
          <View key={row.label} style={[styles.receiptRow, index === receipt.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.inline}>
              <Icon name={row.icon} color={W.gray} />
              <WText size={10} color={W.gray}>
                {row.label}
              </WText>
            </View>
            <View style={styles.inline}>
              {row.check && <Icon name="check" size={15} color={W.green} />}
              <WText size={10} weight={700}>
                {row.value}
              </WText>
            </View>
          </View>
        ))}
      </Card>

      <LinearGradient
        colors={['#fff7d1', W.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.nextCard}>
        <Label size={9} spacing={0.1} color="#966500">
          UP NEXT · STOP {next.number}
        </Label>
        <View style={[styles.rowBetween, { marginTop: 10 }]}>
          <View>
            <WText size={18} weight={700}>
              {next.store}
            </WText>
            <View style={[styles.inline, { gap: 3, marginTop: 4 }]}>
              <Icon name="pin" size={15} color={W.gray} />
              <WText size={10} color={W.gray}>
                {next.city}
              </WText>
            </View>
          </View>
          <View style={styles.nextArrow}>
            <Icon name="chevron" />
          </View>
        </View>
        <View style={styles.metrics}>
          <Metric label="WINDOW" value="9:00–10:00 AM" flex={1.35} />
          <Metric label="DISTANCE" value={next.distance} />
          <Metric label="ETA" value="8:48 AM" accent last />
        </View>
        <Button
          icon="navigation"
          onPress={() => router.navigate({ pathname: '/current-stop', params: { stop: next.number } })}>
          View Next Stop
        </Button>
      </LinearGradient>

      <Button variant="ghost" style={{ marginTop: 5 }} onPress={() => router.navigate('/route')}>
        Back to Route
      </Button>
      <SafetyNote>Set up navigation before you start driving.</SafetyNote>
    </Screen>
  );
}

function Metric({
  label,
  value,
  flex = 1,
  accent,
  last,
}: {
  label: string;
  value: string;
  flex?: number;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.metric, { flex }, !last && styles.metricDivider, label !== 'WINDOW' && { paddingLeft: 10 }]}>
      <Label size={7} spacing={0.08}>
        {label}
      </Label>
      <WText size={10} weight={700} color={accent ? '#9d6800' : W.charcoal} style={{ marginTop: 3 }}>
        {value}
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 330,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 7,
    paddingBottom: 23,
  },
  rings: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(34,197,94,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  ringInner: {
    width: 59,
    height: 59,
    borderRadius: 30,
    backgroundColor: W.green,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 25px rgba(34,197,94,0.25)',
  },
  receipt: {
    padding: 15,
    marginBottom: 15,
  },
  receiptHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: W.lightGray,
  },
  receiptRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: W.divider,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextCard: {
    borderWidth: 1.5,
    borderColor: W.yellow,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 9,
    boxShadow: '0px 10px 27px rgba(245,158,11,0.12)',
  },
  nextArrow: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: W.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadow.sm,
  },
  metrics: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  metric: {
    paddingRight: 5,
  },
  metricDivider: {
    borderRightWidth: 1,
    borderRightColor: '#eadca5',
  },
});

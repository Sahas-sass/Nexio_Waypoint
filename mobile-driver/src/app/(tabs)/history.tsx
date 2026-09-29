// Delivery history and metrics.
import { Fragment, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Card, Label, TitleRow, WText } from '@/components/waypoint/ui';
import { driver, historyDeliveries } from '@/data/mock';
import { W } from '@/utils/theme';

const filters = ['All', 'Completed', 'Exceptions'] as const;

const summary = [
  { label: 'COMPLETED', value: '11', note: '92% success' },
  { label: 'ITEMS DELIVERED', value: '286', note: '2,840 kg total' },
  { label: 'ON-TIME RATE', value: '96%', note: '+3% this week' },
];

export default function HistoryScreen() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  const deliveries = historyDeliveries.filter((d) => {
    if (filter === 'Completed') return d.status === 'Complete';
    if (filter === 'Exceptions') return d.status !== 'Complete';
    return true;
  });
  const firstYesterday = deliveries.findIndex((d) => d.time.startsWith('Yesterday'));

  return (
    <Screen>
      <TitleRow
        eyebrow="DELIVERY RECORDS"
        title="History"
        subtitle="Your recent completed stops"
        aside={
          <View style={styles.total}>
            <WText size={20} weight={800}>
              12
            </WText>
            <Label size={7} spacing={0.06}>
              THIS WEEK
            </Label>
          </View>
        }
      />

      <View style={styles.summary}>
        {summary.map((item) => (
          <Card key={item.label} style={styles.summaryCard}>
            <Label size={7} spacing={0.07}>
              {item.label}
            </Label>
            <WText size={19} weight={700} style={{ marginTop: 8 }}>
              {item.value}
            </WText>
            <WText size={7} weight={700} color={W.greenDark} style={{ marginTop: 2 }}>
              {item.note}
            </WText>
          </Card>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}>
              <WText size={10} weight={800} color={active ? '#604500' : W.gray}>
                {f}
              </WText>
            </Pressable>
          );
        })}
      </ScrollView>

      {firstYesterday !== 0 && deliveries.length > 0 && <DateHeading day="Today" date={driver.dateLabel} />}
      <View style={{ gap: 8 }}>
        {deliveries.map((delivery, index) => {
          const shortfall = delivery.status === 'Shortfall';
          return (
            <Fragment key={`${delivery.store}-${delivery.time}`}>
              {index === firstYesterday && (
                <DateHeading day="Yesterday" date="Sunday, 13 October" divider={index > 0} />
              )}
              <Card style={styles.card}>
                <View style={[styles.check, shortfall && { backgroundColor: W.orangeSoft }]}>
                  <Icon
                    name={shortfall ? 'alert' : 'check'}
                    size={18}
                    color={shortfall ? W.amber : W.greenDark}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.cardTop}>
                    <View style={styles.stopTag}>
                      <WText size={7} weight={800} color="#986700">
                        {delivery.stop.toUpperCase()}
                      </WText>
                    </View>
                    <WText size={8} color={W.gray}>
                      {delivery.time}
                    </WText>
                  </View>
                  <WText size={12} weight={700} style={{ marginTop: 6 }}>
                    {delivery.store}
                  </WText>
                  <View style={[styles.inline, { marginTop: 3 }]}>
                    <Icon name="pin" size={13} color={W.gray} />
                    <WText size={8} color={W.gray}>
                      {delivery.city}
                    </WText>
                  </View>
                  <View style={[styles.inline, { gap: 6, marginTop: 7 }]}>
                    <View style={styles.meta}>
                      <WText size={7} weight={700} color={W.gray}>
                        {delivery.items}
                      </WText>
                    </View>
                    <View style={[styles.meta, delivery.type === 'Chilled' && { backgroundColor: W.blueSoft }]}>
                      {delivery.type === 'Chilled' && <Icon name="snow" size={12} color={W.blueText} />}
                      <WText size={7} weight={700} color={delivery.type === 'Chilled' ? W.blueText : W.gray}>
                        {delivery.type}
                      </WText>
                    </View>
                  </View>
                </View>
                <Icon name="chevron" size={18} color="#b2b5b9" />
              </Card>
            </Fragment>
          );
        })}
      </View>

      <View style={styles.note}>
        <Icon name="cloud" size={18} color={W.greenDark} />
        <View>
          <WText size={10} weight={700} color={W.greenDark} style={{ marginBottom: 2 }}>
            All records synchronized
          </WText>
          <WText size={8} color={W.greenDark}>
            Last synced today at 8:25 AM
          </WText>
        </View>
      </View>
    </Screen>
  );
}

function DateHeading({ day, date, divider }: { day: string; date: string; divider?: boolean }) {
  return (
    <View style={[styles.dateHeading, divider && { marginTop: 4, marginBottom: 3 }]}>
      <WText size={14} weight={800}>
        {day}
      </WText>
      <WText size={8} weight={600} color={W.gray}>
        {date}
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  total: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: W.yellowSoft,
    borderWidth: 1,
    borderColor: '#f7dfa0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minHeight: 91,
    borderRadius: 15,
    paddingVertical: 11,
    paddingHorizontal: 9,
  },
  filters: {
    gap: 7,
    marginBottom: 19,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: W.lightGray,
    backgroundColor: W.white,
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: W.yellow,
    backgroundColor: W.yellow,
  },
  dateHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 2,
    marginBottom: 9,
  },
  card: {
    minHeight: 112,
    borderRadius: 17,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  check: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: W.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopTag: {
    backgroundColor: W.yellowSoft,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 99,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    minHeight: 21,
    borderRadius: 7,
    backgroundColor: W.muted,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  note: {
    minHeight: 55,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: W.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
});

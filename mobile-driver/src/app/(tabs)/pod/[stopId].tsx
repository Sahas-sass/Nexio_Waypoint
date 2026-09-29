// Proof of Delivery flow for a delivery stop.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { CameraCapture } from '@/components/pod/CameraCapture';
import { SignaturePad } from '@/components/pod/SignaturePad';
import { Screen } from '@/components/waypoint/chrome';
import { Icon } from '@/components/waypoint/icon';
import { Button, Card, Label, Pill, TitleRow, WText } from '@/components/waypoint/ui';
import { deliveryItems, stopDetails } from '@/data/mock';
import { font, Radius, W } from '@/utils/theme';

export default function PodScreen() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>();
  const stop = stopDetails[stopId] ?? stopDetails['02'];
  const [signed, setSigned] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [note, setNote] = useState('Goods received and checked by store manager.');

  return (
    <Screen
      contentStyle={{ paddingBottom: 130 }}
      footer={
        <>
          <Button
            onPress={() => router.navigate({ pathname: '/complete/[stopId]', params: { stopId: stop.number } })}
            trailingIcon="check">
            Complete Delivery
          </Button>
          <WText size={8} color={W.gray} style={{ textAlign: 'center', marginTop: 5 }}>
            This notifies the Dispatcher and Store Manager
          </WText>
        </>
      }>
      <TitleRow
        center
        eyebrow={`STOP ${stop.number} · ${stop.store.toUpperCase()}`}
        title="Proof of Delivery"
        subtitle="Confirm delivery details below"
        aside={
          <View style={styles.progress}>
            <WText size={19} weight={800}>
              2/3
            </WText>
            <WText size={8} color={W.gray}>
              STEPS
            </WText>
          </View>
        }
      />

      <Card style={styles.checklist}>
        <View style={styles.rowBetween}>
          <Label size={9} spacing={0.11}>
            DELIVERY CHECKLIST
          </Label>
          <Pill background={W.greenSoft} color={W.greenDark} icon="check" iconSize={14}>
            Verified
          </Pill>
        </View>
        <View style={[styles.rowBetween, { marginTop: 13, marginBottom: 10 }]}>
          <View>
            <WText size={28} weight={700} spacing={-0.04}>
              28 <WText size={17} weight={700} color="#a9adb4">/ 28</WText>
            </WText>
            <WText size={9} weight={700} color={W.gray}>
              Items Delivered
            </WText>
          </View>
          <View style={styles.bigCheck}>
            <Icon name="check" size={24} color={W.white} />
          </View>
        </View>
        <View style={styles.allDelivered}>
          <Icon name="check" size={16} color={W.greenDark} />
          <WText size={9} weight={700} color={W.greenDark}>
            All items delivered in good condition
          </WText>
        </View>
      </Card>

      <Card style={styles.itemsCard}>
        <View style={[styles.rowBetween, styles.itemsHead]}>
          <View>
            <WText size={12} weight={700}>
              Delivered items
            </WText>
            <WText size={8} color={W.gray} style={{ marginTop: 2 }}>
              3 product groups · 28 packages
            </WText>
          </View>
          <Pill background={W.blueSoft} color={W.blueText} icon="snow" height={26}>
            2.8°C
          </Pill>
        </View>
        {deliveryItems.map((item, index) => (
          <View
            key={item.sku}
            style={[styles.item, index === deliveryItems.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.itemBox}>
              <Icon name="box" size={18} color="#9d6800" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Label size={7} spacing={0.06}>
                {item.sku}
              </Label>
              <WText size={10} weight={700} style={{ marginTop: 2 }}>
                {item.name}
              </WText>
              <WText size={8} color={W.gray} style={{ marginTop: 2 }}>
                {item.detail}
              </WText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <WText size={9} weight={700}>
                {item.quantity}
              </WText>
              <View style={styles.delivered}>
                <Icon name="check" size={12} color={W.greenDark} />
                <WText size={7} weight={800} color={W.greenDark}>
                  Delivered
                </WText>
              </View>
            </View>
          </View>
        ))}
      </Card>

      <SignaturePad signed={signed} onChange={setSigned} />
      <CameraCapture captured={photo} onCapture={() => setPhoto(true)} />

      <View style={styles.notes}>
        <View style={[styles.rowBetween, { marginBottom: 8 }]}>
          <WText size={12} weight={700}>
            Delivery note
          </WText>
          <WText size={9} color={W.gray}>
            Optional
          </WText>
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a short note…"
          placeholderTextColor="#b2b4b8"
          multiline
          numberOfLines={3}
          accessibilityLabel="Delivery note"
          style={styles.noteInput}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progress: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: W.yellowSoft,
    borderWidth: 1,
    borderColor: '#f7dfa0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklist: {
    padding: 15,
    marginBottom: 11,
  },
  bigCheck: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: W.green,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 7px 16px rgba(34,197,94,0.2)',
  },
  allDelivered: {
    minHeight: 34,
    borderRadius: 10,
    backgroundColor: W.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
  },
  itemsCard: {
    padding: 14,
    marginBottom: 11,
  },
  itemsHead: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: W.divider,
  },
  item: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: W.divider,
  },
  itemBox: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: W.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delivered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  notes: {
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
    borderRadius: Radius.md,
    padding: 14,
  },
  noteInput: {
    minHeight: 64,
    backgroundColor: '#f6f6f3',
    borderRadius: 12,
    padding: 11,
    fontSize: 11,
    color: W.charcoal,
    textAlignVertical: 'top',
    ...font(400),
  },
});

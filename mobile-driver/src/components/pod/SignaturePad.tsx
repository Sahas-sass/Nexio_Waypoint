// Store manager signature capture component.
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/waypoint/icon';
import { Button, Card, WText } from '@/components/waypoint/ui';
import { W } from '@/utils/theme';

import { podStyles } from './styles';

// TODO: replace the tap-to-sign placeholder with real stroke capture.
export function SignaturePad({ signed, onChange }: { signed: boolean; onChange: (signed: boolean) => void }) {
  return (
    <Card style={podStyles.card}>
      <View style={podStyles.cardTitle}>
        <Icon name="signature" color={W.amber} />
        <View>
          <WText size={12} weight={700}>
            Store Manager Signature
          </WText>
          <WText size={9} color={W.gray} style={{ marginTop: 2 }}>
            Required for completion
          </WText>
        </View>
      </View>
      <Pressable
        onPress={() => onChange(true)}
        accessibilityRole="button"
        accessibilityLabel="Signature area"
        style={[styles.area, signed && styles.areaSigned]}>
        {signed ? (
          <>
            <WText size={31} color="#34312b" style={styles.mark}>
              Nimal R.
            </WText>
            <WText size={8} color={W.gray} style={{ marginTop: 8 }}>
              Signed by Nimal Rathnayake · 8:22 AM
            </WText>
          </>
        ) : (
          <>
            <Icon name="signature" size={30} color="#9a9da2" />
            <WText size={10} color="#9a9da2" style={{ marginTop: 6 }}>
              Sign here with finger
            </WText>
          </>
        )}
      </Pressable>
      <View style={styles.actions}>
        <Button variant="ghost" height={40} textSize={11} style={{ width: 80 }} onPress={() => onChange(false)}>
          Clear
        </Button>
        <Button variant="secondary" height={40} textSize={11} style={{ flex: 1, width: undefined }} onPress={() => onChange(true)}>
          {signed ? 'Signature confirmed' : 'Confirm Signature'}
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  area: {
    height: 112,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cfd2d5',
    borderRadius: 14,
    backgroundColor: '#fcfcfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaSigned: {
    backgroundColor: W.yellowSoft,
    borderStyle: 'solid',
    borderColor: '#f0d580',
  },
  mark: {
    fontFamily: Platform.select({ ios: 'Snell Roundhand', default: 'cursive' }),
    fontStyle: 'italic',
    transform: [{ rotate: '-6deg' }],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
});

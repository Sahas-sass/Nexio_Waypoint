import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, font, Radius } from '@/utils/theme';

import { clampItems } from '../utils/podResult';

/** − / + control for the number of items handed over (0..max). */
export function ItemsStepper({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const step = (delta: number) => onChange(clampItems(value + delta, max));
  return (
    <View style={styles.row}>
      <StepButton label="−" onPress={() => step(-1)} disabled={disabled || value <= 0} accessibilityLabel="One item fewer" />
      <Text style={styles.value} accessibilityLabel={`${value} of ${max} items delivered`}>
        {value}
        <Text style={styles.total}> / {max}</Text>
      </Text>
      <StepButton label="+" onPress={() => step(1)} disabled={disabled || value >= max} accessibilityLabel="One item more" />
    </View>
  );
}

function StepButton({
  label,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, disabled && styles.buttonDisabled, pressed && { opacity: 0.85 }]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  value: { ...font(800), fontSize: 30, color: Colors.textPrimary, minWidth: 90, textAlign: 'center' },
  total: { ...font(600), fontSize: 16, color: Colors.textSecondary },
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { ...font(800), fontSize: 22, color: Colors.textPrimary },
});

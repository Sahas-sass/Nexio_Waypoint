import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconName } from '@/components/waypoint/icon';
import { font, Radius, Shadow, W, type FontWeight } from '@/utils/theme';

type WTextProps = TextProps & {
  size?: number;
  weight?: FontWeight;
  color?: string;
  /** Letter spacing in em, as in the design. */
  spacing?: number;
  style?: StyleProp<TextStyle>;
};

export function WText({
  size = 14,
  weight = 400,
  color = W.charcoal,
  spacing,
  style,
  ...rest
}: WTextProps) {
  return (
    <Text
      {...rest}
      style={[
        font(weight),
        { fontSize: size, color },
        spacing !== undefined && { letterSpacing: spacing * size },
        style,
      ]}
    />
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonText: Record<ButtonVariant, string> = {
  primary: '#302200',
  secondary: W.charcoal,
  ghost: '#7c5500',
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  icon,
  trailingIcon,
  height = 48,
  textSize = 14,
  style,
  textColor,
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  trailingIcon?: IconName;
  height?: number;
  textSize?: number;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  disabled?: boolean;
}) {
  const color = textColor ?? buttonText[variant];
  const content = (
    <>
      {icon && <Icon name={icon} color={color} />}
      <WText size={textSize} weight={800} color={color}>
        {children}
      </WText>
      {trailingIcon && <Icon name={trailingIcon} size={textSize + 4} color={color} />}
    </>
  );
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { minHeight: height },
        variant === 'primary' && { boxShadow: Shadow.yellow },
        variant === 'secondary' && styles.buttonSecondary,
        style,
        pressed && styles.pressed,
        disabled && { opacity: 0.5 },
      ]}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={[W.brightYellow, W.yellow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.sm }]}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

export function StatusDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        boxShadow: `0px 0px 0px 4px ${color}1f`,
      }}
    />
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Eyebrow({ children, color = W.amber }: { children: ReactNode; color?: string }) {
  return (
    <WText size={10} weight={800} spacing={0.12} color={color} style={{ marginBottom: 4 }}>
      {children}
    </WText>
  );
}

export function PageTitle({ children, size = 26 }: { children: ReactNode; size?: number }) {
  return (
    <WText size={size} weight={800} spacing={-0.035} style={{ lineHeight: size * 1.18 }}>
      {children}
    </WText>
  );
}

export function Subtitle({ children, icon }: { children: ReactNode; icon?: IconName }) {
  return (
    <View style={styles.subtitle}>
      {icon && <Icon name={icon} size={15} color={W.gray} />}
      <WText size={13} weight={600} color={W.gray}>
        {children}
      </WText>
    </View>
  );
}

export function TitleRow({
  eyebrow,
  title,
  subtitle,
  subtitleIcon,
  aside,
  center,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  subtitleIcon?: IconName;
  aside?: ReactNode;
  center?: boolean;
}) {
  return (
    <View style={[styles.titleRow, center && { alignItems: 'center' }]}>
      <View style={{ flex: 1 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <PageTitle>{title}</PageTitle>
        <Subtitle icon={subtitleIcon}>{subtitle}</Subtitle>
      </View>
      {aside}
    </View>
  );
}

export function SectionHeading({
  title,
  meta,
  style,
}: {
  title: string;
  meta?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeading, style]}>
      <WText size={16} weight={800}>
        {title}
      </WText>
      {typeof meta === 'string' ? (
        <WText size={10} weight={700} color={W.gray}>
          {meta}
        </WText>
      ) : (
        meta
      )}
    </View>
  );
}

/** Small uppercase label used above values ("DRIVER", "LOAD", ...). */
export function Label({
  children,
  size = 8,
  color = W.gray,
  spacing = 0.1,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  spacing?: number;
}) {
  return (
    <WText size={size} weight={800} spacing={spacing} color={color}>
      {children}
    </WText>
  );
}

export function Pill({
  children,
  background,
  color,
  icon,
  height = 24,
  textSize = 9,
  iconSize = 13,
}: {
  children: ReactNode;
  background: string;
  color: string;
  icon?: IconName;
  height?: number;
  textSize?: number;
  iconSize?: number;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: background, minHeight: height }]}>
      {icon && <Icon name={icon} size={iconSize} color={color} />}
      <WText size={textSize} weight={800} color={color}>
        {children}
      </WText>
    </View>
  );
}

export function IconTile({
  icon,
  size = 36,
  iconSize = 18,
  radius = 12,
  background,
  color,
  style,
}: {
  icon: IconName;
  size?: number;
  iconSize?: number;
  radius?: number;
  background: string;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.center,
        { width: size, height: size, borderRadius: radius, backgroundColor: background },
        style,
      ]}>
      <Icon name={icon} size={iconSize} color={color} />
    </View>
  );
}

export function SafetyNote({ children }: { children: ReactNode }) {
  return (
    <View style={styles.safetyNote}>
      <Icon name="shield" size={17} color={W.gray} />
      <WText size={10} weight={600} color={W.gray}>
        {children}
      </WText>
    </View>
  );
}

export const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: Radius.sm,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  buttonSecondary: {
    backgroundColor: W.white,
    borderWidth: 1.5,
    borderColor: W.lightGray,
    boxShadow: Shadow.sm,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  card: {
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
    borderRadius: Radius.md,
    boxShadow: Shadow.sm,
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
    gap: 12,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 2,
    marginBottom: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 99,
    paddingHorizontal: 8,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyNote: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 12,
  },
});

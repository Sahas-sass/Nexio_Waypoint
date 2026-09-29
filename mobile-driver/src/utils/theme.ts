// Waypoint color palette.

export const W = {
  white: '#ffffff',
  offWhite: '#fafaf7',
  yellow: '#ffc83d',
  brightYellow: '#ffd84d',
  orange: '#f59e0b',
  charcoal: '#202124',
  gray: '#6b7280',
  lightGray: '#e5e7eb',
  green: '#22c55e',
  greenDark: '#15803d',
  blue: '#8dd8f7',
  blueSoft: '#e8f8ff',
  blueText: '#08759e',
  yellowSoft: '#fff8dc',
  orangeSoft: '#fff4dd',
  greenSoft: '#edfbf2',
  amber: '#a66300',
  amberDark: '#8c6200',
  offlineText: '#a65f00',
  border: '#ecece7',
  divider: '#f0f0ec',
  muted: '#f5f5f2',
} as const;

export const Radius = {
  sm: 14,
  md: 20,
  lg: 26,
} as const;

export const Shadow = {
  sm: '0px 4px 16px rgba(32, 33, 36, 0.055)',
  md: '0px 12px 32px rgba(32, 33, 36, 0.1)',
  yellow: '0px 7px 18px rgba(245, 158, 11, 0.25)',
} as const;

export type FontWeight = 400 | 500 | 600 | 700 | 800;

const families: Record<FontWeight, string> = {
  400: 'Manrope_400Regular',
  500: 'Manrope_500Medium',
  600: 'Manrope_600SemiBold',
  700: 'Manrope_700Bold',
  800: 'Manrope_800ExtraBold',
};

export function font(weight: FontWeight = 400) {
  return { fontFamily: families[weight] };
}

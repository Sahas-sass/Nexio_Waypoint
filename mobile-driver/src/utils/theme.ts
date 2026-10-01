/**
 * Waypoint Mobile Theme
 * Foundational design tokens, color palette, and Manrope typography definitions.
 */

export const Colors = {
  // Brand & Status Palette (Specification)
  primaryYellow: '#FFC83D', // Brand CTAs, highlights
  warningOrange: '#F59E0B', // Offline indicator, banners
  successGreen: '#22C55E', // Synced records, verified signatures
  chilledBlue: '#8DD8F7', // Temperature sensitive items
  canvasBackground: '#FAFAF7', // Canvas Background
  surfaceWhite: '#FFFFFF', // Surface White
  textPrimary: '#202124', // Text Primary
  textSecondary: '#687280', // Text Secondary
  border: '#E5E7EB', // Border

  // Extended Accents & Contextual Tones
  brightYellow: '#FFD84D',
  yellowSoft: '#FFF8DC',
  orangeSoft: '#FFF4DD',
  greenSoft: '#EDFBF2',
  greenDark: '#15803D',
  blueSoft: '#E8F8FF',
  blueText: '#08759E',
  amber: '#A66300',
  amberDark: '#8C6200',
  offlineText: '#A65F00',
  divider: '#F0F0EC',
  muted: '#F5F5F2',
} as const;

export type ColorKey = keyof typeof Colors;
export type ThemeColors = typeof Colors;

/**
 * Legacy & shorthand palette alias 'W' for ergonomic usage across Waypoint components.
 */
export const W = {
  white: Colors.surfaceWhite,
  offWhite: Colors.canvasBackground,
  yellow: Colors.primaryYellow,
  brightYellow: Colors.brightYellow,
  orange: Colors.warningOrange,
  charcoal: Colors.textPrimary,
  gray: Colors.textSecondary,
  lightGray: Colors.border,
  green: Colors.successGreen,
  greenDark: Colors.greenDark,
  blue: Colors.chilledBlue,
  blueSoft: Colors.blueSoft,
  blueText: Colors.blueText,
  yellowSoft: Colors.yellowSoft,
  orangeSoft: Colors.orangeSoft,
  greenSoft: Colors.greenSoft,
  amber: Colors.amber,
  amberDark: Colors.amberDark,
  offlineText: Colors.offlineText,
  border: Colors.border,
  divider: Colors.divider,
  muted: Colors.muted,
} as const;

/**
 * Manrope Font Family Definitions
 * Loaded via `@expo-google-fonts/manrope` in `_layout.tsx`
 */
export const FontFamilies = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
} as const;

export type FontWeightNumeric = 400 | 500 | 600 | 700 | 800;
export type FontWeightNamed = 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
export type FontWeight = FontWeightNumeric | FontWeightNamed;

export const fontWeightMap: Record<FontWeight, string> = {
  400: FontFamilies.regular,
  500: FontFamilies.medium,
  600: FontFamilies.semiBold,
  700: FontFamilies.bold,
  800: FontFamilies.extraBold,
  regular: FontFamilies.regular,
  medium: FontFamilies.medium,
  semiBold: FontFamilies.semiBold,
  bold: FontFamilies.bold,
  extraBold: FontFamilies.extraBold,
};

/**
 * Helper to obtain style object with appropriate Manrope font family for a given weight.
 */
export function font(weight: FontWeight = 400): { fontFamily: string } {
  return { fontFamily: fontWeightMap[weight] ?? FontFamilies.regular };
}

/**
 * Typography scale and preset configurations.
 */
export const Typography = {
  display: {
    fontFamily: FontFamilies.extraBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: FontFamilies.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: FontFamilies.bold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    fontFamily: FontFamilies.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  bodyMedium: {
    fontFamily: FontFamilies.medium,
    fontSize: 15,
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: FontFamilies.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: FontFamilies.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  label: {
    fontFamily: FontFamilies.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
} as const;

export const Radius = {
  xs: 8,
  sm: 14,
  md: 20,
  lg: 26,
  full: 9999,
} as const;

export const Shadow = {
  sm: '0px 4px 16px rgba(32, 33, 36, 0.055)',
  md: '0px 12px 32px rgba(32, 33, 36, 0.1)',
  yellow: '0px 7px 18px rgba(245, 158, 11, 0.25)',
} as const;

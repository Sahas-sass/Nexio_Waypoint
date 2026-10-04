import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { W } from '@/utils/theme';

const paths = {
  route: (
    <>
      <Path d="M5 19V6.8a1 1 0 0 1 .6-.9l4-1.8a1 1 0 0 1 .8 0l3.2 1.4a1 1 0 0 0 .8 0l3.2-1.4a1 1 0 0 1 1.4.9v12.2a1 1 0 0 1-.6.9l-4 1.8a1 1 0 0 1-.8 0l-3.2-1.4a1 1 0 0 0-.8 0L5 20.5" />
      <Path d="M10 4v14.5M14 5.5V20" />
    </>
  ),
  pin: (
    <>
      <Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <Circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  snow: (
    <Path d="M12 2v20M4 6l16 12M20 6 4 18M8 4l4 2 4-2M8 20l4-2 4 2M3.5 10 7 12l-.5 4M20.5 10 17 12l.5 4" />
  ),
  check: <Path d="m5 12 4 4L19 6" />,
  chevron: <Path d="m9 18 6-6-6-6" />,
  navigation: (
    <>
      <Path d="m3 11 18-8-8 18-2-8-8-2Z" />
      <Path d="m11 13 4-4" />
    </>
  ),
  box: (
    <>
      <Path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <Path d="M4 7v10l8 4 8-4V7M12 11v10" />
    </>
  ),
  weight: (
    <>
      <Path d="M7 8a5 5 0 0 1 10 0" />
      <Path d="M5 8h14l2 12H3L5 8Z" />
      <Path d="M12 8V5" />
    </>
  ),
  camera: (
    <>
      <Path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <Circle cx="12" cy="13" r="3.5" />
    </>
  ),
  signature: (
    <>
      <Path d="M4 17c3-1 4-5 6-8 1-1.5 2-2 2.5-.8 1 2.5-2 7-1 8 1 1 3-3 4-2s-.5 2 .5 2c1 0 2-1 4-3" />
      <Path d="M4 21h16" />
    </>
  ),
  history: (
    <>
      <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <Path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  more: (
    <>
      <Circle cx="5" cy="12" r="1" />
      <Circle cx="12" cy="12" r="1" />
      <Circle cx="19" cy="12" r="1" />
    </>
  ),
  cloud: (
    <>
      <Path d="M7 18h11a4 4 0 0 0 .6-8A7 7 0 0 0 5.2 8.4 5 5 0 0 0 7 18Z" />
      <Path d="M9 13h6M12 10v6" />
    </>
  ),
  wifiOff: (
    <Path d="m3 3 18 18M8.5 8.7A8 8 0 0 1 20 10M5 10a10 10 0 0 1 1.5-1.3M8.5 14a5 5 0 0 1 7 0M12 18h.01" />
  ),
  shield: (
    <>
      <Path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <Path d="m9 12 2 2 4-4" />
    </>
  ),
  alert: (
    <>
      <Path d="M12 3 2.8 19a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3Z" />
      <Path d="M12 9v4M12 17h.01" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="3.5" />
      <Path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  lock: (
    <>
      <Rect x="5" y="10" width="14" height="11" rx="2" />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  phone: (
    <>
      <Rect x="7" y="2" width="10" height="20" rx="2" />
      <Path d="M10 5h4M11 18h2" />
    </>
  ),
  eye: (
    <>
      <Path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <Circle cx="12" cy="12" r="2.5" />
    </>
  ),
  mail: (
    <>
      <Rect x="2" y="4" width="20" height="16" rx="2" />
      <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  x: (
    <Path d="M18 6 6 18M6 6l12 12" />
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  color = W.charcoal,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  // The View keeps the icon above absolutely positioned siblings (e.g. gradients) on web.
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round">
        {paths[name]}
      </Svg>
    </View>
  );
}

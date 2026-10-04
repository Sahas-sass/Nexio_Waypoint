export type MapEnvironment = {
  platform: string;
  /** True inside Expo Go, which ships its own Google Maps key. */
  isExpoGo: boolean;
  /** android.config.googleMaps.apiKey from the app config, if any. */
  androidMapsApiKey: string | null | undefined;
};

/**
 * Standalone Android builds crash when react-native-maps mounts without a
 * Google Maps API key, so the map is only shown where it can render.
 */
export function canShowNativeMap({ platform, isExpoGo, androidMapsApiKey }: MapEnvironment): boolean {
  if (platform !== 'android') return true;
  return isExpoGo || Boolean(androidMapsApiKey);
}

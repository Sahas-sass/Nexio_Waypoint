import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import type { TripStop } from '@/features/trip/types';
import type { LatLng } from '@/utils/haversine';

import { buildStopMapHtml } from '../utils/stopMapHtml';
import { MapPlaceholder } from './MapPlaceholder';

// OpenStreetMap's tile policy expects a Referer, so the inline page gets the app's web origin
const MAP_BASE_URL = 'https://nexio-waypoint-driver.vercel.app/';

/** Keeps the map page in place: links (e.g. map attribution) never navigate the WebView. */
function onlyInitialPage(request: WebViewNavigation) {
  return request.url === MAP_BASE_URL || request.url === 'about:blank' || request.url.startsWith('data:');
}

/** OpenStreetMap view of the driver position and the store (no API key required). */
export function StopMap({ stop, driver }: { stop: TripStop; driver: LatLng | null }) {
  const html = useMemo(() => {
    if (stop.latitude == null || stop.longitude == null) return null;
    return buildStopMapHtml({
      store: { latitude: stop.latitude, longitude: stop.longitude },
      storeName: stop.storeName,
      driver,
    });
  }, [stop.latitude, stop.longitude, stop.storeName, driver]);

  if (!html) return <MapPlaceholder message="Store location not set" />;

  return (
    <WebView
      style={StyleSheet.absoluteFill}
      originWhitelist={[MAP_BASE_URL, 'about:blank', 'data:*']}
      source={{ html, baseUrl: MAP_BASE_URL }}
      onShouldStartLoadWithRequest={onlyInitialPage}
      javaScriptEnabled
      scrollEnabled={false}
      setSupportMultipleWindows={false}
      renderError={() => <MapPlaceholder message="Map unavailable offline" />}
    />
  );
}

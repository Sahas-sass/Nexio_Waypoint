import { useMemo } from 'react';

import type { TripStop } from '@/features/trip/types';
import type { LatLng } from '@/utils/haversine';

import { buildStopMapHtml } from '../utils/stopMapHtml';
import { MapPlaceholder } from './MapPlaceholder';

/** OpenStreetMap view in a sandboxed iframe (scripts only, no same-origin access). */
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
    <iframe
      title={`Map of ${stop.storeName}`}
      srcDoc={html}
      sandbox="allow-scripts"
      style={{ border: 0, width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}

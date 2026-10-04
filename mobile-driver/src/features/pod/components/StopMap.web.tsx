import type { TripStop } from '@/features/trip/types';
import type { LatLng } from '@/utils/haversine';

import { MapPlaceholder } from './MapPlaceholder';

/** react-native-maps has no web build – show a placeholder; "Open Navigation" still works. */
export function StopMap({ stop }: { stop: TripStop; driver: LatLng | null }) {
  const hasCoords = stop.latitude != null && stop.longitude != null;
  return <MapPlaceholder message={hasCoords ? 'Map preview available on the mobile app' : 'Store location not set'} />;
}

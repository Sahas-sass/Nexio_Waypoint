import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { Icon } from '@/components/waypoint/icon';
import type { TripStop } from '@/features/trip/types';
import type { LatLng } from '@/utils/haversine';
import { Colors } from '@/utils/theme';

import { canShowNativeMap } from '../utils/mapAvailability';
import { MapPlaceholder } from './MapPlaceholder';
import { mapStyleDark } from './mapStyle';

/** Native map of the driver position and the store (placeholder when the store has no coordinates). */
export function StopMap({ stop, driver }: { stop: TripStop; driver: LatLng | null }) {
  if (stop.latitude == null || stop.longitude == null) {
    return <MapPlaceholder message="Store location not set" />;
  }
  const mapAvailable = canShowNativeMap({
    platform: Platform.OS,
    isExpoGo: Constants.executionEnvironment === ExecutionEnvironment.StoreClient,
    androidMapsApiKey: Constants.expoConfig?.android?.config?.googleMaps?.apiKey,
  });
  if (!mapAvailable) {
    return <MapPlaceholder message="Map unavailable – use Navigate" />;
  }
  const store = { latitude: stop.latitude, longitude: stop.longitude };
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      showsUserLocation={false}
      showsMyLocationButton={false}
      customMapStyle={mapStyleDark}
      region={{ ...store, latitudeDelta: 0.04, longitudeDelta: 0.04 }}>
      {driver && (
        <Marker coordinate={driver} title="You" description="Your current location">
          <View style={styles.driverMarker}>
            <View style={styles.driverMarkerInner}>
              <Icon name="navigation" size={14} color="#FFFFFF" />
            </View>
          </View>
        </Marker>
      )}
      <Marker coordinate={store} title={stop.storeName} pinColor={Colors.primaryYellow} />
      {driver && (
        <Polyline coordinates={[driver, store]} strokeColor={Colors.primaryYellow} strokeWidth={3} lineDashPattern={[6, 4]} />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  driverMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1f2835',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
  },
});

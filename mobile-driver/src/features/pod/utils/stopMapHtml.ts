import type { LatLng } from '@/utils/haversine';

export type StopMapInput = {
  store: LatLng;
  storeName: string;
  driver: LatLng | null;
};

// Leaflet 1.9.4 from unpkg, pinned with Subresource Integrity hashes
const LEAFLET_CSS =
  '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />';
const LEAFLET_JS =
  '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>';

/** Serialises a value for inline <script> use without allowing it to close the tag. */
export function toInlineScriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function isValidLatLng(point: LatLng | null): point is LatLng {
  return (
    point != null &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180
  );
}

/**
 * Self-contained HTML page showing the store (and the driver, when known) on an
 * OpenStreetMap map. Rendered in a WebView on native and an iframe on web, so
 * no Google Maps API key is needed.
 */
export function buildStopMapHtml({ store, storeName, driver }: StopMapInput): string {
  if (!isValidLatLng(store)) throw new Error('Invalid store coordinates');
  const data = toInlineScriptJson({
    store: [store.latitude, store.longitude],
    storeName,
    driver: isValidLatLng(driver) ? [driver.latitude, driver.longitude] : null,
  });

  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
${LEAFLET_CSS}
<style>
  html, body, #map { height: 100%; margin: 0; background: #E8ECE4; }
  .pin { width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.35); }
  .store { background: #FFC83D; }
  .driver { background: #3B82F6; }
</style>
</head><body>
<div id="map"></div>
${LEAFLET_JS}
<script>
  var data = ${data};
  var map = L.map('map', { zoomControl: false, attributionControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  function pin(cls) { return L.divIcon({ className: '', html: '<div class="pin ' + cls + '"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }); }
  var storeMarker = L.marker(data.store, { icon: pin('store') }).addTo(map);
  var tip = document.createElement('span');
  tip.textContent = data.storeName; // text only: a store name is never parsed as HTML
  storeMarker.bindTooltip(tip);
  if (data.driver) {
    L.marker(data.driver, { icon: pin('driver') }).addTo(map).bindTooltip('You');
    L.polyline([data.driver, data.store], { color: '#FFC83D', weight: 3, dashArray: '6 4' }).addTo(map);
    map.fitBounds([data.driver, data.store], { padding: [40, 40], maxZoom: 16 });
  } else {
    map.setView(data.store, 15);
  }
</script>
</body></html>`;
}

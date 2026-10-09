"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus } from "lucide-react";
import { LiveTrackingVehicle } from "@/app/(dispatcher)/services/types";
import { DEPOT as CENTRAL_DEPOT } from "@/app/(dispatcher)/utils/constants";

interface RealTrackingMapProps {
  vehicles: LiveTrackingVehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  activeTab: "all" | "on-route" | "delayed" | "exceptions";
  onTabChange: (tab: "all" | "on-route" | "delayed" | "exceptions") => void;
  delayedCount: number;
  exceptionCount: number;
}

// 100% Free Tile Providers - Absolutely NO API Key required & zero watermarks
const TILE_PROVIDERS = {
  osm: {
    name: "Streets",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
  },
  light: {
    name: "Canvas",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
    attribution: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>'
  }
};

type MapStyleKey = keyof typeof TILE_PROVIDERS;

export default function RealTrackingMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  activeTab,
  onTabChange,
  delayedCount,
  exceptionCount
}: RealTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyleKey>("osm");
  const hasFittedBoundsRef = useRef(false);

  // Layer groups to prevent layer duplication
  const routeLinesGroupRef = useRef<L.LayerGroup | null>(null);
  const stopsGroupRef = useRef<L.LayerGroup | null>(null);
  const vehiclesGroupRef = useRef<L.LayerGroup | null>(null);
  const depotGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map instance centered at Colombo, Sri Lanka
    const map = L.map(mapContainerRef.current, {
      center: [6.9271, 79.8612],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false, // We use custom styled zoom buttons
      attributionControl: false
    });

    // Add Free OpenStreetMap base layer (no API key required)
    const initialTileConfig = TILE_PROVIDERS[mapStyle];
    const initialTiles = L.tileLayer(initialTileConfig.url, {
      maxZoom: initialTileConfig.maxZoom
    }).addTo(map);
    tileLayerRef.current = initialTiles;

    // Subtle attribution in bottom-right corner
    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution(initialTileConfig.attribution)
      .addTo(map);

    // Initialize Layer Groups
    routeLinesGroupRef.current = L.layerGroup().addTo(map);
    stopsGroupRef.current = L.layerGroup().addTo(map);
    depotGroupRef.current = L.layerGroup().addTo(map);
    vehiclesGroupRef.current = L.layerGroup().addTo(map);

    // Add Central Depot Marker (Peliyagoda Hub)
    const depotIcon = L.divIcon({
      className: "custom-depot-pin",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
      html: `
        <div class="w-9 h-9 rounded-full bg-white shadow-md border-2 border-waypoint-text flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
          <div class="w-3.5 h-3.5 rounded-full bg-waypoint-text"></div>
        </div>
      `
    });

    const depotMarker = L.marker([CENTRAL_DEPOT.lat, CENTRAL_DEPOT.lng], { icon: depotIcon });
    depotMarker.bindPopup(`
      <div class="text-xs font-sans p-1">
        <p class="font-bold text-gray-900 text-sm">${CENTRAL_DEPOT.name}</p>
        <p class="text-gray-500 text-[11px] mt-0.5">${CENTRAL_DEPOT.address}</p>
        <div class="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-700">
          Central Dispatch & Loading Hub
        </div>
      </div>
    `);
    depotGroupRef.current.addLayer(depotMarker);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Map Style Switch (Free OSM vs Free Light Canvas)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_PROVIDERS[mapStyle];
    const newTiles = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom
    }).addTo(map);
    newTiles.bringToBack();
    tileLayerRef.current = newTiles;
  }, [mapStyle]);

  // 3. Initial Auto-Fit Bounds to Colombo Fleet Zone
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || vehicles.length === 0 || hasFittedBoundsRef.current) return;

    const allCoords: [number, number][] = [
      [CENTRAL_DEPOT.lat, CENTRAL_DEPOT.lng],
      ...vehicles.map(v => [v.lat, v.lng] as [number, number]),
      ...vehicles.flatMap(v => (v.stops || []).map(s => [s.lat, s.lng] as [number, number]))
    ];

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      hasFittedBoundsRef.current = true;
    }
  }, [vehicles]);

  // 4. Update Map Layers (Vehicles, Stops, Corridors) when state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const routeLinesGroup = routeLinesGroupRef.current;
    const stopsGroup = stopsGroupRef.current;
    const vehiclesGroup = vehiclesGroupRef.current;

    if (!routeLinesGroup || !stopsGroup || !vehiclesGroup) return;

    // Clear previous dynamic layers
    routeLinesGroup.clearLayers();
    stopsGroup.clearLayers();
    vehiclesGroup.clearLayers();

    // Filter vehicles by active tab
    const visibleVehicles = vehicles.filter((v) => {
      if (activeTab === "on-route") return v.status === "on-schedule";
      if (activeTab === "delayed") return v.status === "delayed";
      if (activeTab === "exceptions") return v.status === "connectivity-issue" || v.status === "delayed";
      return true;
    });

    visibleVehicles.forEach((vehicle) => {
      const isSelected = vehicle.id === selectedVehicleId;
      const isDelayed = vehicle.status === "delayed";
      const isConnIssue = vehicle.status === "connectivity-issue";

      const markerBg = isSelected
        ? "#FFC83D"
        : isDelayed
        ? "#F97316"
        : isConnIssue
        ? "#7DD3FC"
        : "#F59E0B";

      const pulseBg = isSelected
        ? "#FBBF24"
        : isDelayed
        ? "#F97316"
        : isConnIssue
        ? "#BAE6FD"
        : "#FDE68A";

      const strokeColor = isSelected ? "#202124" : isDelayed ? "#FFFFFF" : isConnIssue ? "#0369A1" : "#FFFFFF";

      // 1. Draw Delivery Corridors (Polylines from Depot -> Stops -> Vehicle)
      const pathCoords: [number, number][] = [
        [CENTRAL_DEPOT.lat, CENTRAL_DEPOT.lng]
      ];

      if (vehicle.stops && vehicle.stops.length > 0) {
        vehicle.stops.forEach((s) => {
          pathCoords.push([s.lat, s.lng]);
        });
      }

      pathCoords.push([vehicle.lat, vehicle.lng]);

      const polyline = L.polyline(pathCoords, {
        color: vehicle.color,
        weight: isSelected ? 4 : 2.5,
        opacity: isSelected ? 0.95 : 0.45,
        dashArray: isSelected ? "6, 8" : "3, 6",
        lineCap: "round",
        lineJoin: "round"
      });
      routeLinesGroup.addLayer(polyline);

      // 2. Draw Stop Pins (if selected or all if tab active)
      if (vehicle.stops && vehicle.stops.length > 0) {
        vehicle.stops.forEach((stop) => {
          const stopIcon = L.divIcon({
            className: "custom-stop-pin",
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
            html: `
              <div class="flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
                <div class="w-6 h-6 rounded-full bg-white shadow-md border-2 border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700">
                  ${stop.sequence}
                </div>
              </div>
            `
          });

          const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon });
          stopMarker.bindPopup(`
            <div class="text-xs font-sans p-1">
              <div class="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                <span class="w-2 h-2 rounded-full" style="background-color: ${vehicle.color};"></span>
                <span>Stop ${stop.sequence}: ${stop.storeName}</span>
              </div>
              <p class="text-gray-500 text-[11px] mt-1">${stop.address}</p>
              <div class="mt-2 flex items-center justify-between text-[10px] font-semibold text-gray-500 pt-1 border-t border-gray-100">
                <span>Vehicle: <strong class="text-gray-800">${vehicle.name}</strong></span>
                <span class="uppercase text-amber-600">${stop.status}</span>
              </div>
            </div>
          `);
          stopsGroup.addLayer(stopMarker);
        });
      }

      // 3. Draw Vehicle Marker
      const vehicleIcon = L.divIcon({
        className: "custom-vehicle-marker",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
            <!-- Outer Pulsing Glow Halo -->
            <span class="absolute inset-0 rounded-full animate-ping opacity-35" style="background-color: ${pulseBg}; animation-duration: 2.2s;"></span>
            <span class="absolute -inset-1 rounded-full opacity-40 blur-[2px]" style="background-color: ${pulseBg};"></span>
            
            <!-- Vehicle Badge (Squircle) -->
            <div class="relative z-10 w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110"
                 style="background-color: ${markerBg}; border: 2.5px solid #FFFFFF;">
              <!-- Truck Icon SVG -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            </div>

            <!-- Vehicle Plate Badge Tag -->
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 ${
              isSelected ? "bg-waypoint-text text-white" : "bg-white/95 text-gray-800 border border-gray-200"
            } text-[10px] font-bold rounded-md whitespace-nowrap shadow-md flex items-center gap-1 z-20">
              <span>${vehicle.name}</span>
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${markerBg};"></span>
            </div>
          </div>
        `
      });

      const vehicleMarker = L.marker([vehicle.lat, vehicle.lng], {
        icon: vehicleIcon,
        zIndexOffset: isSelected ? 1000 : 500
      });

      vehicleMarker.on("click", () => {
        onSelectVehicle(vehicle.id);
      });

      vehicleMarker.bindPopup(`
        <div class="text-xs font-sans p-1 min-w-47.5">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-100">
              <img src="${vehicle.image}" alt="${vehicle.name}" class="w-full h-full object-cover" />
            </div>
            <div>
              <p class="font-bold text-gray-900 text-sm leading-tight">${vehicle.name}</p>
              <p class="text-gray-400 text-[10px] font-medium">${vehicle.type}</p>
            </div>
          </div>

          <div class="space-y-1 py-1.5 border-t border-b border-gray-100 text-[11px]">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Driver</span>
              <span class="font-bold text-gray-800">${vehicle.driverName}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Status</span>
              <span class="font-bold text-[11px]" style="color: ${vehicle.color};">${vehicle.statusText}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Zone</span>
              <span class="font-bold text-gray-800">${vehicle.routeDistrict}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">GPS</span>
              <span class="font-mono text-[10px] text-gray-600">${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}</span>
            </div>
          </div>

          <p class="text-gray-500 text-[10px] font-semibold mt-2 text-right">${vehicle.etaOrUpdate}</p>
        </div>
      `);

      vehiclesGroup.addLayer(vehicleMarker);
    });
  }, [vehicles, selectedVehicleId, activeTab, onSelectVehicle]);

  // 5. Smooth Pan/FlyTo when selected vehicle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (selectedVehicle && selectedVehicle.lat && selectedVehicle.lng) {
      map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 14, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [selectedVehicleId, vehicles]);

  // Zoom Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative w-full h-130 rounded-3xl overflow-hidden border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] bg-[#F8F9FA]">
      
      {/* 1. TOP OVERLAY: Filter Tabs & Zoom/Style Controls (z-index 1000 so above Leaflet canvas) */}
      <div className="absolute top-4 left-4 right-4 z-1000 flex items-center justify-between pointer-events-none">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-xs pointer-events-auto">
          <button
            onClick={() => onTabChange("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "all"
                ? "bg-waypoint-text text-white shadow-xs"
                : "bg-transparent hover:bg-gray-100 text-gray-600"
            }`}
          >
            All ({vehicles.length})
          </button>

          <button
            onClick={() => onTabChange("on-route")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "on-route"
                ? "bg-waypoint-text text-white shadow-xs"
                : "bg-transparent hover:bg-gray-100 text-gray-600"
            }`}
          >
            On Route ({vehicles.filter((v) => v.status === "on-schedule").length})
          </button>

          <button
            onClick={() => onTabChange("delayed")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === "delayed"
                ? "bg-waypoint-text text-white shadow-xs"
                : "bg-transparent hover:bg-gray-100 text-gray-600"
            }`}
          >
            <span>Delayed</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "delayed" ? "bg-amber-400 text-black" : "bg-[#FFF8E6] text-amber-700"
              }`}
            >
              {delayedCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange("exceptions")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTab === "exceptions"
                ? "bg-waypoint-text text-white shadow-xs"
                : "bg-transparent hover:bg-gray-100 text-gray-600"
            }`}
          >
            <span>Exceptions</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "exceptions" ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700"
              }`}
            >
              {exceptionCount}
            </span>
          </button>
        </div>

        {/* Right Controls: Map Layer Switcher + Zoom Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 100% Free Map Style Toggle (No API Key Required) */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200/80 shadow-xs flex items-center p-1">
            <button
              onClick={() => setMapStyle("osm")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mapStyle === "osm"
                  ? "bg-waypoint-text text-white shadow-2xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="OpenStreetMap Streets & Landmarks (Free, No Key)"
            >
              Streets
            </button>
            <button
              onClick={() => setMapStyle("light")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mapStyle === "light"
                  ? "bg-waypoint-text text-white shadow-2xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Minimalist Light Canvas (Free, No Key)"
            >
              Canvas
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
              title="Zoom in"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="h-px bg-gray-200 w-full" />
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
              title="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 2. REAL LEAFLET MAP CONTAINER */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 3. BOTTOM OVERLAY: Status Legend Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-1000 pointer-events-auto">
        <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-gray-200/80 shadow-md text-[11px] font-semibold text-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>On route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Delayed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Connectivity issue</span>
          </div>
        </div>
      </div>

    </div>
  );
}
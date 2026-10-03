"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Calendar, 
  Bell, 
  Truck, 
  Check, 
  Clock, 
  Wifi, 
  WifiOff, 
  ChevronRight, 
  SlidersHorizontal, 
  Plus, 
  Minus, 
  ArrowRight,
  RefreshCw,
  Loader2
} from "lucide-react";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";
import { 
  fetchLiveTrackingFleet, 
  fetchRouteExceptions, 
  subscribeToTelemetry,
  LiveTrackingVehicle, 
  TrackingKPIs, 
  RouteExceptionEvent 
} from "@/app/(dispatcher)/services";

type FilterTab = "all" | "on-route" | "delayed" | "exceptions";

export default function LiveTrackingPage() {
  const [vehicles, setVehicles] = useState<LiveTrackingVehicle[]>([]);
  const [kpis, setKpis] = useState<TrackingKPIs | null>(null);
  const [exceptions, setExceptions] = useState<RouteExceptionEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("TRK-024");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Initial fetch and Realtime Telemetry Subscription
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [fleetData, excData] = await Promise.all([
          fetchLiveTrackingFleet(),
          fetchRouteExceptions()
        ]);
        if (mounted) {
          setVehicles(fleetData.vehicles);
          setKpis(fleetData.kpis);
          setExceptions(excData);
          if (fleetData.vehicles.length > 0) {
            setSelectedVehicleId(fleetData.vehicles[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load live tracking telemetry:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    // Subscribe to live Postgres changes on 'trips' and 'route_exceptions'
    const unsubscribe = subscribeToTelemetry(
      () => {
        // When telemetry changes, silently refresh the vehicle statuses
        fetchLiveTrackingFleet().then((res) => {
          if (mounted) {
            setVehicles(res.vehicles);
            setKpis(res.kpis);
          }
        });
      },
      (newException) => {
        if (mounted && newException) {
          const mapped: RouteExceptionEvent = {
            id: newException.id || `exc-${Date.now()}`,
            tripId: newException.trip_id,
            vehiclePlate: newException.vehicle_plate || "FLEET",
            eventTime: newException.event_time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            eventType: newException.event_type || "delay",
            title: newException.title || "Route update",
            description: newException.description || "Exception reported by driver",
            severity: newException.severity || "warning",
            createdAt: newException.created_at || new Date().toISOString()
          };
          setExceptions((prev) => [mapped, ...prev.slice(0, 5)]);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [fleetData, excData] = await Promise.all([
        fetchLiveTrackingFleet(),
        fetchRouteExceptions()
      ]);
      setVehicles(fleetData.vehicles);
      setKpis(fleetData.kpis);
      setExceptions(excData);
    } catch (err) {
      console.error("Failed to refresh live tracking:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.routeDistrict.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "on-route") return vehicle.status === "on-schedule";
    if (activeTab === "delayed") return vehicle.status === "delayed";
    if (activeTab === "exceptions") return vehicle.status === "connectivity-issue" || vehicle.status === "delayed";
    return true;
  });

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.15, 1.4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.85));
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

  const delayedCount = kpis?.delayed ?? vehicles.filter(v => v.status === "delayed").length;
  const exceptionCount = kpis?.connectivityIssues ?? vehicles.filter(v => v.status === "connectivity-issue").length;

  return (
    <div className="max-w-360 mx-auto space-y-6">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-waypoint-orange text-[10px] font-bold tracking-widest uppercase mb-1">
            FLEET OPERATIONS
          </p>
          <h1 className="text-3xl font-bold text-waypoint-text tracking-tight flex items-center gap-3">
            <span>Live Tracking</span>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-waypoint-orange" />}
          </h1>
          <p className="text-waypoint-secondary text-sm font-medium mt-1">
            Monitor active routes, driver telemetry, and delivery exceptions
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, vehicles..." 
              className="pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-waypoint-yellow w-64 shadow-2xs font-medium placeholder:font-normal"
            />
            <div className="absolute right-3 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-400">
              ⌘K
            </div>
          </div>

          {/* Date Picker Button */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-waypoint-text hover:bg-gray-50 transition-colors shadow-2xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{todayFormatted}</span>
          </button>

          {/* Manual Refresh Live Telemetry Button */}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs text-gray-600 disabled:opacity-50"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-waypoint-orange" : ""}`} />
          </button>

          {/* Notification Bell */}
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative shadow-2xs">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* User Profile */}
          <UserProfileDropdown layoutVariant="header" />
        </div>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Active Vehicles */}
        <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-31.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-amber-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-waypoint-secondary">Active Vehicles</p>
          </div>
          <div className="mt-2.5">
            <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">
              {kpis?.activeVehicles ?? 12}
            </p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Across {kpis?.activeVehicles ? Math.max(kpis.activeVehicles - 3, 1) : 9} live routes
            </p>
          </div>
        </div>

        {/* Card 2: On Schedule */}
        <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-31.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <p className="text-xs font-semibold text-waypoint-secondary">On Schedule</p>
          </div>
          <div className="mt-2.5">
            <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">
              {kpis?.onSchedule ?? 9}
            </p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              {kpis?.activeVehicles ? Math.round((kpis.onSchedule / kpis.activeVehicles) * 100) : 75}% of active fleet
            </p>
          </div>
        </div>

        {/* Card 3: Delayed */}
        <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-31.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-waypoint-secondary">Delayed</p>
          </div>
          <div className="mt-2.5">
            <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">
              {delayedCount}
            </p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Average delay 9 min
            </p>
          </div>
        </div>

        {/* Card 4: Connectivity Issues */}
        <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-31.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-blue-500 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-waypoint-secondary">Connectivity Issues</p>
          </div>
          <div className="mt-2.5">
            <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">
              {exceptionCount}
            </p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Last update 6 min ago
            </p>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE SECTION: LIVE MAP + ACTIVE ROUTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* MAP CONTAINER (8 COLS) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-[#E8E8E3]/90 bg-[#F1F3EC] shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] min-h-125 flex flex-col justify-between p-6 select-none">
          
          {/* Top Controls: Filter Pills (Left) & Zoom Controls (Right) */}
          <div className="relative z-10 flex items-center justify-between pointer-events-auto">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === "all"
                    ? "bg-waypoint-text text-white shadow-sm"
                    : "bg-white/80 backdrop-blur-xs hover:bg-white text-gray-600 border border-gray-200/70"
                }`}
              >
                All Vehicles ({vehicles.length})
              </button>

              <button
                onClick={() => setActiveTab("on-route")}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === "on-route"
                    ? "bg-waypoint-text text-white shadow-sm"
                    : "bg-white/80 backdrop-blur-xs hover:bg-white text-gray-600 border border-gray-200/70"
                }`}
              >
                On Route ({vehicles.filter(v => v.status === "on-schedule").length})
              </button>

              <button
                onClick={() => setActiveTab("delayed")}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === "delayed"
                    ? "bg-waypoint-text text-white shadow-sm"
                    : "bg-white/80 backdrop-blur-xs hover:bg-white text-gray-600 border border-gray-200/70"
                }`}
              >
                <span>Delayed</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "delayed" ? "bg-amber-400 text-black" : "bg-[#FFF8E6] text-amber-700"
                }`}>
                  {delayedCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("exceptions")}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === "exceptions"
                    ? "bg-waypoint-text text-white shadow-sm"
                    : "bg-white/80 backdrop-blur-xs hover:bg-white text-gray-600 border border-gray-200/70"
                }`}
              >
                <span>Exceptions</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "exceptions" ? "bg-orange-400 text-white" : "bg-orange-100 text-orange-700"
                }`}>
                  {exceptionCount}
                </span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl border border-gray-200/80 shadow-sm flex flex-col overflow-hidden">
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

          {/* SVG MAP GRAPHIC CANVAS */}
          <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
            <div 
              className="w-full h-full transition-transform duration-300 ease-out origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg 
                viewBox="0 0 920 480" 
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Highway Ribbon Shadow Filter */}
                  <filter id="roadShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#202124" floodOpacity="0.06" />
                  </filter>
                  <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* --- 1. Soft Topographic Background Curves --- */}
                <path
                  d="M-50,120 Q180,60 400,110 T950,70 L950,-50 L-50,-50 Z"
                  fill="#EAEFE5"
                  opacity="0.75"
                />
                <path
                  d="M-50,380 Q250,310 500,360 T950,320 L950,520 L-50,520 Z"
                  fill="#E8EDE2"
                  opacity="0.7"
                />
                <path
                  d="M-50,260 Q150,190 350,230 T850,210 L950,220 L950,350 Q600,420 300,380 Z"
                  fill="#E3E8DB"
                  opacity="0.45"
                />

                {/* --- 2. District Names --- */}
                <text 
                  x="285" 
                  y="160" 
                  fill="#78806F" 
                  fontSize="11" 
                  fontWeight="700" 
                  letterSpacing="0.22em"
                  className="uppercase select-none"
                >
                  NORTH DISTRICT
                </text>

                <text 
                  x="385" 
                  y="235" 
                  fill="#78806F" 
                  fontSize="11" 
                  fontWeight="700" 
                  letterSpacing="0.22em"
                  className="uppercase select-none"
                >
                  CENTRAL MARKET
                </text>

                <text 
                  x="640" 
                  y="385" 
                  fill="#78806F" 
                  fontSize="11" 
                  fontWeight="700" 
                  letterSpacing="0.22em"
                  className="uppercase select-none"
                >
                  HARBOR POINT
                </text>

                {/* --- 3. Highway Road Ribbons (Smooth White Corridors) --- */}
                {/* North Highway Ribbon */}
                <path
                  d="M 230 170 C 340 180, 480 200, 620 180 C 720 165, 820 120, 880 110"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="38"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#roadShadow)"
                />

                {/* Central & Harbor Main Highway Ribbon */}
                <path
                  d="M 60 320 C 180 310, 240 250, 360 250 C 470 250, 520 300, 640 330 C 720 350, 800 320, 880 300"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="42"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#roadShadow)"
                />

                {/* --- 4. Dynamic Route Traces (Dotted Paths) --- */}
                {/* Blue Dotted Route (North District - TRK-019) */}
                <path
                  d="M 235 170 C 340 180, 480 200, 620 180 C 720 165, 820 120, 880 110"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  opacity={activeTab === "delayed" ? 0.3 : 1}
                />

                {/* Yellow/Amber Dotted Route (Central Market - TRK-024) */}
                <path
                  d="M 60 320 C 180 310, 240 250, 360 250 C 470 250, 520 300, 640 330"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  opacity={activeTab === "exceptions" || activeTab === "delayed" ? 0.3 : 1}
                />

                {/* Orange Dotted Route (Harbor Point - VAN-012) */}
                <path
                  d="M 520 300 C 600 325, 680 345, 800 325"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="3.5"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  opacity={activeTab === "on-route" ? 0.3 : 1}
                />

                {/* --- 5. Waypoint Stop Pin Markers --- */}
                {/* Pin 1: West Depot Start */}
                <g transform="translate(170, 305)" filter="url(#pinShadow)">
                  <circle cx="0" cy="0" r="13" fill="#FFFFFF" />
                  <circle cx="0" cy="0" r="8" fill="#F4F4F0" stroke="#E2E4DC" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3.5" fill="#202124" />
                </g>

                {/* Pin 2: Central Market Stop */}
                <g transform="translate(510, 245)" filter="url(#pinShadow)">
                  <circle cx="0" cy="0" r="13" fill="#FFFFFF" />
                  <circle cx="0" cy="0" r="8" fill="#F4F4F0" stroke="#E2E4DC" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3.5" fill="#202124" />
                </g>

                {/* Pin 3: Harbor Point Stop */}
                <g transform="translate(685, 335)" filter="url(#pinShadow)">
                  <circle cx="0" cy="0" r="13" fill="#FFFFFF" />
                  <circle cx="0" cy="0" r="8" fill="#F4F4F0" stroke="#E2E4DC" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3.5" fill="#202124" />
                </g>

                {/* --- 6. Live Vehicle Markers (Interactive Map Telemetry) --- */}
                {vehicles.map((v) => {
                  const isSelected = selectedVehicleId === v.id;
                  const x = v.x || (v.id === "TRK-024" ? 340 : v.id === "VAN-012" ? 620 : 350);
                  const y = v.y || (v.id === "TRK-024" ? 255 : v.id === "VAN-012" ? 325 : 185);
                  
                  const isDelayed = v.status === "delayed";
                  const isConnIssue = v.status === "connectivity-issue";

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

                  return (
                    <g 
                      key={v.id} 
                      transform={`translate(${x}, ${y})`} 
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => setSelectedVehicleId(v.id)}
                    >
                      {/* Pulsing ring */}
                      <circle 
                        cx="0" 
                        cy="0" 
                        r={isSelected ? 28 : 22} 
                        fill={pulseBg} 
                        opacity="0.35" 
                        className="animate-pulse" 
                      />
                      
                      {/* Vehicle Marker Badge */}
                      <rect 
                        x={isSelected ? -18 : -16} 
                        y={isSelected ? -18 : -16} 
                        width={isSelected ? 36 : 32} 
                        height={isSelected ? 36 : 32} 
                        rx={isSelected ? 12 : 10} 
                        fill={markerBg} 
                        stroke="#FFFFFF" 
                        strokeWidth="2.5" 
                        filter="url(#pinShadow)"
                      />

                      {/* Truck SVG Icon */}
                      <g 
                        transform={`translate(${isSelected ? -9 : -8}, ${isSelected ? -9 : -8}) scale(${isSelected ? 0.75 : 0.65})`} 
                        fill="none" 
                        stroke={strokeColor} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                        <path d="M15 18H9" />
                        <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10" />
                        <circle cx="7" cy="18" r="2" />
                        <circle cx="17" cy="18" r="2" />
                      </g>

                      {/* Tag Pill for Selected Vehicle */}
                      {isSelected && (
                        <g transform="translate(24, -10)">
                          <rect x="0" y="0" width="58" height="20" rx="6" fill="#202124" />
                          <text x="29" y="14" fill="#FFFFFF" fontSize="9.5" fontWeight="700" textAnchor="middle">
                            {v.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

              </svg>
            </div>
          </div>

          {/* Bottom Legend Pill (Translucent Glass) */}
          <div className="relative z-10 pointer-events-auto">
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/85 backdrop-blur-md rounded-full border border-gray-200/70 shadow-xs text-[11px] font-medium text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>On route</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Delayed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>Connectivity</span>
              </div>
            </div>
          </div>

        </div>

        {/* ACTIVE ROUTES LIST (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between space-y-4">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-bold text-waypoint-text leading-tight">
                  Active Routes
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {vehicles.length} vehicles in transit
                </p>
              </div>
              <button 
                onClick={handleRefresh}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                title="Filter active routes"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Vehicle Cards List */}
            <div className="flex flex-col gap-3 max-h-95 overflow-y-auto pr-1">
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? "border-2 border-waypoint-yellow bg-white shadow-xs ring-4 ring-[#FFF8E6]/60"
                        : "border border-gray-200 hover:border-gray-300 bg-white shadow-2xs"
                    }`}
                  >
                    {/* Top Row: Vehicle Image & ID & Chevron */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1 border border-gray-100">
                        <img 
                          src={vehicle.image} 
                          alt={vehicle.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-bold text-waypoint-text leading-tight">
                          {vehicle.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                          {vehicle.type} · {vehicle.stopsCount} Stops
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>

                    {/* Bottom Row: Status Indicator & ETA */}
                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: 
                              vehicle.status === "on-schedule" 
                                ? "#16A34A" 
                                : vehicle.status === "delayed" 
                                ? "#F59E0B" 
                                : "#EA580C"
                          }}
                        />
                        <span 
                          className="text-[11px] font-bold"
                          style={{
                            color: 
                              vehicle.status === "on-schedule" 
                                ? "#16A34A" 
                                : vehicle.status === "delayed" 
                                ? "#D97706" 
                                : "#EA580C"
                          }}
                        >
                          {vehicle.statusText}
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold text-gray-400">
                        {vehicle.etaOrUpdate}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No vehicles match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Link */}
          <div className="pt-2 text-center border-t border-gray-100">
            <button 
              onClick={() => setActiveTab("all")}
              className="text-[12px] font-bold text-waypoint-text hover:text-waypoint-orange transition-colors inline-flex items-center gap-1.5 py-1"
            >
              <span>View all active routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 4. BOTTOM SECTION: RECENT EXCEPTIONS */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[18px] font-bold text-waypoint-text tracking-tight">
              Recent Exceptions
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Live updates from active routes
            </p>
          </div>

          <button 
            onClick={handleRefresh}
            className="text-xs font-bold text-waypoint-orange hover:text-amber-600 transition-colors inline-flex items-center gap-1"
          >
            <span>View activity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Columns Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 gap-4 md:gap-0 pt-2">
          {exceptions.slice(0, 3).map((exc, idx) => {
            const isSuccess = exc.severity === "success" || exc.eventType === "stop_reached";
            const isWarning = exc.severity === "warning" || exc.eventType === "delay";
            const isCritical = exc.severity === "critical" || exc.eventType === "connectivity_loss";

            return (
              <div 
                key={exc.id || idx}
                className={`flex items-center gap-3.5 ${idx === 0 ? "md:pr-6" : idx === 1 ? "md:px-6" : "md:pl-6"} pt-3 md:pt-0`}
              >
                <span className="text-xs font-semibold text-gray-400 shrink-0 w-11">
                  {exc.eventTime}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isSuccess ? "bg-emerald-50 text-emerald-600" :
                  isWarning ? "bg-amber-50 text-amber-600" :
                  "bg-blue-50 text-blue-500"
                }`}>
                  {isSuccess && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  {isWarning && <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  {isCritical && <WifiOff className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-waypoint-text leading-tight truncate">
                    {exc.title}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                    {exc.description}
                  </p>
                </div>
              </div>
            );
          })}

          {exceptions.length === 0 && (
            <div className="col-span-3 text-center py-4 text-xs text-gray-400">
              No recent route exceptions recorded. Fleet operating smoothly.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

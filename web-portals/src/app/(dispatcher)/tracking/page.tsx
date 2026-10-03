"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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

const RealTrackingMap = dynamic(() => import("./RealTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-130 rounded-3xl bg-[#F8F9FA] border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-7 h-7 animate-spin text-waypoint-orange" />
      <p className="text-xs font-bold text-gray-500 tracking-wider uppercase">Loading Live Telemetry Map...</p>
    </div>
  )
});

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
        
        {/* REAL INTERACTIVE TELEMETRY MAP (8 COLS) */}
        <div className="lg:col-span-8">
          <RealTrackingMap
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            delayedCount={delayedCount}
            exceptionCount={exceptionCount}
          />
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
                      <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 shadow-2xs">
                        <img 
                          src={vehicle.image} 
                          alt={vehicle.name} 
                          className="w-full h-full object-cover"
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

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Truck, Check, Clock, Wifi, RefreshCw, Loader2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import { ErrorBlock } from "../components/StatusBlocks";
import { useLiveTracking } from "../hooks/useLiveTracking";
import { averageDelay, latestPing } from "../utils/tracking";
import { isoDate, timeAgo } from "../utils/format";
import RouteCard from "./components/RouteCard";
import ExceptionsStrip from "./components/ExceptionsStrip";

const RealTrackingMap = dynamic(() => import("./RealTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-130 rounded-3xl bg-[#F8F9FA] border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-7 h-7 animate-spin text-waypoint-orange" />
      <p className="text-xs font-bold text-gray-500 tracking-wider uppercase">Loading Live Telemetry Map...</p>
    </div>
  ),
});

type FilterTab = "all" | "on-route" | "delayed" | "exceptions";
const PANEL = "bg-white rounded-3xl border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]";

export default function LiveTrackingPage() {
  const { vehicles, kpis, exceptions, loading, error, reload } = useLiveTracking();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [today] = useState(() => isoDate(new Date()));

  const selectedVehicleId = selectedId || vehicles[0]?.id || "";
  const q = searchQuery.toLowerCase();
  const filteredVehicles = vehicles.filter((v) => {
    const matches = !q || [v.name, v.type, v.routeDistrict, v.driverName].some((s) => s.toLowerCase().includes(q));
    if (!matches) return false;
    if (activeTab === "on-route") return v.status === "on-schedule";
    if (activeTab === "delayed") return v.status === "delayed";
    if (activeTab === "exceptions") return v.status !== "on-schedule";
    return true;
  });

  const active = kpis?.activeVehicles ?? 0;
  const delayedCount = kpis?.delayed ?? 0;
  const exceptionCount = kpis?.connectivityIssues ?? 0;
  const avgDelay = averageDelay(vehicles);

  return (
    <div className="max-w-360 mx-auto space-y-6">
      <PageHeader
        title={<>Live Tracking {loading && <Loader2 className="w-5 h-5 animate-spin text-waypoint-orange" />}</>}
        subtitle="Monitor active routes, driver telemetry, and delivery exceptions"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vehicles, drivers..."
        date={today}
        actions={
          <button
            onClick={reload}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs text-gray-600 disabled:opacity-50"
            title="Refresh live telemetry"
            aria-label="Refresh live telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-waypoint-orange" : ""}`} />
          </button>
        }
      />

      {error && (
        <div className={PANEL}>
          <ErrorBlock message={error} onRetry={reload} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={<Truck className="w-5 h-5" strokeWidth={2} />} iconClass="bg-[#FFF8E6] text-amber-600" label="Active Vehicles" value={active} caption="Trips en route with GPS" dotClass="bg-amber-500" />
        <KpiCard
          icon={<Check className="w-5 h-5" strokeWidth={2.5} />}
          iconClass="bg-[#ECFDF5] text-emerald-600"
          label="On Schedule"
          value={kpis?.onSchedule ?? 0}
          caption={active ? `${Math.round(((kpis?.onSchedule ?? 0) / active) * 100)}% of active fleet` : "No active vehicles"}
          dotClass="bg-emerald-500"
        />
        <KpiCard
          icon={<Clock className="w-5 h-5" strokeWidth={2} />}
          iconClass="bg-[#FFF8E6] text-amber-600"
          label="Delayed"
          value={delayedCount}
          caption={avgDelay ? `Average delay ${avgDelay} min` : "No reported delays"}
          dotClass="bg-amber-500"
        />
        <KpiCard
          icon={<Wifi className="w-5 h-5" strokeWidth={2} />}
          iconClass="bg-[#EFF6FF] text-blue-500"
          label="Connectivity Issues"
          value={exceptionCount}
          caption={timeAgo(latestPing(vehicles))}
          dotClass="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <RealTrackingMap
            vehicles={filteredVehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            delayedCount={delayedCount}
            exceptionCount={exceptionCount}
          />
        </div>

        <div className={`lg:col-span-4 p-5 flex flex-col space-y-4 ${PANEL}`}>
          <div>
            <h3 className="text-[17px] font-bold text-waypoint-text leading-tight">Active Routes</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{vehicles.length} vehicles in transit</p>
          </div>
          <div className="flex flex-col gap-3 max-h-95 overflow-y-auto pr-1">
            {filteredVehicles.map((v) => (
              <RouteCard key={v.id} vehicle={v} isSelected={selectedVehicleId === v.id} onSelect={() => setSelectedId(v.id)} />
            ))}
            {!loading && filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-xs">
                {vehicles.length === 0 ? "No vehicles are on the road right now." : "No vehicles match the selected filter."}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`p-6 ${PANEL}`}>
        <div className="mb-4">
          <h3 className="text-[18px] font-bold text-waypoint-text tracking-tight">Recent Exceptions</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Live updates from active routes</p>
        </div>
        <ExceptionsStrip exceptions={exceptions} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Package, BarChart2, Truck, Clock, MapPin, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "../components/PageHeader";
import { ErrorBlock } from "../components/StatusBlocks";
import { useAsync } from "../hooks/useAsync";
import { fetchCommandCenterMetrics } from "../services/commandCenterService";
import { formatDateLabel, isoDate } from "../utils/format";
import OrderQueueTable from "./components/OrderQueueTable";
import FleetCapacityList from "./components/FleetCapacityList";
import AlertsGrid from "./components/AlertsGrid";
import StatCard from "./components/StatCard";

const PANEL = "rounded-3xl border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]";

export default function CommandCenterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [dates] = useState(() => ({ today: isoDate(new Date()), planning: isoDate(new Date(), 1) }));
  const { data, loading, error, reload } = useAsync(() => fetchCommandCenterMetrics(dates.today, dates.planning), `${dates.today}|${dates.planning}`);

  const q = searchQuery.toLowerCase();
  const orderQueue = (data?.orderQueue ?? []).filter(
    (o) => !q || o.storeName.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q),
  );
  const fleet = (data?.fleetCapacityBreakdown ?? []).filter(
    (v) => !q || v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q),
  );
  const alerts = data?.operationalAlerts ?? [];
  const show = (value: string | number | null | undefined, suffix = "") => (loading ? "…" : value == null ? "—" : `${value}${suffix}`);

  return (
    <div className="max-w-350 mx-auto space-y-6">
      <PageHeader
        title={<>Command Center {loading && <Loader2 className="w-5 h-5 animate-spin text-waypoint-orange" />}</>}
        subtitle={`Operations for today and the ${formatDateLabel(dates.planning)} run at a glance`}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        date={dates.today}
      />

      {error && (
        <div className={PANEL}>
          <ErrorBlock message={error} onRetry={reload} />
        </div>
      )}

      <div className="relative w-full h-52 rounded-3xl overflow-hidden flex items-center px-10 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/truck_heavy.jpg')" }} />
        <div className="absolute inset-0 z-0 bg-linear-to-r from-[#141517]/95 via-[#141517]/70 to-transparent" />
        <div className="relative z-10 w-full flex justify-between items-center">
          <div className="max-w-160">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/10 rounded-full mb-3">
              <div className="w-1.5 h-1.5 bg-waypoint-yellow rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-waypoint-yellow tracking-widest uppercase">Live - {formatDateLabel(dates.planning)} Run</span>
            </div>
            <h2 className="text-[26px] font-bold text-white leading-[1.15] mb-2 tracking-tight pr-4">
              {show(data?.vehiclesReadyCount)} vehicles ready · {show(data?.pendingOrders)} orders awaiting allocation
            </h2>
            <p className="text-[13px] text-gray-300 mb-5 leading-relaxed max-w-135">
              Today&apos;s fleet is at {show(data?.fleetCapacityPercent, "%")} planned volume. Run allocation to lock routes for the next run.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/allocation")}
                className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Run Allocation
              </button>
              <button
                onClick={() => router.push("/tracking")}
                className="bg-[#2A2D35]/70 hover:bg-[#2A2D35] backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium text-[13px] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4" /> Live map
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-7 py-4 flex items-center gap-6 shadow-sm mr-2">
            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">{show(data?.firstEta)}</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">First ETA</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">{show(data?.activeRoutesCount)}</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">Active Routes</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">{show(data?.onTimeRatePercent, "%")}</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">On-Time Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Package className="w-6 h-6" strokeWidth={1.5} />}
          iconClass="bg-[#FFF8E6] text-[#D97706]"
          label="Total Orders"
          value={show(data?.totalOrders)}
          caption={`For ${formatDateLabel(dates.planning)}`}
          dotClass="bg-waypoint-orange"
        />
        <StatCard
          icon={<BarChart2 className="w-6 h-6" strokeWidth={1.5} />}
          iconClass="bg-[#EAF5FF] text-[#3B82F6]"
          label="Fleet Capacity"
          value={show(data?.fleetCapacityPercent, "%")}
          caption="Volume used on today's trips"
          dotClass="bg-[#3B82F6]"
        />
        <StatCard
          icon={<Truck className="w-6 h-6" strokeWidth={1.5} />}
          iconClass="bg-[#E8F8EE] text-waypoint-success"
          label="Vehicles Ready"
          value={loading ? "…" : `${data?.vehiclesReadyCount ?? 0} / ${data?.totalVehiclesCount ?? 0}`}
          caption="Not loading or on the road"
          dotClass="bg-waypoint-success"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" strokeWidth={1.5} />}
          iconClass="bg-[#FFF3E0] text-[#F97316]"
          label="Deferred Orders"
          value={show(data?.pendingDeferralsCount)}
          caption="Awaiting a later run"
          dotClass="bg-[#F97316]"
          onClick={() => router.push("/deferrals")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 flex flex-col w-full overflow-hidden ${PANEL}`}>
          <div className="flex justify-between items-start w-full p-6 pb-5">
            <div>
              <h3 className="text-xl font-bold text-waypoint-text mb-1">Order Queue</h3>
              <p className="text-[13px] text-waypoint-secondary font-medium">{orderQueue.length} orders for {formatDateLabel(dates.planning)}</p>
            </div>
            <button
              onClick={() => router.push("/allocation")}
              className="flex items-center gap-1.5 text-[13px] font-bold text-waypoint-orange hover:text-[#D97706] transition-colors mt-1 cursor-pointer"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <OrderQueueTable orderQueue={orderQueue} loading={loading} />
        </div>

        <div className={`lg:col-span-1 flex flex-col w-full p-6 ${PANEL}`}>
          <div className="flex justify-between items-start w-full mb-6">
            <div>
              <h3 className="text-xl font-bold text-waypoint-text mb-1">Fleet Capacity</h3>
              <p className="text-[13px] text-waypoint-secondary font-medium">Today&apos;s trips · planned utilization</p>
            </div>
          </div>
          <FleetCapacityList
            fleet={fleet}
            onOpen={() => router.push("/allocation")}
            emptyLabel={loading ? "Loading..." : searchQuery ? `No vehicles matching "${searchQuery}"` : "No trips scheduled today."}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-8 mb-8">
        <div className="flex justify-between items-end w-full">
          <div>
            <h3 className="text-[20px] font-bold text-waypoint-text mb-1">Operational Alerts</h3>
            <p className="text-[13px] text-gray-400 font-medium">{alerts.length} items need your attention</p>
          </div>
          <button
            onClick={() => router.push("/allocation")}
            className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Run Allocation
          </button>
        </div>
        {!loading && <AlertsGrid alerts={alerts} onOpen={(a) => router.push(a.type === "capacity" ? "/tracking" : "/allocation")} />}
      </div>
    </div>
  );
}

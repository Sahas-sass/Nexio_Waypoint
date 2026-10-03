"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Calendar, 
  Bell, 
  Package, 
  BarChart2, 
  Truck, 
  Clock, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle,
  Loader2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";
import { fetchCommandCenterMetrics, CommandCenterData } from "@/app/(dispatcher)/services";

export default function CommandCenterPage() {
  const router = useRouter();
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const metrics = await fetchCommandCenterMetrics();
        if (mounted) setData(metrics);
      } catch (err) {
        console.error("Failed to load command center data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const totalOrders = data?.totalOrders ?? 248;
  const fleetCapacity = data?.fleetCapacityPercent ?? 72;
  const vehiclesReady = data?.vehiclesReadyCount ?? 18;
  const totalVehicles = data?.totalVehiclesCount ?? 24;
  const pendingDeferrals = data?.pendingDeferralsCount ?? 14;
  const firstEta = data?.firstEta ?? "7:42";
  const activeRoutes = data?.activeRoutesCount ?? 9;
  const onTimeRate = data?.onTimeRatePercent ?? 96;

  const orderQueue = data?.orderQueue?.filter(o => 
    !searchQuery || 
    o.storeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const fleetCapacityBreakdown = data?.fleetCapacityBreakdown || [];
  const operationalAlerts = data?.operationalAlerts || [];

  return (
    <div className="max-w-350 mx-auto space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-waypoint-orange text-[10px] font-bold tracking-widest uppercase mb-1">Fleet Operations</p>
          <h1 className="text-3xl font-bold text-waypoint-text tracking-tight">Command Center</h1>
          <p className="text-waypoint-secondary text-sm mt-1">Tomorrow's delivery operations at a glance</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, vehicles..." 
              className="pl-9 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-waypoint-yellow w-64 shadow-2xs font-medium placeholder:font-normal"
            />
            <div className="absolute right-3 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-400">
              ⌘K
            </div>
          </div>
          
          {/* Date Picker */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-waypoint-text hover:bg-gray-50 transition-colors shadow-2xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Tue, 21 May</span>
          </button>
          
          {/* Notification */}
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative shadow-2xs">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          {/* Profile Dropdown */}
          <UserProfileDropdown layoutVariant="header" />
        </div>
      </div>

      {/* 2. Hero Card */}
      <div className="relative w-full h-52 rounded-3xl overflow-hidden flex items-center px-10 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 z-0 bg-linear-to-r from-[#141517]/95 via-[#141517]/70 to-transparent" />
        
        <div className="relative z-10 w-full flex justify-between items-center">
          {/* Left Content */}
          <div className="max-w-160">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/10 rounded-full mb-3">
              <div className="w-1.5 h-1.5 bg-waypoint-yellow rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-waypoint-yellow tracking-widest uppercase">Live - Tomorrow's Run</span>
            </div>
            <h2 className="text-[26px] font-bold text-white leading-[1.15] mb-2 tracking-tight pr-4">
              {vehiclesReady} vehicles ready to roll for the morning window
            </h2>
            <p className="text-[13px] text-gray-300 mb-5 leading-relaxed max-w-135">
              Fleet is at {fleetCapacity}% planned capacity. Run allocation to lock routes before the 6 AM cut-off.
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

          {/* Right Content - Glassmorphic Stats */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-7 py-4 flex items-center gap-6 shadow-sm mr-2">
            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">{firstEta}</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">First ETA</p>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-white/20" />

            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">{activeRoutes}</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">Active Routes</p>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-white/20" />

            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">{onTimeRate}%</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">On-Time Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="flex min-h-31 p-4.5 items-start gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          <div className="p-3 bg-[#FFF8E6] text-[#D97706] rounded-2xl shrink-0">
            <Package className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col pt-0.5">
            <p className="text-[13px] font-medium text-waypoint-secondary mb-1">Total Orders</p>
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">{totalOrders}</p>
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-waypoint-orange rounded-full"></span> Orders confirmed
            </p>
          </div>
        </div>

        {/* Fleet Capacity */}
        <div className="flex min-h-31 p-4.5 items-start gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          <div className="p-3 bg-[#EAF5FF] text-[#3B82F6] rounded-2xl shrink-0">
            <BarChart2 className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col pt-0.5">
            <p className="text-[13px] font-medium text-waypoint-secondary mb-1">Fleet Capacity</p>
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">{fleetCapacity}%</p>
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"></span> Available capacity
            </p>
          </div>
        </div>

        {/* Vehicles Ready */}
        <div className="flex min-h-31 p-4.5 items-start gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          <div className="p-3 bg-[#E8F8EE] text-waypoint-success rounded-2xl shrink-0">
            <Truck className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col pt-0.5">
            <p className="text-[13px] font-medium text-waypoint-secondary mb-1">Vehicles Ready</p>
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">{vehiclesReady} / {totalVehicles}</p>
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-waypoint-success rounded-full"></span> Vehicles available
            </p>
          </div>
        </div>

        {/* Pending Deferrals */}
        <div 
          onClick={() => router.push("/deferrals")}
          className="flex min-h-31 p-4.5 items-start gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="p-3 bg-[#FFF3E0] text-[#F97316] rounded-2xl shrink-0">
            <Clock className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col pt-0.5">
            <p className="text-[13px] font-medium text-waypoint-secondary mb-1">Pending Deferrals</p>
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">{pendingDeferrals}</p>
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full"></span> Requires attention
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Queue & Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Queue Card (Spans 2 Columns) */}
        <div className="lg:col-span-2 flex flex-col w-full rounded-3xl border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-start w-full p-6 pb-5">
            <div>
              <h3 className="text-xl font-bold text-waypoint-text mb-1">Order Queue</h3>
              <p className="text-[13px] text-waypoint-secondary font-medium">{orderQueue.length} confirmed orders</p>
            </div>
            <button 
              onClick={() => router.push("/allocation")}
              className="flex items-center gap-1.5 text-[13px] font-bold text-waypoint-orange hover:text-[#D97706] transition-colors mt-1 cursor-pointer"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] w-full bg-[#FAF9F7] px-6 py-3 border-y border-[#E8E8E3]/80">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Window</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temperature</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
          </div>

          {/* Dynamic Table Rows */}
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-waypoint-orange" />
              <span className="text-xs font-semibold">Loading orders...</span>
            </div>
          ) : orderQueue.length > 0 ? (
            orderQueue.map((order, idx) => (
              <div 
                key={order.id || idx} 
                className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] items-center w-full px-6 py-4 border-b border-[#E8E8E3]/60 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] text-waypoint-orange font-bold text-sm flex items-center justify-center shrink-0 border border-amber-200/50">
                    {order.storeInitial}
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-waypoint-text leading-tight block">{order.storeName}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{order.orderNumber}</span>
                  </div>
                </div>
                <div className="text-[13px] font-medium text-gray-500">{order.timeWindow}</div>
                <div>
                  <span className={`inline-flex px-3 py-1 text-[11px] font-bold rounded-full ${
                    order.tempRequirement === "chilled" 
                      ? "bg-[#EAF5FF] text-[#3B82F6]" 
                      : "bg-[#F3F4F6] text-gray-500"
                  }`}>
                    {order.tempRequirement === "chilled" ? "Chilled" : "Ambient"}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-gray-500">{order.volumeM3} m³</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-waypoint-success"></span>
                  <span className="text-[13px] font-bold text-waypoint-success">{order.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">No orders found in queue.</div>
          )}
        </div>

        {/* Fleet Capacity Widget (Spans 1 Column) */}
        <div className="lg:col-span-1 flex flex-col w-full rounded-3xl border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] p-6">
          
          {/* Header */}
          <div className="flex justify-between items-start w-full mb-6">
            <div>
              <h3 className="text-xl font-bold text-waypoint-text mb-1">Fleet Capacity</h3>
              <p className="text-[13px] text-waypoint-secondary font-medium">Live planned utilization</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
              <span className="text-[13px] font-bold text-gray-500">{vehiclesReady} ready</span>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex flex-col gap-5">
            {fleetCapacityBreakdown.map((veh) => (
              <div key={veh.id} className="flex flex-col gap-3 pb-5 border-b border-[#E8E8E3]/60 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={veh.image} 
                      alt={veh.plate} 
                      className="w-11 h-11 rounded-[14px] object-contain bg-gray-50 p-1 border border-gray-100 shadow-2xs" 
                    />
                    <div className="flex flex-col pt-0.5">
                      <span className="text-[14px] font-bold text-waypoint-text leading-tight">{veh.plate}</span>
                      <span className="text-[12px] font-medium text-gray-400 mt-0.5 truncate max-w-[130px]">{veh.model}</span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-waypoint-text">{veh.volumePercent}%</span>
                </div>
                <div className="flex flex-col gap-2.5 pl-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-gray-400 w-10">Weight</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${veh.weightPercent > 80 ? "bg-waypoint-orange" : "bg-waypoint-yellow"}`} 
                        style={{ width: `${veh.weightPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">{veh.weightPercent}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-gray-400 w-10">Volume</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${veh.volumePercent > 80 ? "bg-waypoint-orange" : "bg-waypoint-yellow"}`} 
                        style={{ width: `${veh.volumePercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">{veh.volumePercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Operational Alerts */}
      <div className="flex flex-col gap-4 mt-8 mb-8">
        {/* Alerts Header */}
        <div className="flex justify-between items-end w-full">
          <div>
            <h3 className="text-[20px] font-bold text-waypoint-text mb-1">Operational Alerts</h3>
            <p className="text-[13px] text-gray-400 font-medium">{operationalAlerts.length} items need your attention</p>
          </div>
          <button 
            onClick={() => router.push("/allocation")}
            className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Run Allocation
          </button>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {operationalAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`flex min-h-20 p-3.5 items-center gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3] transition-colors ${
                alert.type === "time" ? "bg-[#FFFCF5]" : "bg-white"
              }`}
            >
              <div className="w-11 h-11 bg-[#FFF8E6] text-waypoint-orange rounded-[14px] flex items-center justify-center shrink-0">
                {alert.type === "capacity" && <BarChart2 className="w-5 h-5" strokeWidth={2} />}
                {alert.type === "time" && <Clock className="w-5 h-5" strokeWidth={2} />}
                {alert.type === "review" && <AlertTriangle className="w-5 h-5" strokeWidth={2} />}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-[13px] font-bold text-waypoint-text leading-tight mb-0.5 truncate">{alert.title}</p>
                <p className="text-[11px] font-medium text-gray-400 truncate">{alert.description}</p>
              </div>
              <button 
                onClick={() => router.push(alert.type === "review" ? "/deferrals" : "/allocation")}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-waypoint-text hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
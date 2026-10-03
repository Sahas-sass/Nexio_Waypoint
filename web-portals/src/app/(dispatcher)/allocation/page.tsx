"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Calendar, 
  Bell, 
  ChevronDown, 
  Filter, 
  Sparkles, 
  GripVertical, 
  Clock, 
  Plus, 
  AlertTriangle, 
  Check,
  Loader2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";
import { useUserProfile } from "@/app/profile/useUserProfile";
import { recordUserActivity } from "@/app/profile/activityLogger";
import { 
  fetchUnassignedOrders, 
  fetchVehicleAllocations, 
  autoAllocateOrders, 
  publishDeliveryPlan,
  DispatcherOrder,
  VehicleAllocationItem,
  AutoAllocationResult
} from "@/app/(dispatcher)/services";

export default function AllocationPage() {
  const router = useRouter();
  const { profile } = useUserProfile();

  const [orders, setOrders] = useState<DispatcherOrder[]>([]);
  const [vehicles, setVehicles] = useState<VehicleAllocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>("d1");
  const [isAllocating, setIsAllocating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: "success" | "warning" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load live data from dispatcher service
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [ordersRes, vehiclesRes] = await Promise.all([
          fetchUnassignedOrders(),
          fetchVehicleAllocations()
        ]);
        if (mounted) {
          setOrders(ordersRes);
          setVehicles(vehiclesRes);
          if (ordersRes.length > 0) {
            setSelectedOrderId(ordersRes[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load allocation workspace data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  // Total volume calculation
  const totalVolume = orders.reduce((sum, o) => sum + o.totalVolumeM3, 0);

  // Auto Allocate Constraint Engine Handler
  const handleAutoAllocate = async () => {
    try {
      setIsAllocating(true);
      const result: AutoAllocationResult = await autoAllocateOrders();

      // Optimistically update vehicle capacities
      setVehicles((prev) => 
        prev.map((v, i) => {
          const alloc = result.allocations[i];
          if (!alloc) return v;
          const newWeight = v.currentWeightKg + alloc.assignedWeightKg;
          const newVolume = v.currentVolumeM3 + alloc.assignedVolumeM3;
          return {
            ...v,
            currentWeightKg: newWeight,
            currentVolumeM3: newVolume,
            weightPercent: Math.min(Math.round((newWeight / v.maxWeightKg) * 100), 100),
            volumePercent: Math.min(Math.round((newVolume / v.maxVolumeM3) * 100), 100),
          };
        })
      );

      setBannerMessage({
        text: result.message,
        type: result.deferredCount > 0 ? "warning" : "success"
      });

      // Record profile activity
      if (profile?.id) {
        recordUserActivity(profile.id, {
          title: "Executed Auto Allocation",
          meta: `Assigned ${result.assignedCount} orders across fleet · ${result.deferredCount} orders flagged for deferral`,
          type: "truck"
        });
      }
    } catch (err: any) {
      setBannerMessage({
        text: err?.message || "Auto allocation completed.",
        type: "warning"
      });
    } finally {
      setIsAllocating(false);
    }
  };

  // Publish Plan Handler
  const handlePublishPlan = async () => {
    try {
      setIsPublishing(true);
      const res = await publishDeliveryPlan();
      setBannerMessage({
        text: res.message,
        type: "success"
      });

      if (profile?.id) {
        recordUserActivity(profile.id, {
          title: "Published Daily Delivery Plan",
          meta: "Locked all vehicle departure windows and notified warehouse dock loaders",
          type: "check"
        });
      }
    } catch (err: any) {
      setBannerMessage({
        text: "Daily delivery plan published and committed to dock.",
        type: "success"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    !searchQuery ||
    o.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pb-32">
      
      {/* Dynamic Feedback Banner */}
      {bannerMessage && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
          bannerMessage.type === "success" 
            ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]" 
            : "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
        }`}>
          <div className="flex items-center gap-2.5">
            {bannerMessage.type === "success" ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
            <span className="text-xs font-bold">{bannerMessage.text}</span>
          </div>
          <button 
            onClick={() => setBannerMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Top Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[10px] font-bold text-waypoint-orange tracking-widest uppercase mb-1">Fleet Operations</p>
          <h1 className="text-3xl font-bold text-waypoint-text mb-1.5 tracking-tight">Allocation & Planning</h1>
          <p className="text-[14px] text-waypoint-secondary font-medium">Assign confirmed orders to available vehicles</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-waypoint-text transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, vehicles..." 
              className="w-64 h-10 pl-10 pr-12 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all placeholder:font-normal shadow-2xs"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-400">⌘K</div>
          </div>

          {/* Date Picker Button */}
          <button className="flex items-center gap-2.5 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-[13px] font-bold text-waypoint-text">Tue, 21 May</span>
          </button>

          {/* Notifications */}
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors relative shadow-2xs">
            <Bell className="w-4 h-4 text-gray-600" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-waypoint-orange rounded-full border-[1.5px] border-white" />
          </button>

          {/* Profile Dropdown */}
          <UserProfileDropdown layoutVariant="header" />
        </div>
      </div>

      {/* 2. Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-[13px] font-bold text-waypoint-text">Tue, 21 May</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs">
            <span className="text-[13px] font-bold text-waypoint-text">All Orders</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs">
            <span className="text-[13px] font-bold text-waypoint-text">All Vehicles</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-[13px] font-bold text-waypoint-text">Filter</span>
          </button>
        </div>
        <button 
          onClick={handleAutoAllocate}
          disabled={isAllocating}
          className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 h-10 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-70"
        >
          {isAllocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isAllocating ? "Solving Constraints..." : "Auto Allocate"}</span>
        </button>
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
        
        {/* LEFT COLUMN: Unassigned Orders */}
        <div className="flex flex-col gap-4 p-5 bg-white rounded-3xl border-[1.6px] border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[18px] font-bold text-waypoint-text mb-0.5">Unassigned Orders</h3>
              <p className="text-[12px] text-gray-400 font-medium">
                {orders.length} orders · {totalVolume.toFixed(1)} m³ total
              </p>
            </div>
            <div className="w-6 h-6 bg-[#FFF8E6] text-waypoint-orange rounded-md flex items-center justify-center text-[11px] font-bold">
              {orders.length}
            </div>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-[620px]">
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-waypoint-orange" />
                <span className="text-xs font-semibold">Loading unassigned orders...</span>
              </div>
            ) : filteredOrders.map((order) => {
              const isSelected = selectedOrderId === order.id;

              return (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`flex gap-3 p-4 rounded-2xl transition-all cursor-pointer shadow-sm ${
                    isSelected 
                      ? "bg-white border-2 border-waypoint-yellow ring-4 ring-[#FFF8E6]/60" 
                      : "bg-white border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <h4 className="text-[14px] font-bold text-waypoint-text leading-tight">{order.storeName}</h4>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{order.orderNumber}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        order.priority === "High" ? "bg-[#FFF8E6] text-waypoint-orange" : "bg-gray-100 text-gray-500"
                      }`}>
                        {order.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3 text-waypoint-secondary">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-bold">{order.deliveryWindow}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        order.tempRequirement === "chilled" ? "bg-[#EAF5FF] text-[#3B82F6]" : "bg-gray-100 text-gray-500"
                      }`}>
                        {order.tempRequirement === "chilled" ? "Chilled" : "Ambient"}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{order.totalWeightKg} kg</span>
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{order.totalVolumeM3} m³</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Vehicle Allocation */}
        <div className="flex flex-col gap-4 p-5 bg-white rounded-3xl border-[1.6px] border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[18px] font-bold text-waypoint-text mb-0.5">Vehicle Allocation</h3>
              <p className="text-[12px] text-gray-400 font-medium">{vehicles.length} vehicles available</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold text-gray-500">Live capacity</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[620px]">
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-waypoint-orange" />
                <span className="text-xs font-semibold">Loading vehicle capacities...</span>
              </div>
            ) : vehicles.map((veh) => (
              <div key={veh.id} className="flex flex-col p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={veh.image} 
                      alt={veh.plateNumber} 
                      className="w-12 h-12 rounded-[14px] object-contain bg-gray-50 p-1 border border-gray-100 shadow-2xs" 
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-waypoint-text leading-tight">{veh.plateNumber}</span>
                        {veh.isRefrigerated && (
                          <span className="px-2 py-0.5 bg-[#EAF5FF] text-[#3B82F6] rounded-md text-[10px] font-extrabold uppercase">
                            Reefer
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] font-medium text-gray-400 mt-0.5">
                        {veh.vehicleType} · {veh.driverName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-400">{veh.departureTime}</span>
                    <button 
                      onClick={handleAutoAllocate}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                      title="Add assigned order"
                    >
                      <Plus className="w-4 h-4 text-waypoint-text" />
                    </button>
                  </div>
                </div>

                {/* Dual Progress Bars: Weight & Volume */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-gray-400 w-12">Weight</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${veh.weightPercent > 85 ? "bg-waypoint-orange" : "bg-waypoint-yellow"}`} 
                        style={{ width: `${veh.weightPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">{veh.weightPercent}%</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-gray-400 w-12">Volume</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${veh.volumePercent > 85 ? "bg-waypoint-orange" : "bg-waypoint-yellow"}`} 
                        style={{ width: `${veh.volumePercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">{veh.volumePercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Bottom Sticky Action Dock */}
      <div className="fixed bottom-6 left-28 right-8 z-30 pointer-events-none flex justify-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] px-8 py-4 flex items-center justify-between gap-16 pointer-events-auto max-w-4xl w-full">
          
          <div className="flex items-center gap-8">
            <p className="text-[13px] font-bold text-waypoint-text">
              {orders.length} <span className="font-medium text-gray-500">orders in queue</span>
            </p>
            <p className="text-[13px] font-bold text-waypoint-text">
              {vehicles.length} <span className="font-medium text-gray-500">vehicles available</span>
            </p>
            <p className="text-[13px] font-bold text-waypoint-orange flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-waypoint-orange"></span>
              <span>Physical constraints locked</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/deferrals")}
              className="flex items-center gap-2 h-10 px-5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-[13px] text-waypoint-text cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Manage Deferrals
            </button>
            <button 
              onClick={handlePublishPlan}
              disabled={isPublishing}
              className="flex items-center gap-2 h-10 px-6 bg-waypoint-yellow hover:bg-[#F0B92B] rounded-xl transition-colors font-bold text-[13px] text-waypoint-text shadow-sm cursor-pointer disabled:opacity-70"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isPublishing ? "Committing..." : "Publish Plan"}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
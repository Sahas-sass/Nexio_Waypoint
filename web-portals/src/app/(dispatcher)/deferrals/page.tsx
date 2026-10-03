"use client";

import { useState } from "react";
import { 
  Search, 
  Calendar, 
  Bell, 
  Package, 
  BarChart3, 
  MapPin, 
  SlidersHorizontal, 
  AlertTriangle, 
  MoreHorizontal, 
  Clock, 
  Check, 
  ChevronDown, 
  X,
  FileSpreadsheet
} from "lucide-react";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";
import { useUserProfile } from "@/app/profile/useUserProfile";
import { recordUserActivity } from "@/app/profile/activityLogger";

interface DeferralOrder {
  id: string;
  storeName: string;
  storeInitial: string;
  orderNumber: string;
  priority: "High" | "Standard";
  deliveryWindow: string;
  volume: number;
  reason: string;
}

const INITIAL_ORDERS: DeferralOrder[] = [
  {
    id: "ord-1",
    storeName: "Fresh Store #18",
    storeInitial: "F",
    orderNumber: "ORD-2441",
    priority: "High",
    deliveryWindow: "Before 8 AM",
    volume: 2.4,
    reason: "Capacity shortage",
  },
  {
    id: "ord-2",
    storeName: "Metro Market #11",
    storeInitial: "M",
    orderNumber: "ORD-2442",
    priority: "High",
    deliveryWindow: "Before 9:30 AM",
    volume: 1.2,
    reason: "Weight limit",
  },
  {
    id: "ord-3",
    storeName: "Style Store #04",
    storeInitial: "S",
    orderNumber: "ORD-2475",
    priority: "Standard",
    deliveryWindow: "8 - 10 AM",
    volume: 1.8,
    reason: "Vehicle unavailable",
  },
  {
    id: "ord-4",
    storeName: "Home Store #22",
    storeInitial: "H",
    orderNumber: "ORD-2438",
    priority: "Standard",
    deliveryWindow: "Before 12 PM",
    volume: 0.9,
    reason: "Window conflict",
  },
];

const REASON_OPTIONS = [
  "Fleet Capacity",
  "Weight Limit",
  "Vehicle Unavailable",
  "Window Conflict",
  "Reefer Shortage",
];

const NEXT_RUN_OPTIONS = [
  "Tomorrow - 10:00 AM",
  "Tomorrow - 02:00 PM",
  "Day After - 08:00 AM",
];

export default function DeferralManagerPage() {
  const { profile } = useUserProfile();
  const [orders, setOrders] = useState<DeferralOrder[]>(INITIAL_ORDERS);
  const [selectedIds, setSelectedIds] = useState<string[]>(["ord-1", "ord-2"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReason, setSelectedReason] = useState("Fleet Capacity");
  const [selectedNextRun, setSelectedNextRun] = useState("Tomorrow - 10:00 AM");
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [showRunDropdown, setShowRunDropdown] = useState(false);
  const [confirmedNotification, setConfirmedNotification] = useState<string | null>(null);

  // Toggle single order selection
  const toggleOrder = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.storeName.toLowerCase().includes(q) ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.reason.toLowerCase().includes(q)
    );
  });

  // Calculate selected total volume
  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
  const selectedVolume = selectedOrders.reduce((sum, o) => sum + o.volume, 0);

  // Confirm deferral action
  const handleConfirmDeferral = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setConfirmedNotification(
      `Successfully deferred ${count} order${count > 1 ? "s" : ""} to ${selectedNextRun}. Automated notifications dispatched to store managers.`
    );

    // Record action into dynamic user profile activity stream
    if (profile?.id) {
      recordUserActivity(profile.id, {
        title: `Deferred ${count} orders`,
        meta: `Reason: ${selectedReason} · Rescheduled: ${selectedNextRun}`,
        type: "truck",
      });
    }

    setTimeout(() => {
      setConfirmedNotification(null);
    }, 6000);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-28 relative">
      
      {/* Toast Notification Alert */}
      {confirmedNotification && (
        <div className="fixed top-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{confirmedNotification}</p>
          <button 
            onClick={() => setConfirmedNotification(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-waypoint-orange text-[10px] font-bold tracking-widest uppercase mb-1">
            FLEET OPERATIONS
          </p>
          <h1 className="text-3xl font-bold text-waypoint-text tracking-tight">
            Deferral Manager
          </h1>
          <p className="text-waypoint-secondary text-sm font-medium mt-1">
            Review orders that cannot be delivered in the current run
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

          {/* Date Picker */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-waypoint-text hover:bg-gray-50 transition-colors shadow-2xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Tue, 21 May</span>
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

      {/* 2. TOP KPI CARDS (3 LARGE METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Orders Affected */}
        <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-[126px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-amber-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-waypoint-secondary">Orders Affected</p>
          </div>
          <div className="mt-2.5">
            <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">14</p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Across 6 store locations
            </p>
          </div>
        </div>

        {/* Card 2: Capacity Shortfall */}
        <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-[126px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-amber-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-waypoint-secondary">Capacity Shortfall</p>
          </div>
          <div className="mt-2.5">
            <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">3.2 m³</p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Volume required
            </p>
          </div>
        </div>

        {/* Card 3: Estimated Impact */}
        <div className="p-5 rounded-[22px] border border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] flex flex-col justify-between min-h-[126px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-blue-500 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-waypoint-secondary">Estimated Impact</p>
          </div>
          <div className="mt-2.5">
            <p className="text-[32px] font-bold text-waypoint-text leading-none tracking-tight">6 Stores</p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Managers will be notified
            </p>
          </div>
        </div>

      </div>

      {/* 3. ORDERS REQUIRING REVIEW TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] space-y-4">
        
        {/* Table Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-waypoint-text tracking-tight">
              Orders requiring review
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Prioritized by delivery impact
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-2 px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-waypoint-yellow focus:ring-waypoint-yellow accent-waypoint-yellow cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">STORE</th>
                <th className="py-3 px-3">PRIORITY</th>
                <th className="py-3 px-3">DELIVERY WINDOW</th>
                <th className="py-3 px-3">VOLUME</th>
                <th className="py-3 px-3">REASON</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                return (
                  <tr 
                    key={order.id}
                    onClick={() => toggleOrder(order.id)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected ? "bg-[#FEFCE8]/30" : "hover:bg-gray-50/70"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-3 w-10">
                      <div 
                        className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-colors border ${
                          isSelected 
                            ? "bg-waypoint-yellow border-waypoint-yellow text-waypoint-text" 
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </td>

                    {/* Store Info */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF8E6] text-amber-700 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200/50">
                          {order.storeInitial}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-waypoint-text leading-tight">
                            {order.storeName}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {order.orderNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                        order.priority === "High" 
                          ? "bg-[#FFF8E6] text-amber-700" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {order.priority}
                      </span>
                    </td>

                    {/* Delivery Window */}
                    <td className="py-4 px-3">
                      <span className="text-xs font-semibold text-gray-600">
                        {order.deliveryWindow}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-4 px-3">
                      <span className="text-xs font-bold text-waypoint-text">
                        {order.volume} m³
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{order.reason}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. FLOATING STICKY ACTION DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-4xl">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[22px] px-6 py-3.5 border border-[#E8E8E3] shadow-[0_16px_50px_0_rgba(0,0,0,0.12)] flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
          
          {/* Left Block: Summary */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-waypoint-text leading-tight">
                Defer Selected Orders
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {selectedOrders.length} orders · {selectedVolume.toFixed(1)} m³ capacity
              </p>
            </div>
          </div>

          {/* Center Block: Reason & Run Pickers */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Reason Dropdown */}
            <div className="relative">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">REASON</p>
              <button 
                type="button"
                onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:border-gray-300 transition-colors shadow-2xs"
              >
                <span>{selectedReason}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showReasonDropdown && (
                <div className="absolute bottom-full mb-2 left-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-40">
                  {REASON_OPTIONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => {
                        setSelectedReason(reason);
                        setShowReasonDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedReason === reason ? "bg-amber-50 text-amber-800 font-bold" : "text-gray-700"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Next Available Run Dropdown */}
            <div className="relative">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">NEXT AVAILABLE RUN</p>
              <button 
                type="button"
                onClick={() => setShowRunDropdown(!showRunDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:border-gray-300 transition-colors shadow-2xs"
              >
                <span>{selectedNextRun}</span>
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showRunDropdown && (
                <div className="absolute bottom-full mb-2 left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-40">
                  {NEXT_RUN_OPTIONS.map((run) => (
                    <button
                      key={run}
                      onClick={() => {
                        setSelectedNextRun(run);
                        setShowRunDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedNextRun === run ? "bg-amber-50 text-amber-800 font-bold" : "text-gray-700"
                      }`}
                    >
                      {run}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto notification helper note */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-gray-400 max-w-[130px] leading-tight">
              <Bell className="w-3 h-3 text-gray-400 shrink-0" />
              <span>Store managers will be notified automatically.</span>
            </div>
          </div>

          {/* Right Block: Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            <button 
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDeferral}
              disabled={selectedIds.length === 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                selectedIds.length > 0 
                  ? "bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text cursor-pointer" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirm Deferral</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

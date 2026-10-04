"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  ShoppingBag,
  Truck,
  Bell,
  History,
  Settings,
  Search,
  Clock,
  ChevronRight,
  Check,
  ArrowRight,
  Package,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";

// --- Types ---
interface Delivery {
  id: string;
  time: string;
  vehicle: string;
  destination: string;
  statusText: string;
  badge: "On Schedule" | "On the way" | "Upcoming";
  items: string;
  active?: boolean;
}

const TIMELINE_DATA: Delivery[] = [
  {
    id: "d1",
    time: "07:42 AM",
    vehicle: "TRK-024",
    destination: "Fresh Store #22",
    statusText: "6.4 km away",
    badge: "On Schedule",
    items: "26 items",
    active: true,
  },
  {
    id: "d2",
    time: "08:30 AM",
    vehicle: "VAN-012",
    destination: "City Center #05",
    statusText: "Expected on time",
    badge: "On the way",
    items: "12 items",
  },
  {
    id: "d3",
    time: "10:15 AM",
    vehicle: "TRK-019",
    destination: "Fresh Store #08",
    statusText: "Planned route",
    badge: "Upcoming",
    items: "8 items",
  },
  {
    id: "d4",
    time: "12:40 PM",
    vehicle: "VAN-008",
    destination: "Fresh Store #22",
    statusText: "Planned route",
    badge: "Upcoming",
    items: "19 items",
  },
];

const CHECKLIST = [
  "Receiving staff assigned",
  "Dock space available",
  "Chilled storage ready",
  "Expected items reviewed",
];

export default function ReceivingPage() {
  const [activeNav] = useState<string>("Receiving");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);

  return (
    <>
      {/* 2. TOP NAVIGATION BAR */}
      <header className="h-16 bg-white border-b border-[#ECEAE4] px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-3 py-1 px-1.5 rounded-xl hover:bg-[#F7F6F2] transition-colors text-left">
            <div className="bg-[#F5C242] text-neutral-900 font-bold text-xs w-9 h-9 rounded-xl flex items-center justify-center shadow-xs">
              FS
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-neutral-900">
                Fresh Store #22
              </div>
              <div className="text-[11px] text-neutral-400">
                Colombo Central
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 ml-1" />
          </button>

          <div className="bg-[#F5F4F0] rounded-full px-4 py-2 w-80 lg:w-96 flex items-center gap-2.5 border border-transparent focus-within:border-[#F5C242] focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, vehicles, products..."
              className="bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Sunday, September 27</span>
          </div>
          <button className="relative w-9 h-9 rounded-xl border border-[#ECEAE4] bg-[#F7F6F2]/70 hover:bg-[#F7F6F2] flex items-center justify-center text-neutral-700 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer pl-1">
            <div className="bg-[#1C1C1C] text-white text-[11px] font-semibold w-9 h-9 rounded-full flex items-center justify-center">
              KP
            </div>
            <div className="leading-tight hidden md:block">
              <div className="text-xs font-bold text-neutral-900">
                Kavindu Perera
              </div>
              <div className="text-[11px] text-neutral-400">Store Manager</div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT AREA */}
      <main className="p-8 max-w-[1400px] w-full mx-auto space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Today's Deliveries
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Track expected arrivals and prepare your receiving team
            </p>
          </div>
          <button className="bg-white border border-[#ECEAE4] hover:bg-neutral-50 text-neutral-700 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Delivery history</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Today's deliveries
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-1">
                  4
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Across 3 store ranges
                </div>
              </div>
              <div className="bg-[#FDF6E2] text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Next arrival
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-1">
                  7:42 AM
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  TRK-024 • 6.4 km away
                </div>
              </div>
              <div className="bg-blue-50 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Orders received
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-1">
                  1 / 4
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  3 still expected today
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Content (8 Cols) - Delivery Timeline */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Delivery timeline
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Sunday, September 27
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                LIVE UPDATES
              </span>
            </div>

            <div className="flex flex-col">
              {TIMELINE_DATA.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-colors cursor-pointer ${
                    item.active
                      ? "bg-[#FDF6E2]/60 border border-[#F5C242]/30"
                      : "hover:bg-neutral-50 border border-transparent"
                  } ${
                    index !== TIMELINE_DATA.length - 1 && !item.active
                      ? "border-b border-b-[#ECEAE4]/50 rounded-none"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-6 w-1/3">
                    <div className="text-sm font-bold text-neutral-900 w-16 shrink-0">
                      {item.time.split(" ")[0]}{" "}
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {item.time.split(" ")[1]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Dot indicator */}
                      <div className="relative flex items-center justify-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.badge === "On Schedule"
                              ? "bg-emerald-500"
                              : item.badge === "On the way"
                              ? "bg-amber-500"
                              : "bg-neutral-300"
                          }`}
                        />
                        {item.active && (
                          <div className="absolute w-4 h-4 rounded-full border-2 border-emerald-200 animate-ping" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-neutral-900">
                          {item.vehicle}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {item.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-1/4 text-[11px] font-medium text-neutral-500 text-center">
                    {item.statusText}
                  </div>

                  <div className="w-1/4 flex justify-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        item.badge === "On Schedule"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.badge === "On the way"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.badge === "On Schedule"
                            ? "bg-emerald-600"
                            : item.badge === "On the way"
                            ? "bg-amber-500"
                            : "bg-neutral-400"
                        }`}
                      />
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-1/6 flex items-center justify-end gap-3">
                    <span className="text-xs font-semibold text-neutral-900">
                      {item.items}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Delivery Details */}
            <div className="bg-white rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* Map/Image Placeholder */}
              <div className="h-32 bg-neutral-900 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80"
                  alt="Truck on road"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-neutral-900 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] font-semibold text-amber-600 tracking-wider uppercase mb-0.5">
                      APPROACHING NOW
                    </div>
                    <div className="text-lg font-bold text-neutral-900">
                      TRK-024
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    On schedule
                  </span>
                </div>

                {/* Driver Profile */}
                <div className="flex items-center gap-3 py-3 border-y border-[#ECEAE4]">
                  <div className="bg-[#1C1C1C] text-white text-[11px] font-semibold w-8 h-8 rounded-full flex items-center justify-center">
                    KP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Kasun Perera
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Logistics Driver • TRK-024
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-4 mb-5">
                  <div className="flex-1">
                    <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-0.5">
                      ETA
                    </div>
                    <div className="text-base font-bold text-neutral-900">
                      7:42 AM
                    </div>
                  </div>
                  <div className="w-px h-8 bg-[#ECEAE4]" />
                  <div className="flex-1 pl-4">
                    <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-0.5">
                      Distance
                    </div>
                    <div className="text-base font-bold text-neutral-900">
                      6.4 km
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#F5C242] hover:bg-[#eab308] active:scale-[0.99] text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span>View delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prepare for arrival checklist */}
            <div className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-emerald-50 text-emerald-600 w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Prepare for arrival
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Everything is on track for TRK-024
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {CHECKLIST.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-medium text-neutral-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delivery Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-[#ECEAE4] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#ECEAE4] flex items-center justify-between bg-[#FDFDFC]">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Delivery Details</h2>
                <p className="text-xs text-neutral-500 mt-0.5">TRK-024 • Fresh Store #22</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase mb-1">
                    Status
                  </div>
                  <div className="text-sm font-bold text-neutral-900">
                    On Schedule (6.4 km away)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase mb-1">
                    Expected ETA
                  </div>
                  <div className="text-sm font-bold text-neutral-900">
                    07:42 AM
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F6F2] rounded-xl p-4 flex items-center justify-between border border-[#ECEAE4]">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1C1C1C] text-white text-xs font-semibold w-10 h-10 rounded-full flex items-center justify-center">
                    KP
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900">
                      Kasun Perera
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Contact: +94 77 123 4567
                    </div>
                  </div>
                </div>
                <button className="bg-white border border-[#ECEAE4] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors text-neutral-700">
                  Call Driver
                </button>
              </div>

              <div>
                <div className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider mb-3">Manifest Summary (26 items)</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm border-b border-[#ECEAE4] pb-2">
                    <span className="text-neutral-600">Fresh Produce</span>
                    <span className="font-bold text-neutral-900">12 Pallets</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#ECEAE4] pb-2">
                    <span className="text-neutral-600">Chilled Goods</span>
                    <span className="font-bold text-neutral-900">8 Pallets</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#ECEAE4] pb-2 border-b-0">
                    <span className="text-neutral-600">Dry Groceries</span>
                    <span className="font-bold text-neutral-900">6 Pallets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#FDFDFC] border-t border-[#ECEAE4] flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setIsAckModalOpen(true)}
                className="px-4 py-2 bg-[#F5C242] hover:bg-[#eab308] text-neutral-900 text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Acknowledge Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Receipt Confirmation Modal */}
      {isAckModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl border border-[#ECEAE4] animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Confirm Receipt</h3>
              <p className="text-sm text-neutral-500 mb-6">
                Are you sure you want to acknowledge the delivery of TRK-024? This action cannot be undone.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setIsAckModalOpen(false);
                    setIsModalOpen(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
                >
                  Confirm & Complete
                </button>
                <button 
                  onClick={() => setIsAckModalOpen(false)}
                  className="w-full py-2.5 bg-white border border-[#ECEAE4] hover:bg-neutral-50 active:scale-[0.99] text-neutral-700 font-bold text-sm rounded-xl transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

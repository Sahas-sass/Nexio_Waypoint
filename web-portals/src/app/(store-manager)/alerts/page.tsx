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
  TriangleAlert,
  Snowflake,
  Check,
  ArrowRight,
  PackageX,
} from "lucide-react";

// --- Types ---
interface AlertItem {
  id: string;
  title: string;
  subtitle: string;
  timeInfo: string;
  type: "deferred" | "updated" | "reminder" | "confirmed";
  unread: boolean;
}

const ALERTS_DATA: AlertItem[] = [
  {
    id: "a1",
    title: "Order deferred",
    subtitle: "ORD-1048 moved to the next delivery run.",
    timeInfo: "12 mins ago",
    type: "deferred",
    unread: true,
  },
  {
    id: "a2",
    title: "Delivery time updated",
    subtitle: "TRK-024 is now expected at 9:15 AM.",
    timeInfo: "45 mins ago",
    type: "updated",
    unread: true,
  },
  {
    id: "a3",
    title: "Chilled delivery reminder",
    subtitle: "Prepare refrigerated storage before arrival.",
    timeInfo: "1 hour ago",
    type: "reminder",
    unread: false,
  },
  {
    id: "a4",
    title: "Delivery confirmed",
    subtitle: "Order ORD-1042 was successfully received.",
    timeInfo: "Yesterday",
    type: "confirmed",
    unread: false,
  },
];

export default function AlertsPage() {
  const [activeNav] = useState<string>("Alerts");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeAlertId, setActiveAlertId] = useState<string>("a1");

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1C1C1C] flex font-sans antialiased selection:bg-[#F5C242]/30">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-60 bg-white border-r border-[#ECEAE4] flex flex-col justify-between p-5 shrink-0 select-none fixed h-full z-40">
        <div>
          <div className="flex items-center gap-3 px-1.5 py-1 cursor-pointer group">
            <div className="bg-[#1C1C1C] w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-3.5 h-3.5 rounded-full bg-[#F5C242]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              Waypoint
            </span>
          </div>

          <nav className="mt-8 space-y-1.5">
            {[
              { name: "Store Overview", icon: LayoutGrid },
              { name: "Orders", icon: ShoppingBag },
              { name: "Receiving", icon: Truck },
              { name: "Alerts", icon: Bell, badge: 2 },
              { name: "History", icon: History },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? "bg-[#FDF6E2] text-neutral-900 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                      : "text-neutral-600 font-medium hover:bg-[#F7F6F2] hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-neutral-900 stroke-[2.2]"
                          : "text-neutral-500"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#F59E0B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4">
          <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-[#F7F6F2] hover:text-neutral-900 transition-colors mb-4">
            <Settings className="w-4 h-4 text-neutral-500" />
            <span>Settings</span>
          </button>

          <div className="bg-[#1C1C1C] text-white p-4 rounded-2xl shadow-sm">
            <p className="text-[11px] text-neutral-400 font-normal">
              Need help?
            </p>
            <p className="text-xs font-semibold mt-0.5 mb-3.5 text-white">
              Support is online
            </p>
            <button className="w-full bg-white text-neutral-900 font-semibold text-xs py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.99] transition-all shadow-sm">
              Contact support
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 ml-60">
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
                <div className="text-[11px] text-neutral-400">
                  Store Manager
                </div>
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
                Alerts & Exceptions
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Important updates about your deliveries
              </p>
            </div>
            <button className="bg-white border border-[#ECEAE4] hover:bg-neutral-50 text-neutral-700 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
              <span>Mark all as read</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    New alerts
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">
                    2
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Requires your attention
                  </div>
                </div>
                <div className="bg-amber-50 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    Deferred orders
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">
                    1
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    New delivery assigned
                  </div>
                </div>
                <div className="bg-amber-50 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <PackageX className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    Delivery issues
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">
                    1
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Expected on time
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Content (8 Cols) - Alerts List */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Recent alerts
                  </h2>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Updates from dispatch and your delivery team
                  </p>
                </div>
                <button className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-[#ECEAE4]">
                  All updates <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col space-y-1.5">
                {ALERTS_DATA.map((item) => {
                  const isActive = activeAlertId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveAlertId(item.id)}
                      className={`flex items-start justify-between p-4 rounded-xl transition-all cursor-pointer border ${
                        isActive
                          ? "bg-[#FFF8EB] border-amber-200/60"
                          : "hover:bg-neutral-50 border-transparent border-b-[#ECEAE4]/50 rounded-none last:border-b-transparent last:hover:rounded-xl"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.type === "deferred"
                              ? "bg-amber-100/50 text-amber-600"
                              : item.type === "updated"
                              ? "bg-amber-100/50 text-amber-600"
                              : item.type === "reminder"
                              ? "bg-blue-50 text-blue-500"
                              : "bg-emerald-50 text-emerald-500"
                          }`}
                        >
                          {item.type === "deferred" && (
                            <TriangleAlert className="w-4 h-4" />
                          )}
                          {item.type === "updated" && (
                            <Clock className="w-4 h-4" />
                          )}
                          {item.type === "reminder" && (
                            <Snowflake className="w-4 h-4" />
                          )}
                          {item.type === "confirmed" && (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-neutral-900">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {item.subtitle}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-1">
                            {item.timeInfo}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.unread && (
                          <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                        )}
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isActive ? "text-amber-600" : "text-neutral-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Content (4 Cols) - Alert Detail */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">
                  PRIORITY UPDATE
                </span>
                <TriangleAlert className="w-5 h-5 text-amber-500" />
              </div>

              <h2 className="text-xl font-bold text-neutral-900">
                Order deferred
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Fresh Store #22</p>

              <div className="mt-6 pt-5 border-t border-[#ECEAE4]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
                      Order
                    </div>
                    <div className="text-sm font-bold text-neutral-900">
                      ORD-1048
                    </div>
                  </div>
                  <div className="bg-[#FFF8EB] text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-amber-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Deferred
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 shrink-0">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 mb-0.5">
                        What happened?
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-relaxed">
                        Your order was moved from tomorrow's early delivery run.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 shrink-0">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 mb-0.5">
                        Why did it happen?
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-relaxed">
                        Cold capacity shortage at the regional hub.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 shrink-0">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 mb-0.5">
                        What happens next?
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-relaxed">
                        Dispatch recommends adding it to the next available run.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-[#FFF8EB] border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-[10px] font-medium text-amber-700/80 uppercase tracking-wider mb-0.5">
                      Recommended slot
                    </div>
                    <div className="text-xs font-bold text-amber-900">
                      Tomorrow · 10:00 AM
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 pb-6 border-b border-[#ECEAE4]">
                  <div className="flex">
                    {["JD", "SM", "KP"].map((initials, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white bg-neutral-800 text-white text-[9px] font-bold flex items-center justify-center -ml-2 first:ml-0"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] font-medium text-neutral-500">
                    See shift timeline
                  </div>
                </div>

                <div className="mt-6">
                  <button className="w-full py-3 rounded-xl bg-[#F5C242] hover:bg-[#eab308] active:scale-[0.99] text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
                    <span>Acknowledge update</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

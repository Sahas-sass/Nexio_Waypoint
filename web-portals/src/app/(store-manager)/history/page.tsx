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
  ChevronLeft,
  Check,
  TriangleAlert,
  Download,
  Calendar,
  Package,
} from "lucide-react";

// --- Types ---
interface HistoryRow {
  id: string;
  orderId: string;
  date: string;
  type: string;
  quantity: string;
  timing: string;
  status: "Planning" | "Deferred" | "Received";
  iconType: "bag" | "alert" | "check";
}

const TABLE_DATA: HistoryRow[] = [
  {
    id: "r1",
    orderId: "ORD-1058",
    date: "Sep 27 - 2:14 PM",
    type: "Daily Grocery",
    quantity: "45 Units",
    timing: "Awaiting allocation",
    status: "Planning",
    iconType: "bag",
  },
  {
    id: "r2",
    orderId: "ORD-1048",
    date: "Sep 26 - 5:42 PM",
    type: "Daily Grocery",
    quantity: "32 Units",
    timing: "Next run - 10:00 AM",
    status: "Deferred",
    iconType: "alert",
  },
  {
    id: "r3",
    orderId: "ORD-1042",
    date: "Sep 26 - 8:15 AM",
    type: "Fresh Delivery",
    quantity: "28 Items",
    timing: "TRK-024",
    status: "Received",
    iconType: "check",
  },
  {
    id: "r4",
    orderId: "ORD-1036",
    date: "Sep 25 - 9:12 AM",
    type: "Fresh Delivery",
    quantity: "41 Items",
    timing: "TRK-019",
    status: "Received",
    iconType: "check",
  },
  {
    id: "r5",
    orderId: "ORD-1025",
    date: "Sep 24 - 9:05 AM",
    type: "Special Order",
    quantity: "12 Items",
    timing: "VAN-012",
    status: "Received",
    iconType: "check",
  },
  {
    id: "r6",
    orderId: "ORD-1018",
    date: "Sep 23 - 7:22 AM",
    type: "Fresh Delivery",
    quantity: "35 Items",
    timing: "TRK-024",
    status: "Received",
    iconType: "check",
  },
];

export default function HistoryPage() {
  const [activeNav] = useState<string>("History");
  const [activeTab, setActiveTab] = useState<string>("All activity");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredData = TABLE_DATA.filter((row) => {
    const matchesTab = activeTab === "All activity" || row.status === activeTab;
    const matchesSearch = row.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
              placeholder="Search orders..."
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
              Order & Delivery History
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review previous orders, receipts, and delivery records
            </p>
          </div>
          <button className="bg-white border border-[#ECEAE4] hover:bg-neutral-50 text-neutral-700 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
            <Download className="w-3.5 h-3.5" />
            <span>Export records</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              Orders this month
            </div>
            <div className="text-2xl font-bold text-neutral-900 mt-1">18</div>
            <div className="text-[11px] text-neutral-400 mt-1">
              2 await fulfillment
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Items received
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-1">
                  428
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  99.2% match
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  On-time deliveries
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-1">
                  94%
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  3% from last month
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
                  Reported issues
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-1">
                  2
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Both resolved
                </div>
              </div>
              <div className="bg-amber-50 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Table Controls */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECEAE4]">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              {["All activity", "Received", "Planning", "Deferred"].map(
                (tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
                        isActive
                          ? "bg-[#FDF6E2] text-neutral-900"
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                }
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="bg-[#F7F6F2] rounded-xl px-3 py-2 flex items-center gap-2 border border-[#ECEAE4]">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order number..."
                  className="bg-transparent text-[11px] font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none w-40"
                />
              </div>
              <button className="bg-white border border-[#ECEAE4] hover:bg-neutral-50 text-neutral-700 font-semibold text-[11px] px-3 py-2 rounded-xl flex items-center gap-2 transition-all">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Last 30 days</span>
                <ChevronRight className="w-3 h-3 text-neutral-400 ml-1" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEAE4] bg-[#FDFDFC]">
                  <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Order
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Order Type
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Quantity
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Vehicle / Timing
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Status
                  </th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4]">
                {filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FAF9F6] transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            row.iconType === "bag"
                              ? "bg-[#FDF6E2] text-amber-600"
                              : row.iconType === "alert"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {row.iconType === "bag" && (
                            <ShoppingBag className="w-4 h-4" />
                          )}
                          {row.iconType === "alert" && (
                            <TriangleAlert className="w-4 h-4" />
                          )}
                          {row.iconType === "check" && (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-neutral-900">
                            {row.orderId}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {row.date}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[13px] font-medium text-neutral-600">
                      {row.type}
                    </td>
                    <td className="py-4 px-6 text-[13px] font-bold text-neutral-900">
                      {row.quantity}
                    </td>
                    <td className="py-4 px-6 text-[13px] font-medium text-neutral-600">
                      {row.timing}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            row.status === "Planning"
                              ? "bg-[#F5C242]"
                              : row.status === "Deferred"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <span className="text-[13px] font-bold text-neutral-900">
                          {row.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 inline-block transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 flex items-center justify-between border-t border-[#ECEAE4] bg-[#FDFDFC]">
            <div className="text-[11px] font-medium text-neutral-500">
              Showing <span className="font-bold text-neutral-900">1-10</span>{" "}
              of 18 records
            </div>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg border border-[#ECEAE4] flex items-center justify-center text-neutral-400 hover:bg-neutral-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#F5C242] text-neutral-900 font-bold text-xs shadow-sm flex items-center justify-center">
                1
              </button>
              <button className="w-8 h-8 rounded-lg border border-transparent hover:bg-neutral-100 text-neutral-600 font-bold text-xs transition-colors flex items-center justify-center">
                2
              </button>
              <button className="w-8 h-8 rounded-lg border border-transparent hover:bg-neutral-100 text-neutral-600 font-bold text-xs transition-colors flex items-center justify-center">
                3
              </button>
              <button className="w-8 h-8 rounded-lg border border-[#ECEAE4] flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

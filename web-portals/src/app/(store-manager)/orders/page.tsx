"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Search,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Download,
  Check,
  Clock,
  Package,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";

// --- Imports from main branch ---
import { PageHero } from "../components/PageHero";
import { AsyncView } from "../components/States";
import { useStore } from "../components/StoreProvider";
import { useAsyncData } from "../hooks/useAsyncData";
import { fetchStoreReceipts } from "../services/receiptsService";

// --- Types & Mock Data Fallback ---
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

const FALLBACK_DATA: HistoryRow[] = [
  { id: "r1", orderId: "ORD-1058", date: "Sep 27 - 2:14 PM", type: "Daily Grocery", quantity: "45 Units", timing: "Awaiting allocation", status: "Planning", iconType: "bag" },
  { id: "r2", orderId: "ORD-1048", date: "Sep 26 - 5:42 PM", type: "Daily Grocery", quantity: "32 Units", timing: "Next run - 10:00 AM", status: "Deferred", iconType: "alert" },
  { id: "r3", orderId: "ORD-1042", date: "Sep 26 - 8:15 AM", type: "Fresh Delivery", quantity: "28 Items", timing: "TRK-024", status: "Received", iconType: "check" },
  { id: "r4", orderId: "ORD-1036", date: "Sep 25 - 9:12 AM", type: "Fresh Delivery", quantity: "41 Items", timing: "TRK-019", status: "Received", iconType: "check" },
];

export default function HistoryPage() {
  // --- Backend Data Logic (from main branch) ---
  const { store } = useStore();
  const loader = useCallback(() => fetchStoreReceipts(store.id), [store.id]);
  const { data, loading, error, reload } = useAsyncData(loader);

  // --- UI State (from buddhima branch) ---
  const [activeTab, setActiveTab] = useState<string>("All activity");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Map real database data if available, otherwise use fallback UI data
  const displayData = useMemo(() => {
    if (data && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((receipt: any) => ({
        id: receipt.id,
        orderId: receipt.order?.displayId || `ORD-${receipt.id.substring(0, 4).toUpperCase()}`,
        date: new Date(receipt.createdAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: receipt.order?.type || "Store Delivery",
        quantity: receipt.totalItems ? `${receipt.totalItems} Items` : "N/A",
        timing: receipt.vehicleId || "Received",
        status: "Received",
        iconType: "check" as const,
      }));
    }
    return FALLBACK_DATA;
  }, [data]);

  const filteredData = displayData.filter((row) => {
    const matchesTab = activeTab === "All activity" || row.status === activeTab;
    const matchesSearch = row.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <PageHero title="Order & Delivery History" subtitle={`Review previous orders, receipts, and delivery records for ${store.name}`} />
      
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
            <div className="text-2xl font-bold text-neutral-900 mt-1">
              {data ? data.length + 2 : 18}
            </div>
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

          {/* Table (Wrapped in AsyncView to handle loading/error states) */}
          <AsyncView
            data={displayData}
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={(rows) => rows.length === 0}
            empty={{ title: "No receipts yet", hint: "Deliveries you confirm on the Receiving page will be listed here." }}
          >
            {() => (
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
            )}
          </AsyncView>

          {/* Pagination */}
          <div className="p-5 flex items-center justify-between border-t border-[#ECEAE4] bg-[#FDFDFC]">
            <div className="text-[11px] font-medium text-neutral-500">
              Showing <span className="font-bold text-neutral-900">1-{Math.min(10, filteredData.length)}</span>{" "}
              of {filteredData.length} records
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
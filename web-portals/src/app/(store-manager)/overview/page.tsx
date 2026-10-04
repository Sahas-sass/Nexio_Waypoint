"use client";

import React, { useState, useMemo } from "react";
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
  Plus,
  Check,
  TriangleAlert,
  ArrowRight,
  MapPin,
  X,
  PhoneCall,
} from "lucide-react";

// --- Types ---
interface Store {
  id: string;
  code: string;
  name: string;
  location: string;
}

interface Activity {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  type: string;
  details: string;
}

interface ReadinessItem {
  id: number;
  label: string;
  checked: boolean;
}

const STORES: Store[] = [
  {
    id: "fs-22",
    code: "FS",
    name: "Fresh Store #22",
    location: "Colombo Central",
  },
  {
    id: "fs-14",
    code: "FS",
    name: "Fresh Store #14",
    location: "Colombo South",
  },
  {
    id: "fs-08",
    code: "FS",
    name: "Fresh Store #08",
    location: "Kandy City Center",
  },
];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "ORD-1042",
    title: "Order ORD-1042 received",
    subtitle: "38 items checked · 6:15 AM",
    status: "Complete",
    type: "received",
    details:
      "Received at Dock Bay 01 by Nuwan S. All 38 chilled dairy & produce cases verified within temperature threshold (2.8°C).",
  },
  {
    id: "ORD-1048",
    title: "Order ORD-1048 deferred",
    subtitle: "Moved to tomorrow at 10:00 AM",
    status: "Review",
    type: "deferred",
    details:
      "Deferred due to cold-room capacity optimization. Rescheduled for Monday 10:00 AM slot.",
  },
  {
    id: "ORD-1058",
    title: "Order ORD-1058 submitted",
    subtitle: "Daily grocery order · Yesterday",
    status: "Planning",
    type: "submitted",
    details:
      "Submitted by Kavindu Perera. Includes 64 dry grocery cases and 18 bakery replenishment units.",
  },
];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState<string>("Store Overview");
  const [selectedStore, setSelectedStore] = useState<Store>(STORES[0]);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);

  // FIXED: Explicitly typed states allowing strings/objects alongside null
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [readinessItems, setReadinessItems] = useState<ReadinessItem[]>([
    { id: 1, label: "Receiving staff assigned", checked: true },
    { id: 2, label: "Dock Bay 02 available", checked: true },
    { id: 3, label: "Chilled storage ready", checked: true },
  ]);

  const [newOrderCategory, setNewOrderCategory] = useState<string>(
    "Fresh Chilled & Dairy"
  );
  const [newOrderCases, setNewOrderCases] = useState<string>("45");
  const [newOrderWindow, setNewOrderWindow] = useState<string>(
    "Tomorrow · 6:30 AM - 8:00 AM"
  );
  const [newOrderNotes, setNewOrderNotes] = useState<string>("");

  // FIXED: Added type for msg
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const readinessPercentage = useMemo(() => {
    const done = readinessItems.filter((i) => i.checked).length;
    return Math.round((done / readinessItems.length) * 100);
  }, [readinessItems]);

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [activities, searchQuery]);

  // FIXED: Added type for id
  const toggleReadiness = (id: number) => {
    setReadinessItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // FIXED: Added React.FormEvent type to prevent implicit 'any' error
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomId = `ORD-${Math.floor(1060 + Math.random() * 40)}`;
    const created: Activity = {
      id: randomId,
      title: `Order ${randomId} submitted`,
      subtitle: `${newOrderCategory} (${newOrderCases} cases) · Just now`,
      status: "Planning",
      type: "submitted",
      details: `Scheduled for ${newOrderWindow}. ${
        newOrderNotes || "Standard replenishment priority."
      }`,
    };
    setActivities((prev) => [created, ...prev]);
    setActiveModal(null);
    setNewOrderNotes("");
    showToast(`Order ${randomId} created and sent to warehouse planning.`);
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1C1C] text-white px-4 py-3 rounded-2xl shadow-xl border border-neutral-800 flex items-center gap-3 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-[#F5C242] text-neutral-900 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <header className="h-16 bg-white border-b border-[#ECEAE4] px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setStoreDropdownOpen((o) => !o)}
              className="flex items-center gap-3 py-1 px-1.5 rounded-xl hover:bg-[#F7F6F2] transition-colors text-left"
            >
              <div className="bg-[#F5C242] text-neutral-900 font-bold text-xs w-9 h-9 rounded-xl flex items-center justify-center shadow-xs">
                {selectedStore.code}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-neutral-900">
                  {selectedStore.name}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {selectedStore.location}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 ml-1" />
            </button>

            {storeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#ECEAE4] py-2 z-40">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Switch Store Location
                </div>
                {STORES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStore(st);
                      setStoreDropdownOpen(false);
                      showToast(`Switched view to ${st.name}`);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#F7F6F2] transition-colors ${
                      selectedStore.id === st.id
                        ? "bg-[#FDF6E2]/60 font-semibold"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-neutral-900">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {st.location}
                      </div>
                    </div>
                    {selectedStore.id === st.id && (
                      <Check className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#F5F4F0] rounded-full px-4 py-2 w-80 lg:w-96 flex items-center gap-2.5 border border-transparent focus-within:border-[#F5C242] focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, vehicles, products..."
              className="bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Sunday, September 27</span>
          </div>

          <button
            onClick={() => setActiveModal("alerts")}
            className="relative w-9 h-9 rounded-xl border border-[#ECEAE4] bg-[#F7F6F2]/70 hover:bg-[#F7F6F2] flex items-center justify-center text-neutral-700 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-white" />
          </button>

          <div
            onClick={() =>
              showToast("Logged in as Kavindu Perera (Store Manager)")
            }
            className="flex items-center gap-2.5 cursor-pointer pl-1"
          >
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

      <section className="bg-[#1C1C1C] text-white px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold tracking-widest text-[#F5C242] uppercase">
            SUNDAY • SEPTEMBER 27
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight text-white">
            Good morning, Kavindu
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Here is what is happening at {selectedStore.name} today
          </p>
        </div>

        <div>
          <button
            onClick={() => setActiveModal("create-order")}
            className="bg-[#F5C242] hover:bg-[#eab308] active:scale-[0.99] text-neutral-900 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create new order</span>
          </button>
        </div>
      </section>

      <main className="p-8 space-y-6 max-w-[1400px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setActiveModal("track-delivery")}
            className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] flex items-center justify-between cursor-pointer hover:shadow-md hover:border-neutral-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#FDF6E2] text-amber-700 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  TODAY&apos;S DELIVERIES
                </div>
                <div className="flex items-baseline mt-0.5">
                  <span className="text-2xl font-bold text-neutral-900">4</span>
                  <span className="text-xs text-neutral-400 ml-2">
                    Next at 7:42 AM
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div
            onClick={() =>
              showToast(
                "12 deliveries (428 items) confirmed this week with 99.4% accuracy."
              )
            }
            className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] flex items-center justify-between cursor-pointer hover:shadow-md hover:border-neutral-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  RECEIVED THIS WEEK
                </div>
                <div className="flex items-baseline mt-0.5">
                  <span className="text-2xl font-bold text-neutral-900">
                    12
                  </span>
                  <span className="text-xs text-neutral-400 ml-2">
                    428 items confirmed
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div
            onClick={() => setActiveModal("alerts")}
            className="bg-white px-5 py-4 rounded-2xl border border-[#ECEAE4] flex items-center justify-between cursor-pointer hover:shadow-md hover:border-neutral-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                <TriangleAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  NEEDS ATTENTION
                </div>
                <div className="flex items-baseline mt-0.5">
                  <span className="text-2xl font-bold text-neutral-900">2</span>
                  <span className="text-xs text-neutral-400 ml-2">
                    1 order deferred
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Next delivery
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Live arrival information for your receiving team
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  ON SCHEDULE
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-[#ECEAE4] bg-[#FCFBF9]">
                <div className="md:col-span-5 relative min-h-[215px] bg-neutral-900 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80"
                    alt="Delivery Truck TRK-024 on highway"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-neutral-900 text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 -ml-3" />
                    LIVE TRACKING
                  </div>
                </div>

                <div className="md:col-span-7 p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                        FRESH CHILLED DELIVERY
                      </div>
                      <div className="text-xl font-bold text-neutral-900 mt-0.5">
                        TRK-024
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                        ETA
                      </div>
                      <div className="text-lg font-bold text-neutral-900 mt-0.5">
                        7:42 AM
                      </div>
                    </div>
                  </div>

                  <div className="my-5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F5C242] ring-4 ring-[#F5C242]/20 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-neutral-800">
                          6.4 km away
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          16 pallets · 214 cases · Dock Bay 02
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#EFECE6] rounded-full mt-3.5 overflow-hidden">
                      <div className="w-[68%] h-full bg-[#F5C242] rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      onClick={() => setActiveModal("prepare-receiving")}
                      className="px-4 py-2 rounded-xl border border-[#E5E2DC] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Prepare receiving
                    </button>
                    <button
                      onClick={() => setActiveModal("track-delivery")}
                      className="px-4 py-2 rounded-xl bg-[#F5C242] hover:bg-[#eab308] text-xs font-semibold text-neutral-900 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Track delivery</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Today&apos;s activity
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Your most recent store operations
                  </p>
                </div>
                <button
                  onClick={() =>
                    showToast(
                      `Showing all ${activities.length} store operation logs.`
                    )
                  }
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-[#ECEAE4] mt-4">
                {filteredActivities.map((item) => {
                  const isComplete = item.status === "Complete";
                  const isReview = item.status === "Review";
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedActivity(item)}
                      className="py-3.5 first:pt-2 last:pb-1 flex items-center justify-between gap-4 hover:bg-[#FAF9F6] -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        {item.type === "received" && (
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        )}
                        {item.type === "deferred" && (
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <TriangleAlert className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === "submitted" && (
                          <div className="w-9 h-9 rounded-xl bg-[#FDF6E2] text-amber-700 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-neutral-900">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {isComplete && (
                        <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Complete
                        </span>
                      )}
                      {isReview && (
                        <span className="bg-amber-50 text-amber-700 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Review
                        </span>
                      )}
                      {!isComplete && !isReview && (
                        <span className="bg-[#FDF6E2] text-amber-800 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          {item.status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div className="bg-[#F5C242] text-neutral-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl flex flex-col items-center justify-center leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mb-0.5" />
                  <span className="text-[10px] font-bold">Open</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  ORDER CUTOFF
                </div>
                <div className="text-xl font-bold text-neutral-900 mt-1">
                  2h 18m remaining
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Submit by 4:00 PM for tomorrow&apos;s planning cycle
                </p>
                <div className="w-full h-1.5 bg-[#EFECE6] rounded-full my-4 overflow-hidden">
                  <div className="w-[72%] h-full bg-[#F5C242] rounded-full" />
                </div>

                <button
                  onClick={() => setActiveModal("create-order")}
                  className="w-full py-2.5 rounded-xl bg-[#F5C242] hover:bg-[#eab308] active:scale-[0.99] text-neutral-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <span>Start an order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Store readiness
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    For today&apos;s arrivals
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  {readinessPercentage}%
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {readinessItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleReadiness(item.id)}
                    className="w-full flex items-center gap-3 text-left group cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        item.checked
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-neutral-100 text-neutral-300"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        item.checked
                          ? "text-neutral-700"
                          : "text-neutral-400 line-through"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h2 className="text-base font-bold text-neutral-900 mb-3">
                Quick actions
              </h2>
              <div className="divide-y divide-[#ECEAE4]">
                <button
                  onClick={() => setActiveModal("create-order")}
                  className="w-full py-3 first:pt-1 flex items-center justify-between hover:bg-[#FAF9F6] -mx-2 px-2 rounded-xl transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F4F0] text-neutral-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        Create order
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Before today&apos;s cutoff
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveModal("alerts")}
                  className="w-full py-3 last:pb-1 flex items-center justify-between hover:bg-[#FAF9F6] -mx-2 px-2 rounded-xl transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F4F0] text-neutral-700 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        Review alerts
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        2 need attention
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: CREATE NEW ORDER */}
      {activeModal === "create-order" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECEAE4] max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECEAE4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F5C242] text-neutral-900 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Create Store Replenishment Order
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {selectedStore.name} · Cutoff in 2h 18m
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Department Category
                </label>
                <select
                  value={newOrderCategory}
                  onChange={(e) => setNewOrderCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#ECEAE4] bg-[#F7F6F2] px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#F5C242]"
                >
                  <option value="Fresh Chilled & Dairy">
                    Fresh Chilled & Dairy
                  </option>
                  <option value="Produce & Organic Greens">
                    Produce & Organic Greens
                  </option>
                  <option value="Bakery & Ambient Grocery">
                    Bakery & Ambient Grocery
                  </option>
                  <option value="Frozen Goods Replenishment">
                    Frozen Goods Replenishment
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Estimated Cases
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={newOrderCases}
                    onChange={(e) => setNewOrderCases(e.target.value)}
                    className="w-full rounded-xl border border-[#ECEAE4] bg-[#F7F6F2] px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#F5C242]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Target Dock Bay
                  </label>
                  <input
                    type="text"
                    value="Dock Bay 02"
                    readOnly
                    className="w-full rounded-xl border border-[#ECEAE4] bg-neutral-100 px-3.5 py-2.5 text-xs font-medium text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Delivery Window
                </label>
                <select
                  value={newOrderWindow}
                  onChange={(e) => setNewOrderWindow(e.target.value)}
                  className="w-full rounded-xl border border-[#ECEAE4] bg-[#F7F6F2] px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#F5C242]"
                >
                  <option value="Tomorrow · 6:30 AM - 8:00 AM">
                    Tomorrow · 6:30 AM - 8:00 AM
                  </option>
                  <option value="Tomorrow · 10:00 AM - 11:30 AM">
                    Tomorrow · 10:00 AM - 11:30 AM
                  </option>
                  <option value="Tomorrow · 2:00 PM - 4:00 PM">
                    Tomorrow · 2:00 PM - 4:00 PM
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Receiving Team Notes
                </label>
                <textarea
                  rows={2}
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  placeholder="Optional instructions for cold storage or pallet staging..."
                  className="w-full rounded-xl border border-[#ECEAE4] bg-[#F7F6F2] px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#F5C242]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#ECEAE4] text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F5C242] hover:bg-[#eab308] text-xs font-semibold text-neutral-900 shadow-xs"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRACK DELIVERY TRK-024 */}
      {activeModal === "track-delivery" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECEAE4] max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECEAE4]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">
                    Live Telemetry · TRK-024
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ON SCHEDULE
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Driver: Chaminda Silva · Refrigerated Heavy Rigid
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-[#1C1C1C] text-white p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5C242] text-neutral-900 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      Baseline Road Approach · 6.4 km away
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Chiller Temp: 3.1°C (Optimal) · Speed: 42 km/h
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#F5C242] font-semibold uppercase">
                    ETA
                  </div>
                  <div className="text-base font-bold">7:42 AM</div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-[#ECEAE4]">
                  <span className="text-neutral-500">Manifest Summary</span>
                  <span className="font-semibold text-neutral-900">
                    16 Pallets · 214 Cases
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#ECEAE4]">
                  <span className="text-neutral-500">
                    Assigned Receiving Bay
                  </span>
                  <span className="font-semibold text-neutral-900">
                    Dock Bay 02
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-500">Receiving Lead</span>
                  <span className="font-semibold text-neutral-900">
                    Nuwan S. (Checked In)
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast(
                      "Pinged driver Chaminda Silva — ETA confirmed at 7:42 AM."
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F5C242] hover:bg-[#eab308] text-xs font-semibold text-neutral-900"
                >
                  Confirm Dock Clearance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREPARE RECEIVING */}
      {activeModal === "prepare-receiving" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECEAE4] max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECEAE4]">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Prepare Receiving · TRK-024
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Pre-arrival dock verification checklist
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              {readinessItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleReadiness(item.id)}
                  className="p-3 rounded-xl border border-[#ECEAE4] flex items-center justify-between cursor-pointer hover:bg-[#F7F6F2]"
                >
                  <span className="text-xs font-medium text-neutral-800">
                    {item.label}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.checked
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.checked ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast("Receiving team notified for 7:42 AM arrival.");
                }}
                className="w-full py-2.5 rounded-xl bg-[#1C1C1C] text-white text-xs font-semibold hover:bg-neutral-800"
              >
                Notify Receiving Crew
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ALERTS & NEEDS ATTENTION */}
      {activeModal === "alerts" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECEAE4] max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECEAE4]">
              <div className="flex items-center gap-2">
                <TriangleAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Items Needing Attention (2)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                <div className="text-xs font-bold text-neutral-900">
                  1. Order ORD-1048 Deferred
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Moved to tomorrow at 10:00 AM due to chiller staging capacity.
                  Requires manager sign-off.
                </p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast("Order ORD-1048 deferral acknowledged.");
                  }}
                  className="mt-2.5 text-[11px] font-bold text-amber-800 underline"
                >
                  Approve 10:00 AM Slot →
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#ECEAE4]">
                <div className="text-xs font-bold text-neutral-900">
                  2. Afternoon Order Cutoff Approaching
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">
                  2h 18m remaining to submit tomorrow&apos;s ambient & produce
                  replenishment order.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl border border-[#ECEAE4] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SUPPORT */}
      {activeModal === "support" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECEAE4] max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECEAE4]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Waypoint Logistics Support
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
              Colombo Central Dispatch Desk is online. Average response time for
              Store Managers is under 90 seconds.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-[#F7F6F2] text-xs space-y-1">
              <div className="font-bold text-neutral-900">
                Direct Dispatch Line
              </div>
              <div className="text-neutral-500">+94 11 234 5678 · Ext 402</div>
            </div>
            <button
              onClick={() => {
                setActiveModal(null);
                showToast("Connected to Waypoint Colombo Central Dispatch.");
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#F5C242] hover:bg-[#eab308] text-neutral-900 font-semibold text-xs"
            >
              Start Live Dispatch Chat
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ACTIVITY DETAIL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECEAE4] max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECEAE4]">
              <h3 className="text-sm font-bold text-neutral-900">
                {selectedActivity.title}
              </h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {selectedActivity.subtitle}
            </p>
            <p className="text-xs text-neutral-800 mt-3 bg-[#F7F6F2] p-3.5 rounded-xl leading-relaxed">
              {selectedActivity.details}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 rounded-xl bg-[#1C1C1C] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
  Lock,
  Grid,
  Leaf,
  Droplet,
  Snowflake,
  Package,
  Coffee,
  Minus,
  Plus,
  ArrowRight,
  Info,
} from "lucide-react";

// --- Types ---
interface Store {
  id: string;
  code: string;
  name: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

const STORES: Store[] = [
  {
    id: "fs-22",
    code: "FS",
    name: "Fresh Store #22",
    location: "Colombo Central",
  },
];

const CATEGORIES: Category[] = [
  { id: "produce", name: "Fresh Produce", icon: Leaf },
  { id: "dairy", name: "Dairy", icon: Droplet },
  { id: "frozen", name: "Frozen", icon: Snowflake },
  { id: "grocery", name: "Dry Grocery", icon: Package },
  { id: "beverage", name: "Beverages", icon: Coffee },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Fresh Milk",
    desc: "Chilled • Available: 120 units",
    icon: Droplet,
  },
  {
    id: "p2",
    name: "Rice 5kg",
    desc: "Ambient • Available: 64 units",
    icon: Package,
  },
  {
    id: "p3",
    name: "Frozen Vegetables",
    desc: "Chilled • Available: 56 units",
    icon: Snowflake,
  },
];

export default function OrdersPage() {
  const [activeNav, setActiveNav] = useState<string>("Orders");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("produce");

  // State for product quantities
  const [quantities, setQuantities] = useState<Record<string, number>>({
    p1: 12,
    p2: 8,
    p3: 6,
  });

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

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
      <main className="p-8 max-w-[1400px] w-full mx-auto">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Create New Order
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Order supplies for your next delivery
            </p>
          </div>
          <div className="bg-white border border-[#ECEAE4] shadow-sm rounded-full px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700">
                Order cutoff: 4:00 PM
              </span>
            </div>
            <div className="w-px h-3 bg-neutral-200" />
            <span className="text-xs font-semibold text-neutral-900">
              2h 18m remaining
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Content (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Choose order type */}
            <section className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Choose order type
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Select a store range to see its ordering catalogue
                  </p>
                </div>
                <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                  STEP 1 OF 2
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Active Card */}
                <div className="relative border-2 border-[#F5C242] bg-[#FDF6E2]/30 rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80"
                      alt="Fresh Produce"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900">
                      Fresh
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Daily Grocery Order
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#F5C242] rounded-full flex items-center justify-center border-2 border-white">
                    <Check className="w-3 h-3 text-neutral-900 stroke-[3]" />
                  </div>
                </div>

                {/* Disabled Card */}
                <div className="border border-[#ECEAE4] bg-neutral-50 rounded-xl p-3 flex items-center gap-3 cursor-not-allowed opacity-70">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-orange-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900">
                      Style
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Apparel Seasonal Order
                    </div>
                  </div>
                </div>

                {/* Inactive Card */}
                <div className="border border-[#ECEAE4] bg-white hover:bg-neutral-50 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Grid className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900">
                      Tech
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      High-value Product Order
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Fresh Catalogue & Product List */}
            <section className="bg-white p-6 rounded-2xl border border-[#ECEAE4] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Fresh catalogue
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Daily ordering • Chilled handling
                  </p>
                </div>
                <button className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors">
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal Categories */}
              <div className="flex overflow-x-auto gap-3 pb-2 mb-4 scrollbar-hide">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-2 min-w-[104px] py-3 px-2 rounded-xl border transition-all ${
                        isActive
                          ? "border-[#F5C242] bg-[#FDF6E2]"
                          : "border-[#ECEAE4] bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-amber-600" : "text-neutral-500"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-bold ${
                          isActive ? "text-neutral-900" : "text-neutral-600"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Product List */}
              <div className="divide-y divide-[#ECEAE4]">
                {INITIAL_PRODUCTS.map((prod) => {
                  const Icon = prod.icon;
                  const isYellow = prod.id === "p1" || prod.id === "p2";
                  return (
                    <div
                      key={prod.id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            prod.id === "p1" || prod.id === "p2"
                              ? "bg-[#FDF6E2] text-amber-600"
                              : "bg-cyan-50 text-cyan-600"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-900">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {prod.desc}
                          </div>
                        </div>
                      </div>

                      {/* Counter Widget */}
                      <div className="flex items-center bg-[#F7F6F2] rounded-lg border border-[#ECEAE4] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(prod.id, -1)}
                          className="px-3 py-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-10 text-center text-xs font-bold text-neutral-900 bg-white py-2 border-x border-[#ECEAE4]">
                          {quantities[prod.id]}
                        </div>
                        <button
                          onClick={() => updateQuantity(prod.id, 1)}
                          className="px-3 py-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Sidebar (Summary - 4 Cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-[#ECEAE4] shadow-md overflow-hidden relative">
              {/* Yellow subtle background blob */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FDF6E2]/80 to-transparent z-0" />

              <div className="p-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5C242] text-neutral-900 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-700 tracking-wider uppercase mb-0.5">
                      CURRENT ORDER
                    </div>
                    <div className="text-base font-bold text-neutral-900">
                      Daily Grocery Order
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-8 pb-6 border-b border-[#ECEAE4]">
                  <div className="flex-1 text-center border-r border-[#ECEAE4]">
                    <div className="text-3xl font-bold text-neutral-900">
                      12
                    </div>
                    <div className="text-[10px] font-medium text-neutral-500 mt-1 uppercase tracking-wider">
                      Products
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-bold text-neutral-900">
                      46
                    </div>
                    <div className="text-[10px] font-medium text-neutral-500 mt-1 uppercase tracking-wider">
                      Units
                    </div>
                  </div>
                </div>

                <div className="py-5 space-y-3 border-b border-[#ECEAE4]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">Estimated volume</span>
                    <span className="font-bold text-neutral-900">2.4 m³</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">Estimated weight</span>
                    <span className="font-bold text-neutral-900">420 kg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">Expected delivery</span>
                    <span className="font-bold text-neutral-900">Tomorrow</span>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-[#FDF6E2] border border-[#F5C242]/30 flex gap-2.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-amber-900 leading-relaxed">
                    Submit before 4:00 PM for tomorrow's planning cycle.
                  </p>
                </div>

                <div className="mt-5 space-y-3 text-center">
                  <button className="w-full py-3 rounded-xl bg-[#F5C242] hover:bg-[#eab308] active:scale-[0.99] text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
                    <span>Review & submit order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
                    Save as draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

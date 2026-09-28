"use client";

import { Search, Calendar, Bell, Package, BarChart2, Truck, Clock, MapPin, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function CommandCenterPage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
              placeholder="Search orders, vehicles..." 
              className="pl-9 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-waypoint-yellow w-64"
            />
            <div className="absolute right-3 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-400">
              ⌘K
            </div>
          </div>
          
          {/* Date Picker */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-waypoint-text hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400" />
            Tue, 21 May
          </button>
          
          {/* Notification */}
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          {/* Profile Pill */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm">KS</div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-waypoint-text leading-tight">Kasun S.</p>
              <p className="text-[11px] text-gray-500 font-semibold">Dispatcher</p>
            </div>
          </div>

          {/* TEMPORARY LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* 2. Hero Card */}
      <div className="relative w-full h-70 rounded-3xl overflow-hidden flex items-center p-10 shadow-sm border border-gray-200/50">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 z-0 bg-linear-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
        
        <div className="relative z-10 w-full flex justify-between items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-waypoint-yellow/30 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-waypoint-yellow rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-waypoint-yellow tracking-widest uppercase">Live - Tomorrow's Run</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">18 vehicles ready to roll for the morning window</h2>
            <p className="text-gray-300 text-sm mb-8 leading-relaxed">Fleet is at 72% planned capacity. Run allocation to lock routes before the 6 AM cut-off.</p>
            
            <div className="flex gap-3">
              <button className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
                <Truck className="w-4 h-4" /> Run Allocation
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
                <MapPin className="w-4 h-4" /> Live map
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex gap-10">
            <div>
              <p className="text-2xl font-bold text-white mb-1">7:42</p>
              <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">First ETA</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">9</p>
              <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">Active Routes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">96%</p>
              <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">On-Time Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Cards Row */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-waypoint-orange rounded-xl"><Package className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-waypoint-text mb-1">248</p>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-waypoint-yellow rounded-full"></span> Orders confirmed
            </p>
          </div>
        </div>

        {/* Fleet Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><BarChart2 className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fleet Capacity</p>
            <p className="text-3xl font-bold text-waypoint-text mb-1">72%</p>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Available capacity
            </p>
          </div>
        </div>

        {/* Vehicles Ready */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-500 rounded-xl"><Truck className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicles Ready</p>
            <p className="text-3xl font-bold text-waypoint-text mb-1">18 <span className="text-lg text-gray-300">/ 24</span></p>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Vehicles available
            </p>
          </div>
        </div>

        {/* Pending Deferrals */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-yellow-50 text-waypoint-orange rounded-xl"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Deferrals</p>
            <p className="text-3xl font-bold text-waypoint-text mb-1">14</p>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-waypoint-yellow rounded-full"></span> Requires attention
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
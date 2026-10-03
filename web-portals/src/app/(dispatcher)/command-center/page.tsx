"use client";

import { Search, Calendar, Bell, Package, BarChart2, Truck, Clock, MapPin, Sparkles, ArrowRight, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";

export default function CommandCenterPage() {
  const router = useRouter();

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
              18 vehicles ready to roll for the morning window
            </h2>
            <p className="text-[13px] text-gray-300 mb-5 leading-relaxed max-w-135">
              Fleet is at 72% planned capacity. Run allocation to lock routes before the 6 AM cut-off.
            </p>
            
            <div className="flex gap-3">
              <button className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm">
                <Sparkles className="w-4 h-4" /> Run Allocation
              </button>
              <button className="bg-[#2A2D35]/70 hover:bg-[#2A2D35] backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium text-[13px] flex items-center gap-2 transition-colors">
                <MapPin className="w-4 h-4" /> Live map
              </button>
            </div>
          </div>

          {/* Right Content - Glassmorphic Stats */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-7 py-4 flex items-center gap-6 shadow-sm mr-2">
            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">7:42</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">First ETA</p>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-white/20" />

            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">9</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">Active Routes</p>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-white/20" />

            <div>
              <p className="text-[22px] font-bold text-white mb-0.5 leading-none">96%</p>
              <p className="text-[9px] text-white/70 font-bold tracking-widest uppercase">On-Time Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Cards Row */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="flex min-h-31 p-4.5 items-start gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          <div className="p-3 bg-[#FFF8E6] text-[#D97706] rounded-2xl shrink-0">
            <Package className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col pt-0.5">
            <p className="text-[13px] font-medium text-waypoint-secondary mb-1">Total Orders</p>
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">248</p>
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
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">72%</p>
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
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">18 / 24</p>
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-waypoint-success rounded-full"></span> Vehicles available
            </p>
          </div>
        </div>

        {/* Pending Deferrals */}
        <div className="flex min-h-31 p-4.5 items-start gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          <div className="p-3 bg-[#FFF3E0] text-[#F97316] rounded-2xl shrink-0">
            <Clock className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col pt-0.5">
            <p className="text-[13px] font-medium text-waypoint-secondary mb-1">Pending Deferrals</p>
            <p className="text-[32px] font-bold text-waypoint-text leading-none mb-2.5 tracking-tight">14</p>
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full"></span> Requires attention
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Queue & Capacity */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Order Queue Card (Spans 2 Columns) */}
        <div className="col-span-2 flex flex-col w-full rounded-3xl border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-start w-full p-6 pb-5">
            <div>
              <h3 className="text-xl font-bold text-waypoint-text mb-1">Order Queue</h3>
              <p className="text-[13px] text-waypoint-secondary font-medium">248 confirmed orders</p>
            </div>
            <button className="flex items-center gap-1.5 text-[13px] font-bold text-waypoint-orange hover:text-[#D97706] transition-colors mt-1">
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

          {/* Row 1 */}
          <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] items-center w-full px-6 py-4 border-b border-[#E8E8E3]/60 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] text-waypoint-orange font-bold text-sm flex items-center justify-center shrink-0">F</div>
              <span className="text-[13px] font-bold text-waypoint-text">Fresh Store 18</span>
            </div>
            <div className="text-[13px] font-medium text-gray-400">Before 8 AM</div>
            <div>
              <span className="inline-flex px-3 py-1 bg-[#EAF5FF] text-[#3B82F6] text-[11px] font-bold rounded-full">Chilled</span>
            </div>
            <div className="text-[13px] font-medium text-gray-400">2.4 m³</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-waypoint-success"></span>
              <span className="text-[13px] font-bold text-waypoint-success">Ready</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] items-center w-full px-6 py-4 border-b border-[#E8E8E3]/60 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] text-waypoint-orange font-bold text-sm flex items-center justify-center shrink-0">S</div>
              <span className="text-[13px] font-bold text-waypoint-text">Style Store 04</span>
            </div>
            <div className="text-[13px] font-medium text-gray-400">8-10 AM</div>
            <div>
              <span className="inline-flex px-3 py-1 bg-[#F3F4F6] text-gray-500 text-[11px] font-bold rounded-full">Ambient</span>
            </div>
            <div className="text-[13px] font-medium text-gray-400">1.8 m³</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-waypoint-success"></span>
              <span className="text-[13px] font-bold text-waypoint-success">Ready</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] items-center w-full px-6 py-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] text-waypoint-orange font-bold text-sm flex items-center justify-center shrink-0">T</div>
              <span className="text-[13px] font-bold text-waypoint-text">Tech Store 09</span>
            </div>
            <div className="text-[13px] font-medium text-gray-400">Before 12 PM</div>
            <div>
              <span className="inline-flex px-3 py-1 bg-[#F3F4F6] text-gray-500 text-[11px] font-bold rounded-full">Ambient</span>
            </div>
            <div className="text-[13px] font-medium text-gray-400">0.7 m³</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-waypoint-success"></span>
              <span className="text-[13px] font-bold text-waypoint-success">Ready</span>
            </div>
          </div>
        </div>

        {/* Fleet Capacity Widget (Spans 1 Column) */}
        <div className="col-span-1 flex flex-col w-full rounded-3xl border-[1.6px] border-[#E8E8E3]/80 bg-white shadow-[0_12px_40px_0_rgba(32,33,36,0.05)] p-6">
          
          {/* Header */}
          <div className="flex justify-between items-start w-full mb-6">
            <div>
              <h3 className="text-xl font-bold text-waypoint-text mb-1">Fleet Capacity</h3>
              <p className="text-[13px] text-waypoint-secondary font-medium">Live planned utilization</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
              <span className="text-[13px] font-bold text-gray-500">18 ready</span>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex flex-col gap-5">
            
            {/* TRK-024 */}
            <div className="flex flex-col gap-3 pb-5 border-b border-[#E8E8E3]/60">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3.5">
                  <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=150&auto=format&fit=crop" alt="TRK-024" className="w-11 h-11 rounded-[14px] object-cover shadow-sm" />
                  <div className="flex flex-col pt-0.5">
                    <span className="text-[14px] font-bold text-waypoint-text leading-tight">TRK-024</span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">Heavy truck</span>
                  </div>
                </div>
                <span className="text-[15px] font-bold text-waypoint-text">72%</span>
              </div>
              <div className="flex flex-col gap-2.5 pl-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-400 w-10">Weight</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '64%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">64%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-400 w-10">Volume</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">72%</span>
                </div>
              </div>
            </div>

            {/* VAN-012 */}
            <div className="flex flex-col gap-3 pb-5 border-b border-[#E8E8E3]/60">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3.5">
                  <img src="https://images.unsplash.com/photo-1566315573427-0243be44ba44?q=80&w=150&auto=format&fit=crop" alt="VAN-012" className="w-11 h-11 rounded-[14px] object-cover shadow-sm" />
                  <div className="flex flex-col pt-0.5">
                    <span className="text-[14px] font-bold text-waypoint-text leading-tight">VAN-012</span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">Delivery van</span>
                  </div>
                </div>
                <span className="text-[15px] font-bold text-waypoint-text">51%</span>
              </div>
              <div className="flex flex-col gap-2.5 pl-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-400 w-10">Weight</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">42%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-400 w-10">Volume</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '51%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">51%</span>
                </div>
              </div>
            </div>

            {/* TRK-019 */}
            <div className="flex flex-col gap-3 pb-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3.5">
                  <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=150&auto=format&fit=crop" alt="TRK-019" className="w-11 h-11 rounded-[14px] object-cover shadow-sm" />
                  <div className="flex flex-col pt-0.5">
                    <span className="text-[14px] font-bold text-waypoint-text leading-tight">TRK-019</span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">Refrigerated</span>
                  </div>
                </div>
                <span className="text-[15px] font-bold text-waypoint-text">86%</span>
              </div>
              <div className="flex flex-col gap-2.5 pl-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-400 w-10">Weight</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-orange rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">78%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-400 w-10">Volume</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-orange rounded-full" style={{ width: '86%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-waypoint-text w-6 text-right">86%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. Operational Alerts (Moved below the queue and capacity) */}
            <div className="flex flex-col gap-4 mt-8 mb-8">
          
              {/* Alerts Header */}
              <div className="flex justify-between items-end w-full">
                <div>
                  <h3 className="text-[20px] font-bold text-waypoint-text mb-1">Operational Alerts</h3>
                  <p className="text-[13px] text-gray-400 font-medium">3 items need your attention</p>
                </div>
                <button className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm">
                  <Sparkles className="w-4 h-4" /> Run Allocation
                </button>
              </div>

              {/* Alerts Grid */}
              <div className="grid grid-cols-3 gap-6">
            
                {/* Alert 1 */}
                <div className="flex min-h-20 p-3.5 items-center gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3] bg-white">
                  <div className="w-11 h-11 bg-[#FFF8E6] text-waypoint-orange rounded-[14px] flex items-center justify-center shrink-0">
                    <BarChart2 className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-[13px] font-bold text-waypoint-text leading-tight mb-0.5">Vehicle approaching capacity</p>
                    <p className="text-[11px] font-medium text-gray-400">TRK-019 is at 86% volume</p>
                  </div>
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-waypoint-text hover:bg-gray-50 transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Alert 2 (Tinted Background) */}
                <div className="flex min-h-20 p-3.5 items-center gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3] bg-[#FFFCF5]">
                  <div className="w-11 h-11 bg-[#FFF3E0] text-[#D97706] rounded-[14px] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-[13px] font-bold text-waypoint-text leading-tight mb-0.5">Fresh delivery before 8 AM</p>
                    <p className="text-[11px] font-medium text-gray-400">Priority time window · Store 18</p>
                  </div>
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-waypoint-text bg-white hover:bg-gray-50 transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Alert 3 */}
                <div className="flex min-h-20 p-3.5 items-center gap-3.5 rounded-[20px] border-[1.6px] border-[#E8E8E3] bg-white">
                  <div className="w-11 h-11 bg-[#FFF8E6] text-waypoint-orange rounded-[14px] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-[13px] font-bold text-waypoint-text leading-tight mb-0.5">Allocation review required</p>
                    <p className="text-[11px] font-medium text-gray-400">6 orders have open constraints</p>
                  </div>
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-waypoint-text hover:bg-gray-50 transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
            
              </div>
            </div>
      
    </div>
  );
}
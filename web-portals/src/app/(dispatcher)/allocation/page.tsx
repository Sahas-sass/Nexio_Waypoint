"use client";

import { Search, Calendar, Bell, ChevronDown, Filter, Sparkles, GripVertical, Clock, Plus, AlertTriangle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";
import { useUserProfile } from "@/app/profile/useUserProfile";
import { recordUserActivity } from "@/app/profile/activityLogger";

export default function AllocationPage() {
  const router = useRouter();
  const { profile } = useUserProfile();

  const handleAutoAllocate = () => {
    if (profile?.id) {
      recordUserActivity(profile.id, {
        title: "Executed Auto Allocation",
        meta: "18 orders allocated across 6 vehicles",
        type: "truck",
      });
    }
  };

  const handlePublishPlan = () => {
    if (profile?.id) {
      recordUserActivity(profile.id, {
        title: "Published Daily Delivery Plan",
        meta: "Locked 6 vehicle routes for morning window",
        type: "check",
      });
    }
  };

  return (
    <div className="relative min-h-screen pb-32">
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
              placeholder="Search orders, vehicles..." 
              className="w-64 h-10 pl-10 pr-12 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all placeholder:font-normal"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-400">⌘K</div>
          </div>

          {/* Date Picker Button */}
          <button className="flex items-center gap-2.5 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-[13px] font-bold text-waypoint-text">Tue, 21 May</span>
          </button>

          {/* Notifications */}
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors relative">
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
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-[13px] font-bold text-waypoint-text">Tue, 21 May</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <span className="text-[13px] font-bold text-waypoint-text">All Orders</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <span className="text-[13px] font-bold text-waypoint-text">All Vehicles</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-[13px] font-bold text-waypoint-text">Filter</span>
          </button>
        </div>
        <button 
          onClick={handleAutoAllocate}
          className="bg-waypoint-yellow hover:bg-[#F0B92B] text-waypoint-text px-5 h-10 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Auto Allocate
        </button>
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-[1fr_1.3fr] gap-6">
        
        {/* LEFT COLUMN: Unassigned Orders */}
        <div className="flex flex-col gap-4 p-5 bg-white rounded-3xl border-[1.6px] border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[18px] font-bold text-waypoint-text mb-0.5">Unassigned Orders</h3>
              <p className="text-[12px] text-gray-400 font-medium">6 orders · 8.1 m³ total</p>
            </div>
            <div className="w-6 h-6 bg-[#FFF8E6] text-waypoint-orange rounded-md flex items-center justify-center text-[11px] font-bold">6</div>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            
            {/* Order Card 1 (Active/Selected state) */}
            <div className="flex gap-3 p-4 bg-white rounded-2xl border-2 border-waypoint-yellow shadow-sm cursor-grab">
              <GripVertical className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[14px] font-bold text-waypoint-text leading-tight">Fresh Store #18</h4>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">ORD-2441</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#FFF8E6] text-waypoint-orange text-[10px] font-bold rounded-full">High</span>
                </div>
                <div className="flex items-center gap-1.5 mb-3 text-waypoint-secondary">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-bold">Before 8:00 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#EAF5FF] text-[#3B82F6] text-[11px] font-bold rounded-full">Chilled</span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">420 kg</span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">2.4 m³</span>
                </div>
              </div>
            </div>

            {/* Order Card 2 */}
            <div className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors cursor-grab shadow-sm">
              <GripVertical className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[14px] font-bold text-waypoint-text leading-tight">Style Store #04</h4>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">ORD-2448</p>
                  </div>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">Standard</span>
                </div>
                <div className="flex items-center gap-1.5 mb-3 text-waypoint-secondary">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-bold">8:00 - 10:00 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full">Ambient</span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">310 kg</span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">1.8 m³</span>
                </div>
              </div>
            </div>

            {/* Order Card 3 */}
            <div className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors cursor-grab shadow-sm">
              <GripVertical className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[14px] font-bold text-waypoint-text leading-tight">Metro Market #11</h4>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">ORD-2490</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#FFF8E6] text-waypoint-orange text-[10px] font-bold rounded-full">High</span>
                </div>
                <div className="flex items-center gap-1.5 mb-3 text-waypoint-secondary">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-bold">Before 9:30 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full">Ambient</span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">195 kg</span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">1.2 m³</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Vehicle Allocation */}
        <div className="flex flex-col gap-4 p-5 bg-white rounded-3xl border-[1.6px] border-[#E8E8E3]/80 shadow-[0_12px_40px_0_rgba(32,33,36,0.05)]">
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[18px] font-bold text-waypoint-text mb-0.5">Vehicle Allocation</h3>
              <p className="text-[12px] text-gray-400 font-medium">6 vehicles available</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
              <span className="text-[11px] font-bold text-gray-500">Live capacity</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            
            {/* Vehicle 1 */}
            <div className="flex flex-col p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3.5">
                  <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=150&auto=format&fit=crop" alt="TRK-024" className="w-12 h-12 rounded-[14px] object-cover shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-waypoint-text leading-tight">TRK-024</span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">Heavy truck · Driver Kasun</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-bold text-gray-400">3 orders</span>
                  <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4 text-waypoint-text" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-400 w-12">Weight</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '64%' }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">64%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-400 w-12">Volume</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">72%</span>
                </div>
              </div>
            </div>

            {/* Vehicle 2 */}
            <div className="flex flex-col p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3.5">
                  <img src="https://images.unsplash.com/photo-1566315573427-0243be44ba44?q=80&w=150&auto=format&fit=crop" alt="VAN-012" className="w-12 h-12 rounded-[14px] object-cover shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-waypoint-text leading-tight">VAN-012</span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">Delivery van · Driver Nuwan</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-bold text-gray-400">3 orders</span>
                  <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4 text-waypoint-text" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-400 w-12">Weight</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">42%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-400 w-12">Volume</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-yellow rounded-full" style={{ width: '51%' }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">51%</span>
                </div>
              </div>
            </div>

            {/* Vehicle 3 (Warning State) */}
            <div className="flex flex-col p-4 bg-white rounded-2xl border-2 border-[#F9DCA8] shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3.5">
                  <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=150&auto=format&fit=crop" alt="TRK-019" className="w-12 h-12 rounded-[14px] object-cover shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-waypoint-text leading-tight">TRK-019</span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">Refrigerated · Driver Amal</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-bold text-gray-400">5 orders</span>
                  <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4 text-waypoint-text" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-400 w-12">Weight</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-orange rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">78%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-400 w-12">Volume</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-waypoint-orange rounded-full" style={{ width: '86%' }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-waypoint-text w-8 text-right">86%</span>
                </div>
              </div>
              
              {/* Inline Warning Banner */}
              <div className="flex justify-between items-center p-3 bg-[#FFF8E6] rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-waypoint-orange" />
                  <span className="text-[11px] font-bold text-waypoint-orange">Temperature requirement not supported</span>
                </div>
                <button className="text-[11px] font-bold text-waypoint-text hover:underline">Resolve</button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Floating Bottom Action Bar */}
      <div className="fixed bottom-6 left-23 right-0 flex justify-center z-30 pointer-events-none">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] px-8 py-4 flex items-center justify-between gap-16 pointer-events-auto">
          
          <div className="flex items-center gap-8">
            <p className="text-[13px] font-bold text-waypoint-text">
              18 <span className="font-medium text-gray-500">orders selected</span>
            </p>
            <p className="text-[13px] font-bold text-waypoint-text">
              6 <span className="font-medium text-gray-500">vehicles assigned</span>
            </p>
            <p className="text-[13px] font-bold text-waypoint-orange flex items-center gap-1.5">
              2 <span className="font-medium">constraints resolving</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-10 px-5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-[13px] text-waypoint-text">
              <AlertTriangle className="w-4 h-4" /> Resolve Issues
            </button>
            <button 
              onClick={handlePublishPlan}
              className="flex items-center gap-2 h-10 px-6 bg-waypoint-yellow hover:bg-[#F0B92B] rounded-xl transition-colors font-bold text-[13px] text-waypoint-text shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" /> Publish Plan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
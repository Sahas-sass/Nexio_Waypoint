"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Truck, 
  CheckSquare, 
  History, 
  Bell, 
  LogOut, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  Warehouse,
  ChevronDown
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoaderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tabletFrame, setTabletFrame] = useState(false);
  const [selectedBay, setSelectedBay] = useState("Bay 04 - Cold & Ambient");
  const [bayMenuOpen, setBayMenuOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const navItems = [
    { name: "Trip Queue", href: "/trip-queue", icon: Truck },
    { name: "Verify & Scan", href: "/trip-queue?tab=verify", icon: CheckSquare },
    { name: "Past Logs", href: "/trip-queue?tab=logs", icon: History },
  ];

  return (
    <div className={`min-h-screen bg-[#F4F4F0] flex flex-col font-sans transition-all duration-300 ${
      tabletFrame ? "p-4 sm:p-8 flex items-center justify-center bg-gray-900" : ""
    }`}>
      {/* Prototype Frame Switcher (Header pill on desktop) */}
      <div className="fixed top-3 right-4 z-50 hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-sm text-xs font-semibold text-gray-700">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Prototype View:</span>
        <button
          onClick={() => setTabletFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
            !tabletFrame ? "bg-waypoint-yellow text-waypoint-text shadow-xs" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" /> Full
        </button>
        <button
          onClick={() => setTabletFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
            tabletFrame ? "bg-waypoint-yellow text-waypoint-text shadow-xs" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Tablet className="w-3.5 h-3.5" /> Tablet Frame
        </button>
      </div>

      {/* Main Container - either standard full responsive, or wrapped in an iPad/Tablet bezel */}
      <div className={`w-full flex flex-col bg-waypoint-bg transition-all duration-300 ${
        tabletFrame 
          ? "max-w-[840px] min-h-[1100px] rounded-[40px] shadow-2xl border-[12px] border-gray-800 overflow-hidden relative ring-1 ring-white/20" 
          : "min-h-screen"
      }`}>
        
        {/* Tablet Top Status / App Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E8E3] px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          {/* Left: Waypoint Brand + Loader Tag */}
          <div className="flex items-center gap-3">
            <Link href="/trip-queue" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="Waypoint" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-waypoint-text tracking-tight">Waypoint</span>
                  <span className="bg-[#FFF6D8] text-waypoint-orange text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Tablet
                  </span>
                </div>
                <p className="text-[11px] text-waypoint-secondary font-medium -mt-0.5">Warehouse Loading Dock</p>
              </div>
            </Link>
          </div>

          {/* Center: Bay Selector with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBayMenuOpen(!bayMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#FFF9E6] border border-waypoint-yellow/60 rounded-xl text-xs font-bold text-waypoint-text hover:bg-yellow-100/80 transition-colors"
            >
              <Warehouse className="w-4 h-4 text-waypoint-orange" />
              <span>{selectedBay}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {bayMenuOpen && (
              <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-40">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Dock Bay
                </div>
                {["Bay 01 - Dry Ambient", "Bay 02 - Express Van", "Bay 04 - Cold & Ambient", "Bay 06 - Heavy Freight"].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setSelectedBay(b);
                      setBayMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-gray-50 ${
                      selectedBay === b ? "text-waypoint-orange bg-yellow-50/60 font-bold" : "text-gray-700"
                    }`}
                  >
                    {b}
                    {selectedBay === b && <span className="w-1.5 h-1.5 rounded-full bg-waypoint-orange" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Shift Status & Loader Profile */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-green-50 border border-green-200/80 rounded-full">
              <span className="w-2 h-2 rounded-full bg-waypoint-success animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-700">Morning Shift</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-waypoint-orange rounded-full border border-white" />
            </button>

            {/* Loader User Avatar & Logout */}
            <div className="flex items-center gap-2 pl-1 border-l border-gray-200">
              <div className="w-9 h-9 bg-waypoint-text text-white font-bold rounded-xl flex items-center justify-center text-xs shadow-xs relative">
                LP
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-waypoint-success rounded-full border-2 border-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-waypoint-text leading-tight">Loader Peter</p>
                <p className="text-[10px] text-gray-500 font-medium">Station #04</p>
              </div>
              <button 
                onClick={handleLogout}
                title="Log Out"
                className="ml-1 p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-7 pb-28">
          {children}
        </main>

        {/* Floating Bottom Tablet Dock Navigation */}
        <div className="sticky bottom-4 w-full flex justify-center pointer-events-none z-30">
          <nav className="pointer-events-auto bg-white/95 backdrop-blur-lg border border-gray-200/90 shadow-xl rounded-2xl p-1.5 flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href.includes("=") && pathname.includes(item.href.split("=")[0]));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? "bg-waypoint-yellow text-waypoint-text shadow-sm"
                      : "text-waypoint-secondary hover:bg-gray-100 hover:text-waypoint-text"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

      </div>
    </div>
  );
}

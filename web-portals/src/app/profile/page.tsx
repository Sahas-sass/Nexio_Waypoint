"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  Bell, 
  Loader2 
} from "lucide-react";
import { UserProfileCard, UserProfileDropdown, useUserProfile } from "./";
import { getRoleConfig } from "./roleConfig";
import LoaderBottomDock from "@/app/(loader)/LoaderBottomDock";

export default function ProfilePage() {
  const { profile, loading } = useUserProfile();

  const role = profile?.role || "loader";
  const roleConfig = getRoleConfig(role);
  const isLoader = role === "loader";
  const portalName = roleConfig.portalName;
  const backLabel = roleConfig.backLabel;
  const dashboardUrl = roleConfig.dashboardUrl;

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#F8F8F5] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-9 h-9 text-waypoint-orange animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-700">Loading user profile...</p>
      </div>
    );
  }

  // ==========================================
  // 1. LOADER ROLE: TABLET VIEW LAYOUT
  // ==========================================
  if (isLoader) {
    return (
      <div className="min-h-screen bg-waypoint-bg flex flex-col font-sans antialiased text-gray-900">
        {/* Tablet Top Status Bar / Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E8E3] px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          {/* Waypoint Brand + Tablet Badge */}
          <div className="flex items-center gap-3">
            <Link href="/trip-queue" className="flex items-center gap-2.5 group">
              <img 
                src="/logo.png" 
                alt="Waypoint" 
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" 
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-waypoint-text tracking-tight">Waypoint</span>
                  <span className="bg-[#FFF6D8] text-waypoint-orange text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Tablet
                  </span>
                </div>
                <p className="text-[11px] text-waypoint-secondary font-medium -mt-0.5">{portalName}</p>
              </div>
            </Link>
          </div>

          {/* Right Header: Notification Bell + Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button 
              type="button" 
              title="Notifications"
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-waypoint-orange rounded-full border border-white" />
            </button>

            {/* User Profile Dropdown */}
            <UserProfileDropdown layoutVariant="header" />
          </div>
        </header>

        {/* Main Tablet Content Container (Touch-Friendly max-w-4xl with bottom dock padding) */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-28">
          <UserProfileCard />
        </main>

        {/* Floating Bottom Tablet Dock Navigation (Trip Queue, Logs, Profile) */}
        <LoaderBottomDock />
      </div>
    );
  }

  // ==========================================
  // 2. DISPATCHER & STORE MANAGER: DESKTOP VIEW LAYOUT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F8F8F5] flex flex-col font-sans antialiased text-gray-900">
      {/* Desktop Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E8E3] px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand + Return Link */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href={dashboardUrl} className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="Waypoint" 
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-gray-900 tracking-tight">Waypoint</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border ${roleConfig.badgeColor}`}>
                  {roleConfig.title}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium -mt-0.5">{portalName}</p>
            </div>
          </Link>

          {/* Return to Dashboard Button */}
          <Link
            href={dashboardUrl}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-yellow-50 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {backLabel}</span>
          </Link>
        </div>

        {/* Right Actions: Notification & Profile Dropdown */}
        <div className="flex items-center gap-3">
          <Link
            href={dashboardUrl}
            className="sm:hidden inline-flex items-center gap-1 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold"
            title={`Back to ${backLabel}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button 
            type="button"
            title="Notifications"
            className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-waypoint-orange rounded-full border border-white" />
          </button>

          <UserProfileDropdown layoutVariant="header" />
        </div>
      </header>

      {/* Main Profile Desktop Content Area (Wide Screen max-w-6xl) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        <UserProfileCard />
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";
import LoaderBottomDock from "./LoaderBottomDock";

export default function LoaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-waypoint-bg flex flex-col font-sans">
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
              <p className="text-[11px] text-waypoint-secondary font-medium -mt-0.5">Loading Dock</p>
            </div>
          </Link>
        </div>

        {/* Right: Loader Profile */}
        <div className="flex items-center gap-3">
          {/* User Profile Dropdown */}
          <UserProfileDropdown layoutVariant="header" />
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 p-4 sm:p-7 pb-28">
        {children}
      </main>

      {/* Floating Bottom Tablet Dock Navigation (Trip Queue, Logs, Profile) */}
      <LoaderBottomDock />
    </div>
  );
}

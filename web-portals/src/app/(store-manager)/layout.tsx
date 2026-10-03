"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShoppingBag, Truck, Bell } from "lucide-react";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";

export default function StoreManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutGrid },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Receiving", href: "/receiving", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-waypoint-bg flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E8E3] px-6 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Left: Brand + Store Manager Tag */}
        <div className="flex items-center gap-6">
          <Link href="/overview" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Waypoint" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-waypoint-text tracking-tight">Waypoint</span>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-emerald-200">
                  Store
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-waypoint-yellow text-waypoint-text shadow-xs"
                      : "text-waypoint-secondary hover:bg-gray-100 hover:text-waypoint-text"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-waypoint-orange rounded-full border border-white" />
          </button>

          <UserProfileDropdown layoutVariant="header" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}

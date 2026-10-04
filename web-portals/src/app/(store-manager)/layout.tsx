"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingBag,
  Truck,
  Bell,
  History,
  Settings,
} from "lucide-react";

export default function StoreManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Store Overview", icon: LayoutGrid, path: "/overview" },
    { name: "Orders", icon: ShoppingBag, path: "/orders" },
    { name: "Receiving", icon: Truck, path: "/receiving" },
    { name: "Alerts", icon: Bell, badge: 2, path: "/alerts" },
    { name: "History", icon: History, path: "/history" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1C1C1C] flex font-sans antialiased selection:bg-[#F5C242]/30">
      {/* LEFT SIDEBAR */}
      <aside className="w-60 bg-white border-r border-[#ECEAE4] flex flex-col justify-between p-5 shrink-0 select-none fixed h-full z-40">
        <div>
          <Link
            href="/overview"
            className="flex items-center gap-3 px-1.5 py-1 group outline-none"
          >
            <div className="bg-[#1C1C1C] w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-3.5 h-3.5 rounded-full bg-[#F5C242]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              Waypoint
            </span>
          </Link>

          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all outline-none ${
                    isActive
                      ? "bg-[#FDF6E2] text-neutral-900 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                      : "text-neutral-600 font-medium hover:bg-[#F7F6F2] hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-neutral-900 stroke-[2.2]"
                          : "text-neutral-500"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#F59E0B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4">
          <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-[#F7F6F2] hover:text-neutral-900 transition-colors mb-4 outline-none">
            <Settings className="w-4 h-4 text-neutral-500" />
            <span>Settings</span>
          </button>

          <div className="bg-[#1C1C1C] text-white p-4 rounded-2xl shadow-sm">
            <p className="text-[11px] text-neutral-400 font-normal">
              Need help?
            </p>
            <p className="text-xs font-semibold mt-0.5 mb-3.5 text-white">
              Support is online
            </p>
            <button className="w-full bg-white text-neutral-900 font-semibold text-xs py-2.5 rounded-xl hover:bg-neutral-100 active:scale-[0.99] transition-all shadow-sm outline-none">
              Contact support
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 ml-60">{children}</div>
    </div>
  );
}

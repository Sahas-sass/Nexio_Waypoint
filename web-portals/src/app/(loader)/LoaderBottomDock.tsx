"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Truck, History, User } from "lucide-react";
import { Suspense } from "react";

function BottomDockContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const isLogsActive = pathname === "/trip-queue" && currentTab === "logs";
  const isQueueActive = pathname === "/trip-queue" && currentTab !== "logs";
  const isProfileActive = pathname === "/profile";

  const navItems = [
    {
      name: "Trip Queue",
      href: "/trip-queue",
      icon: Truck,
      isActive: isQueueActive,
    },
    {
      name: "Logs",
      href: "/trip-queue?tab=logs",
      icon: History,
      isActive: isLogsActive,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      isActive: isProfileActive,
    },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 w-full flex justify-center pointer-events-none z-40 px-4">
      <nav 
        aria-label="Loader Navigation Dock"
        className="pointer-events-auto bg-white/95 backdrop-blur-lg border border-gray-200/90 shadow-xl rounded-2xl p-1.5 flex items-center gap-1.5 sm:gap-2"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                item.isActive
                  ? "bg-waypoint-yellow text-waypoint-text shadow-sm"
                  : "text-waypoint-secondary hover:bg-gray-100 hover:text-waypoint-text"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={item.isActive ? 2.2 : 1.8} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function LoaderBottomDock() {
  return (
    <Suspense fallback={null}>
      <BottomDockContent />
    </Suspense>
  );
}

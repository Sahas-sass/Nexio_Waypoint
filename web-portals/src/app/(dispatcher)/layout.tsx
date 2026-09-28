"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calendar, MapPin, Clock, Bell, Settings } from "lucide-react";

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Command", href: "/command-center", icon: LayoutGrid },
    { name: "Planning", href: "/allocation", icon: Calendar },
    { name: "Tracking", href: "/tracking", icon: MapPin },
    { name: "Deferrals", href: "/deferrals", icon: Clock },
  ];

  const bottomNavItems = [
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-waypoint-bg flex">
      {/* Slim Icon-Based Sidebar */}
      <aside className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 fixed h-full z-20">
        {/* Logo */}
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-8 relative">
          <div className="w-3 h-3 bg-waypoint-yellow rounded-full absolute bottom-2 right-2" />
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M22 10L16 22L10 10H22Z" fill="#FFC83D"/>
          </svg>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 w-full flex flex-col items-center gap-6 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 group w-full">
                <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-yellow-50 text-waypoint-orange' : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600'}`}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-waypoint-orange' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav & Profile */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 group w-full">
                <div className="p-2 text-gray-400 group-hover:bg-gray-50 rounded-xl transition-colors">
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wide">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="mt-4 w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm">
            KS
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-24 p-8">
        {children}
      </main>
    </div>
  );
}
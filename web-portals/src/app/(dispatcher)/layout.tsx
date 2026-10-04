"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calendar, MapPin, Clock, Settings } from "lucide-react";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Command", href: "/command-center", icon: LayoutGrid },
    { name: "Planning", href: "/allocation", icon: Calendar },
    { name: "Tracking", href: "/tracking", icon: MapPin },
    { name: "Deferrals", href: "/deferrals", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-waypoint-bg flex">
      {/* Sidebar with canonical Tailwind sizing */}
      <aside 
        className="fixed top-0 left-0 h-screen w-23 pt-5.5 pb-4.5 px-2.5 flex flex-col items-center bg-white/92 backdrop-blur-[18px] border-r-[1.6px] border-[#E8E8E3] z-20"
      >
        {/* Top Logo / App Icon */}
        <Link href="/command-center" className="mb-8 shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Waypoint Logo" className="w-11 h-11 object-contain" />
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 w-full flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <div key={item.name} className="relative w-full flex justify-center">
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0.75 h-6 bg-waypoint-yellow rounded-r-md" />
                )}
                
                <Link 
                  href={item.href} 
                  className={`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-2xl transition-colors ${
                    isActive 
                      ? 'bg-[#FFF6D8] text-waypoint-text' 
                      : 'text-waypoint-secondary hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5.5 h-5.5" strokeWidth={isActive ? 2 : 1.5} />
                  <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'font-semibold' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions & Profile */}
        <div className="w-full flex flex-col items-center gap-4 mt-auto shrink-0">
          {/* Settings / Profile */}
          <Link 
            href="/profile" 
            className="flex flex-col items-center gap-1.5 text-waypoint-secondary hover:text-waypoint-text transition-colors group"
          >
            <div className="p-1">
              <Settings className="w-5.5 h-5.5" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium tracking-tight group-hover:font-semibold">Settings</span>
          </Link>
          
          {/* Profile Identity */}
          <div className="mt-2 flex justify-center w-full">
            <UserProfileDropdown layoutVariant="sidebar" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-23 p-8">
        {children}
      </main>
    </div>
  );
}
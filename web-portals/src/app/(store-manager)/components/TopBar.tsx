"use client";

import Link from "next/link";
import { Bell, Clock } from "lucide-react";
import { UserProfileDropdown } from "@/app/profile";
import { useNow } from "../hooks/useNow";
import { initials } from "../utils/text";
import { useStore } from "./StoreProvider";

export function TopBar() {
  const { store } = useStore();
  const now = useNow();
  const today = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "Asia/Colombo" });

  return (
    <header className="h-16 bg-white border-b border-[#ECEAE4] px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 py-1 px-1.5">
        <div className="bg-[#F5C242] text-neutral-900 font-bold text-xs w-9 h-9 rounded-xl flex items-center justify-center shadow-xs">
          {initials(store.brand ?? store.name)}
        </div>
        <div className="leading-tight">
          <div className="text-xs font-bold text-neutral-900">{store.name}</div>
          <div className="text-[11px] text-neutral-400">{store.district ?? store.address ?? "—"}</div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>{today}</span>
        </div>
        <Link
          href="/alerts"
          className="relative w-9 h-9 rounded-xl border border-[#ECEAE4] bg-[#F7F6F2]/70 hover:bg-[#F7F6F2] flex items-center justify-center text-neutral-700 transition-colors"
          title="Alerts"
        >
          <Bell className="w-4 h-4" />
        </Link>
        <UserProfileDropdown />
      </div>
    </header>
  );
}

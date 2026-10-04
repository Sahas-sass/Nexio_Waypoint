"use client";

import type { ReactNode } from "react";
import { Search, Calendar } from "lucide-react";
import UserProfileDropdown from "@/app/profile/UserProfileDropdown";
import { formatDateLabel } from "../utils/format";

interface PageHeaderProps {
  title: ReactNode;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Selected date (YYYY-MM-DD). Shown as a label, or as a picker when onDateChange is given. */
  date?: string;
  onDateChange?: (value: string) => void;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search orders, vehicles...",
  date,
  onDateChange,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <p className="text-waypoint-orange text-[10px] font-bold tracking-widest uppercase mb-1">Fleet Operations</p>
        <h1 className="text-3xl font-bold text-waypoint-text tracking-tight flex items-center gap-3">{title}</h1>
        <p className="text-waypoint-secondary text-sm font-medium mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-waypoint-yellow w-64 shadow-2xs font-medium placeholder:font-normal"
          />
        </div>

        {date && (
          <label className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-waypoint-text shadow-2xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDateLabel(date)}</span>
            {onDateChange && (
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                aria-label="Planning date"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            )}
          </label>
        )}

        {actions}
        <UserProfileDropdown layoutVariant="header" />
      </div>
    </div>
  );
}

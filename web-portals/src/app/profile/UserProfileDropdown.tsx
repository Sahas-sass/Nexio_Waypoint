"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  LogOut, 
  Mail, 
  ChevronDown, 
  User, 
  ExternalLink 
} from "lucide-react";
import { useUserProfile } from "./useUserProfile";
import { getRoleConfig } from "./roleConfig";

interface UserProfileDropdownProps {
  layoutVariant?: "header" | "sidebar";
}

export default function UserProfileDropdown({ layoutVariant = "header" }: UserProfileDropdownProps) {
  const { profile, loading, logout } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (loading && !profile) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
        {layoutVariant === "header" && (
          <div className="hidden md:block space-y-1">
            <div className="w-18 h-3 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-2.5 bg-gray-100 rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  const initials = profile?.initials || "WP";
  const fullName = profile?.fullName || "Staff User";
  const email = profile?.email || "staff@waypoint.com";
  const avatarUrl = profile?.avatarUrl;

  const roleConfig = getRoleConfig(profile?.role);
  const roleBadgeColor = roleConfig.badgeColor;
  const roleDisplayName = roleConfig.title;
  const isSidebar = layoutVariant === "sidebar";
  const employeeId = profile?.employeeId || `${roleConfig.defaultEmployeeIdPrefix}-001`;

  return (
    <div className={`relative ${!isSidebar ? "pl-2" : ""}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100/80 transition-colors text-left focus:outline-none cursor-pointer ${
          isSidebar ? "justify-center w-full" : ""
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-[#181C24] text-white font-bold flex items-center justify-center text-xs shadow-2xs relative shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={fullName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-[11px] font-bold">{initials}</span>
          )}
        </div>

        {!isSidebar && (
          <>
            <div className="hidden md:block text-left leading-tight pr-0.5">
              <p className="text-xs font-bold text-gray-900 tracking-tight truncate max-w-[130px]">
                {fullName}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                {employeeId}
              </p>
            </div>
            <ChevronDown 
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:block ${
                isOpen ? "rotate-180" : ""
              }`} 
            />
          </>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div 
          className={`absolute ${
            isSidebar ? "bottom-2 left-16" : "right-0 top-full mt-2"
          } w-72 bg-white rounded-2xl shadow-xl border border-gray-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right`}
          role="menu"
        >
          {/* User Header */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-waypoint-text text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={fullName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-bold text-waypoint-text truncate">
                    {fullName}
                  </h4>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${roleBadgeColor}`}>
                    {roleDisplayName}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 truncate mt-1">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* Links Section */}
          <div className="px-2 py-1 space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:text-waypoint-text hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-gray-500" />
                <span>View Full Profile</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* Logout Action */}
          <div className="px-2 pt-1">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { LucideIcon, Warehouse, Truck, Store, ShieldCheck, Car } from "lucide-react";
import { UserProfile, UserRole } from "./types";

export interface RoleUIConfig {
  role: UserRole;
  title: string;
  badgeStyle: string;
  badgeColor: string;
  icon: LucideIcon;
  dashboardUrl: string;
  portalName: string;
  backLabel: string;
  assignedLabel: string;
  defaultDepartment: string;
  defaultEmployeeIdPrefix: string;
  getLocationDisplay: (profile?: Partial<UserProfile> | null) => string;
  getMetaDisplay: (profile?: Partial<UserProfile> | null) => string;
}

export const ROLE_CONFIGS: Record<string, RoleUIConfig> = {
  loader: {
    role: "loader",
    title: "Dock Loader",
    badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Warehouse,
    dashboardUrl: "/trip-queue",
    portalName: "Warehouse Loading Dock",
    backLabel: "Trip Queue",
    assignedLabel: "ASSIGNED LOADING BAY",
    defaultDepartment: "Dock Operations",
    defaultEmployeeIdPrefix: "LDR",
    getLocationDisplay: (profile) =>
      profile?.assignedBay || profile?.station || "Bay 04",
    getMetaDisplay: (profile) =>
      profile?.assignedMeta || (profile?.shift ? `Shift: ${profile.shift}` : "Morning Shift (06:00 - 14:00)"),
  },
  dispatcher: {
    role: "dispatcher",
    title: "Logistics Dispatcher",
    badgeStyle: "bg-blue-50 text-blue-800 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Truck,
    dashboardUrl: "/command-center",
    portalName: "Dispatcher Command Center",
    backLabel: "Command Center",
    assignedLabel: "DISPATCH SCOPE",
    defaultDepartment: "Logistics Operations",
    defaultEmployeeIdPrefix: "DISP",
    getLocationDisplay: (profile) =>
      profile?.outlet || "Central Logistics Hub",
    getMetaDisplay: (profile) =>
      profile?.assignedMeta || (profile?.shift ? `Shift: ${profile.shift}` : "Day Shift Operations"),
  },
  store_manager: {
    role: "store_manager",
    title: "Store Manager",
    badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Store,
    dashboardUrl: "/overview",
    portalName: "Store Manager Portal",
    backLabel: "Store Overview",
    assignedLabel: "ASSIGNED OUTLET",
    defaultDepartment: "Retail Operations",
    defaultEmployeeIdPrefix: "SM",
    getLocationDisplay: (profile) =>
      profile?.outlet || "Fresh Store 22 (F-042)",
    getMetaDisplay: (profile) =>
      profile?.assignedMeta || "Store hours: 06:00 - 18:00",
  },
  driver: {
    role: "driver",
    title: "Fleet Driver",
    badgeStyle: "bg-indigo-50 text-indigo-800 border-indigo-200",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Car,
    dashboardUrl: "/trip-queue",
    portalName: "Fleet Driver Portal",
    backLabel: "Trip Queue",
    assignedLabel: "ASSIGNED FLEET & BAY",
    defaultDepartment: "Fleet Operations",
    defaultEmployeeIdPrefix: "DRV",
    getLocationDisplay: (profile) =>
      profile?.assignedBay || profile?.outlet || "Fleet Bay 04",
    getMetaDisplay: (profile) =>
      profile?.assignedMeta || (profile?.shift ? `Shift: ${profile.shift}` : "Route Run"),
  },
  admin: {
    role: "admin",
    title: "Administrator",
    badgeStyle: "bg-purple-50 text-purple-800 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    icon: ShieldCheck,
    dashboardUrl: "/command-center",
    portalName: "System Administration Portal",
    backLabel: "Command Center",
    assignedLabel: "SYSTEM SCOPE",
    defaultDepartment: "IT & System Administration",
    defaultEmployeeIdPrefix: "ADM",
    getLocationDisplay: () => "Operations Headquarters",
    getMetaDisplay: () => "Full Administrator Access",
  },
};

export function getRoleConfig(role?: string | null): RoleUIConfig {
  if (!role) return ROLE_CONFIGS.loader;
  const normalized = role.toLowerCase().trim();
  return ROLE_CONFIGS[normalized] || {
    role: normalized,
    title: normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, " "),
    badgeStyle: "bg-gray-50 text-gray-800 border-gray-200",
    badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Warehouse,
    dashboardUrl: "/login",
    portalName: "Waypoint Portal",
    backLabel: "Dashboard",
    assignedLabel: "ASSIGNED SCOPE",
    defaultDepartment: "Operations",
    defaultEmployeeIdPrefix: "WP",
    getLocationDisplay: (p) => p?.outlet || p?.assignedBay || "Assigned Location",
    getMetaDisplay: (p) => p?.assignedMeta || p?.shift || "Standard Schedule",
  };
}

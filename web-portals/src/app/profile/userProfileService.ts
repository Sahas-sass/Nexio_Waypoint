import { createBrowserClient } from "@supabase/ssr";
import { UserProfile, UserRole, UserActivity } from "./types";
import { getRoleConfig } from "./roleConfig";

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

function getInitials(name: string): string {
  if (!name) return "WP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatRoleTitle(role: string): string {
  return getRoleConfig(role).title;
}

export function getDashboardUrlForRole(role: string): string {
  return getRoleConfig(role).dashboardUrl;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Just now";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

export async function fetchRecentUserActivities(
  role: string,
  _userId?: string
): Promise<UserActivity[]> {
  const supabase = getSupabaseClient();
  const normalizedRole = (role || "").toLowerCase().trim();

  try {
    if (normalizedRole === "loader") {
      const { data: logs, error } = await supabase
        .from("loading_logs")
        .select("trip_number, plate_number, total_pallets, seal_number, dispatched_at, created_at, has_discrepancy")
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && logs && logs.length > 0) {
        return logs.map((log) => ({
          title: `Dispatched ${log.trip_number} (${log.plate_number})`,
          meta: `${log.total_pallets} pallets • Seal ${log.seal_number || "Verified"}`,
          time: formatRelativeTime(log.dispatched_at || log.created_at),
          type: log.has_discrepancy ? "check" : "truck",
        }));
      }
    } else if (normalizedRole === "dispatcher") {
      const { data: trips, error } = await supabase
        .from("trips")
        .select("trip_number, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && trips && trips.length > 0) {
        return trips.map((trip) => ({
          title: `Trip ${trip.trip_number} scheduled`,
          meta: `Status: ${String(trip.status || "active").toUpperCase()}`,
          time: formatRelativeTime(trip.created_at),
          type: "truck",
        }));
      }
    } else if (normalizedRole === "store_manager") {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("order_number, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && orders && orders.length > 0) {
        return orders.map((order) => ({
          title: `Order ${order.order_number}`,
          meta: `Status: ${String(order.status || "pending").toUpperCase()}`,
          time: formatRelativeTime(order.created_at),
          type: "bag",
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch live activity feed:", err);
  }

  return [
    {
      title: "Account active",
      meta: "Session authenticated",
      time: "Just now",
      type: "check",
    },
  ];
}

export async function fetchCurrentUserProfile(): Promise<UserProfile> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const roleConfig = getRoleConfig("loader");
    return {
      id: "",
      email: "staff@waypoint.com",
      fullName: "Waypoint Staff",
      role: "loader",
      roleTitle: roleConfig.title,
      avatarUrl: null,
      assignedBay: "Bay 04",
      station: "Central Fulfillment Hub",
      shift: "Morning Shift (06:00 - 14:00)",
      initials: "WP",
      activities: [
        {
          title: "Account active",
          meta: "Session authenticated",
          time: "Just now",
          type: "check",
        },
      ],
      isVerified: true,
      status: "active",
      createdAt: new Date().toISOString(),
      lastSignInAt: null,
    };
  }

  // Fetch row from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const metadata = user.user_metadata || {};
  const fullName = profile?.full_name || metadata.full_name || "Waypoint Staff";
  const role: UserRole = profile?.role || metadata.role || "loader";
  const roleConfig = getRoleConfig(role);
  const avatarUrl = profile?.avatar_url || metadata.avatar_url || null;
  const assignedBay = profile?.assigned_bay || metadata.assigned_bay || null;
  const station = profile?.station || metadata.station || null;
  const shift = profile?.shift || metadata.shift || null;
  const storeId = profile?.store_id || metadata.store_id || null;
  const phone = profile?.phone || metadata.phone || null;
  const department = profile?.department || roleConfig.defaultDepartment;
  const employeeId = profile?.employee_id || `${roleConfig.defaultEmployeeIdPrefix}-001`;
  const outlet = profile?.outlet || null;
  const isVerified: boolean = profile?.is_verified ?? true;
  const status: string = profile?.status || "active";
  const assignedMeta: string | null = profile?.assigned_meta || null;

  // Dynamically fetch live recent activities from real database operations
  let activities: UserActivity[] = [];
  try {
    activities = await fetchRecentUserActivities(role, user.id);
  } catch {
    activities = Array.isArray(profile?.activities) && profile.activities.length > 0
      ? profile.activities
      : [
          {
            title: "Account active",
            meta: "Session authenticated",
            time: "Just now",
            type: "check",
          },
        ];
  }

  return {
    id: user.id,
    email: user.email || "",
    fullName,
    role,
    roleTitle: roleConfig.title,
    avatarUrl,
    assignedBay,
    station,
    shift,
    storeId,
    phone,
    department,
    employeeId,
    outlet,
    activities,
    isVerified,
    status,
    assignedMeta,
    initials: getInitials(fullName),
    createdAt: profile?.created_at || user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
  };
}

export async function updateUserProfile(updates: {
  fullName?: string;
  phone?: string;
  department?: string;
  outlet?: string;
  shift?: string;
  employeeId?: string;
  assignedBay?: string;
  station?: string;
  activities?: UserActivity[];
  status?: string;
  isVerified?: boolean;
  assignedMeta?: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User is not authenticated");

  try {
    const res = await fetch("/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        fullName: updates.fullName,
        phone: updates.phone,
        department: updates.department,
        outlet: updates.outlet,
        shift: updates.shift,
        employeeId: updates.employeeId,
        assignedBay: updates.assignedBay,
        station: updates.station,
        activities: updates.activities,
        status: updates.status,
        isVerified: updates.isVerified,
        assignedMeta: updates.assignedMeta,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "API update failed");
    }
  } catch (apiErr: any) {
    console.warn("API route update fallback to client Supabase update:", apiErr?.message);
    const updateData: Record<string, any> = {};
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.outlet !== undefined) updateData.outlet = updates.outlet;
    if (updates.shift !== undefined) updateData.shift = updates.shift;
    if (updates.employeeId !== undefined) updateData.employee_id = updates.employeeId;
    if (updates.assignedBay !== undefined) updateData.assigned_bay = updates.assignedBay;
    if (updates.station !== undefined) updateData.station = updates.station;
    if (updates.activities !== undefined) updateData.activities = updates.activities;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isVerified !== undefined) updateData.is_verified = updates.isVerified;
    if (updates.assignedMeta !== undefined) updateData.assigned_meta = updates.assignedMeta;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message || "Failed to update profile");
    }
  }
}

export async function uploadUserAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/profile/upload-avatar", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to upload avatar to Supabase Storage");
  }

  return data.avatarUrl;
}

export async function signOutUser(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

import { createBrowserClient } from "@supabase/ssr";
import { UserActivity } from "./types";

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export function formatActivityTime(dateInput?: string | Date): string {
  if (!dateInput) return "Just now";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "Recently";
    
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

export interface ActivityPayload {
  title: string;
  meta: string;
  type: "check" | "bag" | "truck" | string;
  timestamp?: string;
}

/**
 * Records a real-time user action (pallet scan, truck dispatch, exception) into the user's profile activity stream.
 * Automatically keeps the most recent 10 activities and updates PostgreSQL public.profiles.
 */
export async function recordUserActivity(
  userId: string | undefined | null,
  activity: ActivityPayload
): Promise<void> {
  if (!userId) return;

  try {
    const supabase = getSupabaseClient();
    
    // Fetch current user activities from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("activities")
      .eq("id", userId)
      .maybeSingle();

    const existingActivities: UserActivity[] = Array.isArray(profile?.activities) 
      ? profile.activities 
      : [];

    const newActivity: UserActivity = {
      title: activity.title,
      meta: activity.meta,
      type: activity.type,
      time: activity.timestamp || new Date().toISOString(),
    };

    // Prepend new activity and limit to latest 10
    const updatedActivities = [newActivity, ...existingActivities].slice(0, 10);

    // Saved through the validated server route; the caller can only ever update their own row
    const res = await fetch("/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activities: updatedActivities }),
    });
    if (!res.ok) {
      console.warn("Could not log user activity:", res.status);
    }
  } catch (err) {
    console.warn("Could not log user activity in background:", err);
  }
}

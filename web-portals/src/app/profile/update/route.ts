import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeProfileUpdate } from "@/lib/profile/profileUpdate";

/**
 * Updates the signed-in user's own profile. Runs with the user's session, so the
 * "Users can update own profile" RLS policy and the role/store protection trigger apply.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update = sanitizeProfileUpdate(body);
  if (!update.ok) {
    return NextResponse.json({ error: update.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(update.payload)
    .eq("id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[profile/update] update failed:", error.message);
    return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
  }

  if (typeof update.payload.full_name === "string") {
    const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: update.payload.full_name } });
    if (metaError) console.warn("[profile/update] auth metadata not updated:", metaError.message);
  }

  return NextResponse.json({ success: true, data });
}

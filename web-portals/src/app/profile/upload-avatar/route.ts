import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv, getSupabaseServiceKey } from "@/lib/supabase/env";
import { sniffImageType, validateAvatarFile } from "@/lib/profile/avatarFile";

/** Uploads the signed-in user's avatar to `avatars/<user id>/…` and stores its URL on their profile. */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const value = (await request.formData()).get("file");
    file = value instanceof File ? value : null;
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const check = validateAvatarFile(file);
  if (!check.ok || !file) {
    return NextResponse.json({ error: check.ok ? "No file provided" : check.error }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (sniffImageType(bytes) !== file.type) {
    return NextResponse.json({ error: "File content does not match its image type" }, { status: 400 });
  }

  // Storage write uses the service key server-side only; the path is always scoped to the caller.
  const { url } = getSupabasePublicEnv();
  const admin = createClient(url, getSupabaseServiceKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const filePath = `${user.id}/avatar-${Date.now()}.${check.extension}`;
  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(filePath, bytes, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("[profile/upload-avatar] upload failed:", uploadError.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const avatarUrl = admin.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;

  const { error: profileError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
  if (profileError) {
    console.error("[profile/upload-avatar] profile update failed:", profileError.message);
    return NextResponse.json({ error: "Could not save avatar" }, { status: 500 });
  }
  await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });

  return NextResponse.json({ success: true, avatarUrl });
}

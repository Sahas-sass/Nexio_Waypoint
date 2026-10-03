import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user from request cookies
    const supabaseUserClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error: userErr,
    } = await supabaseUserClient.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse uploaded file from formData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file exceeds 5MB limit" }, { status: 400 });
    }

    // 3. Admin Supabase client for storage upload
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || "";
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const fileExt = file.name.split(".").pop() || "png";
    const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const filePath = `${user.id}/avatar-${Date.now()}.${cleanExt}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to avatars bucket
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // 4. Update user metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        avatar_url: avatarUrl,
      },
    });

    // 5. Update profiles table if possible
    try {
      await supabaseAdmin
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
    } catch {
      // ignore if column not present yet
    }

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err: any) {
    console.error("Avatar upload API error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

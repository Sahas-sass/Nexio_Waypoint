import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || "";

    // 1. Identify caller session
    const supabaseUserClient = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    });

    const {
      data: { user },
    } = await supabaseUserClient.auth.getUser();

    const body = await request.json();
    const { 
      userId, 
      fullName, 
      phone, 
      department, 
      outlet, 
      shift, 
      assignedBay, 
      station, 
      employeeId,
      role,
      activities,
      status,
      isVerified,
      assignedMeta,
    } = body;

    // Determine target ID: if authenticated, use user.id; if admin/demo mode with specified target, allow target
    const targetUserId = user?.id || userId;

    if (!targetUserId && !role) {
      return NextResponse.json(
        { error: "No user authenticated or target specified" },
        { status: 401 }
      );
    }

    // 2. Prepare database update payload
    const updatePayload: Record<string, any> = {};
    if (fullName !== undefined) updatePayload.full_name = fullName;
    if (phone !== undefined) updatePayload.phone = phone;
    if (department !== undefined) updatePayload.department = department;
    if (outlet !== undefined) updatePayload.outlet = outlet;
    if (shift !== undefined) updatePayload.shift = shift;
    if (assignedBay !== undefined) updatePayload.assigned_bay = assignedBay;
    if (station !== undefined) updatePayload.station = station;
    if (employeeId !== undefined) updatePayload.employee_id = employeeId;
    if (activities !== undefined) updatePayload.activities = activities;
    if (status !== undefined) updatePayload.status = status;
    if (isVerified !== undefined) updatePayload.is_verified = isVerified;
    if (assignedMeta !== undefined) updatePayload.assigned_meta = assignedMeta;

    // 3. Update via Supabase Admin Client
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let query = supabaseAdmin.from("profiles").update(updatePayload);

    if (targetUserId) {
      query = query.eq("id", targetUserId);
    } else if (role) {
      query = query.eq("role", role);
    }

    const { data: updatedRows, error: updateErr } = await query.select();

    if (updateErr) {
      console.error("Profile update DB error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Also update auth.users metadata if targetUserId is available
    if (targetUserId && fullName) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          user_metadata: {
            full_name: fullName,
            phone: phone,
          },
        });
      } catch (authErr) {
        console.warn("Failed to update auth metadata:", authErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully in database",
      data: updatedRows?.[0] || null,
    });
  } catch (err: any) {
    console.error("Profile update route error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

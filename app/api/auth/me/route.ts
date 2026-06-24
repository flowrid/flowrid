import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * GET /api/auth/me
 * Resolve user role from multiple sources (most reliable first):
 * 1. public.users table
 * 2. auth.users raw_user_meta_data (via admin API — survives OAuth refresh)
 * 3. session user_metadata (may be overwritten by Google OAuth)
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    }

    // Validate token
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = authData.user.id;

    // Source 1: public.users table
    const { data: dbUser } = await supabase
      .from("users")
      .select("role, name, email")
      .eq("id", userId)
      .maybeSingle();

    if (dbUser?.role) {
      return NextResponse.json({
        role: dbUser.role,
        name: dbUser.name || null,
        email: dbUser.email || authData.user.email || null,
        source: "public.users",
      });
    }

    // Source 2: auth.users stored metadata via admin API (survives OAuth refresh)
    const { data: adminUser } = await supabase.auth.admin.getUserById(userId);
    const adminMeta = adminUser?.user?.user_metadata as Record<string, unknown> | undefined;
    const storedRole = adminMeta?.role as string | undefined;

    if (storedRole) {
      // Backfill public.users for next time
      const name = (adminMeta?.first_name as string) || authData.user.email?.split("@")[0] || "";
      await supabase.from("users").upsert({
        id: userId,
        email: authData.user.email || "",
        name,
        role: storedRole,
        is_active: true,
      }, { onConflict: "id" });

      return NextResponse.json({
        role: storedRole,
        name: (adminMeta?.first_name as string) || null,
        email: authData.user.email || null,
        source: "admin_api_raw_meta",
      });
    }

    // Source 3: session user_metadata (least reliable)
    const metaRole = authData.user.user_metadata?.role as string | undefined;

    return NextResponse.json({
      role: metaRole || null,
      name: authData.user.user_metadata?.first_name || null,
      email: authData.user.email || null,
      source: metaRole ? "user_metadata" : "none",
    });
  } catch (e) {
    console.error("/api/auth/me error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * POST /api/auth/set-role
 * Stores the user's role in public.users table after registration.
 * Called by /join/brand and /join/3pl pages.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const { role } = await req.json();
    if (!role || !["brand", "3pl"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = authData.user.id;
    const email = authData.user.email || "";
    const name =
      (authData.user.user_metadata?.first_name as string) ||
      email.split("@")[0];

    await supabase.from("users").upsert(
      { id: userId, email, name, role, is_active: true },
      { onConflict: "id" }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("/api/auth/set-role error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

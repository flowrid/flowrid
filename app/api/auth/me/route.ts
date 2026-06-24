import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * GET /api/auth/me
 * 根据 Authorization header 中的 Supabase access_token 查询用户角色。
 * 优先查 public.users 表，fallback 到 user_metadata。
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

    // 验证 token 获取用户 ID
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = authData.user.id;

    // 查 public.users 表获取角色
    const { data: dbUser } = await supabase
      .from("users")
      .select("role, name, email")
      .eq("id", userId)
      .maybeSingle();

    // fallback 到 user_metadata
    const metaRole = authData.user.user_metadata?.role;

    return NextResponse.json({
      role: dbUser?.role || metaRole || null,
      name: dbUser?.name || authData.user.user_metadata?.first_name || null,
      email: dbUser?.email || authData.user.email || null,
    });
  } catch (e) {
    console.error("/api/auth/me error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

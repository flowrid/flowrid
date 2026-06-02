import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createServiceClient } from "@/lib/supabase";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "flowrid-saas-secret-change-in-production-2026"
);

/**
 * 将 Supabase Auth 身份桥接到 SaaS 系统的 flowrid_token cookie。
 * 3PL 用户通过 Supabase 注册/登录后调用此接口，获取 SaaS 访问权限。
 */
export async function POST(req: Request) {
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

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const role = data.user.user_metadata?.role || "3pl";
    if (role !== "3pl") {
      return NextResponse.json({ error: "Not a 3PL user" }, { status: 403 });
    }

    // 确保 tenant 存在
    const { data: existing } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!existing) {
      const name = (data.user.email || "3pl").split("@")[0];
      await supabase.from("tenants").insert({
        id: data.user.id,
        name,
        slug: data.user.id,
        subscription_tier: "free",
      });
      // 创建 public.users 记录（dock_appointments 等表 FK 需要）
      await supabase.from("users").insert({
        id: data.user.id,
        tenant_id: data.user.id,
        email: data.user.email || "",
        name,
        role: "admin",
        is_active: true,
      });
      // 创建默认仓库
      await supabase.from("warehouses").insert({
        tenant_id: data.user.id,
        name: `${name}'s Warehouse`,
        code: "DEFAULT",
        city: "Default",
        state: "CA",
        country: "US",
        is_active: true,
      });
    }

    // 确保 public.users 记录存在（dock_appointments 等表 FK 需要）
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!existingUser) {
      const userName = (data.user.email || "user").split("@")[0];
      await supabase.from("users").insert({
        id: data.user.id,
        tenant_id: data.user.id,
        email: data.user.email || "",
        name: userName,
        role: "admin",
        is_active: true,
      });
    }

    // 签发 flowrid_token JWT
    const jwt = await new SignJWT({
      sub: data.user.id,
      email: data.user.email || "",
      tenantId: data.user.id,
      role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true });

    response.cookies.set("flowrid_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Auth bridge error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "flowrid-saas-secret-change-in-production-2026"
);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const cookieJar: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => cookieJar.push(c as any));
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=failed`);
  }

  const user = data.user;
  const role = user.user_metadata?.role;
  let redirectUrl = "/join"; // 无 role → 选角色
  let flowridToken: string | null = null;

  if (role === "3pl") {
    const serviceClient = createServiceClient();
    if (serviceClient) {
      const userId = user.id;
      const email = user.email || "";
      const name = email.split("@")[0];

      const { data: existing } = await serviceClient
        .from("tenants").select("id").eq("id", userId).maybeSingle();
      if (!existing) {
        await serviceClient.from("tenants").insert({ id: userId, name, slug: userId, subscription_tier: "free" });
        await serviceClient.from("warehouses").insert({ tenant_id: userId, name: `${name}'s Warehouse`, code: "DEFAULT", city: "Default", state: "CA", country: "US", is_active: true });
      }
      const { data: existingUser } = await serviceClient
        .from("users").select("id").eq("id", userId).maybeSingle();
      if (!existingUser) {
        await serviceClient.from("users").insert({ id: userId, tenant_id: userId, email, name, role: "admin", is_active: true });
      }

      flowridToken = await new SignJWT({ sub: userId, email, tenantId: userId, role: "3pl" })
        .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(JWT_SECRET);
    }
    redirectUrl = "/saas/dashboard";
  } else if (role === "brand") {
    redirectUrl = "/account";
  }

  const response = NextResponse.redirect(`${origin}${redirectUrl}`);

  // 复制 Supabase session cookies
  for (const c of cookieJar) {
    response.cookies.set(c.name, c.value as string, c.options as any);
  }

  // 3PL 用户设置 flowrid_token cookie
  if (flowridToken) {
    response.cookies.set("flowrid_token", flowridToken, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/",
    });
  }

  return response;
}

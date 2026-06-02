import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { OperatorJwtPayload } from "@/types/saas";

const FALLBACK_SECRET = "flowrid-saas-secret-change-in-production-2026";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || FALLBACK_SECRET
);

const DEMO_TENANT = "00000000-0000-0000-0000-000000000001";

function demoOperator(): OperatorJwtPayload {
  return { userId: "demo-001", email: "demo@flowrid.com", tenantId: DEMO_TENANT, role: "admin" };
}

function allowLocalDemoRuntime(request: NextRequest | Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const url = new URL((request as Request).url || "http://localhost");
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

/**
 * 确保 Brand 用户在 tenants 表中存在记录。
 * Brand 用户用自身 Supabase user ID 作为 tenant_id，
 * 需要一条对应的 tenant 行才能满足 products/orders 等表的 FK 约束。
 */
async function ensureTenant(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  userId: string,
  email: string
): Promise<boolean> {
  try {
    // 检查是否已有 tenant
    const { data: existing } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) return true;

    // 自动创建 tenant — slug 用 userId 保证唯一
    const name = email.split("@")[0];
    const { error } = await supabase.from("tenants").insert({
      id: userId,
      name,
      slug: userId,
      subscription_tier: "free",
    });

    if (error) {
      // 可能并发创建导致 duplicate，再次检查
      const { data: retry } = await supabase
        .from("tenants")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      if (!retry) return false;
    }

    // 为新 tenant 创建默认仓库，避免 Orders/Receiving 报 "No warehouse"
    await supabase.from("warehouses").insert({
      tenant_id: userId,
      name: `${name}'s Warehouse`,
      code: "DEFAULT",
      city: "Default",
      state: "CA",
      country: "US",
      is_active: true,
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * 验证 Supabase Auth access token。
 *
 * Supabase 浏览器 session 默认在 localStorage 中，浏览器不会自动发送给 API。
 * Brand Account 复用 SaaS API 时，前端通过 Authorization: Bearer <access_token>
 * 显式传递登录态。
 */
async function verifySupabaseSession(
  request: NextRequest | Request
): Promise<OperatorJwtPayload | null> {
  try {
    const authHeader = (request as Request).headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const accessToken = authHeader.slice("Bearer ".length).trim();
    if (!accessToken) return null;

    const supabase = createServiceClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) return null;

    const metadata = data.user.user_metadata || {};
    const role = metadata?.role || "brand";

    // Brand 用户自动创建 tenant 记录，满足 products/orders 等表的 FK 约束
    if (!(await ensureTenant(supabase, data.user.id, data.user.email || ""))) {
      return null;
    }

    return {
      userId: data.user.id,
      email: data.user.email || "",
      tenantId: data.user.id,
      role: role as string,
    };
  } catch {
    return null;
  }
}

export async function verifyOperatorToken(
  request: NextRequest | Request
): Promise<OperatorJwtPayload | null> {
  try {
    const cookieHeader = (request as NextRequest).cookies?.get?.("flowrid_token");
    const token =
      cookieHeader?.value ||
      (request as Request).headers.get("cookie")?.match(/flowrid_token=([^;]+)/)?.[1];

    if (!token) {
      // 没有 flowrid_token，尝试 Supabase Auth 回退（Brand Account 用户）
      const supabaseUser = await verifySupabaseSession(request);
      if (supabaseUser) return supabaseUser;

      return allowLocalDemoRuntime(request) ? demoOperator() : null;
    }

    if (token === "demo-token") {
      if (process.env.NODE_ENV === "production") return null;
      return demoOperator();
    }

    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[saas-auth] JWT_SECRET is not set — using fallback secret; set JWT_SECRET in production");
      }
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    const tenantId = (payload.tenantId as string) ?? DEMO_TENANT;

    if (!payload.tenantId && payload.sub) {
      const lookedUp = await lookupTenantId(payload.sub as string);
      if (lookedUp) return { userId: payload.sub as string, email: (payload.email as string) ?? "", tenantId: lookedUp };
    }

    return {
      userId: payload.sub as string,
      email: (payload.email as string) ?? "",
      tenantId,
      role: (payload.role as string) ?? undefined,
    };
  } catch {
    // JWT 验证失败，尝试 Supabase Auth 回退
    try {
      const supabaseUser = await verifySupabaseSession(request);
      if (supabaseUser) return supabaseUser;
    } catch {
      // 忽略回退失败
    }
    return null;
  }
}

async function lookupTenantId(userId: string): Promise<string | null> {
  try {
    const supabase = createServiceClient();
    if (!supabase) return null;
    const { data } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle();
    return (data as any)?.tenant_id ?? null;
  } catch {
    return null;
  }
}

export async function requireRole(
  request: NextRequest | Request,
  allowedRoles: string[]
): Promise<OperatorJwtPayload> {
  const operator = await verifyOperatorToken(request);
  if (!operator) throw new UnauthorizedError();

  // Demo token always passes in development
  if (operator.userId === "demo-001" && process.env.NODE_ENV !== "production") {
    return operator;
  }

  const supabase = createServiceClient();
  if (!supabase) {
    // If DB is unavailable, fall back to JWT-embedded role
    if (operator.role && allowedRoles.includes(operator.role)) {
      return operator;
    }
    throw new ForbiddenError("You do not have permission to perform this action");
  }

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", operator.userId)
    .eq("tenant_id", operator.tenantId)
    .maybeSingle();

  const role = (data as any)?.role ?? "viewer";
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }

  return operator;
}

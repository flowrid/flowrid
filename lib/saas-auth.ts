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

// 从 SUPABASE_URL 提取 project ref，用于匹配 Supabase auth cookie
// Cookie 格式：sb-<project-ref>-auth-token
function getSupabaseAuthCookieName(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const match = url.match(/https?:\/\/([^.]+)\./);
  const ref = match ? match[1] : "cdwbbfzfjakkdwnqfffw";
  return `sb-${ref}-auth-token`;
}

function demoOperator(): OperatorJwtPayload {
  return { userId: "demo-001", email: "demo@flowrid.com", tenantId: DEMO_TENANT, role: "admin" };
}

function allowLocalDemoRuntime(request: NextRequest | Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const url = new URL((request as Request).url || "http://localhost");
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

/**
 * 从请求 cookies 中提取 Supabase session 并验证
 * 用于 Brand Account 用户（通过 Supabase Auth 登录）访问 SaaS API 时回退认证
 */
async function verifySupabaseSession(
  request: NextRequest | Request
): Promise<OperatorJwtPayload | null> {
  try {
    // 从 cookie header 中提取 Supabase auth token
    const cookieHeader = (request as Request).headers.get("cookie") || "";
    const cookieName = getSupabaseAuthCookieName();
    const match = cookieHeader.match(
      new RegExp(`${cookieName.replace(/-/g, "\\-")}=([^;]+)`)
    );
    if (!match) return null;

    const rawValue = match[1];
    let accessToken: string | null = null;

    // Supabase cookie 值是 JSON 字符串格式的 session 对象
    try {
      const decoded = decodeURIComponent(rawValue);
      const sessionData = JSON.parse(decoded);
      accessToken = sessionData?.access_token || null;
    } catch {
      // 如果解析失败，尝试直接作为 token 使用
      accessToken = rawValue;
    }

    if (!accessToken) return null;

    // 使用 service_role client 验证 Supabase JWT
    const supabase = createServiceClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) return null;

    const metadata = data.user.user_metadata || {};
    const role = metadata?.role || "brand";

    return {
      userId: data.user.id,
      email: data.user.email || "",
      tenantId: data.user.id, // Brand 用户用自身 ID 作为 tenant 隔离
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

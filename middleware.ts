import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "flowrid-saas-secret-change-in-production-2026"
);

/**
 * 路由保护中间件
 * /saas/* 除 login 和 register 外，未登录跳转到登录页
 * /api/saas/* 验证 JWT 并注入 x-tenant-id / x-user-id header
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只保护 /saas 路由
  if (!pathname.startsWith("/saas")) return NextResponse.next();

  // login 和 register 允许未登录访问
  if (pathname === "/saas/login" || pathname === "/saas/register") {
    return NextResponse.next();
  }

  // API 路由：验证 JWT 并注入 header（非阻塞，路由层仍自行验证）
  if (pathname.startsWith("/api/saas")) {
    const token = request.cookies.get("flowrid_token")?.value;
    if (token && token !== "demo-token") {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-tenant-id", (payload.tenantId as string) || "");
        requestHeaders.set("x-user-id", (payload.sub as string) || "");
        requestHeaders.set("x-user-email", (payload.email as string) || "");
        return NextResponse.next({ request: { headers: requestHeaders } });
      } catch {
        // 验证失败 — 不注入 header，由 API 层自行处理
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("flowrid_token")?.value;

  if (!token) {
    const loginUrl = new URL("/saas/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/saas/:path*",
};

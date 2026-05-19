import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 路由保护中间件
 * /saas/* 除 login 和 register 外，未登录跳转到登录页
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只保护 /saas 路由
  if (!pathname.startsWith("/saas")) return NextResponse.next();

  // login 和 register 允许未登录访问
  if (pathname === "/saas/login" || pathname === "/saas/register") {
    return NextResponse.next();
  }

  // API 路由不拦截（由 API 层自己验证）
  if (pathname.startsWith("/api/saas")) {
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

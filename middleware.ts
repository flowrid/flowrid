import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose";
import { routing } from "./i18n/routing";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "flowrid-saas-secret-change-in-production-2026"
);

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Step 1: Let next-intl handle locale detection + cookie
  const response = intlMiddleware(request);

  // Step 2: Apply SaaS route protection on top
  if (pathname.startsWith("/saas") && pathname !== "/saas/login" && pathname !== "/saas/register") {
    if (pathname.startsWith("/api/saas")) {
      const token = request.cookies.get("flowrid_token")?.value;
      if (token && token !== "demo-token") {
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          response.headers.set("x-tenant-id", (payload.tenantId as string) || "");
          response.headers.set("x-user-id", (payload.sub as string) || "");
          response.headers.set("x-user-email", (payload.email as string) || "");
        } catch {
          // Invalid token — let API handle it
        }
      }
    } else {
      const token = request.cookies.get("flowrid_token")?.value;
      if (!token) {
        const loginUrl = new URL("/saas/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|images|favicon.ico|sitemap.xml|robots.txt|.*\\.png|.*\\.svg|.*\\.jpg).*)"],
};

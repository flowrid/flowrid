import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "flowrid-saas-secret-change-in-production-2026"
);

/**
 * Combined middleware:
 * 1. Locale detection via NEXT_LOCALE cookie (next-intl, localePrefix: 'never')
 * 2. Route protection for /saas/* (JWT-based)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Locale handling ---
  // next-intl with localePrefix: 'never' reads locale from cookie.
  // If no cookie is set, detect from Accept-Language and set it.
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (!localeCookie) {
    const acceptLang = request.headers.get("accept-language") || "";
    const preferred = acceptLang.split(",")[0]?.split("-")[0] || "en";
    const supported = ["en", "zh", "es", "de", "fr", "ja"];
    const locale = supported.includes(preferred) ? preferred : "en";
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", locale, { maxAge: 31536000, path: "/" });
    return response;
  }

  // --- SaaS route protection ---
  if (!pathname.startsWith("/saas")) return NextResponse.next();

  if (pathname === "/saas/login" || pathname === "/saas/register") {
    return NextResponse.next();
  }

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
        // Invalid token — let API handle it
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
  matcher: [
    // Match all paths except static files and api routes that don't need locale
    "/((?!_next|_vercel|api|images|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.png|.*\\.svg|.*\\.jpg).*)",
  ],
};

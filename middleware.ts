import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "flowrid-saas-secret-change-in-production-2026"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /saas routes
  if (!pathname.startsWith("/saas")) {
    // Set NEXT_LOCALE cookie if missing (next-intl plugin reads it)
    const res = NextResponse.next();
    if (!request.cookies.get("NEXT_LOCALE")) {
      const acceptLang = request.headers.get("accept-language") || "";
      const preferred = acceptLang.split(",")[0]?.split("-")[0] || "en";
      const supported = ["en", "zh", "es", "de", "fr", "ja"];
      res.cookies.set("NEXT_LOCALE", supported.includes(preferred) ? preferred : "en", {
        maxAge: 31536000, path: "/",
      });
    }
    return res;
  }

  if (pathname === "/saas/login" || pathname === "/saas/register") {
    const res = NextResponse.next();
    if (!request.cookies.get("NEXT_LOCALE")) {
      const acceptLang = request.headers.get("accept-language") || "";
      const preferred = acceptLang.split(",")[0]?.split("-")[0] || "en";
      const supported = ["en", "zh", "es", "de", "fr", "ja"];
      res.cookies.set("NEXT_LOCALE", supported.includes(preferred) ? preferred : "en", {
        maxAge: 31536000, path: "/",
      });
    }
    return res;
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
      } catch {}
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
  matcher: ["/((?!_next|_vercel|api|images|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.png|.*\\.svg|.*\\.jpg).*)"],
};

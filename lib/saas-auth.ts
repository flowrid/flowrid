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

export async function verifyOperatorToken(
  request: NextRequest | Request
): Promise<OperatorJwtPayload | null> {
  try {
    const cookieHeader = (request as NextRequest).cookies?.get?.("flowrid_token");
    const token =
      cookieHeader?.value ||
      (request as Request).headers.get("cookie")?.match(/flowrid_token=([^;]+)/)?.[1];

    if (!token) return null;

    if (token === "demo-token") {
      if (process.env.NODE_ENV === "production") return null;
      return { userId: "demo-001", email: "demo@flowrid.com", tenantId: DEMO_TENANT, role: "admin" };
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

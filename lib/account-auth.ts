import { createServiceClient } from "./supabase";

export type BrandAccountUser = {
  userId: string;
  email: string;
  company: string | null;
  role: string;
};

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export function isAllowedBrandRole(role: string | undefined): boolean {
  return !role || role === "brand";
}

export async function requireBrandUser(req: Request): Promise<BrandAccountUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;
  if (error || !user) return null;

  const metadata = user.user_metadata || {};
  const role = (metadata.role as string | undefined) || "brand";
  if (!isAllowedBrandRole(role)) return null;

  return {
    userId: user.id,
    email: user.email || "",
    company: (metadata.company as string | undefined) || null,
    role,
  };
}

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---- 公开客户端（anon key，受 RLS 限制）----

let publicCache: SupabaseClient | null = null;

function getPublicClient(): SupabaseClient | null {
  if (publicCache) return publicCache;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "your_supabase_url_here") {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase 未配置。请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    return null;
  }

  try {
    publicCache = createClient(url, key);
    return publicCache;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase 连接失败:", (e as Error).message);
    }
    return null;
  }
}

// ---- 服务端客户端（service_role key，绕过 RLS）----

let serviceCache: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient | null {
  if (serviceCache) return serviceCache;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "development") {
      console.warn("SUPABASE_SERVICE_ROLE_KEY 未配置，写入操作将不可用");
    }
    return null;
  }

  try {
    serviceCache = createClient(url, key, {
      auth: { persistSession: false },
    });
    return serviceCache;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase 服务端连接失败:", (e as Error).message);
    }
    return null;
  }
}

// Server Components 用 anon key（只读查询）
export function createServerClient(): SupabaseClient | null {
  return getPublicClient();
}

// API Routes 用 service_role key（读写操作）
export function createServiceClient(): SupabaseClient | null {
  return getServiceClient();
}

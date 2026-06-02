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

// ---- Cookie-based storage adapter ----
// 将 Supabase session 存储在 cookie 中，使浏览器自动携带认证信息到 API 请求
// 默认的 localStorage 存储不会自动发送到服务器，导致 Brand Account 页面 401

function cookieStorage() {
  if (typeof document === "undefined") {
    // SSR 环境回退到内存存储
    const mem: Record<string, string> = {};
    return {
      getItem: (key: string) => mem[key] || null,
      setItem: (key: string, value: string) => { mem[key] = value; },
      removeItem: (key: string) => { delete mem[key]; },
    };
  }

  return {
    getItem: (key: string) => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    },
    setItem: (key: string, value: string) => {
      // 30 天过期，SameSite=Lax 允许同站请求自动携带
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
    },
    removeItem: (key: string) => {
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
    },
  };
}

// 浏览器客户端（使用 cookie 存储，确保 API 请求自动携带认证）
let browserCache: SupabaseClient | null = null;
let browserCacheIsSSR = false; // 追踪是否在 SSR 期间创建

export function createBrowserClient(): SupabaseClient | null {
  // SSR 期间创建的客户端在客户端水合后需要重建
  // 因为 SSR 时 cookieStorage() 回退到内存存储（无 document 对象）
  if (browserCacheIsSSR && typeof document !== "undefined") {
    browserCache = null;
    browserCacheIsSSR = false;
  }

  if (browserCache) return browserCache;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  browserCacheIsSSR = typeof document === "undefined";

  browserCache = createClient(url, key, {
    auth: {
      storage: cookieStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserCache;
}

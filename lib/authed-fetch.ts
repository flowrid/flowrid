"use client";

import { createBrowserClient } from "@/lib/supabase";

/**
 * 为需要 Supabase Auth 的 API 请求自动附加 Bearer token。
 *
 * Supabase 浏览器 session 默认存储在 localStorage，浏览器不会自动发送给 API。
 * 因此 Brand Account 复用 SaaS API 时必须显式携带 access_token。
 */
export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const supabase = createBrowserClient();
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const token = data.session?.access_token;

  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

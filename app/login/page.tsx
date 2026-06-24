"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const processingRef = useRef(false);

  useEffect(() => {
    // 防止 React Strict Mode 双重挂载导致重复处理
    if (processingRef.current) return;

    const search = window.location.search;
    const hash = window.location.hash;
    const hasAuthInQuery = search.includes("code=");
    const hasAuthInHash = hash.includes("access_token") || hash.includes("code=");

    if (!hasAuthInQuery && !hasAuthInHash) {
      setShowForm(true);
      return;
    }

    processingRef.current = true;

    const supabase = createBrowserClient();
    if (!supabase) {
      setShowForm(true);
      processingRef.current = false;
      return;
    }

    function getRedirect(session: any) {
      const role = session?.user?.user_metadata?.role;
      if (!role) return "/join";
      return role === "3pl" ? "/saas/dashboard" : "/account";
    }

    async function bridgeIf3PL(session: any) {
      const role = session?.user?.user_metadata?.role;
      if (role === "3pl" && session?.access_token) {
        try {
          await fetch("/api/auth/bridge", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
        } catch {
          // 桥接失败不阻塞登录流程
        }
      }
    }

    let resolved = false;

    async function handleSession(session: any) {
      if (resolved || !session) return;
      resolved = true;
      subscription?.unsubscribe();
      clearTimeout(fallback);
      await bridgeIf3PL(session);
      window.history.replaceState({}, "", "/login");
      router.push(getRedirect(session));
      router.refresh();
    }

    // 注册 onAuthStateChange（自动检测完成后触发 SIGNED_IN）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await handleSession(session);
      }
    });

    // 主动处理：从 query string 提取 code 并交换 session
    const urlParams = new URLSearchParams(search);
    const code = urlParams.get("code");

    if (code) {
      // 手动交换 PKCE code（比依赖 detectSessionInUrl 更可靠）
      supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
        if (error) {
          console.error("PKCE exchange failed:", error.message);
          if (!resolved) {
            resolved = true;
            subscription.unsubscribe();
            processingRef.current = false;
            window.history.replaceState({}, "", "/login");
            setShowForm(true);
          }
          return;
        }
        if (data?.session) {
          await handleSession(data.session);
        }
      });
    } else {
      // 非 PKCE 流程（hash token）：尝试 getSession
      supabase.auth.getSession().then(async ({ data }) => {
        if (data?.session && !resolved) {
          await handleSession(data.session);
        }
      });
    }

    // 兜底：8 秒后仍未解析则回退到登录表单
    const fallback = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        subscription.unsubscribe();
        processingRef.current = false;
        window.history.replaceState({}, "", "/login");
        setShowForm(true);
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      {showForm ? (
        <LoginForm />
      ) : (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Signing you in…</p>
        </div>
      )}
    </div>
  );
}

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

    // 同时检查 query string（PKCE 流程：?code=xxx）和 hash（implicit 流程：#access_token=xxx）
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

    // resolved 标志防止 onAuthStateChange 和 getSession 双重触发
    let resolved = false;

    async function handleSession(session: any) {
      if (resolved || !session) return;
      resolved = true;
      subscription.unsubscribe();
      clearTimeout(fallback);
      await bridgeIf3PL(session);
      // 清理 URL 中的 auth 参数，避免浏览器回退时重新触发
      window.history.replaceState({}, "", "/login");
      router.push(getRedirect(session));
      router.refresh();
    }

    // 方案 A：监听 SIGNED_IN 事件（PKCE code exchange 完成时触发）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await handleSession(session);
      }
    });

    // 方案 B：主动检查 session（处理事件在监听器注册前已触发的情况）
    supabase.auth.getSession().then(async ({ data }) => {
      if (data?.session && !resolved) {
        await handleSession(data.session);
      }
    });

    // 兜底：5 秒后仍未解析则回退到登录表单
    const fallback = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        subscription.unsubscribe();
        processingRef.current = false;
        window.history.replaceState({}, "", "/login");
        setShowForm(true);
      }
    }, 5000);

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

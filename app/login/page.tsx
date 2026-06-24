"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const processingRef = useRef(false);

  useEffect(() => {
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
    setStatus("检测到授权回调，正在交换 session…");

    const supabase = createBrowserClient();
    if (!supabase) {
      setStatus("认证服务不可用，请重试");
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
      setStatus("登录成功，正在跳转…");
      await bridgeIf3PL(session);
      window.location.href = getRedirect(session);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[LoginPage] onAuthStateChange:", event, session?.user?.email);
      if (event === "SIGNED_IN" && session) {
        await handleSession(session);
      }
    });

    const urlParams = new URLSearchParams(search);
    const code = urlParams.get("code");

    if (code) {
      console.log("[LoginPage] Exchanging PKCE code…");
      // 诊断：检查 sessionStorage 中是否有 PKCE verifier
      const storageKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        storageKeys.push(sessionStorage.key(i));
      }
      console.log("[LoginPage] sessionStorage keys:", storageKeys);
      setStatus("交换授权码中…");
      supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
        console.log("[LoginPage] exchangeCodeForSession result:", { hasSession: !!data?.session, error: error?.message });
        if (error) {
          console.error("[LoginPage] PKCE exchange failed:", error.message);
          setStatus(`授权失败: ${error.message}`);
          if (!resolved) {
            resolved = true;
            subscription.unsubscribe();
            processingRef.current = false;
            setTimeout(() => setShowForm(true), 3000);
          }
          return;
        }
        if (data?.session) {
          await handleSession(data.session);
        }
      });
    } else {
      console.log("[LoginPage] No code in URL, trying getSession…");
      setStatus("恢复会话中…");
      supabase.auth.getSession().then(async ({ data, error }) => {
        console.log("[LoginPage] getSession result:", { hasSession: !!data?.session, error: error?.message });
        if (data?.session && !resolved) {
          await handleSession(data.session);
        } else if (!resolved) {
          setStatus("未检测到会话，请重新登录");
          resolved = true;
          subscription.unsubscribe();
          processingRef.current = false;
          setTimeout(() => setShowForm(true), 3000);
        }
      });
    }

    const fallback = setTimeout(() => {
      if (!resolved) {
        console.log("[LoginPage] Fallback timeout");
        resolved = true;
        subscription.unsubscribe();
        processingRef.current = false;
        setStatus("登录超时，请重试");
        setTimeout(() => {
          window.history.replaceState({}, "", "/login");
          setShowForm(true);
        }, 2000);
      }
    }, 10000);

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
          <p className="text-text-secondary text-sm">{status || "Signing you in…"}</p>
        </div>
      )}
    </div>
  );
}

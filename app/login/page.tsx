"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const hasAuthTokens = hash && (hash.includes("access_token") || hash.includes("code="));

    if (!hasAuthTokens) {
      setShowForm(true);
      return;
    }

    // OAuth 回调 — 等待 SIGNED_IN 后跳转
    const supabase = createBrowserClient();
    if (!supabase) {
      setShowForm(true);
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
        await fetch("/api/auth/bridge", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        await bridgeIf3PL(session);
        router.push(getRedirect(session));
        router.refresh();
      }
    });

    // 兜底
    const fallback = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        subscription.unsubscribe();
        await bridgeIf3PL(data.session);
        router.push(getRedirect(data.session));
        router.refresh();
      } else {
        setShowForm(true);
      }
    }, 3000);

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

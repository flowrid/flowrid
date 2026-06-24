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
    setStatus("Exchanging authorization code…");

    const supabase = createBrowserClient();
    if (!supabase) {
      setStatus("Authentication service unavailable. Please try again.");
      processingRef.current = false;
      return;
    }

    // Resolve role: user_metadata first, then DB as fallback
    async function resolveRole(session: any): Promise<string | null> {
      const metaRole = session?.user?.user_metadata?.role as string | undefined;
      console.log("[LoginPage] user_metadata.role:", metaRole);
      if (metaRole) return metaRole;

      // Google OAuth may overwrite user_metadata — check via API
      console.log("[LoginPage] user_metadata has no role, calling /api/auth/me…");
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const body = await res.json();
        console.log("[LoginPage] /api/auth/me response:", body);
        return body.role || null;
      } catch (e) {
        console.error("[LoginPage] /api/auth/me failed:", e);
      }
      return null;
    }

    function getRedirect(role: string | null) {
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
          // Non-blocking
        }
      }
    }

    let resolved = false;

    async function handleSession(session: any) {
      if (resolved || !session) return;
      resolved = true;
      subscription?.unsubscribe();
      clearTimeout(fallback);

      setStatus("Signing you in…");
      const role = await resolveRole(session);
      await bridgeIf3PL(session);
      window.location.href = getRedirect(role);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await handleSession(session);
      }
    });

    const urlParams = new URLSearchParams(search);
    const code = urlParams.get("code");

    if (code) {
      setStatus("Verifying with Google…");
      supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
        if (error) {
          setStatus("Authorization failed. Please try again.");
          resolved = true;
          subscription.unsubscribe();
          processingRef.current = false;
          setTimeout(() => setShowForm(true), 3000);
          return;
        }
        if (data?.session) {
          await handleSession(data.session);
        }
      });
    } else {
      setStatus("Restoring session…");
      supabase.auth.getSession().then(async ({ data, error }) => {
        if (data?.session && !resolved) {
          await handleSession(data.session);
        } else if (!resolved) {
          setStatus("No session found. Please sign in again.");
          resolved = true;
          subscription.unsubscribe();
          processingRef.current = false;
          setTimeout(() => setShowForm(true), 3000);
        }
      });
    }

    const fallback = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        subscription.unsubscribe();
        processingRef.current = false;
        setStatus("Login timed out. Please try again.");
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

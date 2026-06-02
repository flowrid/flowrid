"use client";

import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const router = useRouter();

  // 处理 OAuth / Magic Link 回调 — 使用 onAuthStateChange 避免竞态条件
  // Supabase 构造函数中的 _getSessionFromUrl() 是异步的，
  // getSession() 可能在 session 设置完成前就返回 null
  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) return;

    const hash = window.location.hash;
    const hasAuthTokens = hash && (hash.includes("access_token") || hash.includes("code="));

    if (!hasAuthTokens) return;

    // 根据用户 role 决定跳转目标；无 role 则先选角色
    function getRedirect(session: any) {
      const role = session?.user?.user_metadata?.role;
      if (!role) return "/join";
      return role === "3pl" ? "/saas/dashboard" : "/account";
    }

    // 首选：监听 SIGNED_IN 事件（在 _getSessionFromUrl 完成后触发）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        router.push(getRedirect(session));
        router.refresh();
      }
    });

    // 兜底：2 秒后手动检查（以防 onAuthStateChange 因某种原因未触发）
    const fallback = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          subscription.unsubscribe();
          router.push(getRedirect(data.session));
          router.refresh();
        }
      });
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [router]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Authentication service unavailable.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const { data } = await supabase.auth.getSession();
      const role = data?.session?.user?.user_metadata?.role;
      router.push(role === "3pl" ? "/saas/dashboard" : role === "brand" ? "/account" : "/join");
      router.refresh();
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Authentication service unavailable.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Check your email for the magic link!");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Authentication service unavailable.");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // 让 Supabase 重定向回当前页面，客户端自动处理 hash token
          redirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) {
        if (error.message.includes("not enabled") || error.message.includes("Unsupported provider")) {
          setError("Google login is not yet configured. Please use email to sign in.");
        } else {
          setError(error.message);
        }
      }
    } catch {
      setError("Google login is not available. Please use email to sign in.");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link href="/">
          <img src="/flowrid-logo.png" alt="Flowrid" className="h-8 mx-auto mb-6" />
        </Link>
        <h1 className="text-2xl font-bold text-text">Log in to Flowrid</h1>
        <p className="text-text-secondary mt-2">Welcome back.</p>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white border border-border rounded-xl px-4 py-3 text-text hover:bg-gray-50 transition-colors font-medium"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-secondary uppercase tracking-wider">Or continue with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />

        {mode === "password" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        )}

        {error && (
          <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-2.5">{error}</div>
        )}

        {message && (
          <div className="text-sm text-success bg-success/5 border border-success/20 rounded-lg px-4 py-2.5">{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Continue"}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
          className="text-sm text-text-secondary hover:text-primary transition-colors"
        >
          {mode === "password" ? "Send a magic link instead" : "Sign in with password instead"}
        </button>
      </div>

      <div className="text-center mt-6 pt-6 border-t border-border">
        <p className="text-sm text-text-secondary">
          New here?{" "}
          <Link href="/join" className="text-primary hover:underline font-medium">
            Get started &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { createBrowserClient } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ThreePLJoinPage() {
  const t = useTranslations();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Registration is temporarily unavailable.");
      setLoading(false);
      return;
    }

    // 检查是否已有 session（Google OAuth 进来的用户）
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          company: form.company,
          role: "3pl",
        },
      });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        // 同步写入 public.users 表，避免后续 OAuth 登录时角色丢失
        const at = sessionData.session.access_token;
        if (at) {
          await fetch("/api/auth/set-role", {
            method: "POST",
            headers: { Authorization: `Bearer ${at}` },
            body: JSON.stringify({ role: "3pl" }),
          });
        }
        // 桥接：获取 SaaS flowrid_token cookie
        const { data: newSession } = await supabase.auth.getSession();
        const accessToken = newSession?.session?.access_token;
        if (accessToken) {
          await fetch("/api/auth/bridge", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        }
        router.push("/saas/dashboard");
        router.refresh();
      }
      return;
    }

    // 新用户，走 signUp
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          company: form.company,
          role: "3pl",
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data?.session) {
      // 桥接：获取 SaaS flowrid_token cookie
      if (data.session.access_token) {
        await fetch("/api/auth/bridge", {
          method: "POST",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
      }
      router.push("/saas/dashboard");
      router.refresh();
    } else {
      setLoading(false);
      setError("Account created! Please check your email to confirm your account, then log in.");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/flowrid-logo.png" alt="Flowrid" className="h-8 mx-auto mb-6" />
          </Link>
          <h1 className="text-2xl font-bold text-text">{t('auth.threePLJoinTitle')}</h1>
          <p className="text-text-secondary mt-2">{t('auth.threePLJoinDesc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder={t('auth.firstName')} value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)} required
              className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            <input type="text" placeholder={t('auth.lastName')} value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)} required
              className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <input type="text" placeholder={t('auth.warehouseName')} value={form.company}
            onChange={(e) => update("company", e.target.value)} required
            className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          <input type="email" placeholder={t('auth.email')} value={form.email}
            onChange={(e) => update("email", e.target.value)} required
            className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          <input type="password" placeholder={t('auth.password')} value={form.password}
            onChange={(e) => update("password", e.target.value)} required minLength={6}
            className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />

          {error && <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-2.5">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60">
            {loading ? t('auth.creating') : t('auth.createAccount')}
          </button>
        </form>

        <p className="text-xs text-text-secondary text-center mt-4">
          {t('auth.legalConsent')}
        </p>
        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-sm text-text-secondary">
            {t('auth.alreadyHave')} <Link href="/login" className="text-primary hover:underline font-medium">{t('auth.logIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

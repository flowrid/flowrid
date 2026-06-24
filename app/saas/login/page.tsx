"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/saas/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", email, password }) });
      if (!res.ok) { const data = await res.json(); setError(data.error || t("saas.invalidCredentials")); return; }
      window.location.href = "/saas/dashboard";
    } catch {
      setError(t("saas.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("saas.loginTitle")}</h1>
          <p className="text-[#86868B] text-sm mt-2">{t("saas.loginSubtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{t("saas.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 transition-all"
              placeholder={t("saas.emailPlaceholder")}
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{t("saas.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 transition-all"
              placeholder={t("saas.passwordPlaceholder")}
              required
            />
          </div>

          {error && <p className="text-[#FF3B30] text-xs bg-[#FF3B30]/5 rounded-xl px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ed6d00] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#FF8A1F] transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? t("saas.signingIn") : t("saas.signIn")}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#86868B] mt-6">
          {t("saas.version")}
        </p>
        <p className="text-center text-xs text-[#86868B] mt-3">
          <Link href="/saas/register" className="text-[#ed6d00] hover:underline font-medium">
            {t("saas.noAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}

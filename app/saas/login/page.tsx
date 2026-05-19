"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/saas/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (!res.ok) { setError("Invalid credentials"); return; }
      window.location.href = "/saas/dashboard";
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Flowrid</h1>
          <p className="text-[#86868B] text-sm mt-2">3PL Operating System</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
              placeholder="operator@3pl.com"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-[#FF3B30] text-xs bg-[#FF3B30]/5 rounded-xl px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0071E3] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#0077ED] transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#86868B] mt-6">
          Flowrid 3PL OS v0.1
        </p>
        <p className="text-center text-xs text-[#86868B] mt-3">
          Don&apos;t have an account?{" "}
          <Link href="/saas/register" className="text-[#0071E3] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/saas/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">&#x2705;</div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Account Created</h1>
          <p className="text-[#86868B] text-sm mt-2 mb-8">
            Your 3PL operating system is ready.
          </p>
          <Link
            href="/saas/dashboard"
            className="inline-flex bg-[#ed6d00] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] transition-colors shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Create Account</h1>
          <p className="text-[#86868B] text-sm mt-2">Set up your 3PL warehouse</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
              Warehouse Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 transition-all"
              placeholder="FlowX Fulfillment"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 transition-all"
              placeholder="operator@warehouse.com"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 transition-all"
              placeholder="Min 6 characters"
              required
            />
          </div>

          {error && (
            <p className="text-[#FF3B30] text-xs bg-[#FF3B30]/5 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ed6d00] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#FF8A1F] transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-[#86868B] mt-4">
          Already have an account?{" "}
          <Link href="/saas/login" className="text-[#ed6d00] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

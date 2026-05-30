"use client";

import { createBrowserClient } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ThreePLJoinPage() {
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

    const { error } = await supabase.auth.signUp({
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
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <a href="/">
            <img src="/flowrid-logo.png" alt="Flowrid" className="h-8 mx-auto mb-6" />
          </a>
          <h1 className="text-2xl font-bold text-text">List your 3PL on Flowrid</h1>
          <p className="text-text-secondary mt-2">Create your partner account to get matched with top brands.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="First name" value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)} required
              className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            <input type="text" placeholder="Last name" value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)} required
              className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <input type="text" placeholder="Warehouse / Company name" value={form.company}
            onChange={(e) => update("company", e.target.value)} required
            className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          <input type="email" placeholder="Email address" value={form.email}
            onChange={(e) => update("email", e.target.value)} required
            className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          <input type="password" placeholder="Password (min 6 characters)" value={form.password}
            onChange={(e) => update("password", e.target.value)} required minLength={6}
            className="w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />

          {error && <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-2.5">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-text-secondary text-center mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-sm text-text-secondary">
            Already have an account? <a href="/login" className="text-primary hover:underline font-medium">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata = {
  title: "Dashboard | Flowrid",
};

export default async function DashboardPage() {
  // 简单检查是否登录（通过 Supabase cookie）
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("sb-cdwbbfzfjakkdwnqfffw-auth-token");

  if (!hasSession) {
    redirect("/login");
  }

  return (
    <div className="max-w-[1460px] mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-2">Welcome to Flowrid</h1>
        <p className="text-text-secondary mb-8">
          Your 3PL matching dashboard. We&apos;ll help you find the perfect fulfillment partner.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Find 3PL */}
          <Link
            href="/3pl"
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">Find a 3PL</h2>
            <p className="text-sm text-text-secondary">
              Search and compare 2,800+ verified 3PL providers across the US.
            </p>
          </Link>

          {/* Submit RFQ */}
          <Link
            href="/rfq"
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">Submit an RFQ</h2>
            <p className="text-sm text-text-secondary">
              Get matched with the best 3PL for your specific needs.
            </p>
          </Link>

          {/* Compare */}
          <Link
            href="/compare"
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">Compare 3PLs</h2>
            <p className="text-sm text-text-secondary">
              Side-by-side comparison of your shortlisted providers.
            </p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "3PL Providers", value: "2,818" },
            { label: "States Covered", value: "33" },
            { label: "Platforms", value: "12+" },
            { label: "Categories", value: "25+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <div className="text-center">
          <a
            href="/api/auth/signout"
            className="text-sm text-text-secondary hover:text-danger transition-colors"
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
}

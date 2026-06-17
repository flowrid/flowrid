"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    const loadDashboardUser = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const meta = data.session.user.user_metadata;
        setRole((meta?.role as string) || null);
        setEmail(data.session.user.email || null);
      }
      setLoading(false);
    };

    void loadDashboardUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1460px] mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Welcome{email ? `, ${email.split("@")[0]}` : " to Flowrid"}</h1>
          <p className="text-text-secondary">
            {role === "3pl"
              ? "We connect you with e-commerce brands looking for fulfillment partners."
              : "We connect you with the right 3PL from 2,800+ vetted partners."}
          </p>
        </div>

        {role === "3pl" ? (
          /* ──── 3PL Dashboard ──── */
          <>
            <Link
              href="/join/3pl"
              className="block bg-card border border-border rounded-2xl p-8 hover:border-primary/40 hover:shadow-lg transition-all mb-4"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">Get matched with brands</h2>
              <p className="text-text-secondary mb-6">
                Complete your 3PL profile to start receiving RFQs from e-commerce brands looking for fulfillment.
              </p>
              <span className="text-primary font-medium text-sm">
                Complete your profile &rarr;
              </span>
            </Link>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { label: "Active RFQs", value: "0" },
                { label: "Profile Views", value: "0" },
                { label: "Response Rate", value: "—" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-text">{stat.value}</p>
                  <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ──── Brand Dashboard ──── */
          <>
            <Link
              href="/3pl"
              className="block bg-card border border-border rounded-2xl p-8 hover:border-primary/40 hover:shadow-lg transition-all mb-4"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">Find Your 3PL Match</h2>
              <p className="text-text-secondary mb-6">
                Browse 2,800+ verified 3PLs filtered by state, category, and platform. Compare providers and submit RFQs to get matched.
              </p>
              <span className="text-primary font-medium text-sm">
                Browse 3PL directory &rarr;
              </span>
            </Link>

            <Link
              href="/account/integrations"
              className="block bg-card border border-border rounded-2xl p-8 hover:border-primary/40 hover:shadow-lg transition-all mb-4"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6.75H18A2.25 2.25 0 0120.25 9v9A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V9A2.25 2.25 0 016 6.75h4.5m3 0V5.25A1.5 1.5 0 0012 3.75v0a1.5 1.5 0 00-1.5 1.5v1.5m3 0h-3m-1.5 6h6m-6 3h3" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">Connect your store</h2>
              <p className="text-text-secondary mb-6">
                Connect Shopify so Flowrid can use real order volume, SKUs, and shipping zones to improve 3PL matching and RFQ accuracy.
              </p>
              <span className="text-primary font-medium text-sm">
                Set up store integrations &rarr;
              </span>
            </Link>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { label: "3PL Providers", value: "2,818" },
                { label: "States Covered", value: "33" },
                { label: "Platforms", value: "12+" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-text">{stat.value}</p>
                  <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Getting Started — 通用 */}
        <div className="bg-card border border-border rounded-2xl p-6 text-left">
          <h2 className="text-lg font-semibold text-text mb-4">How it works</h2>
          <div className="space-y-4">
            {role === "3pl" ? (
              [
                { step: 1, title: "Complete your profile", desc: "Add your warehouse locations, specialties, and integrations." },
                { step: 2, title: "Receive RFQs from brands", desc: "Brands submit their requirements and we match them with your capabilities." },
                { step: 3, title: "Submit proposals and win business", desc: "Respond to RFQs with pricing and capabilities to win new clients." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              [
                { step: 1, title: "Search by state, category, or platform", desc: "Browse 2,800+ 3PLs filtered to your exact needs." },
                { step: 2, title: "Connect your store or add shipping signals", desc: "Use order volume, SKU mix, and shipping zones to improve provider matching." },
                { step: 3, title: "Submit an RFQ with better context", desc: "Tell us your requirements and receive proposals from the best-fit 3PLs." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <a href="/rfq" className="text-primary hover:underline">Submit an RFQ</a>
          <span className="text-border">|</span>
          <a href="/compare" className="text-primary hover:underline">Compare 3PLs</a>
          <span className="text-border">|</span>
          <a href="/api/auth/signout" className="text-text-secondary hover:text-danger transition-colors">Sign out</a>
        </div>
      </div>
    </div>
  );
}

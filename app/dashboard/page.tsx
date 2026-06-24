"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations();  const [role, setRole] = useState<string | null>(null);
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
          <h1 className="text-3xl font-bold text-text mb-2">
            {email ? t("dashboard.welcome", { email: email.split("@")[0] }) : t("dashboard.welcomeGuest")}
          </h1>
          <p className="text-text-secondary">
            {role === "3pl"
              ? t("dashboard.threePLDesc")
              : t("dashboard.brandDesc")}
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
              <h2 className="text-xl font-semibold text-text mb-2">{t("dashboard.matchBrands")}</h2>
              <p className="text-text-secondary mb-6">
                {t("dashboard.matchBrandsDesc")}
              </p>
              <span className="text-primary font-medium text-sm">
                {t("dashboard.completeProfile")}
              </span>
            </Link>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { label: t("dashboard.activeRFQs"), value: "0" },
                { label: t("dashboard.profileViews"), value: "0" },
                { label: t("dashboard.responseRate"), value: "—" },
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
              <h2 className="text-xl font-semibold text-text mb-2">{t("dashboard.findMatch")}</h2>
              <p className="text-text-secondary mb-6">
                {t("dashboard.findMatchDesc")}
              </p>
              <span className="text-primary font-medium text-sm">
                {t("dashboard.browseDir")}
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
              <h2 className="text-xl font-semibold text-text mb-2">{t("dashboard.connectStore")}</h2>
              <p className="text-text-secondary mb-6">
                {t("dashboard.connectStoreDesc")}
              </p>
              <span className="text-primary font-medium text-sm">
                {t("dashboard.setupIntegrations")}
              </span>
            </Link>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { label: t("dashboard.providers"), value: "2,818" },
                { label: t("dashboard.statesCovered"), value: "33" },
                { label: t("dashboard.platformsCount"), value: "12+" },
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
          <h2 className="text-lg font-semibold text-text mb-4">{t("dashboard.howItWorks")}</h2>
          <div className="space-y-4">
            {role === "3pl" ? (
              [
                { step: 1, title: t("dashboard.threePLSteps.complete"), desc: "Add your warehouse locations, specialties, and integrations." },
                { step: 2, title: t("dashboard.threePLSteps.receive"), desc: "Brands submit their requirements and we match them with your capabilities." },
                { step: 3, title: t("dashboard.threePLSteps.submit"), desc: "Respond to RFQs with pricing and capabilities to win new clients." },
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
                { step: 1, title: t("dashboard.brandSteps.search"), desc: "Browse 2,800+ 3PLs filtered to your exact needs." },
                { step: 2, title: t("dashboard.brandSteps.connect"), desc: "Use order volume, SKU mix, and shipping zones to improve provider matching." },
                { step: 3, title: t("dashboard.brandSteps.submit"), desc: "Tell us your requirements and receive proposals from the best-fit 3PLs." },
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
          <a href="/rfq" className="text-primary hover:underline">{t("dashboard.submitRFQ")}</a>
          <span className="text-border">|</span>
          <a href="/compare" className="text-primary hover:underline">{t("dashboard.compare3PLs")}</a>
          <span className="text-border">|</span>
          <a href="/api/auth/signout" className="text-text-secondary hover:text-danger transition-colors">{t("dashboard.signOut")}</a>
        </div>
      </div>
    </div>
  );
}

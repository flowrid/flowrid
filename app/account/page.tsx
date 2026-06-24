"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface OverviewData {
  savedCount: number;
  rfqCount: number;
  shopifyConnected: boolean;
  totalProviders: number;
}

export default function AccountPage() {
  const t = useTranslations();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch("/api/account/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setData(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  const metricCards = [
    {
      value: data?.savedCount ?? "-",
      label: t("overview.saved3PLs"),
      sub: t("overview.saved3PLsSub"),
      href: "/account/saved",
      linkText: t("overview.viewSaved"),
    },
    {
      value: data?.rfqCount ?? "-",
      label: t("overview.activeRFQs"),
      sub: data?.rfqCount ? t("overview.rfqsActive") : t("overview.rfqsNone"),
      href: "/rfq",
      linkText: t("overview.submitRFQ"),
    },
    {
      value: data?.shopifyConnected ? "✓" : "—",
      label: t("overview.storeConnection"),
      sub: data?.shopifyConnected ? t("overview.shopifyConnected") : t("overview.shopifyNotConnected"),
      href: "/account/integrations",
      linkText: data?.shopifyConnected ? t("overview.manageIntegrations") : t("overview.connectStore"),
    },
    {
      value: data?.totalProviders?.toLocaleString() ?? "-",
      label: t("overview.total3PLs"),
      sub: t("overview.total3PLsSub"),
      href: "/3pl",
      linkText: t("overview.browseDirectory"),
    },
  ];

  const coreActions = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: t("overview.browse3PL"),
      desc: t("overview.browse3PLDesc"),
      href: "/3pl",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: t("overview.submitRFQ"),
      desc: t("overview.submitRFQDesc"),
      href: "/rfq",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: t("overview.compareSaved"),
      desc: t("overview.compareSavedDesc"),
      href: "/account/compare",
    },
  ];

  const quickLinks = [
    { key: "orders", href: "/account/orders", icon: "/icons/orders.png" },
    { key: "products", href: "/account/products", icon: "/icons/products.png" },
    { key: "inventory", href: "/account/inventory", icon: "/icons/inventory.png" },
    { key: "inbound", href: "/account/receiving", icon: "/icons/receiving.png" },
    { key: "returnsLabel", href: "/account/returns", icon: "/icons/returns.png" },
    { key: "shippingLabel", href: "/account/shipping", icon: "/icons/shipping.png" },
    { key: "analyticsLabel", href: "/account/analytics", icon: "/icons/analytics.png" },
    { key: "reportsLabel", href: "/account/reports", icon: "/icons/reports.png" },
    { key: "billingLabel", href: "/account/billing", icon: "/icons/billing.png" },
    { key: "automationLabel", href: "/account/automation", icon: "/icons/automation.png" },
    { key: "auditLabel", href: "/account/audit", icon: "/icons/audit.png" },
    { key: "settingsLabel", href: "/account/settings", icon: "/icons/settings.png" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">{t("account.brandAccount")}</h1>
        <p className="text-text-secondary">{t("account.desc")}</p>
      </div>

      {/* 第一层：数据概览 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {metricCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="text-3xl font-bold text-text mb-1">
              {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse" /> : card.value}
            </div>
            <div className="text-sm font-medium text-text mb-0.5">{card.label}</div>
            <div className="text-xs text-text-secondary mb-2">{card.sub}</div>
            <span className="text-xs text-primary font-medium group-hover:underline">
              {card.linkText} &rarr;
            </span>
          </Link>
        ))}
      </div>

      {/* 第二层：核心操作 */}
      <h2 className="text-lg font-bold text-text mb-4">{t("overview.coreActions")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {coreActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="text-primary mb-3">{action.icon}</div>
            <h3 className="text-base font-semibold text-text mb-1 group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-text-secondary">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* 第三层：快捷入口 */}
      <h2 className="text-lg font-bold text-text mb-4">{t("overview.quickLinks")}</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {quickLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-text hover:text-primary hover:border-primary/40 hover:bg-gray-50 transition-all"
          >
            <img src={link.icon} alt="" className="w-4 h-4" />
            <span className="truncate">{t(`account.${link.key}`)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

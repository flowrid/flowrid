"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * RFQ 询盘页面 — 核心变现入口
 *
 * 流程：产品类型 → 平台 → 订单量 → 邮箱提交
 */
export default function RFQPage() {
  const t = useTranslations();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    state: "",
    category: "",
    platform: "",
    volume: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customPlatform, setCustomPlatform] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      alert(t('rfq.error'));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <h1 className="text-2xl font-bold text-text">{t('rfq.submitted')}</h1>
        <p className="mt-2 text-text-secondary">
          {t('rfq.submittedMsg')}
        </p>
        <a
          href="/"
          className="inline-block mt-6 text-primary hover:underline font-medium"
        >
          {t('rfq.backHome')}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text text-center">
        {t('rfq.title')}
      </h1>
      <p className="mt-2 text-text-secondary text-center">
        {t('rfq.desc')}
      </p>

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 w-12 rounded-full ${
              s <= step ? "bg-primary" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {/* Step 1: Product Type */}
        {step === 1 && (
          <>
            <label className="block text-sm font-medium text-text">
              {t('rfq.step1Product')}
            </label>
            <input
              type="text"
              placeholder={t('rfq.step1ProductPlaceholder')}
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              autoFocus
            />
            <label className="block text-sm font-medium text-text mt-4">
              {t('rfq.step1State')}
            </label>
            <input
              type="text"
              placeholder={t('rfq.step1StatePlaceholder')}
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
            />
          </>
        )}

        {/* Step 2: Platform */}
        {step === 2 && (
          <>
            <label className="block text-sm font-medium text-text">
              {t('rfq.step2Platform')}
            </label>
            <div className="grid grid-cols-1 gap-3 mt-2">
              {["Shopify", "TikTok Shop", "Amazon"].map((p) => (
                <button
                  key={p}
                  onClick={() => { update("platform", p); setCustomPlatform(""); }}
                  className={`border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    form.platform === p
                      ? "border-primary bg-orange-50 text-primary"
                      : "border-border bg-card hover:border-gray-400"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => { update("platform", customPlatform || "Other"); }}
                className={`border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  form.platform && !["Shopify", "TikTok Shop", "Amazon"].includes(form.platform)
                    ? "border-primary bg-orange-50 text-primary"
                    : "border-border bg-card hover:border-gray-400"
                }`}
              >
                Other
              </button>
            </div>
            {form.platform && !["Shopify", "TikTok Shop", "Amazon"].includes(form.platform) && (
              <input
                type="text"
                placeholder="Enter your platform name"
                value={customPlatform}
                onChange={(e) => { setCustomPlatform(e.target.value); update("platform", e.target.value || "Other"); }}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card mt-3"
                autoFocus
              />
            )}
          </>
        )}

        {/* Step 3: Volume */}
        {step === 3 && (
          <>
            <label className="block text-sm font-medium text-text">
              {t('rfq.step3Volume')}
            </label>
            <div className="grid grid-cols-1 gap-3 mt-2">
              {[
                t('rfq.volume1'),
                t('rfq.volume2'),
                t('rfq.volume3'),
                t('rfq.volume4'),
              ].map((v) => (
                <button
                  key={v}
                  onClick={() => update("volume", v)}
                  className={`border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    form.volume === v
                      ? "border-primary bg-orange-50 text-primary"
                      : "border-border bg-card hover:border-gray-400"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <>
            <label className="block text-sm font-medium text-text">
              {t('rfq.name')}
            </label>
            <input
              type="text"
              placeholder={t('rfq.namePlaceholder')}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              autoFocus
            />
            <label className="block text-sm font-medium text-text mt-4">
              {t('rfq.email')}
            </label>
            <input
              type="email"
              placeholder={t('rfq.emailPlaceholder')}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
            />
            <label className="block text-sm font-medium text-text mt-4">
              {t('rfq.company')}
            </label>
            <input
              type="text"
              placeholder={t('rfq.companyPlaceholder')}
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
            />
            <label className="block text-sm font-medium text-text mt-4">
              {t('rfq.details')}
            </label>
            <textarea
              placeholder={t('rfq.detailsPlaceholder')}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={3}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card resize-none"
            />
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 border border-border rounded-lg py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              {t('rfq.back')}
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-primary text-white rounded-lg py-3 font-semibold hover:bg-primary-dark transition-colors"
            >
              {t('rfq.continue')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary text-white rounded-lg py-3 font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? t('rfq.submitting') : t('rfq.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

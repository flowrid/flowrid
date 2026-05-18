"use client";

import { useState } from "react";

/**
 * RFQ 询盘页面 — 核心变现入口
 *
 * 流程：产品类型 → 平台 → 订单量 → 邮箱提交
 */
export default function RFQPage() {
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
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <h1 className="text-2xl font-bold text-text">Request Submitted!</h1>
        <p className="mt-2 text-text-secondary">
          We&apos;ll match you with the best 3PLs and get back to you within 24
          hours.
        </p>
        <a
          href="/"
          className="inline-block mt-6 text-primary hover:underline font-medium"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text text-center">
        Get Matched with the Best 3PL
      </h1>
      <p className="mt-2 text-text-secondary text-center">
        Tell us about your needs and we&apos;ll find the perfect fulfillment
        partner.
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
              What are you shipping?
            </label>
            <input
              type="text"
              placeholder="e.g. Apparel, Electronics, Jewelry"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              autoFocus
            />
            <label className="block text-sm font-medium text-text mt-4">
              Where do you need fulfillment? (State)
            </label>
            <input
              type="text"
              placeholder="e.g. Texas, California"
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
              Which platform do you sell on?
            </label>
            <div className="grid grid-cols-1 gap-3 mt-2">
              {["Shopify", "TikTok Shop", "Amazon", "Other"].map((p) => (
                <button
                  key={p}
                  onClick={() => update("platform", p)}
                  className={`border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    form.platform === p
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-border bg-card hover:border-gray-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Volume */}
        {step === 3 && (
          <>
            <label className="block text-sm font-medium text-text">
              Monthly order volume?
            </label>
            <div className="grid grid-cols-1 gap-3 mt-2">
              {[
                "0-500 orders/month",
                "500-2000 orders/month",
                "2000-5000 orders/month",
                "5000+ orders/month",
              ].map((v) => (
                <button
                  key={v}
                  onClick={() => update("volume", v)}
                  className={`border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    form.volume === v
                      ? "border-primary bg-blue-50 text-primary"
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
              Your Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              autoFocus
            />
            <label className="block text-sm font-medium text-text mt-4">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
            />
            <label className="block text-sm font-medium text-text mt-4">
              Company (optional)
            </label>
            <input
              type="text"
              placeholder="Your brand or company name"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
            />
            <label className="block text-sm font-medium text-text mt-4">
              Additional Details (optional)
            </label>
            <textarea
              placeholder="Any specific requirements..."
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
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-primary text-white rounded-lg py-3 font-semibold hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary text-white rounded-lg py-3 font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

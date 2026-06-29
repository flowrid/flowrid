"use client";

/**
 * RFQ 快速生成器 — 3 步智能匹配
 * 选品类 → 选平台 → 选地区 + 量级 → 一键生成匹配
 */

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  "Apparel & Fashion", "Electronics", "Health & Beauty", "Food & Beverage",
  "Home & Garden", "Sports & Outdoors", "Pet Supplies", "Toys & Games",
  "Automotive", "Books & Media", "Jewelry", "Furniture", "Supplements",
];

const PLATFORMS = ["Shopify", "Amazon", "WooCommerce", "BigCommerce", "eBay", "Walmart", "Etsy", "Magento", "Custom API"];

const US_STATES = [
  "California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Ohio", "Georgia",
  "North Carolina", "Michigan", "New Jersey", "Virginia", "Washington", "Arizona", "Tennessee",
  "Massachusetts", "Indiana", "Missouri", "Maryland", "Wisconsin", "Colorado", "Minnesota",
  "South Carolina", "Alabama", "Louisiana", "Kentucky", "Oregon", "Oklahoma", "Connecticut",
  "Utah", "Iowa", "Nevada", "Arkansas", "Mississippi", "Kansas", "New Mexico", "Nebraska",
  "Idaho", "West Virginia", "Hawaii", "New Hampshire", "Maine", "Rhode Island", "Montana",
  "Delaware", "South Dakota", "North Dakota", "Alaska", "Vermont", "Wyoming",
];

const VOLUMES = [
  { value: "0-100", label: "0-100 orders/month", desc: "Just getting started" },
  { value: "100-500", label: "100-500 orders/month", desc: "Growing steadily" },
  { value: "500-2000", label: "500-2,000 orders/month", desc: "Scaling up" },
  { value: "2000-5000", label: "2,000-5,000 orders/month", desc: "High volume" },
  { value: "5000+", label: "5,000+ orders/month", desc: "Enterprise scale" },
];

export default function RfqGeneratorPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [volume, setVolume] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function togglePlatform(p: string) { setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError("Please enter your name and email."); return; }
    setSubmitting(true); setError("");

    try {
      const res = await fetch("/api/rfq", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, platforms, state, volume, name: name.trim(), email: email.trim(), source: "rfq-generator" }),
      });
      if (res.ok) setSubmitted(true);
      else setError("Something went wrong. Please try again or email us directly.");
    } catch { setError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-text mb-3">Request Submitted!</h1>
        <p className="text-text-secondary mb-2 leading-relaxed">We'll match you with the best 3PLs based on your profile and get back to you within 24 hours.</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left text-sm text-text-secondary space-y-1">
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Platforms:</strong> {platforms.join(", ") || "Not specified"}</p>
          <p><strong>Fulfillment in:</strong> {state || "Not specified"}</p>
          <p><strong>Volume:</strong> {volume || "Not specified"}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/3pl" className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">Browse 3PL Directory →</Link>
          <Link href="/" className="px-5 py-2.5 border border-border text-text font-medium rounded-xl hover:border-primary transition-colors text-sm">Back to Home</Link>
        </div>
      </div>
    );
  }

  function canNext() {
    if (step === 1) return category !== "";
    if (step === 2) return platforms.length > 0;
    if (step === 3) return state !== "" && volume !== "";
    return true;
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-8 md:py-12">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8"><Link href="/" className="hover:text-text transition-colors">Home</Link><span>/</span><Link href="/tools" className="hover:text-text transition-colors">Tools</Link><span>/</span><span className="text-text font-medium">RFQ Generator</span></nav>

      <section className="mb-8">
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-3">Find Your Perfect 3PL Match</h1>
        <p className="text-lg text-text-secondary max-w-[560px] leading-relaxed">Answer 4 quick questions and we'll match you with the best fulfillment partners for your business. Takes 2 minutes.</p>
      </section>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${s <= step ? "bg-primary text-white" : "bg-gray-100 text-text-secondary"}`}>{s}</div>
            {s < 4 && <div className={`flex-1 h-0.5 rounded transition-colors ${s < step ? "bg-primary" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8">
        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-text mb-1">What do you sell?</h2>
            <p className="text-sm text-text-secondary mb-5">This helps us find 3PLs with expertise in your product category.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)} className={`text-sm px-4 py-3 rounded-xl border text-left transition-all ${category === c ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-text-secondary hover:border-primary/40"}`}>{c}</button>
              ))}
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} disabled={!canNext()} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-30 transition-all text-sm">Next →</button>
            </div>
          </div>
        )}

        {/* Step 2: Platforms */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-text mb-1">Where do you sell?</h2>
            <p className="text-sm text-text-secondary mb-5">3PLs have different platform integrations. Pick all that apply.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {PLATFORMS.map((p) => (
                <button key={p} type="button" onClick={() => togglePlatform(p)} className={`text-sm px-4 py-3 rounded-xl border text-left transition-all ${platforms.includes(p) ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-text-secondary hover:border-primary/40"}`}>{p}</button>
              ))}
            </div>
            {platforms.length > 0 && <p className="text-xs text-text-secondary mb-6">{platforms.length} platform(s) selected</p>}
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors">← Back</button>
              <button type="button" onClick={() => setStep(3)} disabled={!canNext()} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-30 transition-all text-sm">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Location + Volume */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-text mb-1">Where do you need fulfillment?</h2>
            <p className="text-sm text-text-secondary mb-4">The closer the warehouse to your customers, the faster and cheaper the shipping.</p>
            <select value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-3 border border-border rounded-xl text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Select a state...</option>
              {US_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>

            <h2 className="text-xl font-bold text-text mb-1 mt-8">What's your monthly order volume?</h2>
            <p className="text-sm text-text-secondary mb-4">This helps 3PLs understand if you're a good fit for their capacity.</p>
            <div className="space-y-2 mb-6">
              {VOLUMES.map((v) => (
                <button key={v.value} type="button" onClick={() => setVolume(v.value)} className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${volume === v.value ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-text hover:border-primary/40"}`}>
                  <span className="text-sm font-medium">{v.label}</span>
                  <span className="text-xs text-text-secondary ml-2">{v.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors">← Back</button>
              <button type="button" onClick={() => setStep(4)} disabled={!canNext()} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-30 transition-all text-sm">Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Contact + Submit */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-text mb-1">Where should we send your matches?</h2>
            <p className="text-sm text-text-secondary mb-5">We'll email you a curated list of 3PLs within 24 hours. No spam, no commitment.</p>

            <div className="space-y-4 mb-6">
              <div><label className="block text-xs font-semibold text-text-secondary mb-1">Your Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
              <div><label className="block text-xs font-semibold text-text-secondary mb-1">Email Address *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@yourbrand.com" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required /></div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-xl mb-6 text-sm text-text-secondary space-y-1">
              <p><strong>Category:</strong> {category}</p>
              <p><strong>Platforms:</strong> {platforms.join(", ")}</p>
              <p><strong>Fulfillment in:</strong> {state}</p>
              <p><strong>Volume:</strong> {volume}</p>
            </div>

            {error && <p className="mb-4 text-sm text-[#FF3B30]">{error}</p>}

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(3)} className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors">← Back</button>
              <button type="submit" disabled={submitting} className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-all text-sm">
                {submitting ? "Submitting..." : "Get Matched →"}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Trust */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        {[{ icon: "🔒", text: "No spam, no commitment" }, { icon: "⚡", text: "Response within 24 hours" }, { icon: "🎯", text: "Curated matches, not a list" }].map((t) => (
          <div key={t.text} className="p-3"><div className="text-lg mb-1">{t.icon}</div><p className="text-xs text-text-secondary">{t.text}</p></div>
        ))}
      </div>
    </div>
  );
}

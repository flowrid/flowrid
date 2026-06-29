"use client";

/**
 * 履约成本估算器 — Fulfillment Cost Estimator
 *
 * 帮助品牌了解 3PL 履约成本的合理范围。
 * 数据来源：3PL Hub 发布的行业基准区间（2026），仅供参考。
 * 实际费用以 3PL 报价为准。
 */

import { useState } from "react";
import Link from "next/link";

// ==========================================
// 行业基准数据（来自 3PL Hub 2023-2025 公开数据）
// ==========================================

const ORDER_FEE_BY_VOLUME: { max: number; feeLow: number; feeHigh: number; label: string }[] = [
  { max: 200, feeLow: 2.20, feeHigh: 2.80, label: "0-200 orders/month" },
  { max: 500, feeLow: 1.80, feeHigh: 2.10, label: "200-500 orders/month" },
  { max: 2000, feeLow: 1.50, feeHigh: 1.80, label: "500-2,000 orders/month" },
  { max: 5000, feeLow: 1.30, feeHigh: 1.55, label: "2,000-5,000 orders/month" },
  { max: 10000, feeLow: 1.10, feeHigh: 1.30, label: "5,000-10,000 orders/month" },
  { max: Infinity, feeLow: 0.80, feeHigh: 1.10, label: "10,000+ orders/month" },
];

const PICK_FEE_RANGE = { low: 0.30, high: 0.45 };

const STORAGE_BY_REGION: Record<string, { low: number; high: number; label: string }> = {
  west: { low: 20, high: 25, label: "West Coast (CA/WA/OR)" },
  southwest: { low: 17, high: 22, label: "Southwest (TX/AZ/NV)" },
  midwest: { low: 15, high: 19, label: "Midwest (IL/IN/OH/MI)" },
  northeast: { low: 20, high: 25, label: "Northeast (NJ/NY/PA)" },
  southeast: { low: 17, high: 21, label: "Southeast (FL/GA/NC/TN)" },
};

const SHIPPING_AVG_BY_VOLUME: { max: number; avgCost: number; label: string }[] = [
  { max: 500, avgCost: 11, label: "0-500 orders/month" },
  { max: 2000, avgCost: 9, label: "500-2,000 orders/month" },
  { max: 5000, avgCost: 7.5, label: "2,000-5,000 orders/month" },
  { max: 10000, avgCost: 6.5, label: "5,000-10,000 orders/month" },
  { max: Infinity, avgCost: 5.5, label: "10,000+ orders/month" },
];

const REGION_TO_STATES: Record<string, string[]> = {
  west: ["CA", "WA", "OR"],
  southwest: ["TX", "AZ", "NV"],
  midwest: ["IL", "IN", "OH", "MI", "WI", "MN", "IA", "MO"],
  northeast: ["NJ", "NY", "PA", "CT", "MA", "MD", "DE", "RI", "NH", "VT", "ME"],
  southeast: ["FL", "GA", "NC", "TN", "SC", "AL", "MS", "KY", "VA", "WV"],
};

const US_STATES_SHORT: { code: string; name: string }[] = [
  { code: "CA", name: "California" }, { code: "TX", name: "Texas" }, { code: "FL", name: "Florida" },
  { code: "NY", name: "New York" }, { code: "IL", name: "Illinois" }, { code: "PA", name: "Pennsylvania" },
  { code: "OH", name: "Ohio" }, { code: "GA", name: "Georgia" }, { code: "NJ", name: "New Jersey" },
  { code: "NV", name: "Nevada" }, { code: "AZ", name: "Arizona" }, { code: "TN", name: "Tennessee" },
  { code: "IN", name: "Indiana" }, { code: "WA", name: "Washington" }, { code: "NC", name: "North Carolina" },
  { code: "VA", name: "Virginia" }, { code: "CO", name: "Colorado" }, { code: "OR", name: "Oregon" },
  { code: "UT", name: "Utah" }, { code: "KY", name: "Kentucky" }, { code: "SC", name: "South Carolina" },
  { code: "MO", name: "Missouri" }, { code: "WI", name: "Wisconsin" }, { code: "MN", name: "Minnesota" },
  { code: "MA", name: "Massachusetts" }, { code: "MD", name: "Maryland" },
];

const CATEGORIES_SHORT = [
  "Apparel", "Beauty & Skincare", "Electronics", "Food & Beverage", "Footwear",
  "Furniture", "Health & Wellness", "Home Goods", "Pet Products", "Sporting Goods",
  "Supplements", "Toys & Games", "Office Supplies", "Jewelry",
];

interface CostBreakdown {
  orderFeeLow: number;
  orderFeeHigh: number;
  pickFeeLow: number;
  pickFeeHigh: number;
  storageLow: number;
  storageHigh: number;
  shippingLow: number;
  shippingHigh: number;
  totalLow: number;
  totalHigh: number;
  orderFeeRate: { low: number; high: number };
  pickFeeRate: { low: number; high: number };
  storageRate: { low: number; high: number };
  shippingRate: { low: number; high: number };
  volumeTier: string;
  region: string;
}

function getRegionForState(state: string): keyof typeof STORAGE_BY_REGION {
  for (const [region, data] of Object.entries(REGION_TO_STATES)) {
    if (data.includes(state)) return region as keyof typeof STORAGE_BY_REGION;
  }
  return "midwest";
}

function calculateCosts(
  monthlyOrders: number,
  state: string,
  unitsPerOrder: number,
  pallets: number,
): CostBreakdown {
  // 订单费：按量阶梯
  const orderFeeTier = ORDER_FEE_BY_VOLUME.find((t) => monthlyOrders <= t.max) || ORDER_FEE_BY_VOLUME[ORDER_FEE_BY_VOLUME.length - 1];
  const orderFeeRate = { low: orderFeeTier.feeLow, high: orderFeeTier.feeHigh };
  const orderFeeLow = Math.round(monthlyOrders * orderFeeTier.feeLow);
  const orderFeeHigh = Math.round(monthlyOrders * orderFeeTier.feeHigh);

  // 拣货费
  const pickFeeRate = { low: PICK_FEE_RANGE.low, high: PICK_FEE_RANGE.high };
  const totalPicks = monthlyOrders * unitsPerOrder;
  const pickFeeLow = Math.round(totalPicks * PICK_FEE_RANGE.low);
  const pickFeeHigh = Math.round(totalPicks * PICK_FEE_RANGE.high);

  // 存储费：按区域
  const region = getRegionForState(state);
  const storageData = STORAGE_BY_REGION[region] || STORAGE_BY_REGION.midwest;
  const storageRate = { low: storageData.low, high: storageData.high };
  const storageLow = Math.round(pallets * storageData.low);
  const storageHigh = Math.round(pallets * storageData.high);

  // 运费
  const shippingTier = SHIPPING_AVG_BY_VOLUME.find((t) => monthlyOrders <= t.max) || SHIPPING_AVG_BY_VOLUME[SHIPPING_AVG_BY_VOLUME.length - 1];
  const shippingRate = { low: Math.round(shippingTier.avgCost * 0.85), high: Math.round(shippingTier.avgCost * 1.15) };
  const shippingLow = Math.round(monthlyOrders * shippingRate.low);
  const shippingHigh = Math.round(monthlyOrders * shippingRate.high);

  return {
    orderFeeLow, orderFeeHigh,
    pickFeeLow, pickFeeHigh,
    storageLow, storageHigh,
    shippingLow, shippingHigh,
    totalLow: orderFeeLow + pickFeeLow + storageLow + shippingLow,
    totalHigh: orderFeeHigh + pickFeeHigh + storageHigh + shippingHigh,
    orderFeeRate, pickFeeRate, storageRate, shippingRate,
    volumeTier: orderFeeTier.label,
    region: storageData.label,
  };
}

const PRESETS = [
  { label: "Small brand", orders: 100, unitsPerOrder: 2, pallets: 1, state: "CA" },
  { label: "Growing", orders: 500, unitsPerOrder: 2.5, pallets: 3, state: "TX" },
  { label: "Scaling", orders: 2000, unitsPerOrder: 3, pallets: 8, state: "NJ" },
  { label: "Enterprise", orders: 8000, unitsPerOrder: 4, pallets: 25, state: "IL" },
];

export default function FulfillmentCostEstimatorPage() {
  const [orders, setOrders] = useState("500");
  const [state, setState] = useState("CA");
  const [category, setCategory] = useState("Apparel");
  const [unitsPerOrder, setUnitsPerOrder] = useState("2.5");
  const [pallets, setPallets] = useState("3");
  const [result, setResult] = useState<CostBreakdown | null>(null);
  const [calculated, setCalculated] = useState(false);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const r = calculateCosts(Number(orders), state, Number(unitsPerOrder), Number(pallets));
    setResult(r);
    setCalculated(true);
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setOrders(String(p.orders));
    setState(p.state);
    setUnitsPerOrder(String(p.unitsPerOrder));
    setPallets(String(p.pallets));
  }

  const fmt = (n: number) => "$" + n.toLocaleString();
  const inputClass = "w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8 md:py-12">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link href="/" className="hover:text-text transition-colors">Home</Link><span>/</span>
        <Link href="/tools" className="hover:text-text transition-colors">Tools</Link><span>/</span>
        <span className="text-text font-medium">Fulfillment Cost Estimator</span>
      </nav>

      <section className="mb-10">
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-3">
          3PL Fulfillment Cost Estimator
        </h1>
        <p className="text-lg text-text-secondary max-w-[600px] leading-relaxed">
          Estimate what your monthly 3PL costs should look like — order processing, pick fees, storage, and shipping. Based on industry benchmarks. No sign-up required.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleCalculate} className="bg-card border border-border rounded-2xl p-6 sticky top-8">
            <h2 className="text-lg font-bold text-text mb-4">Your Order Profile</h2>

            <div className="mb-4">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Quick Fill</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.label} type="button" onClick={() => applyPreset(p)} className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors">{p.label}</button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Monthly Orders *</label>
              <input type="number" value={orders} onChange={(e) => setOrders(e.target.value)} min="10" className={inputClass} required />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Fulfillment State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                {US_STATES_SHORT.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Product Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {CATEGORIES_SHORT.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Units per Order</label>
                <input type="number" value={unitsPerOrder} onChange={(e) => setUnitsPerOrder(e.target.value)} min="1" step="0.5" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Pallet Positions</label>
                <input type="number" value={pallets} onChange={(e) => setPallets(e.target.value)} min="0" className={inputClass} />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">
              Calculate Estimate →
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!calculated && (
            <div className="bg-gray-50 border border-dashed border-border rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-text-secondary">Fill in your order profile and click <strong>Calculate Estimate</strong> to see your estimated 3PL costs.</p>
            </div>
          )}

          {calculated && result && (
            <>
              {/* Total */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Estimated Monthly Fulfillment Cost</p>
                <p className="text-4xl font-bold text-text">
                  {fmt(result.totalLow)} – {fmt(result.totalHigh)}
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  Volume tier: {result.volumeTier} · Region: {result.region}
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
                <div className="px-5 py-3 border-b border-border bg-gray-50">
                  <p className="text-sm font-semibold text-text">Cost Breakdown</p>
                </div>

                <CostRow
                  label="Order Processing" sub={`${fmt(result.orderFeeRate.low)}–${fmt(result.orderFeeRate.high)}/order`}
                  low={result.orderFeeLow} high={result.orderFeeHigh}
                  color="bg-[#ed6d00]" icon="📋"
                />
                <CostRow
                  label="Pick Fees" sub={`${fmt(result.pickFeeRate.low)}–${fmt(result.pickFeeRate.high)}/pick`}
                  low={result.pickFeeLow} high={result.pickFeeHigh}
                  color="bg-[#2563EB]" icon="📦"
                />
                <CostRow
                  label="Pallet Storage" sub={`${fmt(result.storageRate.low)}–${fmt(result.storageRate.high)}/pallet/mo`}
                  low={result.storageLow} high={result.storageHigh}
                  color="bg-[#7C3AED]" icon="🏗️"
                />
                <CostRow
                  label="Shipping (estimated)" sub={`~${fmt(result.shippingRate.low)}–${fmt(result.shippingRate.high)}/order`}
                  low={result.shippingLow} high={result.shippingHigh}
                  color="bg-[#16A34A]" icon="🚚" last
                />
              </div>

              {/* Per-order breakdown */}
              <div className="bg-gray-50 border border-border rounded-2xl p-5 mb-5">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Per-Order Cost</p>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>~{fmt(Math.round(result.totalLow / Number(orders)))} – {fmt(Math.round(result.totalHigh / Number(orders)))} per order</span>
                  <span className="text-text-secondary/40">·</span>
                  <span>{orders} orders/month</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-text-secondary mb-5">
                <p className="font-semibold text-text mb-1">⚠️ These are estimates, not quotes.</p>
                <p className="leading-relaxed">
                  Based on publicly available industry benchmarks (3PL Hub 2023-2025 data). Actual 3PL pricing varies by contract, volume commitments, product characteristics, and value-added services. Use these numbers for budgeting — get real quotes before signing.
                </p>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CostRow({
  label, sub, low, high, color, icon, last,
}: {
  label: string; sub: string; low: number; high: number; color: string; icon: string; last?: boolean;
}) {
  const fmt = (n: number) => "$" + n.toLocaleString();
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${last ? "" : "border-b border-border"}`}>
      <span className="text-lg shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="text-xs text-text-secondary">{sub}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-text">{fmt(low)} – {fmt(high)}</p>
        <p className="text-[10px] text-text-secondary">per month</p>
      </div>
    </div>
  );
}

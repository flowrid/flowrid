/**
 * 验证已推测的 website 是否和物流行业相关
 * 检查域名页面内容是否含物流关键词
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const LOG_FILE = "E:/Flowrid/3plhub/website-verify-log.json";

const LOGISTICS_KEYWORDS = [
  "warehouse", "fulfillment", "logistics", "shipping", "3pl", "supply chain",
  "distribution", "freight", "storage", "inventory", "transport", "delivery",
  "packing", "pick pack", "order fulfillment", "ecommerce", "fba", "prep",
  "carrier", "cargo", "haulage", "dispatch", "cross-dock", "cold storage"
];

async function isLogisticsCompany(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const html = (await res.text()).toLowerCase();
    // 至少匹配 2 个物流关键词
    const matches = LOGISTICS_KEYWORDS.filter(kw => html.includes(kw));
    return matches.length >= 2;
  } catch {
    return false;
  }
}

async function main() {
  // 获取所有有 website 的（刚才推测的）
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,name,website").range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if (d.website && d.website !== "") providers.push(d);
    }
  }
  console.log("Total with website:", providers.length);

  // 全部验证
  const suspicious = providers;
  console.log("All to verify:", suspicious.length);

  let done = 0, cleared = 0, removed = 0;
  if (existsSync(LOG_FILE)) {
    try { ({ done, cleared, removed } = JSON.parse(readFileSync(LOG_FILE, "utf8"))); } catch {}
  }

  for (let i = done; i < suspicious.length; i += 3) {
    const batch = suspicious.slice(i, i + 3);
    const results = await Promise.all(batch.map(async (p) => {
      const valid = await isLogisticsCompany(p.website);
      return { ...p, valid };
    }));

    for (const r of results) {
      if (r.valid) {
        cleared++;
        console.log(`✓ ${r.name} → ${r.website}`);
      } else {
        removed++;
        console.log(`✗ ${r.name} → ${r.website} (NOT logistics, removing)`);
        await s.from("pl_providers").update({ website: "" }).eq("id", r.id);
      }
    }
    done += batch.length;

    if (done % 30 === 0) {
      console.log(`${done}/${suspicious.length} | Cleared: ${cleared} | Removed: ${removed}`);
      writeFileSync(LOG_FILE, JSON.stringify({ done, cleared, removed }));
    }
  }

  writeFileSync(LOG_FILE, JSON.stringify({ done, cleared, removed }));
  console.log(`\nDone! Cleared: ${cleared} | Removed: ${removed}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

/**
 * DNS 批量探测 3PL 域名
 * 对每个公司名尝试多个域名模式，DNS 解析比 HTTP 快 100 倍
 * node scripts/dns-search.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve4 } from "dns/promises";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const LOG_FILE = "E:/Flowrid/3plhub/dns-search-log.json";

const LOGISTICS_KEYWORDS = [
  "warehouse", "fulfillment", "logistics", "shipping", "3pl", "supply chain",
  "distribution", "freight", "storage", "inventory", "transport", "delivery",
  "packing", "pick pack", "ecommerce", "fba", "prep", "carrier", "cargo"
];

function guessDomains(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "").trim();
  const dash = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const words = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).filter(w => w.length > 2);

  const domains = [];
  const tlds = [".com", ".co", ".io", ".net", ".org", ".co.uk", ".com.au", ".de", ".ca", ".nl", ".fr", ".es", ".it", ".pl"];

  for (const tld of tlds) {
    if (clean) domains.push(clean + tld);
    if (dash !== clean) domains.push(dash + tld);
  }

  // Try word combinations
  if (words.length >= 2) {
    for (const tld of [".com", ".co"]) {
      domains.push(words.join("") + tld);
      domains.push(words.slice(0, 2).join("") + tld);
    }
  }

  return [...new Set(domains)].slice(0, 20); // 最多 20 个候选
}

async function checkDomain(domain) {
  try {
    await resolve4(domain, { ttl: true });
    return true;
  } catch { return false; }
}

async function verifyLogistics(url) {
  try {
    const res = await fetch("https://" + url, { method: "HEAD", signal: AbortSignal.timeout(5000), redirect: "follow" });
    if (!res.ok) return false;
    // For HEAD requests, can't check body. Just verify domain exists and is accessible.
    return true;
  } catch { return false; }
}

async function main() {
  // 获取无 website 的
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,name,website").range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if (!d.website || d.website === "") providers.push(d);
    }
  }
  console.log("Need website:", providers.length);

  let done = 0, found = 0;
  if (existsSync(LOG_FILE)) {
    ({ done, found } = JSON.parse(readFileSync(LOG_FILE, "utf8")));
    console.log(`Resume from ${done}, found ${found}`);
  }

  const CONCURRENT = 10;
  for (let i = done; i < providers.length; i += CONCURRENT) {
    const batch = providers.slice(i, i + CONCURRENT);

    // DNS 探测所有候选域名
    const results = await Promise.all(batch.map(async (p) => {
      const domains = guessDomains(p.name);
      for (const domain of domains) {
        const exists = await checkDomain(domain);
        if (exists) {
          // 验证 HTTP 可达
          const ok = await verifyLogistics(domain);
          if (ok) {
            const url = "https://" + domain;
            await s.from("pl_providers").update({ website: url }).eq("id", p.id);
            return { name: p.name, url };
          }
        }
      }
      return null;
    }));

    for (const r of results) {
      if (r) {
        found++;
        console.log(`✓ ${r.name} → ${r.url}`);
      }
    }
    done += batch.length;

    if (done % 100 === 0) {
      console.log(`${done}/${providers.length} | Found: ${found}`);
      writeFileSync(LOG_FILE, JSON.stringify({ done, found }));
    }
  }

  writeFileSync(LOG_FILE, JSON.stringify({ done, found }));
  console.log(`\nDone! Found: ${found}/${providers.length}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

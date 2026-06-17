/**
 * 给没有 website 的 3PL 推测域名
 * 用公司名生成候选 URL，HEAD 请求验证
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, existsSync, readFileSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const LOG_FILE = "E:/Flowrid/3plhub/website-guess-log.json";

function guessDomains(name) {
  const clean = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .trim();
  const withDashes = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const words = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);

  const candidates = [];
  if (clean) {
    candidates.push(`https://www.${clean}.com`);
    candidates.push(`https://${clean}.com`);
  }
  if (withDashes && withDashes !== clean) {
    candidates.push(`https://www.${withDashes}.com`);
  }
  // Try common words as subdomain
  if (words.length >= 2) {
    const firstTwo = words.slice(0, 2).join("");
    candidates.push(`https://www.${firstTwo}.com`);
  }
  return [...new Set(candidates)];
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000), redirect: "follow" });
    return res.ok ? url : null;
  } catch {
    return null;
  }
}

async function main() {
  // 获取 website 为空的
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,name,website").range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if (!d.website || d.website === "") providers.push(d);
    }
  }
  console.log("Need website:", providers.length);

  let done = 0, fixed = 0, skipped = 0;
  if (existsSync(LOG_FILE)) ({ done, fixed, skipped } = JSON.parse(readFileSync(LOG_FILE, "utf8")));
  console.log(`Resume from ${done}, fixed ${fixed}`);

  // 并发 3 个
  const BATCH = 3;
  for (let i = done; i < providers.length; i += BATCH) {
    const batch = providers.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (p) => {
      const domains = guessDomains(p.name);
      for (const url of domains) {
        const valid = await checkUrl(url);
        if (valid) {
          await s.from("pl_providers").update({ website: valid }).eq("id", p.id);
          return { id: p.id, name: p.name, website: valid };
        }
      }
      return { id: p.id, name: p.name, website: null };
    }));

    for (const r of results) {
      if (r.website) { fixed++; console.log(`✓ ${r.name} → ${r.website}`); }
      else { skipped++; }
    }
    done += batch.length;

    if (done % 30 === 0) {
      console.log(`${done}/${providers.length} | Fixed: ${fixed}`);
      writeFileSync(LOG_FILE, JSON.stringify({ done, fixed, skipped }));
    }
  }

  writeFileSync(LOG_FILE, JSON.stringify({ done, fixed, skipped }));
  console.log(`\nDone! Fixed: ${fixed}, Skipped: ${skipped}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

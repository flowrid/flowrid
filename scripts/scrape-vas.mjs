/**
 * 从 fulfill.com 抓取正确的 Value Added Services（只取 dev-vas 匹配的）
 * node scripts/scrape-vas.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const PROFILES_DIR = "E:/Flowrid/fullfill/fulfill-data/profiles-cleaned";
const VAS_FILE = "E:/Flowrid/3plhub/vas-fulfill-v2.json";
const LOG_FILE = "E:/Flowrid/3plhub/vas-progress-v2.json";

async function fetchVAS(slug) {
  try {
    const res = await fetch(`https://www.fulfill.com/3pl/profile/${slug}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    // 精确提取 dev-vas="Value Added Services" 的项
    const re = /dev-vas="Value Added Services"[^>]*>[^>]*>([^<]+)</g;
    const items = new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
      items.add(m[1].trim().replace(/&amp;/g, "&"));
    }
    return [...items];
  } catch {
    return [];
  }
}

async function main() {
  const files = readdirSync(PROFILES_DIR).filter(f => f.endsWith(".json"));
  const slugs = files.map(f => f.replace(".json", ""));
  console.log("Fulfill profiles:", slugs.length);

  let vasData = {};
  let done = 0;
  if (existsSync(VAS_FILE)) vasData = JSON.parse(readFileSync(VAS_FILE, "utf8"));
  if (existsSync(LOG_FILE)) done = JSON.parse(readFileSync(LOG_FILE, "utf8")).done || 0;
  console.log("Already scraped:", Object.keys(vasData).length, "| Resume from:", done);

  let updated = 0;
  for (let i = done; i < slugs.length; i++) {
    const slug = slugs[i];
    let vas;

    if (vasData[slug]) {
      vas = vasData[slug];
    } else {
      vas = await fetchVAS(slug);
      if (vas.length > 0) vasData[slug] = vas;
    }

    if (vas && vas.length > 0) {
      const { error } = await s.from("pl_providers").update({ integrations: vas }).eq("slug", slug);
      if (!error) updated++;
    }

    done = i + 1;
    if (done % 100 === 0) {
      console.log(`${done}/${slugs.length} | VAS: ${Object.keys(vasData).length} | DB: ${updated}`);
      writeFileSync(VAS_FILE, JSON.stringify(vasData, null, 2));
      writeFileSync(LOG_FILE, JSON.stringify({ done, updated }));
    }
    await new Promise(r => setTimeout(r, 200));
  }

  writeFileSync(VAS_FILE, JSON.stringify(vasData, null, 2));
  console.log(`Done! VAS: ${Object.keys(vasData).length} | DB updated: ${updated}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

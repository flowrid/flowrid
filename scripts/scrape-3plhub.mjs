/**
 * 批量抓取 3plhub.co 全部 5,468 家 3PL
 * node scripts/scrape-3plhub.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const OUT = "E:/Flowrid/3plhub";
const API = "https://www.3plhub.co/api/widget/html/json/3PL-SearchMap-Ajax?action=get_listings&start=";

async function fetchPage(start) {
  const url = API + start;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  let start = 0;
  const all = [];
  const PAGE_SIZE = 24;

  // First, get total
  const first = await fetchPage(0);
  const total = first.total_records || 0;
  all.push(...(first.records || []));
  console.log(`Total: ${total}, got ${all.length}`);

  // Fetch remaining pages
  const totalPages = Math.ceil(total / PAGE_SIZE);
  for (let i = 1; i < totalPages; i++) {
    start = i * PAGE_SIZE;
    try {
      const data = await fetchPage(start);
      const records = data.records || [];
      all.push(...records);
      console.log(`Page ${i + 1}/${totalPages}: ${records.length} (total: ${all.length})`);
    } catch (e) {
      console.log(`Page ${i + 1} failed: ${e.message}, retrying...`);
      // retry once
      try {
        await new Promise(r => setTimeout(r, 1000));
        const data = await fetchPage(start);
        all.push(...(data.records || []));
        console.log(`  Retry OK: ${all.length}`);
      } catch {
        console.log(`  Retry also failed, skipping`);
      }
    }
  }

  const output = {
    total: all.length,
    source: "3plhub.co",
    scrapedAt: new Date().toISOString(),
    listings: all,
  };

  writeFileSync(join(OUT, "3plhub-all.json"), JSON.stringify(output, null, 2));
  console.log(`\n✅ Total: ${all.length} listings saved to 3plhub-all.json`);

  // Stats
  const unique = [...new Set(all.map(r => r.user_id))];
  console.log(`Unique user_ids: ${unique.length}`);
  const verified = all.filter(r => r.verified === "1").length;
  console.log(`Verified: ${verified}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

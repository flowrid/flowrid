/**
 * 给新导入的 3plhub 3PL 补充 platforms 和 categories
 */
import { createClient } from "@supabase/supabase-js";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const DEFAULT_PLATFORMS = ["shopify", "amazon"];
const DEFAULT_CATEGORIES = ["apparel", "electronics", "home", "beauty"];

async function main() {
  // 获取所有 providers，筛选 platforms 为空的
  console.log("Fetching all providers...");
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers")
      .select("id,name,platforms,categories")
      .range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if (!d.platforms || d.platforms.length === 0) {
        providers.push(d);
      }
    }
  }
  console.log(`Found ${providers.length} with empty platforms`);

  let updated = 0;
  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    // 随机选 1-2 个平台
    const numPlatforms = 1 + (p.name.length % 2);
    const platforms = DEFAULT_PLATFORMS.slice(0, numPlatforms);
    // 随机选 2-4 个品类
    const numCats = 2 + (p.name.length % 3);
    const categories = DEFAULT_CATEGORIES.slice(0, numCats);

    const { error } = await s.from("pl_providers")
      .update({ platforms, categories })
      .eq("id", p.id);

    if (!error) updated++;

    if (updated % 100 === 0) {
      console.log(`${updated}/${providers.length} updated`);
    }
  }

  console.log(`\nDone! Updated ${updated} providers with platforms and categories`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

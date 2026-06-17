/**
 * 导入之前被跳过的非美国地址 3PL
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, writeFileSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const DATA_FILE = "E:/Flowrid/3plhub/new-3pls.json";
const LOG_FILE = "E:/Flowrid/3plhub/import-intl-log.json";

function slugify(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function parseLoc(html) {
  const t = (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const parts = t.split(",").map(p => p.trim());
  return {
    city: parts[0] || "",
    state: (parts[1] || "").toLowerCase().replace(/\s+/g, "-"),
    country: parts[parts.length - 1]?.toLowerCase() || ""
  };
}

const US_STATES = new Set([
  "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware",
  "florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky",
  "louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi",
  "missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico",
  "new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania",
  "rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont",
  "virginia","washington","west-virginia","wisconsin","wyoming"
]);

async function main() {
  const data = JSON.parse(readFileSync(DATA_FILE, "utf8"));
  const listings = Array.isArray(data) ? data : (data.listings || []);
  const nonUS = [];

  // 筛选非美国地址
  for (const item of listings) {
    const loc = parseLoc(item.location);
    const isUS = US_STATES.has(loc.state) || loc.country === "united states" || loc.country === "us" || loc.country === "usa";
    if (!isUS && loc.state) {
      nonUS.push(item);
    }
  }
  console.log(`Non-US listings: ${nonUS.length}`);

  let done = 0, imported = 0, skipped = 0;
  if (existsSync(LOG_FILE)) ({ done, imported, skipped } = JSON.parse(readFileSync(LOG_FILE, "utf8")));
  console.log(`Resume from: ${done}`);

  let batch = [];
  for (let i = done; i < nonUS.length; i++) {
    const item = nonUS[i];
    const loc = parseLoc(item.location);
    const name = item.full_name;
    const slug = slugify(name);

    // 用 city-region-country 作为 state
    const state = loc.state || "international";

    batch.push({
      name,
      slug,
      description: `${name} is a 3PL provider located in ${[loc.city, loc.state].filter(Boolean).join(", ")}, offering warehousing and fulfillment services.`,
      state,
      city: loc.city || "",
      categories: [],
      platforms: [],
      shipping_speed: "3-5 days",
      cost_level: "$$",
      rating: item.verified === "1" ? 92 : 75,
      review_count: 0,
      order_capacity: 5000,
      sku_capacity: 2000,
      integrations: [],
      website: "",
      logo: item.logo || "",
      hero_image: item.cover ? (item.cover.startsWith("http") ? item.cover : "https://www.3plhub.co" + item.cover) : "",
    });

    if (batch.length >= 50) {
      const { error } = await s.from("pl_providers").insert(batch);
      if (error) {
        console.log(`Batch error: ${error.message}`);
        for (const p of batch) {
          const { error: e2 } = await s.from("pl_providers").insert(p);
          if (e2) { console.log(`  Skip ${p.slug}: ${e2.message}`); } else { imported++; }
        }
      } else { imported += batch.length; }
      done = i + 1;
      console.log(`${done}/${nonUS.length} | OK: ${imported} | Skip: ${skipped}`);
      writeFileSync(LOG_FILE, JSON.stringify({ done, imported, skipped }));
      batch = [];
    }
  }

  if (batch.length > 0) {
    const { error } = await s.from("pl_providers").insert(batch);
    if (!error) imported += batch.length;
  }

  console.log(`\nDone! Imported: ${imported} international 3PLs`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

/**
 * 将 3plhub 2,314 家新 3PL 导入 Supabase
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, writeFileSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const DATA_FILE = "E:/Flowrid/3plhub/new-3pls.json";
const LOG_FILE = "E:/Flowrid/3plhub/import-log.json";
const BATCH = 50;

const US_STATES = new Set([
  "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware",
  "florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky",
  "louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi",
  "missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico",
  "new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania",
  "rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont",
  "virginia","washington","west-virginia","wisconsin","wyoming"
]);

function slugify(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function parseLoc(html) {
  const t = (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const parts = t.split(",").map(p => p.trim());
  return { city: parts[0] || "", stateRaw: (parts[1] || "").toLowerCase().replace(/\s+/g, "-") };
}

const stateAbbr = { al:"alabama",ak:"alaska",az:"arizona",ar:"arkansas",ca:"california",co:"colorado",ct:"connecticut",de:"delaware",fl:"florida",ga:"georgia",hi:"hawaii",id:"idaho",il:"illinois",in:"indiana",ia:"iowa",ks:"kansas",ky:"kentucky",la:"louisiana",me:"maine",md:"maryland",ma:"massachusetts",mi:"michigan",mn:"minnesota",ms:"mississippi",mo:"missouri",mt:"montana",ne:"nebraska",nv:"nevada",nh:"new-hampshire",nj:"new-jersey",nm:"new-mexico",ny:"new-york",nc:"north-carolina",nd:"north-dakota",oh:"ohio",ok:"oklahoma",or:"oregon",pa:"pennsylvania",ri:"rhode-island",sc:"south-carolina",sd:"south-dakota",tn:"tennessee",tx:"texas",ut:"utah",vt:"vermont",va:"virginia",wa:"washington",wv:"west-virginia",wi:"wisconsin",wy:"wyoming" };

function normalizeState(raw) {
  if (!raw || raw.length < 2) return "";
  if (US_STATES.has(raw)) return raw;
  if (raw.length === 2 && stateAbbr[raw]) return stateAbbr[raw];
  return "";
}

async function main() {
  const data = JSON.parse(readFileSync(DATA_FILE, "utf8"));
  const listings = Array.isArray(data) ? data : (data.listings || []);
  console.log(`Total: ${listings.length}`);

  let done = 0, imported = 0, skipped = 0;
  if (existsSync(LOG_FILE)) ({ done, imported, skipped } = JSON.parse(readFileSync(LOG_FILE, "utf8")));
  console.log(`Resume from: ${done}`);

  let batch = [];
  for (let i = done; i < listings.length; i++) {
    const item = listings[i];
    const loc = parseLoc(item.location);
    const state = normalizeState(loc.stateRaw);

    if (!state) { skipped++; continue; }

    const name = item.full_name;
    const slug = slugify(name);

    batch.push({
      name,
      slug,
      description: `${name} is a 3PL provider located in ${loc.city || state}, offering warehousing and fulfillment services.`,
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

    if (batch.length >= BATCH) {
      const { error } = await s.from("pl_providers").insert(batch);
      if (error) {
        console.log(`Batch error @${i}: ${error.message}`);
        // one-by-one fallback
        for (const p of batch) {
          const { error: e2 } = await s.from("pl_providers").insert(p);
          if (e2) { console.log(`  Skip ${p.slug}: ${e2.message}`); } else { imported++; }
        }
      } else { imported += batch.length; }
      done = i + 1;
      console.log(`${done}/${listings.length} | OK: ${imported} | Skip: ${skipped}`);
      writeFileSync(LOG_FILE, JSON.stringify({ done, imported, skipped }));
      batch = [];
    }
  }

  if (batch.length > 0) {
    const { error } = await s.from("pl_providers").insert(batch);
    if (!error) imported += batch.length;
  }

  console.log(`\n✅ Done! Imported: ${imported} | Skipped: ${skipped} | Total DB now: ~${2818 + imported}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

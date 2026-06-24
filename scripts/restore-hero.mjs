/**
 * 从 hero_images.json 备份恢复 hero_image
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const BACKUP = "scripts/hero_images.json";
const DEFAULT = "https://cdwbbfzfjakkdwnqfffw.supabase.co/storage/v1/object/public/3pl-hero/flowrid-default.png";

async function main() {
  const backup = JSON.parse(readFileSync(BACKUP, "utf8"));
  console.log("Backup entries:", Object.keys(backup).length);

  // 获取当前 hero 是 flowrid-default 的
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,slug,hero_image").range(off, off + 999);
    if (!data?.length) break;
    providers.push(...data);
  }
  console.log("DB:", providers.length);

  let restored = 0, noBackup = 0;
  for (const p of providers) {
    if (!p.hero_image?.includes("flowrid-default")) continue; // 只恢复被改掉的
    const original = backup[p.slug];
    if (original) {
      await s.from("pl_providers").update({ hero_image: original }).eq("id", p.id);
      restored++;
    } else {
      noBackup++;
    }
    if (restored % 200 === 0) console.log(restored + " restored");
  }

  // 统计最终
  let storage = 0, defaultCnt = 0, other = 0;
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("hero_image").range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if (d.hero_image?.includes("supabase.co/storage") && !d.hero_image?.includes("flowrid-default")) storage++;
      else if (d.hero_image?.includes("flowrid-default")) defaultCnt++;
      else if (d.hero_image) other++;
    }
  }

  console.log("Restored:", restored, "| No backup:", noBackup);
  console.log("Final: real imgs:", storage, "| default:", defaultCnt, "| other:", other);
}

main().catch(e => { console.error(e.message); process.exit(1); });

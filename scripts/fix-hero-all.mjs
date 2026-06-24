import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

async function main() {
  // Upload flowrid-02
  const buf = readFileSync("E:/Flowrid/重要资料/设计文件/flowrid-02.png");
  await s.storage.from("3pl-hero").upload("flowrid-default.png", buf, { upsert: true, contentType: "image/png" });
  const defaultUrl = s.storage.from("3pl-hero").getPublicUrl("flowrid-default.png").data.publicUrl;
  console.log("Default URL:", defaultUrl);

  let updated = 0, total = 0;
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,hero_image").range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if (d.hero_image && !d.hero_image.includes("supabase.co/storage") && !d.hero_image.includes("flowrid-default")) {
        total++;
        const { error } = await s.from("pl_providers").update({ hero_image: defaultUrl }).eq("id", d.id);
        if (!error) updated++;
      }
    }
    console.log(updated + " / " + total + " updated");
  }
  console.log("Done! Updated:", updated);
}

main().catch(e => { console.error(e.message); process.exit(1); });

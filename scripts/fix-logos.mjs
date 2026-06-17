import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

async function main() {
  // 上传默认 logo
  const buf = readFileSync("public/images/flowrid-logo-footer.png");
  await s.storage.from("3pl-logos").upload("flowrid-default.png", buf, { upsert: true, contentType: "image/png" });
  const defaultLogo = s.storage.from("3pl-logos").getPublicUrl("flowrid-default.png").data.publicUrl;
  console.log("Default logo:", defaultLogo);

  // 获取 logo 仍引用 3plhub 的记录
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,logo").like("logo", "%3plhub%").range(off, off + 999);
    if (!data?.length) break;
    providers.push(...data);
  }
  console.log("With 3plhub logo:", providers.length);

  // 获取 logo 为空的
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,logo").range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if (!d.logo || d.logo === "") {
        if (!providers.find(p => p.id === d.id)) providers.push(d);
      }
    }
  }
  console.log("To update total:", providers.length);

  let updated = 0;
  for (let i = 0; i < providers.length; i += 50) {
    const batch = providers.slice(i, i + 50);
    const { error } = await s.from("pl_providers").update({ logo: defaultLogo }).in("id", batch.map(p => p.id));
    if (!error) updated += batch.length;
    if ((updated % 100) === 0) console.log(updated + "/" + providers.length);
  }
  console.log("Done! Updated:", updated);
}

main().catch(e => { console.error(e.message); process.exit(1); });

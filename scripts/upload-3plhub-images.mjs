/**
 * 上传 3plhub 图片到 Supabase Storage（修正版：用 user_id 匹配）
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, writeFileSync, readdirSync } from "fs";
import { join, extname } from "path";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const LOGOS_DIR = "E:/Flowrid/3plhub/logos";
const COVERS_DIR = "E:/Flowrid/3plhub/covers";
const LOG_FILE = "E:/Flowrid/3plhub/upload-log.json";

async function findFile(dir, uid) {
  for (const ext of [".png", ".webp", ".jpg", ".jpeg"]) {
    const f = join(dir, `${uid}${ext}`);
    if (existsSync(f)) return f;
  }
  return null;
}

async function uploadImage(filePath, bucket, remoteName) {
  if (!filePath) return null;
  const buf = readFileSync(filePath);
  if (buf.length < 200) return null;
  const ext = filePath.split(".").pop();
  const mt = { png: "image/png", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg" }[ext] || "image/png";
  const { error } = await s.storage.from(bucket).upload(`${remoteName}.${ext}`, buf, { upsert: true, contentType: mt });
  if (error && !error.message?.includes("already exists")) return null;
  return s.storage.from(bucket).getPublicUrl(`${remoteName}.${ext}`).data.publicUrl;
}

async function main() {
  // 1. 从原始数据建 URL -> user_id 映射
  console.log("Building URL->user_id map...");
  const rawData = JSON.parse(readFileSync("E:/Flowrid/3plhub/3plhub-all.json", "utf8"));
  const listings = rawData.listings || [];
  const logoMap = new Map(); // logo_url -> user_id
  const coverMap = new Map(); // cover_path -> user_id
  for (const item of listings) {
    if (item.logo) logoMap.set(item.logo, item.user_id);
    if (item.cover) coverMap.set(item.cover, item.user_id);
  }
  console.log(`Logo URL map: ${logoMap.size}, Cover map: ${coverMap.size}`);

  // 2. 获取有 3plhub URL 的 DB 记录
  console.log("Fetching providers...");
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers")
      .select("id,slug,logo,hero_image")
      .or("logo.ilike.*3plhub*,hero_image.ilike.*3plhub*")
      .range(off, off + 999);
    if (!data?.length) break;
    providers.push(...data);
  }
  console.log(`Found ${providers.length} with 3plhub URLs`);

  let resume = { logoDone: 0, coverDone: 0 };
  if (existsSync(LOG_FILE)) resume = JSON.parse(readFileSync(LOG_FILE, "utf8"));

  // 3. Upload logos
  const needLogo = providers.filter(p => p.logo?.includes("3plhub"));
  let lUp = resume.logoDone || 0, lSkip = 0, lFail = 0;
  for (let i = lUp; i < needLogo.length; i++) {
    const p = needLogo[i];
    const uid = logoMap.get(p.logo);
    if (!uid) { lSkip++; continue; }
    const file = await findFile(LOGOS_DIR, uid);
    const url = await uploadImage(file, "3pl-logos", p.slug);
    if (url) { await s.from("pl_providers").update({ logo: url }).eq("id", p.id); lUp++; }
    else { lFail++; }
    if ((lUp + lFail + lSkip) % 50 === 0) {
      console.log(`Logo: ${lUp} ok, ${lSkip} skip, ${lFail} fail / ${needLogo.length}`);
      writeFileSync(LOG_FILE, JSON.stringify({ logoDone: lUp, coverDone: resume.coverDone }));
    }
  }

  // 4. Upload covers
  const needHero = providers.filter(p => p.hero_image?.includes("3plhub"));
  let cUp = resume.coverDone || 0, cSkip = 0, cFail = 0;
  for (let i = cUp; i < needHero.length; i++) {
    const p = needHero[i];
    // cover can be "/covers/profile/cimage-..." or "https://www.3plhub.co/covers/..."
    const coverPath = p.hero_image.replace("https://www.3plhub.co", "");
    const uid = coverMap.get(coverPath) || coverMap.get(p.hero_image);
    if (!uid) { cSkip++; continue; }
    const file = await findFile(COVERS_DIR, uid);
    const url = await uploadImage(file, "3pl-hero", p.slug);
    if (url) { await s.from("pl_providers").update({ hero_image: url }).eq("id", p.id); cUp++; }
    else { cFail++; }
    if ((cUp + cFail + cSkip) % 50 === 0) {
      console.log(`Cover: ${cUp} ok, ${cSkip} skip, ${cFail} fail / ${needHero.length}`);
      writeFileSync(LOG_FILE, JSON.stringify({ logoDone: lUp, coverDone: cUp }));
    }
  }

  console.log(`\n✅ Done! Logos: ${lUp}/${needLogo.length} | Covers: ${cUp}/${needHero.length}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

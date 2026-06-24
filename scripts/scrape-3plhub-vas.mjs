/**
 * 从 3plhub 详情页提取服务数据（curl+Node混合）
 * node scripts/scrape-3plhub-vas.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { tmpdir } from "os";

const s = createClient(
  "https://cdwbbfzfjakkdwnqfffw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
);

const HUB_DATA = "E:/Flowrid/3plhub/3plhub-all.json";
const VAS_FILE = "E:/Flowrid/3plhub/vas-3plhub.json";
const LOG_FILE = "E:/Flowrid/3plhub/vas-3plhub-progress.json";

function slugify(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function fetchPage(url) {
  try {
    const tmp = join(tmpdir(), "hubvas-" + Date.now() + ".html");
    execSync(`curl -s "${url}" -H "User-Agent: Mozilla/5.0" --connect-timeout 10 --max-time 15 -o "${tmp}"`, { timeout: 20000 });
    const html = readFileSync(tmp, "utf8");
    try { execSync(`rm "${tmp}"`); } catch {}
    return html;
  } catch { return null; }
}

function extractServices(html) {
  if (!html) return [];
  const items = new Set();
  const re = /<span class="jh-v2-chip__check"[^>]*>[^<]*<\/span>([^<]+)</g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = m[1].trim();
    if (t.length > 1 && !t.includes("No capabilities")) items.add(t);
  }
  return [...items];
}

async function main() {
  // 1. 建立 slug -> filename 映射
  const hubRaw = JSON.parse(readFileSync(HUB_DATA, "utf8"));
  const listings = hubRaw.listings || [];
  const slugToFile = new Map();
  for (const item of listings) {
    if (item.filename) {
      const slug = slugify(item.full_name);
      slugToFile.set(slug, item.filename);
    }
  }
  console.log("3plhub slug->filename:", slugToFile.size);

  // 2. 获取 DB 中 integrations 为空且能匹配到 3plhub filename 的
  const providers = [];
  for (let off = 0; off < 5000; off += 1000) {
    const { data } = await s.from("pl_providers").select("id,slug,name,integrations").range(off, off + 999);
    if (!data?.length) break;
    for (const d of data) {
      if ((!d.integrations || d.integrations.length === 0) && slugToFile.has(d.slug)) {
        providers.push({ ...d, filename: slugToFile.get(d.slug) });
      }
    }
  }
  console.log("To scrape:", providers.length);

  // 3. 进度恢复
  let vasData = {}, done = 0, updated = 0;
  if (existsSync(VAS_FILE)) vasData = JSON.parse(readFileSync(VAS_FILE, "utf8"));
  if (existsSync(LOG_FILE)) ({ done, updated } = JSON.parse(readFileSync(LOG_FILE, "utf8")));
  console.log("Resume from:", done);

  // 4. 抓取
  let count = 0;
  for (let i = done; i < providers.length; i++) {
    const p = providers[i];
    let services = vasData[p.slug];

    if (!services) {
      const url = `https://www.3plhub.co/${p.filename}`;
      const html = fetchPage(url);
      services = extractServices(html);
      vasData[p.slug] = services;
    }

    if (services && services.length > 0) {
      const { error } = await s.from("pl_providers").update({ integrations: services }).eq("id", p.id);
      if (!error) updated++;
    }

    done = i + 1;
    count++;
    if (count % 50 === 0) {
      const withData = Object.values(vasData).filter(v => v && v.length > 0).length;
      console.log(`${done}/${providers.length} | Data: ${withData} | DB: ${updated}`);
      writeFileSync(VAS_FILE, JSON.stringify(vasData, null, 2));
      writeFileSync(LOG_FILE, JSON.stringify({ done, updated }));
    }
    await new Promise(r => setTimeout(r, 300));
  }

  writeFileSync(VAS_FILE, JSON.stringify(vasData, null, 2));
  console.log(`Done! Scraped: ${Object.keys(vasData).length} | DB updated: ${updated}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });

/**
 * 下载 3plhub 全部 logo 和仓库封面图
 * node scripts/download-3plhub-images.mjs
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const DATA_FILE = "E:/Flowrid/3plhub/3plhub-all.json";
const LOGOS_DIR = "E:/Flowrid/3plhub/logos";
const COVERS_DIR = "E:/Flowrid/3plhub/covers";
const BASE = "https://www.3plhub.co";

if (!existsSync(LOGOS_DIR)) mkdirSync(LOGOS_DIR, { recursive: true });
if (!existsSync(COVERS_DIR)) mkdirSync(COVERS_DIR, { recursive: true });

const { listings } = JSON.parse(readFileSync(DATA_FILE, "utf8"));
console.log(`Total listings: ${listings.length}`);

const unique = new Map();
for (const item of listings) {
  if (!unique.has(item.user_id)) {
    unique.set(item.user_id, item);
  }
}
const items = [...unique.values()];
console.log(`Unique: ${items.length}`);

let logoOk = 0, logoSkip = 0, logoFail = 0;
let coverOk = 0, coverSkip = 0, coverFail = 0;

async function download(url, filepath) {
  if (existsSync(filepath)) return "skip";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return "fail";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return "fail"; // 太小 = 占位图/错误
    writeFileSync(filepath, buf);
    return "ok";
  } catch {
    return "fail";
  }
}

let count = 0;
const CONCURRENT = 5;

async function processBatch(batch) {
  const tasks = batch.map(async (item) => {
    const id = item.user_id;
    const results = {};

    // Logo
    if (item.logo && item.logo.startsWith("http")) {
      const ext = item.logo.split(".").pop()?.split("?")[0] || "png";
      results.logo = await download(item.logo, join(LOGOS_DIR, `${id}.${ext}`));
    }

    // Cover
    if (item.cover) {
      const coverUrl = item.cover.startsWith("http") ? item.cover : BASE + item.cover;
      const ext = coverUrl.split(".").pop()?.split("?")[0] || "png";
      results.cover = await download(coverUrl, join(COVERS_DIR, `${id}.${ext}`));
    }

    return results;
  });

  return Promise.all(tasks);
}

for (let i = 0; i < items.length; i += CONCURRENT) {
  const batch = items.slice(i, i + CONCURRENT);
  const results = await processBatch(batch);
  for (const r of results) {
    if (r.logo === "ok") logoOk++;
    else if (r.logo === "skip") logoSkip++;
    else if (r.logo === "fail") logoFail++;
    if (r.cover === "ok") coverOk++;
    else if (r.cover === "skip") coverSkip++;
    else if (r.cover === "fail") coverFail++;
  }
  count += batch.length;
  if (count % 100 === 0 || count === items.length) {
    console.log(`${count}/${items.length} | Logos: ${logoOk}ok ${logoSkip}skip ${logoFail}fail | Covers: ${coverOk}ok ${coverSkip}skip ${coverFail}fail`);
  }
}

console.log(`\nDone. Logos: ${logoOk} | Covers: ${coverOk}`);

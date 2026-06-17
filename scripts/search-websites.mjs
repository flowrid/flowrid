/**
 * 通过 WebSearch 搜缺失 website 的 3PL
 * 这个是辅助脚本 - 生成待搜索列表，由 Claude 的 WebSearch 逐个搜索
 * node scripts/search-websites.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";

const SEARCH_BATCH = 50;

async function main() {
  // 从 DB 导出无 website 的列表（优先美国 + 长名字）
  console.log("Generating search queue...");
  console.log("Run this script to generate search list, then process with Claude WebSearch");

  // 读已有的搜索结果
  const done = existsSync("E:/Flowrid/3plhub/websearch-results.json")
    ? JSON.parse(readFileSync("E:/Flowrid/3plhub/websearch-results.json", "utf8"))
    : {};

  console.log("Already processed:", Object.keys(done).length);
  console.log("Verified:", Object.values(done).filter(v => v).length);
}

main();

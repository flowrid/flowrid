/**
 * POST /api/import-hero-images
 * 从 scripts/hero_images.json 读取 hero image URL 并批量写入 pl_providers
 * 一次性使用 — 导入完成后可删除
 */
import { createServiceClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const jsonPath = path.join(process.cwd(), "scripts", "hero_images.json");
  if (!fs.existsSync(jsonPath)) {
    return NextResponse.json({ error: "hero_images.json not found" }, { status: 404 });
  }

  const data: Record<string, string> = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const entries = Object.entries(data);
  let updated = 0;
  let failed = 0;
  const BATCH_SIZE = 50;

  const results: string[] = [];

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    // 逐个更新（Supabase REST 不支持批量 upsert 不同记录）
    for (const [slug, hero_image] of batch) {
      const { error } = await supabase
        .from("pl_providers")
        .update({ hero_image })
        .eq("slug", slug);

      if (error) {
        failed++;
      } else {
        updated++;
      }
    }
    results.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${updated + failed}/${entries.length} (${failed} failed)`);
  }

  results.push(`\nDONE: ${updated} updated, ${failed} failed out of ${entries.length}`);

  return NextResponse.json({ updated, failed, total: entries.length, results });
}

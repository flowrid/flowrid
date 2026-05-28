/**
 * 数据库迁移脚本
 * 用法: npx tsx scripts/migrate.ts
 * 注意: 此脚本不在 Next.js 构建范围内，通过 tsx 独立运行
 */

import { createClient } from "@supabase/supabase-js";

const MIGRATIONS = [
  "004_qc_checks.sql",
  "005_automation.sql",
  "006_dock_appointments.sql",
  "007_cycle_count.sql",
  "008_kitting.sql",
  "009_containers.sql",
  "010_notifications.sql",
  "011_audit_logs.sql",
  "012_inventory_transfers.sql",
];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const fs = await import("fs");
  const path = await import("path");
  const migrationsDir = path.resolve(__dirname, "..", "data", "migrations");

  console.log("Flowrid Migration Runner\n");

  for (const file of MIGRATIONS) {
    const filePath = path.join(migrationsDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP  ${file} — not found`);
      continue;
    }

    const sql = fs.readFileSync(filePath, "utf-8");
    const { error } = await supabase.rpc("exec_sql", { sql_string: sql }).single();

    if (error) {
      // 尝试通过 REST API 直接执行
      const statements = sql.split(";").filter((s) => s.trim() && !s.trim().startsWith("--"));
      let allOk = true;
      for (const stmt of statements) {
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ sql_string: stmt.trim() + ";" }),
        });
        if (!res.ok) {
          console.error(`  FAIL  ${file} — segment error: ${res.status}`);
          allOk = false;
          break;
        }
      }
      if (allOk) console.log(`  OK    ${file}`);
    } else {
      console.log(`  OK    ${file}`);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});

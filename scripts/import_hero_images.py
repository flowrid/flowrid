"""将 hero_images.json 导入 Supabase pl_providers 表"""
import json, time, urllib.request, ssl

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 读取 JSON
with open("scripts/hero_images.json", "r", encoding="utf-8") as f:
    data = json.load(f)

entries = list(data.items())
total = len(entries)
print(f"Total entries: {total}")

updated = 0
failed = 0
errors = []

for i, (slug, hero_image) in enumerate(entries):
    try:
        patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{urllib.request.quote(slug)}"
        payload = json.dumps({"hero_image": hero_image}).encode("utf-8")
        req = urllib.request.Request(
            patch_url, data=payload, method="PATCH",
            headers={
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
        )
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        if resp.status in (200, 204):
            updated += 1
        else:
            failed += 1
    except Exception as e:
        failed += 1
        if len(errors) < 10:
            errors.append(f"{slug}: {str(e)[:80]}")

    if (i + 1) % 200 == 0:
        print(f"Progress: {i + 1}/{total} ({updated} ok, {failed} fail)")
        time.sleep(1)  # 短暂休息

print(f"\nDONE: {updated} updated, {failed} failed out of {total}")
if errors:
    print(f"First errors: {errors[:5]}")

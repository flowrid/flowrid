"""检查当前数据库中缺失 hero_image 的 3PL 数量"""
import requests, urllib3
urllib3.disable_warnings()

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}

# 分页统计
all_rows = []
offset = 0
while True:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/pl_providers?select=slug,name,website,hero_image&limit=1000&offset={offset}",
        headers=headers, verify=False, timeout=30
    )
    batch = resp.json()
    if not batch:
        break
    all_rows.extend(batch)
    offset += 1000

total = len(all_rows)
with_hero = sum(1 for r in all_rows if r.get("hero_image"))
without_hero = total - with_hero
with_website = sum(1 for r in all_rows if not r.get("hero_image") and r.get("website") and r["website"].startswith("http"))

print(f"Total 3PLs: {total}")
print(f"With hero image: {with_hero}")
print(f"Missing hero image: {without_hero}")
print(f"  - of which have website to scrape: {with_website}")

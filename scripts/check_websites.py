"""排查所有 2,818 条记录的 website 字段"""
import requests, urllib3, json
urllib3.disable_warnings()

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Accept": "application/json"
}

# 分页获取所有记录
all_rows = []
offset = 0
limit = 1000
while True:
    url = f"{SUPABASE_URL}/rest/v1/pl_providers?select=slug,name,website,logo,linkedin&limit={limit}&offset={offset}"
    resp = requests.get(url, headers=headers, verify=False, timeout=30)
    batch = resp.json()
    if not batch:
        break
    all_rows.extend(batch)
    offset += limit

print(f"Total records: {len(all_rows)}")

# 分析 website
empty_web = []
fulfill_web = []
short_web = []
real_web = []

for r in all_rows:
    web = (r.get("website") or "").strip()
    name = r["name"]
    slug = r["slug"]

    if not web:
        empty_web.append((slug, name, web))
    elif "fulfill.com" in web.lower():
        fulfill_web.append((slug, name, web))
    elif len(web) < 20:  # 太短的可能是无效 URL
        short_web.append((slug, name, web))
    else:
        real_web.append((slug, name, web))

print(f"\nEmpty website: {len(empty_web)}")
print(f"fulfill.com links: {len(fulfill_web)}")
print(f"Very short/suspicious: {len(short_web)}")
print(f"Real websites: {len(real_web)}")

if fulfill_web:
    print(f"\n=== FULFILL.COM LINKS ===")
    for slug, name, web in fulfill_web:
        print(f"  {name}: {web}")

if empty_web:
    print(f"\n=== EMPTY WEBSITE (first 15) ===")
    for slug, name, web in empty_web[:15]:
        print(f"  {name}")

if short_web:
    print(f"\n=== SHORT/SUSPICIOUS (first 30) ===")
    for slug, name, web in short_web[:30]:
        print(f"  {name}: [{web}]")

# 检查 linkedin
print(f"\n=== LINKEDIN FIELD ===")
fulfill_li = []
for r in all_rows:
    li = (r.get("linkedin") or "").strip()
    if "fulfill.com" in li.lower():
        fulfill_li.append((r["slug"], r["name"], li))
print(f"LinkedIn pointing to fulfill.com: {len(fulfill_li)}")
for slug, name, li in fulfill_li[:10]:
    print(f"  {name}: {li[:100]}")

# 检查 logo 中是否有 fulfill.com 链接
print(f"\n=== LOGO FIELD (checking for fulfill.com placeholders) ===")
fulfill_logos = []
for r in all_rows:
    logo = (r.get("logo") or "").strip()
    if "636447e01bb9fb0f9cef2a46_fulfill.png" in logo:
        fulfill_logos.append((r["slug"], r["name"]))
print(f"Default fulfill.com logo used: {len(fulfill_logos)}")

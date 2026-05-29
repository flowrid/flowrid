"""清理非仓库图片：只保留文件名含仓库关键词的 hero_image，其余设为 null"""
import json, requests, urllib3
urllib3.disable_warnings()

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

WAREHOUSE_KW = [
    "warehouse", "exterior", "facility", "building", "fulfillment",
    "fulfilment", "distribution", "headquarter", "interior", "inside",
    "shelf", "pallet", "forklift", "racking", "conveyor", "picking",
    "packing", "dock", "loading", "storage", "campus", "logistics-center",
]

NOT_WAREHOUSE_KW = [
    "logo", "icon", "favicon", "avatar", "banner", "slider", "slide",
    "hero", "header", "footer", "background", "pattern",
    "about-", "team", "person", "people", "staff", "portrait",
    "testimonial", "client", "partner", "badge", "award",
    "og-image", "ogimage", "seo", "social", "share",
    "default", "placeholder",
]

# 加载所有图片
with open("scripts/hero_images.json", "r", encoding="utf-8") as f:
    fulfill_hero = json.load(f)

with open("scripts/warehouse_photos.json", "r", encoding="utf-8") as f:
    website_photos = json.load(f)

all_photos = {}
for slug, url in fulfill_hero.items():
    all_photos[slug] = url
for slug, data in website_photos.items():
    all_photos[slug] = data.get("hero_image", data) if isinstance(data, dict) else data

# 分类
keep = []
revert = []

for slug, url in all_photos.items():
    if not url:
        continue
    fn = url.split("/")[-1].lower()
    is_warehouse = any(k in fn for k in WAREHOUSE_KW)
    is_not = any(k in fn for k in NOT_WAREHOUSE_KW)

    if is_warehouse:
        keep.append(slug)
    elif not is_warehouse and (is_not or True):
        revert.append(slug)

print(f"Total photos: {len(all_photos)}")
print(f"Keep (warehouse): {len(keep)}")
print(f"Revert (non-warehouse): {len(revert)}")
print()
print("Sample KEEP:")
for s in keep[:5]:
    url = all_photos[s]
    fn = url.split("/")[-1][:80]
    print(f"  {fn}")
print()
print("Sample REVERT:")
for s in revert[:5]:
    url = all_photos[s]
    fn = url.split("/")[-1][:80]
    print(f"  {fn}")

# 批量回退
print(f"\nReverting {len(revert)} records...")
done = 0
for i in range(0, len(revert), 100):
    batch = revert[i:i+100]
    for slug in batch:
        try:
            resp = requests.patch(
                f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}",
                json={"hero_image": None},
                headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}", "Prefer": "return=minimal"},
                timeout=10, verify=False
            )
            if resp.status_code in (200, 204):
                done += 1
        except:
            pass
    if (i + 100) % 500 == 0:
        print(f"  {done}/{len(revert)} reverted...")

print(f"\nDone! Reverted {done} records to null.")
print(f"Remaining warehouse photos: {len(keep)}")

# 保存保留列表
with open("scripts/warehouse_keep.json", "w", encoding="utf-8") as f:
    json.dump({s: all_photos[s] for s in keep}, f, ensure_ascii=False)
print("Saved keep list to warehouse_keep.json")

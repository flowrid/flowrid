"""
从各 3PL 官网批量抓取仓库图片 — requests 版
优先级：大楼外景 > 仓库内部 > og:image > 首页大图
"""
import json, os, glob, re, time, sys
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "warehouse_photos.json")

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

MAX_WORKERS = 20
TIMEOUT = 6  # 秒

sys.stdout.reconfigure(line_buffering=True)

WAREHOUSE_KW = ["warehouse", "exterior", "facility", "building", "location",
                "fulfillment", "fulfilment", "center", "distribution"]
SKIP_IMG_KW = ["icon", "logo", "favicon", "avatar", "flag", "pixel", "1x1", "tracking", "gravatar"]

# 已有的好图
with open(os.path.join(os.path.dirname(__file__), "hero_images.json"), "r", encoding="utf-8") as f:
    EXISTING_HERO = json.load(f)


def fetch_html(url):
    try:
        resp = requests.get(url, timeout=TIMEOUT, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }, allow_redirects=True, verify=False)
        return resp.text if resp.status_code == 200 else None
    except Exception:
        return None


def extract_best_image(html, base_url):
    if not html:
        return None

    candidates = []

    # 1. og:image
    og = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if not og:
        og = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', html, re.I)
    if og:
        img_url = urljoin(base_url, og.group(1))
        if not any(k in img_url.lower() for k in SKIP_IMG_KW):
            candidates.append({"url": img_url, "score": 50})

    # 2. 所有 img 标签
    imgs = re.findall(r'<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']', html, re.I)
    for img_url in imgs:
        full = urljoin(base_url, img_url)
        if any(k in full.lower() for k in SKIP_IMG_KW):
            continue
        # 根据文件名评分
        fn = full.split("/")[-1].lower()
        score = 0
        if any(k in fn for k in ["exterior", "building", "headquarter", "office", "outside"]):
            score += 30
        elif any(k in fn for k in WAREHOUSE_KW):
            score += 25
        elif any(k in fn for k in ["interior", "inside", "shelf", "pallet", "forklift", "racking"]):
            score += 20
        elif any(k in fn for k in ["facility", "location", "campus", "site"]):
            score += 15
        elif any(k in fn for k in ["hero", "banner", "slider", "slide", "home", "main", "feature"]):
            score += 10
        # 减分项
        if any(k in fn for k in ["logo", "icon", "avatar", "team", "person", "people", "staff",
                                   "portrait", "testimonial", "client", "partner", "badge"]):
            score -= 30
        candidates.append({"url": full, "score": score})

    if not candidates:
        return None

    # 按分数排序，去重
    seen = set()
    for c in sorted(candidates, key=lambda x: -x["score"]):
        if c["url"] not in seen:
            seen.add(c["url"])
            if c["score"] >= 0:
                # 快速验证图片可访问
                try:
                    r = requests.head(c["url"], timeout=3, verify=False)
                    if r.status_code == 200:
                        return c["url"]
                except Exception:
                    continue

    # 回退：分数最高的，即使未验证
    for c in sorted(candidates, key=lambda x: -x["score"]):
        return c["url"]

    return None


def has_good_hero(slug):
    hero = EXISTING_HERO.get(slug, "")
    if hero:
        fn = hero.split("/")[-1].lower()
        return any(k in fn for k in WAREHOUSE_KW)
    return False


def process_3pl(slug, website, name):
    if has_good_hero(slug):
        return None
    html = fetch_html(website)
    if not html:
        return None
    img = extract_best_image(html, website)
    if img:
        return {"slug": slug, "hero_image": img}
    return None


def patch_supabase(slug, hero_image):
    try:
        resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}",
            json={"hero_image": hero_image},
            headers={
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Prefer": "return=minimal",
            },
            timeout=10,
            verify=False,
        )
        return resp.status_code in (200, 204)
    except Exception:
        return False


def main():
    # 禁用 SSL 警告
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # 加载所有 profiles
    json_files = sorted(glob.glob(os.path.join(PROFILES_DIR, "*.json")))
    todo = []
    for f in json_files:
        try:
            with open(f, "r", encoding="utf-8") as fh:
                d = json.load(fh)
        except Exception:
            continue
        slug = d.get("slug", "")
        website = d.get("website", "")
        if not website or not website.startswith("http"):
            continue
        if not has_good_hero(slug):
            todo.append((slug, website, d.get("name", "?")))

    # 加载 checkpoint
    results = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            results = json.load(f)
    done = set(results.keys())
    todo = [(s, w, n) for s, w, n in todo if s not in done]

    total_remaining = len(todo)
    total_done = len(results)
    print(f"Total to scrape: {total_remaining} (already have {total_done})")

    if not todo:
        print("All done!")
        return

    found = 0
    updated = 0
    processed = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_3pl, s, w, n): s for s, w, n in todo}

        for future in as_completed(futures):
            processed += 1
            try:
                result = future.result()
                if result:
                    slug = result["slug"]
                    results[slug] = {"hero_image": result["hero_image"]}
                    found += 1
                    if patch_supabase(slug, result["hero_image"]):
                        updated += 1
            except Exception:
                pass

            if processed % 200 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False)
                pct = (total_done + processed) * 100 // (total_done + total_remaining)
                print(f"[{total_done + processed}/{total_done + total_remaining}] {pct}% | new: {found} | DB: {updated}")

    # 最终保存
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f"\n=== DONE ===")
    print(f"Total photos: {len(results)}")
    print(f"New this run: {found}, DB updated: {updated}")


if __name__ == "__main__":
    main()

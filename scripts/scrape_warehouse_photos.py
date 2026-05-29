"""
从各 3PL 官网抓取仓库照片

优先级：大楼外景 > 仓库内部 > 仓库环境 > og:image > 首页大图

策略：
1. 先尝试 /facility, /warehouse, /about, /locations 子页面
2. 提取 og:image 和页面中的大图
3. 按关键词权重排序选最佳图片

增量保存到 warehouse_photos.json，每 100 条 checkpoint
"""

import json, os, glob, re, time, urllib.request, ssl, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse

# 确保输出立即刷新
sys.stdout.reconfigure(line_buffering=True)

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "warehouse_photos.json")

# Supabase 配置
SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

MAX_WORKERS = 20
PAGE_TIMEOUT = 5
IMG_TIMEOUT = 3

# 已有好图的 slug（跳过）
with open(os.path.join(os.path.dirname(__file__), "hero_images.json"), "r", encoding="utf-8") as f:
    EXISTING_HERO = json.load(f)

WAREHOUSE_KW = ["warehouse", "exterior", "facility", "building", "location",
                "fulfillment", "fulfilment", "center", "distribution"]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def fetch_html(url, timeout=PAGE_TIMEOUT):
    """获取页面 HTML"""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml",
        })
        resp = urllib.request.urlopen(req, timeout=timeout, context=ctx)
        return resp.read().decode("utf-8", errors="ignore")
    except Exception:
        return None


def extract_images(html, base_url):
    """从 HTML 中提取候选图片"""
    if not html:
        return []

    candidates = []

    # 1. og:image (最高权重)
    og_match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not og_match:
        og_match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.I)
    if og_match:
        img_url = urljoin(base_url, og_match.group(1))
        candidates.append({"url": img_url, "score": 100, "source": "og:image"})

    # 2. 所有 <img> 标签
    img_tags = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html, re.I)
    for img_url in img_tags:
        full_url = urljoin(base_url, img_url)
        # 跳过明显的小图、图标、logo
        if any(k in full_url.lower() for k in ["icon", "logo", "favicon", "avatar", "flag", "pixel", "1x1", "tracking"]):
            continue
        candidates.append({"url": full_url, "score": 0, "source": "img"})

    # 3. CSS background images
    bg_matches = re.findall(r'background(?:-image)?\s*:\s*url\(["\']?([^"\')\s]+)["\']?\)', html, re.I)
    for img_url in bg_matches:
        full_url = urljoin(base_url, img_url)
        if any(k in full_url.lower() for k in ["icon", "logo", "gradient"]):
            continue
        candidates.append({"url": full_url, "score": 0, "source": "css-bg"})

    return candidates


def score_image(url, alt_text=""):
    """根据文件名和 alt 文本对图片评分"""
    filename = url.split("/")[-1].lower()
    combined = f"{filename} {alt_text.lower()}"

    score = 0

    # 大楼外景 - 最高优先级
    exterior_kw = ["exterior", "building", "headquarter", "office", "outside", "front", "driveway"]
    for kw in exterior_kw:
        if kw in combined:
            score += 30
            break

    # 仓库 - 高优先级
    warehouse_kw = ["warehouse", "fulfillment", "fulfilment", "distribution-center", "dc-", "logistics-center"]
    for kw in warehouse_kw:
        if kw in combined:
            score += 25
            break

    # 仓库内部
    interior_kw = ["interior", "inside", "shelf", "pallet", "forklift", "racking", "conveyor", "picking", "packing", "inventory"]
    for kw in interior_kw:
        if kw in combined:
            score += 20
            break

    # 设施/环境
    facility_kw = ["facility", "location", "campus", "site", "center", "storage"]
    for kw in facility_kw:
        if kw in combined:
            score += 15
            break

    # 通用好评
    generic_good = ["hero", "banner", "slider", "slide", "home", "main", "feature", "about"]
    for kw in generic_good:
        if kw in combined:
            score += 5
            break

    # 惩罚项
    penalties = {
        "logo": -50, "icon": -30, "avatar": -30, "team": -20, "person": -15,
        "people": -15, "staff": -15, "portrait": -20, "testimonial": -20,
        "client": -15, "partner": -15, "badge": -20, "award": -10,
        "certification": -10, "svg": -10, "sprite": -30,
    }
    for kw, penalty in penalties.items():
        if kw in combined:
            score += penalty

    return score


def probe_image_size(url):
    """快速检测图片是否存在（HEAD 请求）"""
    try:
        req = urllib.request.Request(url, method="HEAD", headers={
            "User-Agent": "Mozilla/5.0", "Accept": "image/*"
        })
        resp = urllib.request.urlopen(req, timeout=IMG_TIMEOUT, context=ctx)
        return True
    except Exception:
        return False


def scrape_website(base_url):
    """抓取单个网站的最佳仓库图片"""
    if not base_url or not base_url.startswith("http"):
        return None

    base_url = base_url.rstrip("/")
    all_candidates = []

    # 策略 1：首页
    html = fetch_html(base_url)
    if html:
        candidates = extract_images(html, base_url)
        all_candidates.extend(candidates)

    # 只抓首页（子页面太慢，中国到海外网络延迟高）
    # og:image 通常在首页就有

    if not all_candidates:
        return None

    # 评分排序
    for c in all_candidates:
        c["score"] += score_image(c["url"])

    # 去重并选最佳
    seen = set()
    unique = []
    for c in sorted(all_candidates, key=lambda x: -x["score"]):
        url = c["url"]
        if url not in seen:
            seen.add(url)
            unique.append(c)

    # 返回分数最高的有效图片
    for c in unique[:10]:
        if c["score"] >= 0 and probe_image_size(c["url"]):
            return c["url"]

    # 回退到 og:image（即使分数低）
    for c in unique:
        if c["source"] == "og:image" and probe_image_size(c["url"]):
            return c["url"]

    return None


def process_3pl(slug, website, name):
    """处理单个 3PL"""
    # 检查是否已有好图
    existing = EXISTING_HERO.get(slug, "")
    if existing:
        fn = existing.split("/")[-1].lower()
        if any(k in fn for k in WAREHOUSE_KW):
            return None  # 已有仓库图，跳过

    img_url = scrape_website(website)
    if img_url:
        return {"slug": slug, "hero_image": img_url, "website": website, "name": name}
    return None


def patch_supabase(slug, hero_image):
    """更新 Supabase 单条记录"""
    try:
        patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{urllib.request.quote(slug)}"
        data = json.dumps({"hero_image": hero_image}).encode("utf-8")
        req = urllib.request.Request(patch_url, data=data, method="PATCH", headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        })
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        return resp.status in (200, 204)
    except Exception:
        return False


def load_checkpoint():
    """加载已有进度"""
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def main():
    # 加载所有 profiles
    json_files = sorted(glob.glob(os.path.join(PROFILES_DIR, "*.json")))

    # 构建待处理列表
    todo = []
    for f in json_files:
        try:
            with open(f, "r", encoding="utf-8") as fh:
                d = json.load(fh)
        except Exception:
            continue

        slug = d.get("slug", "")
        website = d.get("website", "")
        name = d.get("name", "?")

        if not website or not website.startswith("http"):
            continue

        # 跳过已有仓库好图
        existing = EXISTING_HERO.get(slug, "")
        if existing:
            fn = existing.split("/")[-1].lower()
            if any(k in fn for k in WAREHOUSE_KW):
                continue

        todo.append((slug, website, name))

    total = len(todo)
    print(f"To scrape: {total} websites (skipped {len(json_files) - total} with good existing photos)")

    # 加载 checkpoint
    results = load_checkpoint()
    done_slugs = set(results.keys())
    todo = [(s, w, n) for s, w, n in todo if s not in done_slugs]
    print(f"Already done: {len(done_slugs)}, remaining: {len(todo)}")

    if not todo:
        print("All done!")
        return

    # 开始抓取
    processed = 0
    found = 0
    updated_db = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_3pl, s, w, n): (s, n) for s, w, n in todo}

        for future in as_completed(futures):
            slug, name = futures[future]
            processed += 1

            try:
                result = future.result()
                if result:
                    results[slug] = {
                        "hero_image": result["hero_image"],
                        "website": result["website"],
                        "name": name,
                    }
                    found += 1

                    # 更新 Supabase
                    if patch_supabase(slug, result["hero_image"]):
                        updated_db += 1
            except Exception:
                pass

            # 进度保存
            if processed % 100 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False)
                pct = (len(done_slugs) + processed) * 100 // (len(done_slugs) + len(todo))
                print(f"Progress: {len(done_slugs) + processed}/{len(done_slugs) + len(todo)} ({pct}%) — found {found}, DB updated {updated_db}")

    # 最终保存
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)

    total_done = len(results)
    print(f"\n=== DONE ===")
    print(f"Total found: {total_done}")
    print(f"Updated in Supabase: {updated_db}")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

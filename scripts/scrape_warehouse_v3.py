"""
深度抓取各 3PL 官网的仓库照片 — V3
策略：
1. 主页 + /about + /facility + /warehouse + /locations 多页探测
2. og:image 作为兜底
3. 文件名/alt 文本含仓库关键词的图片优先
4. 过滤 logo、icon、stock 等非仓库图片
5. HEAD 请求验证图片可访问 + 大小 > 10KB
"""
import json, os, re, sys, time, requests, urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

urllib3.disable_warnings()
sys.stdout.reconfigure(line_buffering=True)

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "warehouse_photos_v3.json")

MAX_WORKERS = 15
PAGE_TIMEOUT = 6
HEAD_TIMEOUT = 4

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
    "Accept": "text/html,application/xhtml+xml",
}

# 仓库相关关键词（命中即得分）
WAREHOUSE_KEYWORDS = [
    "warehouse", "facility", "fulfillment", "fulfilment", "distribution",
    "exterior", "building", "interior", "shelf", "shelves", "pallet",
    "forklift", "racking", "conveyor", "loading", "dock", "storage",
    "operations", "logistics-center", "dc-", "3pl-", "headquarters",
]

# 强排斥关键词
SKIP_KEYWORDS = [
    "logo", "icon", "favicon", "avatar", "team", "person", "people",
    "staff", "portrait", "headshot", "testimonial", "client-",
    "partner-", "badge", "award", "certification", "sprite",
    "background-", "pattern", "texture", "social", "share",
    "facebook", "twitter", "linkedin", "instagram", "youtube",
    "1x1", "pixel", "tracking", "spinner", "loader",
]

SUBPAGES = ["/about", "/about-us", "/facility", "/facilities", "/warehouse",
            "/our-warehouse", "/locations", "/our-facility", "/services",
            "/fulfillment", "/3pl"]


def fetch_html(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=PAGE_TIMEOUT, allow_redirects=True, verify=False)
        return r.text if r.status_code == 200 else None
    except Exception:
        return None


def extract_images(html, base_url):
    if not html:
        return []
    cands = []

    # og:image
    og = re.search(r'<meta[^>]+(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if not og:
        og = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:image', html, re.I)
    if og:
        cands.append({"url": urljoin(base_url, og.group(1)), "alt": "", "score": 10})

    # 所有 img 标签 with src + alt
    for m in re.finditer(r'<img[^>]+(?:src|data-src|data-lazy-src)=["\']([^"\']+)["\'][^>]*(?:alt=["\']([^"\']*)["\'])?', html, re.I):
        src = m.group(1)
        alt = (m.group(2) or "").lower()
        full = urljoin(base_url, src)
        cands.append({"url": full, "alt": alt, "score": 0})

    return cands


def score_image(c):
    url = c["url"].lower()
    alt = c["alt"]
    fn = url.split("/")[-1]
    combined = f"{fn} {alt}"
    score = c["score"]

    # 仓库关键词加分
    for kw in WAREHOUSE_KEYWORDS:
        if kw in combined:
            score += 30
            break

    # 设施类弱加分
    if any(kw in combined for kw in ["facility", "location", "site"]):
        score += 10
    if any(kw in combined for kw in ["hero", "banner", "slider", "home"]):
        score += 5

    # 排斥关键词大幅减分
    for kw in SKIP_KEYWORDS:
        if kw in combined:
            score -= 50
            break

    # SVG 通常是图标
    if url.endswith(".svg"):
        score -= 30

    return score


def verify_image(url):
    """HEAD 请求验证图片可访问且大小 >10KB"""
    try:
        r = requests.head(url, headers=HEADERS, timeout=HEAD_TIMEOUT, verify=False, allow_redirects=True)
        if r.status_code != 200:
            return False
        # 检查 Content-Length
        cl = r.headers.get("content-length")
        if cl and int(cl) < 10000:
            return False
        # 检查 Content-Type
        ct = r.headers.get("content-type", "").lower()
        if not ct.startswith("image/"):
            return False
        return True
    except Exception:
        return False


def scrape_website(website):
    if not website or not website.startswith("http"):
        return None
    base = website.rstrip("/")

    all_cands = []

    # 主页
    html = fetch_html(base)
    if html:
        all_cands.extend(extract_images(html, base))

    # 子页面（遇到第一个仓库强关键词命中即可早退）
    for sub in SUBPAGES[:5]:  # 只试前 5 个，避免太慢
        sub_url = urljoin(base, sub)
        html = fetch_html(sub_url)
        if html:
            all_cands.extend(extract_images(html, sub_url))

    if not all_cands:
        return None

    # 评分
    for c in all_cands:
        c["final_score"] = score_image(c)

    # 去重
    seen = set()
    unique = []
    for c in all_cands:
        if c["url"] not in seen:
            seen.add(c["url"])
            unique.append(c)

    # 按分数排序，验证前 3 个
    unique.sort(key=lambda x: -x["final_score"])
    for c in unique[:5]:
        if c["final_score"] >= 0 and verify_image(c["url"]):
            return c["url"]

    return None


def patch_supabase(slug, hero_image):
    try:
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}",
            json={"hero_image": hero_image},
            headers={
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Prefer": "return=minimal",
            },
            timeout=10, verify=False,
        )
        return r.status_code in (200, 204)
    except Exception:
        return False


def main():
    # 拉取所有缺 hero_image 的记录
    print("Loading 3PLs without hero_image...")
    all_rows = []
    offset = 0
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/pl_providers?select=slug,name,website&hero_image=is.null&limit=1000&offset={offset}",
            headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"},
            verify=False, timeout=30,
        )
        batch = r.json()
        if not batch:
            break
        all_rows.extend(batch)
        offset += 1000

    todo = [(r["slug"], r["website"], r.get("name", "?"))
            for r in all_rows if r.get("website", "").startswith("http")]

    # checkpoint
    results = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            results = json.load(f)
    todo = [t for t in todo if t[0] not in results]

    total = len(todo)
    print(f"To scrape: {total} (already done: {len(results)})")

    if not todo:
        print("All done!")
        return

    found = 0
    db_updated = 0
    processed = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(scrape_website, w): s for s, w, _ in todo}
        for future in as_completed(futures):
            slug = futures[future]
            processed += 1
            try:
                img = future.result()
                if img:
                    results[slug] = img
                    found += 1
                    if patch_supabase(slug, img):
                        db_updated += 1
            except Exception:
                pass

            if processed % 100 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False)
                pct = processed * 100 // total
                print(f"[{processed}/{total}] {pct}% | new: {found} | DB: {db_updated}")

    # 最终保存
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f"\nDone! found {found}/{total}, DB updated {db_updated}")


if __name__ == "__main__":
    main()

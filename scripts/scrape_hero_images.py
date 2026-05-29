"""
从 fulfill.com 抓取 3PL 仓库/品牌大图

提取每个 profile 页面的 hero image URL（非 logo，非头像），
通过 Supabase REST API 写入 pl_providers 的 hero_image 字段。

模式：图片来自 Webflow 项目 622a0650809cd1200f8b4f07（3PL 内容项目）
"""

import json, os, glob, re, time, urllib.request, ssl
from concurrent.futures import ThreadPoolExecutor, as_completed

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"
BATCH_SIZE = 50
MAX_WORKERS = 10
TIMEOUT = 15

# 忽略的文件名关键词（logo、头像、徽章等）
SKIP_PATTERNS = [
    "logo", "LOGO", "fulfill.png", "badge", "avatar", "john-doe",
    "billy", "sam-glaser", "team", "Screenshot", "Frame"
]

# 默认图（fulfill.com 通用图，跳过）
DEFAULT_IMAGES = {
    "636447e01bb9fb0f9cef2a46_fulfill.png",
}

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def fetch_html(url):
    """获取页面 HTML"""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=TIMEOUT, context=CTX)
        return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return None


def extract_hero_image(html):
    """从 HTML 中提取 hero image URL"""
    if not html:
        return None

    # 找出所有来自 3PL 内容项目 (622a0650809cd1200f8b4f07) 的图片
    pattern = r'https://cdn\.prod\.website-files\.com/622a0650809cd1200f8b4f07/([^"\s\)]+)'
    matches = re.findall(pattern, html)

    candidates = []
    for match in matches:
        full_url = f"https://cdn.prod.website-files.com/622a0650809cd1200f8b4f07/{match}"
        filename = match.split("/")[-1]

        # 跳过已知的非 hero 图片
        skip = False
        for sp in SKIP_PATTERNS:
            if sp.lower() in filename.lower():
                skip = True
                break
        if skip:
            continue

        # 跳过默认图
        if filename in DEFAULT_IMAGES:
            continue

        # 优先 webp/avif（现代格式），跳过 svg（通常是 logo）
        if filename.endswith(".svg"):
            continue

        candidates.append(full_url)

    if not candidates:
        return None

    # 优先选择文件路径中不包含尺寸信息的（如 720, 1080 等）
    for c in candidates:
        if not re.search(r'_\d+x\d+', c):
            return c

    return candidates[0] if candidates else None


def process_profile(json_path):
    """处理单个 profile"""
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return None

    slug = data.get("slug", "")
    url = data.get("url", "")
    name = data.get("name", "?")

    if not url or not slug:
        return None

    html = fetch_html(url)
    if not html:
        return None

    hero = extract_hero_image(html)
    if hero:
        return {"slug": slug, "hero_image": hero}
    return None


def patch_supabase_batch(updates):
    """批量更新 Supabase"""
    success = 0
    for item in updates:
        slug = item["slug"]
        hero = item["hero_image"]
        try:
            patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{urllib.request.quote(slug)}"
            data = json.dumps({"hero_image": hero}).encode("utf-8")
            req = urllib.request.Request(
                patch_url,
                data=data,
                method="PATCH",
                headers={
                    "apikey": SERVICE_KEY,
                    "Authorization": f"Bearer {SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
            )
            resp = urllib.request.urlopen(req, timeout=10, context=CTX)
            if resp.status == 200:
                success += 1
        except Exception as e:
            pass  # 静默跳过
    return success


def main():
    # 读取所有 profiles
    json_files = sorted(glob.glob(os.path.join(PROFILES_DIR, "*.json")))
    total = len(json_files)
    print(f"Total profiles: {total}")

    # 检查 Supabase 连接
    db_ok = False
    try:
        check_url = f"{SUPABASE_URL}/rest/v1/pl_providers?select=slug&limit=1"
        req = urllib.request.Request(check_url, headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"})
        resp = urllib.request.urlopen(req, timeout=10, context=CTX)
        print(f"Supabase connection: OK")
        db_ok = True
    except Exception as e:
        print(f"Supabase connection failed: {e}")
        print("Will scrape and save to local JSON only.")

    # 抓取所有
    print(f"\nScraping {total} profiles with {MAX_WORKERS} workers...")
    all_results = {}
    processed = 0
    failed = 0
    output_file = os.path.join(os.path.dirname(__file__), "hero_images.json")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_profile, f): f for f in json_files}
        for future in as_completed(futures):
            processed += 1
            try:
                result = future.result()
                if result and result["hero_image"]:
                    all_results[result["slug"]] = result["hero_image"]
                elif result is None:
                    failed += 1
            except Exception:
                failed += 1

            if processed % 200 == 0:
                # 增量保存
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(all_results, f, ensure_ascii=False)
                pct = processed * 100 // total
                print(f"Progress: {processed}/{total} ({pct}%) — {len(all_results)} images, {failed} failed")

    print(f"\nDone! Found {len(all_results)} hero images out of {total} profiles ({failed} failed)")

    # 最终保存
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False)
    print(f"Saved to: {output_file}")

    # 保存到本地 JSON
    output_file = os.path.join(os.path.dirname(__file__), "hero_images.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"Saved to: {output_file}")

    # 尝试更新数据库
    if db_ok:
        print("\nUpdating Supabase...")
        updates = [{"slug": s, "hero_image": h} for s, h in all_results.items()]
        for i in range(0, len(updates), BATCH_SIZE):
            batch = updates[i : i + BATCH_SIZE]
            ok = patch_supabase_batch(batch)
            print(f"  Batch {i // BATCH_SIZE + 1}: {ok}/{len(batch)}")
            time.sleep(0.5)


if __name__ == "__main__":
    main()

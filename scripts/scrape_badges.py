"""从 fulfill.com 抓取奖项徽章图片"""
import json, os, glob, re, time, urllib.request, ssl

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
OUTPUT_DIR = r"E:\Flowrid\重要资料\设计文件\徽章"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 收集所有已知徽章图片 URL
badge_urls = {}  # name -> url
badge_pattern = re.compile(
    r'https://cdn\.prod\.website-files\.com/622a0650809cd1200f8b4f07/([a-f0-9]+_)+([a-z0-9-]+)\.(webp|png|svg)',
    re.I
)

def fetch_html(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=12, context=ctx)
        return resp.read().decode("utf-8", errors="ignore")
    except:
        return None

# 从已知有丰富奖项的 profile 抓取
# 先检查哪些 profile 有较多奖项
print("Finding profiles with awards...")
candidates = []
for f in glob.glob(os.path.join(PROFILES_DIR, "*.json")):
    try:
        with open(f, "r", encoding="utf-8") as fh:
            d = json.load(fh)
        awards = d.get("awards", [])
        if isinstance(awards, list) and len(awards) >= 4:
            candidates.append((d.get("url", ""), d.get("name", "?"), len(awards)))
    except:
        pass

candidates.sort(key=lambda x: -x[2])
print(f"Found {len(candidates)} profiles with 4+ awards")

# 访问前 20 个以收集各种徽章
visited = 0
for url, name, count in candidates[:20]:
    if not url:
        continue
    print(f"\n[{visited+1}/20] {name} ({count} awards)")
    html = fetch_html(url)
    if not html:
        print("  FAILED")
        continue

    matches = badge_pattern.findall(html)
    for m in matches:
        full_hash = m[0]  # e.g., "684c864c572e595d2555d982_6835c0ef46cdb5b490399a1f_"
        name_part = m[1]  # e.g., "direct-to-consumer-dtc"
        ext = m[2]        # webp/png/svg
        full_url = f"https://cdn.prod.website-files.com/622a0650809cd1200f8b4f07/{full_hash}{name_part}.{ext}"

        # 清除 URL 编码
        full_url = full_url.replace("%20", " ").replace("%2B", "+")

        if name_part not in badge_urls:
            badge_urls[name_part] = full_url
            print(f"  NEW: {name_part}")

    visited += 1
    time.sleep(0.5)

print(f"\n\nTotal unique badges found: {len(badge_urls)}")
print("Downloading...")

# 下载所有徽章
for name, url in sorted(badge_urls.items()):
    try:
        filepath = os.path.join(OUTPUT_DIR, f"{name}.webp")
        if os.path.exists(filepath):
            continue

        resp = urllib.request.urlopen(url, timeout=15, context=ctx)
        with open(filepath, "wb") as f:
            f.write(resp.read())
        print(f"  OK: {name}")
    except Exception as e:
        print(f"  FAIL: {name} - {e}")

print(f"\nSaved to: {OUTPUT_DIR}")
print("Badges downloaded. Manually sort into category folders.")

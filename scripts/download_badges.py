"""从 fulfill.com 提取 + 下载所有徽章图片（带 Referer 防盗链绕过）"""
import json, os, glob, re, time, urllib.request, ssl

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
OUTPUT_DIR = r"E:\Flowrid\重要资料\设计文件\徽章\ALL_BADGES"
os.makedirs(OUTPUT_DIR, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.fulfill.com/",
    "Accept": "image/webp,image/*",
}

# 提取徽章 URL 的正则（从 3PL 内容项目 CDN）
badge_re = re.compile(
    r'https://cdn\.prod\.website-files\.com/622a0650809cd1200f8b4f07/'
    r'([a-f0-9]+_)+([a-z0-9-]+)\.(webp|png)',
    re.I
)

# 过滤掉合作伙伴 logo、团队照片等非徽章图片
SKIP_PATTERNS = [
    "logo", "pic", "photo", "avatar", "portrait", "image",
    "cover", "download", "screenshot", "chatgpt", "drive-",
    "envoy-", "amware", "apsfulfillment", "bms-", "cbs-",
    "easyship", "ifulfillandship", "lvl-", "shipmate",
    "shiptquick", "depotmaster", "nocnoc", "companylogo",
    "asset-", "87f4b901", "dermalogica", "takis", "mavericks",
    "fahlo", "gap", "humps", "bulu-", "moby-dick",
    "9f3c3fc", "1e100f6", "985ab09", "41aa57a",
    "3461996", "5de5dec", "1698091404", "1613165929",
    "1617963938", "1729098574", "1660148304", "1734388108",
    "1737387598", "1663579424", "1623855788", "1723562829",
    "1721091700", "1651594695", "1517055721", "1565985400",
    "1537148950", "1689104992", "1516290929", "1720527914",
    "123-prep-fox", "97dcd8ee", "b918824d", "cbs-logo",
    "9445af09", "4912F6D8", "E5FC5A70", "aisha-chottani",
    "AllPack", "Awesome", "AMSCo", "BMS-", "LVK-logo",
    "SHIPMATE", "next-20level", "ShiptQuick", "Dermalogica",
    "Takis", "Mavericks", "Fahlo", "Gap", "Humps",
    "bulu-group", "moby-dick-cover", "FF-01-ef0468a7",
    "images", "download-3", "download", "drive-MAIN-LOGO",
    "2025-12-14", "123-prep-fox-logo",
]

def fetch_html(url):
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://www.fulfill.com/",
        })
        resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        return resp.read().decode("utf-8", errors="ignore")
    except:
        return None

# 找有丰富奖项的 profile
print("Finding profiles with many awards...")
candidates = []
for f in glob.glob(os.path.join(PROFILES_DIR, "*.json")):
    try:
        with open(f, "r", encoding="utf-8") as fh:
            d = json.load(fh)
        awards = d.get("awards", [])
        if isinstance(awards, list) and len(awards) >= 5:
            candidates.append((d.get("url", ""), d.get("name", "?")))
    except:
        pass
candidates = candidates[:40]  # 前40个
print(f"Scraping {len(candidates)} profiles...")

# 收集所有唯一徽章 URL
badge_map = {}  # name_part -> full_url
for url, name in candidates:
    if not url:
        continue
    html = fetch_html(url)
    if not html:
        continue
    matches = badge_re.findall(html)
    for m in matches:
        hash_part = m[0]
        name_part = m[1].lower()
        ext = m[2]
        full_url = f"https://cdn.prod.website-files.com/622a0650809cd1200f8b4f07/{hash_part}{name_part}.{ext}"

        # 过滤无关图片
        skip = False
        for sp in SKIP_PATTERNS:
            if sp.lower() in name_part.lower() or sp.lower() in full_url.lower():
                skip = True
                break
        if skip:
            continue

        if name_part not in badge_map:
            badge_map[name_part] = full_url
    time.sleep(0.25)

print(f"\nFound {len(badge_map)} unique badge images")
print("Downloading...\n")

# 下载
ok = 0
for name_part, url in sorted(badge_map.items()):
    out_path = os.path.join(OUTPUT_DIR, f"{name_part}.webp")
    if os.path.exists(out_path):
        ok += 1
        continue
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        with open(out_path, "wb") as f:
            f.write(resp.read())
        print(f"  OK: {name_part}")
        ok += 1
    except Exception as e:
        print(f"  FAIL: {name_part} - {e}")
        # 尝试 png
        png_url = url.replace(".webp", ".png")
        png_path = os.path.join(OUTPUT_DIR, f"{name_part}.png")
        try:
            req = urllib.request.Request(png_url, headers=HEADERS)
            resp = urllib.request.urlopen(req, timeout=15, context=ctx)
            with open(png_path, "wb") as f:
                f.write(resp.read())
            print(f"  OK (png): {name_part}")
            ok += 1
        except:
            pass

print(f"\nDownloaded: {ok}/{len(badge_map)}")
print(f"Saved to: {OUTPUT_DIR}")

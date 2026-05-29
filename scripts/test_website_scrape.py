"""Quick test: scrape 3 websites to verify the approach works"""
import json, os, glob, re, time, urllib.request, ssl, sys

from urllib.parse import urljoin

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

WAREHOUSE_KW = ["warehouse", "exterior", "facility", "building", "location",
                "fulfillment", "fulfilment", "center", "distribution"]

with open(os.path.join(os.path.dirname(__file__), "hero_images.json"), "r") as f:
    existing = json.load(f)


def fetch_html(url):
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return None


def has_good_hero(slug):
    hero = existing.get(slug, "")
    if hero:
        fn = hero.split("/")[-1].lower()
        return any(k in fn for k in WAREHOUSE_KW)
    return False


# Find first 5 3PLs that need scraping
files = sorted(glob.glob(os.path.join(PROFILES_DIR, "*.json")))
todo = []
for f in files:
    with open(f, "r", encoding="utf-8") as fh:
        d = json.load(fh)
    slug = d.get("slug", "")
    website = d.get("website", "")
    if website and website.startswith("http") and not has_good_hero(slug):
        todo.append((slug, website, d.get("name", "?")))
    if len(todo) >= 3:
        break

print(f"Testing {len(todo)} websites...\n")

for slug, website, name in todo:
    print(f"--- {name}: {website} ---")
    html = fetch_html(website)
    if html:
        # Find og:image
        og = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
        if not og:
            og = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', html, re.I)
        if og:
            print(f"  og:image: {urljoin(website, og.group(1))[:120]}")

        # Count images
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)', html, re.I)
        print(f"  Total <img> tags: {len(imgs)}")

        # Find large/promising images
        good = [urljoin(website, i) for i in imgs if not any(k in i.lower()
                for k in ["icon", "logo", "favicon", "avatar", "pixel", "1x1", "flag"])]
        print(f"  Non-icon images: {len(good)}")
        for g in good[:5]:
            fn = g.split("/")[-1][:60]
            print(f"    {fn}")
    else:
        print("  FAILED to fetch HTML")
    print()

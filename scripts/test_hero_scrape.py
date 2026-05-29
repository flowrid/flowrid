"""Test hero image scraper on 5 profiles"""
import json, os, glob, re, time, urllib.request, ssl

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SKIP_PATTERNS = [
    "logo", "LOGO", "fulfill.png", "badge", "avatar",
    "john-doe", "billy", "sam-glaser", "team", "Screenshot",
    "Frame", "Untitled"
]

def fetch_html(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return None

def extract_hero(html):
    if not html:
        return None
    pattern = r'https://cdn\.prod\.website-files\.com/622a0650809cd1200f8b4f07/([^"\s)]+)'
    matches = re.findall(pattern, html)
    candidates = []
    for match in matches:
        filename = match.split("/")[-1]
        skip = False
        for sp in SKIP_PATTERNS:
            if sp.lower() in filename.lower():
                skip = True
                break
        if skip or filename.endswith(".svg"):
            continue
        candidates.append(f"https://cdn.prod.website-files.com/622a0650809cd1200f8b4f07/{match}")
    return candidates[0] if candidates else None

json_files = sorted(glob.glob(os.path.join(PROFILES_DIR, "*.json")))[:5]
for f in json_files:
    with open(f, "r", encoding="utf-8") as fh:
        d = json.load(fh)
    name = d.get("name", "?")
    url = d.get("url", "")
    slug = d.get("slug", "")
    if not url:
        print(f"{name}: no URL")
        continue
    html = fetch_html(url)
    hero = extract_hero(html)
    if hero:
        print(f"[OK] {name}: {hero[:120]}")
    else:
        print(f"[NONE] {name}")
    time.sleep(0.5)

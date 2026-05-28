import json, os, urllib.request, re, concurrent.futures

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

slugs = []
for filename in sorted(os.listdir(PROFILES_DIR))[:10]:
    if filename.endswith('.json'):
        with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
            profile = json.load(f)
        slugs.append(profile.get('slug', ''))

print(f"Testing {len(slugs)} slugs...")

def fetch_logo(slug):
    url = f"https://www.fulfill.com/3pl/profile/{slug}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='ignore')
        # Find all cdn website-files URLs
        pattern = r'https://cdn\.prod\.website-files\.com/[^"\'\s]+'
        matches = re.findall(pattern, html)
        logos = [m for m in matches if 'fulfill.png' not in m.lower() and 'favicon' not in m.lower() and 'icon' not in m.lower()]
        return (slug, logos[:3])  # return first 3 candidates
    except Exception as e:
        return (slug, [f"ERROR: {e}"])

for slug in slugs:
    result_slug, logos = fetch_logo(slug)
    print(f"\n{result_slug}:")
    for l in logos:
        short = l.split('/')[-1][:60]
        print(f"  -> .../{short}")

import json, urllib.request, re

US_STATE_MAP = {
    "CA": "california", "TX": "texas", "NY": "new-york", "NJ": "new-jersey",
    "FL": "florida", "IL": "illinois", "PA": "pennsylvania", "OH": "ohio",
    "GA": "georgia", "NV": "nevada", "UT": "utah", "WA": "washington",
    "CO": "colorado", "CT": "connecticut", "WI": "wisconsin", "IN": "indiana",
    "OR": "oregon", "SC": "south-carolina", "NC": "north-carolina", "AL": "alabama",
    "NE": "nebraska", "OK": "oklahoma", "MS": "mississippi", "KY": "kentucky",
    "MI": "michigan", "MN": "minnesota", "AR": "arkansas", "ID": "idaho", "KS": "kansas",
}

def parse_loc(html):
    m = re.search(r'var locationsForMap\s*=\s*"(.*?)"', html)
    if not m:
        return None, None
    s = m.group(1).strip()
    if not s:
        return None, None
    first = s.split(";")[0].strip()
    parts = [p.strip() for p in first.split(",")]
    for i, part in enumerate(parts):
        code = part.split()[0] if part else ""
        if len(code) == 2 and code.isupper() and code in US_STATE_MAP:
            if i > 0:
                city = parts[i - 1].strip()
                if re.search(r'\d', city) or len(city) < 2:
                    if i > 1:
                        city = parts[i - 2].strip()
                city = re.sub(r'^(Ste|Suite|Unit|Apt|Building|Bldg)\s+', '', city)
                if city and len(city) >= 2 and not re.match(r'^[\d\s#.-]+$', city):
                    return city, US_STATE_MAP[code]
            break
    return None, None

# Test with problematic cases
test_slugs = [
    "ironlink-logistics", "3plguys", "green-e-commerce",
    "full-tilt-logistics", "3gistix", "total-biz-fulfillment",
    "shiprocket-fulfillment", "007cargo"
]
for slug in test_slugs:
    url = f"https://www.fulfill.com/3pl/profile/{slug}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode("utf-8", errors="ignore")
        city, state = parse_loc(html)
        lm = re.search(r'var locationsForMap\s*=\s*"(.*?)"', html)
        raw = (lm.group(1)[:80] if lm else "NOT FOUND")
        print(f"{slug}: city={city}, state={state}")
        print(f"  raw: {raw}")
    except Exception as e:
        print(f"{slug}: ERROR {e}")
    print()

import json, os, urllib.request, time, re

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

US_STATE_MAP = {
    "AL": "alabama", "AK": "alaska", "AZ": "arizona", "AR": "arkansas",
    "CA": "california", "CO": "colorado", "CT": "connecticut",
    "DE": "delaware", "FL": "florida", "GA": "georgia", "HI": "hawaii",
    "ID": "idaho", "IL": "illinois", "IN": "indiana", "IA": "iowa",
    "KS": "kansas", "KY": "kentucky", "LA": "louisiana", "ME": "maine",
    "MD": "maryland", "MA": "massachusetts", "MI": "michigan",
    "MN": "minnesota", "MS": "mississippi", "MO": "missouri",
    "MT": "montana", "NE": "nebraska", "NV": "nevada",
    "NH": "new-hampshire", "NJ": "new-jersey", "NM": "new-mexico",
    "NY": "new-york", "NC": "north-carolina", "ND": "north-dakota",
    "OH": "ohio", "OK": "oklahoma", "OR": "oregon", "PA": "pennsylvania",
    "RI": "rhode-island", "SC": "south-carolina",
    "SD": "south-dakota", "TN": "tennessee", "TX": "texas",
    "UT": "utah", "VT": "vermont", "VA": "virginia", "WA": "washington",
    "WV": "west-virginia", "WI": "wisconsin", "WY": "wyoming",
}

def parse_locations_for_map(html):
    match = re.search(r'var locationsForMap\s*=\s*"(.*?)"', html)
    if not match:
        return None, None
    locations_str = match.group(1).strip()
    if not locations_str:
        return None, None
    first_location = locations_str.split(";")[0].strip()

    # US 格式: 逗号+城市+逗号+州代码(2大写字母)
    us_match = re.search(r',\s*([A-Za-z][A-Za-z\s\.\'-]+?),\s*([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?(?:,?\s*US)?\s*$', first_location)
    if us_match:
        city = us_match.group(1).strip()
        state_code = us_match.group(2).upper()
        state = US_STATE_MAP.get(state_code)
        if state:
            return city, state

    # 简单格式: 尾部 ", XX" 两字母
    simple_match = re.search(r',\s*([A-Z]{2})$', first_location)
    if simple_match:
        state_code = simple_match.group(1).upper()
        state = US_STATE_MAP.get(state_code)
        if state:
            city_part = first_location[:simple_match.start()].strip()
            parts = [p.strip() for p in city_part.split(",")]
            city = parts[-1] if parts else city_part
            return city, state

    # 非 US 格式: "CityName, CountryName"
    non_us = re.search(r'([A-Za-z\s\'-]+),\s*([A-Za-z\s]+)$', first_location)
    if non_us:
        city = non_us.group(1).strip()
        country = non_us.group(2).strip()
        if country.lower() not in US_STATE_MAP and country.lower() != 'us':
            return city, None

    return None, None


def extract_description(html):
    match = re.search(
        r'<div class="detailed-page_location_sub-title text-align-left">(.*?)</div>',
        html, re.DOTALL
    )
    if match:
        desc = match.group(1).strip()
        desc = desc.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        desc = desc.replace('&#x27;', "'").replace('&quot;', '"').replace('&#39;', "'")
        desc = re.sub(r'<[^>]+>', '', desc)
        desc = desc.strip()
        if desc and len(desc) > 20:
            bp = [r'has fulfillment centers? strategically located',
                  r'offers (premier |)3PL services? with a',
                  r'provides fulfillment services? across']
            if not any(re.search(p, desc.lower()) for p in bp):
                return desc
    return ""


# Test with 10 random profiles
import random
files = [f for f in os.listdir(PROFILES_DIR) if f.endswith('.json')]
samples = random.sample(files, 10)

print("Testing extraction on 10 random profiles...\n")
for filename in samples:
    filepath = os.path.join(PROFILES_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        profile = json.load(f)
    slug = profile.get('slug', '')
    if not slug:
        continue

    # Current data
    old_city = profile.get('city', '') or ''
    old_desc = (profile.get('description') or '')[:80]

    # Fetch and extract
    url = f"https://www.fulfill.com/3pl/profile/{slug}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='ignore')
        city, state = parse_locations_for_map(html)
        desc = extract_description(html)

        print(f"  {slug}:")
        print(f"    OLD: city={old_city[:30]}")
        print(f"    NEW: city={city}, state={state}")
        print(f"    DESC: {(desc or 'NOT FOUND')[:100]}")
        print()
    except Exception as e:
        print(f"  {slug}: ERROR - {e}")
        print()

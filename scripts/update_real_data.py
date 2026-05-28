import json, os, urllib.request, re, sys

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
SCRAPED_FILE = r"E:\Flowrid\flowrid\scripts\scraped_locations.json"

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
KNOWN_STATES = set(US_STATE_MAP.values())

# State name → slug reverse map
STATE_NAME_TO_SLUG = {}
for code, slug in US_STATE_MAP.items():
    STATE_NAME_TO_SLUG[slug] = slug
    # Also add display names
    display = slug.replace("-", " ").title()
    STATE_NAME_TO_SLUG[display.lower()] = slug

# Full state names
STATE_NAMES = {
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
    "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine",
    "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
    "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey",
    "new mexico", "new york", "north carolina", "north dakota", "ohio",
    "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
    "south dakota", "tennessee", "texas", "utah", "vermont", "virginia",
    "washington", "west virginia", "wisconsin", "wyoming",
}


def extract_city_state_from_desc(text):
    """从描述中提取 city 和 state"""
    if not text:
        return None, None

    # 模式1: "CityName-based"
    m = re.search(r'\b([A-Z][A-Za-z\s\.\'-]+?)-based\b', text)
    if m:
        city = m.group(1).strip()
        if city.lower() not in KNOWN_STATES and len(city) >= 3:
            # 去掉前面的 "is a", "a" 等
            city = re.sub(r'^(is\s+a|a|an)\s+', '', city)
            return city, None

    # 模式2: "in CityName, ST"
    m = re.search(
        r'\b(?:in|at|near)\s+([A-Z][A-Za-z\s\.\'-]+?),\s*([A-Z]{2})\b',
        text
    )
    if m:
        city = m.group(1).strip()
        code = m.group(2).upper()
        state = US_STATE_MAP.get(code)
        if state and city.lower() not in KNOWN_STATES:
            return city, state

    # 模式3: "in CityName, FullStateName"
    for state_name in STATE_NAMES:
        pattern = rf'\b(?:in|at|near)\s+([A-Z][A-Za-z\s\.\'-]+?),\s*{re.escape(state_name)}\b'
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            city = m.group(1).strip()
            slug = state_name.replace(" ", "-")
            if city.lower() not in KNOWN_STATES:
                return city, slug

    # 模式4: "in StateName" — 例如 "in Connecticut", "in California"
    m = re.search(
        r'\b(?:in|of|across)\s+((?:New|North|South|West|East|Rhode)\s+)?([A-Z][a-z]+)\b',
        text
    )
    if m:
        full = (m.group(1) or "") + m.group(2)
        slug = full.strip().lower().replace(" ", "-")
        if slug in KNOWN_STATES:
            return None, slug

    return None, None


print("Loading scraped data...")
with open(SCRAPED_FILE, 'r', encoding='utf-8') as f:
    scraped = json.load(f)
print(f"Loaded {len(scraped)} scrape results")

# 统计
has_city = sum(1 for v in scraped.values() if v.get('city'))
has_state = sum(1 for v in scraped.values() if v.get('state'))
has_desc = sum(1 for v in scraped.values() if v.get('description'))
print(f"Before desc-extraction: {has_city} cities, {has_state} states, {has_desc} descriptions")

# 从描述中提取补充
desc_extracted = 0
desc_state_extracted = 0
for slug, data in scraped.items():
    if not data.get('city') and data.get('description'):
        city, state = extract_city_state_from_desc(data['description'])
        if city:
            data['city'] = city
            desc_extracted += 1
        if state and not data.get('state'):
            data['state'] = state
            desc_state_extracted += 1

has_city2 = sum(1 for v in scraped.values() if v.get('city'))
has_state2 = sum(1 for v in scraped.values() if v.get('state'))
print(f"After desc-extraction: {has_city2} cities (+{has_city2-has_city}), {has_state2} states (+{has_state2-has_state})")

# ============================================================
# 更新 JSON 文件和 Supabase
# ============================================================
print("\nUpdating local JSON files and Supabase...")

slug_to_file = {}
for fn in os.listdir(PROFILES_DIR):
    if fn.endswith('.json'):
        slug_to_file[fn.replace('.json', '')] = fn

updated_json = 0
updated_db = 0
errors = 0

for i, (slug, data) in enumerate(scraped.items()):
    city = data.get('city')
    state = data.get('state')
    description = data.get('description')

    if not city and not state and not description:
        continue

    # 1) 更新本地 JSON
    filename = slug_to_file.get(slug)
    if filename:
        filepath = os.path.join(PROFILES_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                profile = json.load(f)
            changed = False
            if city and profile.get('city') != city:
                profile['city'] = city
                changed = True
            if state and profile.get('state') != state:
                profile['state'] = state
                changed = True
            if description and profile.get('description') != description:
                profile['description'] = description
                changed = True
            if changed:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(profile, f, ensure_ascii=False, indent=2)
                updated_json += 1
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  JSON error {filename}: {e}")

    # 2) 更新 Supabase
    patch_data = {}
    if city:
        patch_data['city'] = city
    if state:
        patch_data['state'] = state
    if description:
        patch_data['description'] = description

    if patch_data:
        patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
        body = json.dumps(patch_data).encode('utf-8')
        req = urllib.request.Request(patch_url, data=body, method='PATCH')
        req.add_header('apikey', SERVICE_KEY)
        req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Prefer', 'return=minimal')
        try:
            urllib.request.urlopen(req)
            updated_db += 1
        except Exception as e:
            errors += 1
            if errors <= 10:
                print(f"  DB error {slug}: {e}")

    if (i + 1) % 500 == 0:
        print(f"  {i+1}/{len(scraped)} | JSON:{updated_json} DB:{updated_db} err:{errors}")

print(f"\n=== UPDATE COMPLETE ===")
print(f"JSON files updated: {updated_json}")
print(f"DB records updated: {updated_db}")
print(f"Errors: {errors}")

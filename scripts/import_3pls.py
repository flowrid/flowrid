import json, os, urllib.request, time, re

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

# US State name → slug mapping
US_STATES = {
    "alabama": "alabama", "alaska": "alaska", "arizona": "arizona", "arkansas": "arkansas",
    "california": "california", "colorado": "colorado", "connecticut": "connecticut",
    "delaware": "delaware", "florida": "florida", "georgia": "georgia", "hawaii": "hawaii",
    "idaho": "idaho", "illinois": "illinois", "indiana": "indiana", "iowa": "iowa",
    "kansas": "kansas", "kentucky": "kentucky", "louisiana": "louisiana", "maine": "maine",
    "maryland": "maryland", "massachusetts": "massachusetts", "michigan": "michigan",
    "minnesota": "minnesota", "mississippi": "mississippi", "missouri": "missouri",
    "montana": "montana", "nebraska": "nebraska", "nevada": "nevada",
    "new-hampshire": "new-hampshire", "new-jersey": "new-jersey", "new-mexico": "new-mexico",
    "new-york": "new-york", "north-carolina": "north-carolina", "north-dakota": "north-dakota",
    "ohio": "ohio", "oklahoma": "oklahoma", "oregon": "oregon", "pennsylvania": "pennsylvania",
    "rhode-island": "rhode-island", "south-carolina": "south-carolina",
    "south-dakota": "south-dakota", "tennessee": "tennessee", "texas": "texas",
    "utah": "utah", "vermont": "vermont", "virginia": "virginia", "washington": "washington",
    "west-virginia": "west-virginia", "wisconsin": "wisconsin", "wyoming": "wyoming",
}

# Known platforms to detect in specialties
PLATFORM_KEYWORDS = {
    "shopify": "shopify", "amazon": "amazon", "tiktok": "tiktok", "walmart": "walmart",
    "ebay": "ebay", "etsy": "etsy", "shein": "shein", "temu": "temu",
    "chewy": "chewy", "wayfair": "wayfair", "whatnot": "whatnot",
    "fba": "amazon", "fbm": "amazon", "woocommerce": "woocommerce",
    "bigcommerce": "bigcommerce", "magento": "magento", "macy": "macys",
}

# Known categories to detect in specialties
CATEGORY_KEYWORDS = {
    "apparel": "apparel", "clothing": "apparel", "fashion": "apparel", "footwear": "apparel",
    "electronics": "electronics",
    "food": "food", "beverage": "food", "grocery": "food", "snack": "food",
    "beauty": "beauty", "cosmetics": "beauty", "health": "beauty", "skincare": "beauty",
    "home": "home", "garden": "home", "furniture": "home",
    "toys": "toys", "hobbies": "toys", "game": "toys",
    "sports": "sports", "outdoors": "sports", "fitness": "sports",
    "jewelry": "jewelry", "jewellery": "jewelry",
    "big": "home", "bulky": "home",
    "auto": "automotive", "automotive": "automotive",
    "pet": "pets", "pets": "pets",
    "book": "books", "books": "books",
    "supplement": "beauty", "vitamin": "beauty", "cbd": "beauty",
    "pharmaceutical": "pharma", "medical": "pharma", "pharma": "pharma",
}

def extract_state(specialties, locations):
    """Extract US state from specialties or locations"""
    # Try specialties first
    for s in specialties:
        s_lower = s.lower().replace(" 3pl", "")
        for state_name, state_slug in US_STATES.items():
            if state_name in s_lower or state_slug.replace("-", " ") in s_lower:
                return state_slug

    # Try locations
    if isinstance(locations, list):
        for loc in locations:
            if isinstance(loc, dict):
                state = loc.get("state", "")
                if state:
                    state_slug = state.lower().replace(" ", "-")
                    if state_slug in US_STATES.values():
                        return state_slug
                    # Try reverse lookup
                    for sn, ss in US_STATES.items():
                        if sn in state_slug or state_slug in sn:
                            return ss

    return "california"  # default

def extract_city(locations):
    """Extract city from locations"""
    if isinstance(locations, list):
        for loc in locations:
            if isinstance(loc, dict):
                city = loc.get("city", "")
                if city and len(city) > 1:
                    return city
    return ""

def extract_country(locations, specialties):
    """Extract country"""
    # Check locations first
    if isinstance(locations, list):
        for loc in locations:
            if isinstance(loc, dict):
                country = loc.get("country", "")
                if country and country.lower() in ("us", "usa", "united states", "united states of america"):
                    return "US"
                if country and country.lower() in ("ca", "canada"):
                    return "CA"
                if country and country.lower() in ("uk", "united kingdom", "gb"):
                    return "UK"
                if country and country.lower() in ("au", "australia"):
                    return "AU"
                if country and country.lower() in ("mx", "mexico"):
                    return "MX"

    # Check specialties for country hints
    for s in specialties:
        s_lower = s.lower()
        if "canada" in s_lower:
            return "CA"
        if "united kingdom" in s_lower or "uk " in s_lower:
            return "UK"
        if "australia" in s_lower:
            return "AU"
        if "mexico" in s_lower:
            return "MX"

    return "US"

def extract_platforms(specialties):
    """Extract e-commerce platforms from specialties"""
    platforms = set()
    for s in specialties:
        s_lower = s.lower()
        for keyword, platform in PLATFORM_KEYWORDS.items():
            if keyword in s_lower:
                platforms.add(platform)
    if not platforms:
        platforms.add("shopify")  # default, most common
    return sorted(list(platforms))

def extract_categories(specialties):
    """Extract product categories from specialties"""
    cats = set()
    for s in specialties:
        s_lower = s.lower().replace(" 3pl", "").strip()
        for keyword, category in CATEGORY_KEYWORDS.items():
            if keyword in s_lower:
                cats.add(category)
    if not cats:
        cats.add("apparel")
    return sorted(list(cats))

def extract_shipping_speed(profile):
    """Estimate shipping speed from profile data"""
    desc = profile.get("description", "").lower()
    if "same day" in desc or "same-day" in desc:
        return "1-2 days"
    if "next day" in desc or "overnight" in desc:
        return "1-2 days"
    if "2-day" in desc or "two day" in desc or "2 day" in desc:
        return "2-3 days"
    return "3-5 days"

def extract_cost_level(profile):
    """Estimate cost level based on rating"""
    rating = profile.get("rating")
    if rating is None:
        return "$$"
    if rating >= 4.5:
        return "$$$"
    if rating >= 3.5:
        return "$$"
    return "$"

def transform_profile(profile):
    """Transform a fulfill.com profile to pl_providers row"""
    specialties = profile.get("specialties", [])
    if not isinstance(specialties, list):
        specialties = []
    locations = profile.get("locations", [])
    if not isinstance(locations, list):
        locations = []
    tags = profile.get("tags", [])
    if not isinstance(tags, list):
        tags = []
    wh_count = profile.get("warehouseCount", 1) or 1

    state = extract_state(specialties, locations)
    city = extract_city(locations)
    country = extract_country(locations, specialties)
    platforms = extract_platforms(specialties)
    categories = extract_categories(specialties)

    # If no city found, use state name
    if not city:
        city = state.replace("-", " ").title()

    slug = profile.get("slug", "").strip().lower()
    if not slug:
        slug = profile.get("name", "unknown").strip().lower().replace(" ", "-").replace(".", "")[:80]

    return {
        "name": profile.get("name", "").strip() or "Unknown 3PL",
        "slug": slug,
        "state": state,
        "city": city or state.replace("-", " ").title(),
        "categories": categories,
        "platforms": platforms,
        "shipping_speed": extract_shipping_speed(profile),
        "cost_level": extract_cost_level(profile),
        "rating": profile.get("rating") or 3.0,
        "review_count": profile.get("reviewCount") or 0,
        "order_capacity": wh_count * 5000,
        "sku_capacity": wh_count * 2000,
        "integrations": platforms,
        "description": profile.get("description", "").strip() or f"Fulfillment center in {city}",
        "website": profile.get("website", ""),
        "logo": profile.get("logo", ""),
    }

def upsert_provider(provider_data):
    """Upsert a single provider into Supabase"""
    slug = provider_data["slug"]
    url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"

    # First check if exists
    check_req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}&select=id")
    check_req.add_header('apikey', SERVICE_KEY)
    check_req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    try:
        resp = urllib.request.urlopen(check_req)
        existing = json.loads(resp.read())
        if existing:
            # Update existing record
            data = json.dumps(provider_data).encode('utf-8')
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}",
                data=data, method='PATCH'
            )
            req.add_header('apikey', SERVICE_KEY)
            req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
            req.add_header('Content-Type', 'application/json')
            req.add_header('Prefer', 'return=minimal')
            urllib.request.urlopen(req)
            return "updated"
    except:
        pass

    # Insert new record
    data = json.dumps(provider_data).encode('utf-8')
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/pl_providers",
        data=data, method='POST'
    )
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    try:
        urllib.request.urlopen(req)
        return "inserted"
    except Exception as e:
        return f"error: {e}"

# Main import
files = sorted(os.listdir(PROFILES_DIR))
total = len(files)
print(f"Total profiles to import: {total}")

inserted = 0
updated = 0
errors = 0
batch = []

for i, filename in enumerate(files):
    if not filename.endswith('.json'):
        continue

    filepath = os.path.join(PROFILES_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            profile = json.load(f)
    except:
        errors += 1
        continue

    if not profile.get('name'):
        continue

    provider = transform_profile(profile)

    try:
        result = upsert_provider(provider)
        if result == "inserted":
            inserted += 1
        elif result == "updated":
            updated += 1
        else:
            errors += 1
    except Exception as e:
        errors += 1
        if errors < 5:
            print(f"  Error on {filename}: {e}")

    # Progress every 100
    if (i + 1) % 100 == 0:
        print(f"Progress: {i+1}/{total} | inserted: {inserted} updated: {updated} errors: {errors}")
        time.sleep(0.5)  # rate limit buffer

print(f"\n=== IMPORT COMPLETE ===")
print(f"Inserted: {inserted}")
print(f"Updated: {updated}")
print(f"Errors: {errors}")
print(f"Total processed: {inserted + updated + errors}")

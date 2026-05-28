import json, os, urllib.request

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

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
    # Also kebab versions
    "new-hampshire", "new-jersey", "new-mexico", "new-york",
    "north-carolina", "north-dakota", "south-carolina", "south-dakota",
    "west-virginia", "rhode-island",
}

def is_placeholder_city(city):
    """Check if city is actually a state name (placeholder)"""
    if not city:
        return False
    city_lower = city.lower().strip()
    return city_lower in STATE_NAMES

print("Checking for placeholder cities...")
cleaned_json = 0
cleaned_db = 0

for filename in os.listdir(PROFILES_DIR):
    if not filename.endswith('.json'):
        continue

    filepath = os.path.join(PROFILES_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            profile = json.load(f)
    except:
        continue

    city = profile.get('city', '')
    slug = profile.get('slug', '')

    if not is_placeholder_city(city):
        continue

    # City is a placeholder — clear it
    profile['city'] = ''

    # Update JSON
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)
    cleaned_json += 1

    # Update Supabase
    if slug:
        patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
        body = json.dumps({"city": ""}).encode('utf-8')
        req = urllib.request.Request(patch_url, data=body, method='PATCH')
        req.add_header('apikey', SERVICE_KEY)
        req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Prefer', 'return=minimal')
        try:
            urllib.request.urlopen(req)
            cleaned_db += 1
        except Exception as e:
            print(f"  DB error {slug}: {e}")

    if cleaned_json % 200 == 0:
        print(f"  Cleaned: {cleaned_json} JSON / {cleaned_db} DB")

print(f"\n=== DONE ===")
print(f"JSON cleaned: {cleaned_json}")
print(f"DB cleaned: {cleaned_db}")

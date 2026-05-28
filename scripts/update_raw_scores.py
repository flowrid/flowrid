import json, os, urllib.request

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

def calculate_score(profile):
    score = 0
    wh = profile.get('warehouseCount') or 0
    if wh >= 21: score += 25
    elif wh >= 11: score += 20
    elif wh >= 6: score += 15
    elif wh >= 3: score += 10
    elif wh >= 1: score += 5
    locs = profile.get('locations', [])
    if isinstance(locs, list):
        lc = len(locs)
        if lc >= 11: score += 5
        elif lc >= 6: score += 3
        elif lc >= 3: score += 1

    specialties = profile.get('specialties', [])
    if isinstance(specialties, list):
        sc = len(specialties)
        if sc >= 46: score += 20
        elif sc >= 36: score += 16
        elif sc >= 31: score += 12
        elif sc >= 26: score += 8
        elif sc >= 21: score += 5
        else: score += 3

    clients = profile.get('clients', [])
    if isinstance(clients, list):
        cc = len(clients)
        if cc >= 16: score += 20
        elif cc >= 9: score += 15
        elif cc >= 6: score += 10
        elif cc >= 5: score += 5

    tags = profile.get('tags', [])
    if isinstance(tags, list):
        tag_str = ' '.join(tags).lower()
        if '10,000+ matches' in tag_str: score += 10
        if 'enterprise' in tag_str: score += 5
        if 'midmarket' in tag_str: score += 3
        tag_count = len([t for t in tags if t and len(t) > 2])
        if tag_count >= 4: score += 2

    reviews = profile.get('reviewCount') or 0
    if reviews >= 11: score += 10
    elif reviews >= 1: score += 5

    rating = profile.get('rating') or 3.0
    if rating >= 4.5: score += 5
    elif rating >= 4.0: score += 2

    return min(score, 100)

# Calculate scores
scores = {}
for filename in os.listdir(PROFILES_DIR):
    if not filename.endswith('.json'):
        continue
    with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
        profile = json.load(f)
    slug = profile.get('slug', '')
    if slug:
        scores[slug] = calculate_score(profile)

print(f"Calculated {len(scores)} scores")
print(f"Range: {min(scores.values())} - {max(scores.values())}")

# Update DB with raw score as rating
updated = 0
for slug, score in scores.items():
    patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
    data = json.dumps({"rating": float(score)}).encode('utf-8')
    req = urllib.request.Request(patch_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    try:
        urllib.request.urlopen(req)
        updated += 1
    except:
        pass
    if updated % 500 == 0:
        print(f"  {updated}/{len(scores)}")

print(f"Updated: {updated}")

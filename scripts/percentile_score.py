import json, os, urllib.request, math

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

def calculate_raw_score(profile):
    """Raw score based on objective data (0-100 scale)"""
    score = 0

    # 1. Warehouse Scale (0-30)
    wh = profile.get('warehouseCount') or 0
    if wh >= 51: score += 30
    elif wh >= 21: score += 26
    elif wh >= 11: score += 22
    elif wh >= 7: score += 18
    elif wh >= 4: score += 15
    elif wh >= 2: score += 10
    elif wh >= 1: score += 5

    # Location bonus (fallback for missing warehouse count)
    locs = profile.get('locations', [])
    if isinstance(locs, list):
        lc = len(locs)
        if lc >= 11: score += 5
        elif lc >= 6: score += 3
        elif lc >= 3: score += 2

    # 2. Specialty Breadth (0-25)
    specialties = profile.get('specialties', [])
    if isinstance(specialties, list):
        sc = len(specialties)
        if sc >= 51: score += 25
        elif sc >= 41: score += 20
        elif sc >= 36: score += 16
        elif sc >= 31: score += 12
        elif sc >= 26: score += 8
        elif sc >= 21: score += 5
        else: score += 3

    # 3. Client Base (0-20)
    clients = profile.get('clients', [])
    if isinstance(clients, list):
        cc = len(clients)
        if cc >= 16: score += 20
        elif cc >= 9: score += 15
        elif cc >= 6: score += 10
        elif cc >= 5: score += 5

    # 4. Tag Quality (0-15)
    tags = profile.get('tags', [])
    if isinstance(tags, list):
        tag_str = ' '.join(tags).lower()
        if '10,000+ matches' in tag_str: score += 6
        if 'enterprise' in tag_str: score += 5
        if 'midmarket' in tag_str: score += 2
        real_tags = [t for t in tags if t and len(t) > 2]
        if len(real_tags) >= 4: score += 2

    # 5. Review Volume (0-10)
    reviews = profile.get('reviewCount') or 0
    if reviews >= 11: score += 10
    elif reviews >= 1: score += 5

    return min(score, 100)

print("Calculating raw scores...")

# Step 1: Calculate raw scores for all profiles
slugs = []
raw_scores = {}
for filename in os.listdir(PROFILES_DIR):
    if not filename.endswith('.json'):
        continue
    with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
        profile = json.load(f)
    slug = profile.get('slug', '')
    name = profile.get('name', '')
    if slug:
        raw = calculate_raw_score(profile)
        raw_scores[slug] = raw
        slugs.append(slug)

print(f"Profiles scored: {len(raw_scores)}")
print(f"Raw range: {min(raw_scores.values())} - {max(raw_scores.values())}")

# Step 2: Sort by raw score and assign percentile ranks
sorted_slugs = sorted(slugs, key=lambda s: raw_scores[s])
n = len(sorted_slugs)

# Step 3: Map percentile to final score (20-95 range with curve)
# Use a non-linear mapping for better distribution
final_scores = {}
for i, slug in enumerate(sorted_slugs):
    percentile = i / (n - 1)  # 0.0 to 1.0

    # Curve: compress middle, expand edges slightly
    # Target: bottom 10% → 20-30, middle 80% → 30-80, top 10% → 80-95
    if percentile <= 0.10:
        # Bottom 10%: map 0-0.10 → 20-35
        final = 20 + (percentile / 0.10) * 15
    elif percentile <= 0.90:
        # Middle 80%: map 0.10-0.90 → 35-75
        final = 35 + ((percentile - 0.10) / 0.80) * 40
    else:
        # Top 10%: map 0.90-1.00 → 75-95
        final = 75 + ((percentile - 0.90) / 0.10) * 20

    final_scores[slug] = round(final)

print(f"Final range: {min(final_scores.values())} - {max(final_scores.values())}")

# Show distribution
from collections import Counter
dist = Counter()
for s in final_scores.values():
    bucket = (s // 5) * 5
    dist[bucket] += 1

print("\nFinal score distribution:")
for bucket in sorted(dist.keys()):
    count = dist[bucket]
    bar = '#' * (count // 20)
    print(f"  {bucket:3d}-{bucket+4:3d}: {count:4d} {bar}")

# Update database
print("\nUpdating database...")
updated = 0
errors = 0
for slug, score in final_scores.items():
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
        errors += 1
    if (updated + errors) % 500 == 0:
        print(f"  {updated + errors}/{len(final_scores)}")

print(f"\n=== DONE ===")
print(f"Updated: {updated}, Errors: {errors}")

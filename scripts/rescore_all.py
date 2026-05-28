import json, os, urllib.request, time, random, sys

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

def calculate_score(profile):
    """客观评分系统 (0-100)

    评分档次（百分位分布）:
    - 90-100: 前 3%（顶级 3PL）
    - 80-89:  前 15%（优秀 3PL）
    - 70-79:  前 50%（良好 3PL）
    - 60-69:  前 80%（可靠 3PL）
    - 50-59:  后 20%（发展中 3PL）
    """
    score = 0

    # 1. Warehouse Scale (0-25) — 最重要的区分维度
    wh = profile.get('warehouseCount') or 0
    if wh >= 21: score += 25
    elif wh >= 11: score += 22
    elif wh >= 6: score += 18
    elif wh >= 3: score += 13
    elif wh >= 1: score += 7

    locs = profile.get('locations', [])
    if isinstance(locs, list):
        loc_count = len(locs)
        if loc_count >= 11: score += 3
        elif loc_count >= 6: score += 2
        elif loc_count >= 3: score += 1

    # 2. Specialty Breadth (0-20)
    specialties = profile.get('specialties', [])
    if isinstance(specialties, list):
        sc = len(specialties)
        if sc >= 46: score += 20
        elif sc >= 36: score += 17
        elif sc >= 31: score += 13
        elif sc >= 21: score += 8
        elif sc >= 11: score += 4
        else: score += 1

    # 3. Client Base (0-20)
    clients = profile.get('clients', [])
    if isinstance(clients, list):
        cc = len(clients)
        if cc >= 16: score += 20
        elif cc >= 10: score += 17
        elif cc >= 6: score += 13
        elif cc >= 3: score += 8
        elif cc >= 1: score += 4

    # 4. Tag Quality (0-20)
    tags = profile.get('tags', [])
    if isinstance(tags, list):
        tag_str = ' '.join(tags).lower()
        if '10,000+ matches' in tag_str: score += 16
        elif 'enterprise' in tag_str: score += 12
        elif 'midmarket' in tag_str: score += 7
        else: score += 3
        # bonus for multiple high-quality tags
        if '10,000+ matches' in tag_str and 'enterprise' in tag_str: score += 4
        elif '10,000+ matches' in tag_str and 'midmarket' in tag_str: score += 2

    # 5. Review Volume (0-10)
    reviews = profile.get('reviewCount') or 0
    if reviews >= 11: score += 10
    elif reviews >= 1: score += 5

    # 6. Rating Bonus (0-5)
    rating = profile.get('rating') or 3.0
    if rating >= 4.5: score += 5
    elif rating >= 4.0: score += 3

    return score


def map_to_percentile_tier(raw_scores):
    """将原始分数按百分位映射到最终 50-100 分"""
    sorted_slugs = sorted(raw_scores.keys(), key=lambda s: raw_scores[s])
    n = len(sorted_slugs)

    final_scores = {}
    for rank, slug in enumerate(sorted_slugs):
        percentile = (rank / n) * 100  # 0 = lowest, 100 = highest

        # 百分位 → 最终分数
        if percentile >= 97:      # 前 3%
            # 90-100 spread
            sub_pct = (percentile - 97) / 3  # 0 to 1
            final = 90 + round(sub_pct * 10)
        elif percentile >= 85:    # 前 3%-15%
            sub_pct = (percentile - 85) / 12
            final = 80 + round(sub_pct * 10)
        elif percentile >= 50:    # 前 15%-50%
            sub_pct = (percentile - 50) / 35
            final = 70 + round(sub_pct * 10)
        elif percentile >= 20:    # 前 50%-80%
            sub_pct = (percentile - 20) / 30
            final = 60 + round(sub_pct * 10)
        else:                     # 后 20%
            sub_pct = percentile / 20
            final = 50 + round(sub_pct * 10)

        final_scores[slug] = min(final, 99)

    return final_scores

# Process all profiles
print("Calculating raw scores for all profiles...")
raw_scores = {}
for filename in os.listdir(PROFILES_DIR):
    if not filename.endswith('.json'):
        continue
    with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
        profile = json.load(f)
    slug = profile.get('slug', '')
    if slug:
        raw_scores[slug] = calculate_score(profile)

# Show raw distribution
from collections import Counter
raw_dist = Counter()
for s in raw_scores.values():
    bucket = (s // 5) * 5
    raw_dist[bucket] += 1

print(f"\nTotal scored: {len(raw_scores)}", flush=True)
print("\nRaw score distribution:", flush=True)
for bucket in sorted(raw_dist.keys()):
    count = raw_dist[bucket]
    bar = '#' * (count // 10)
    print(f"  {bucket:3d}-{bucket+4:3d}: {count:4d} {bar}", flush=True)

# Map to percentile-based final scores
print("\nMapping to percentile tiers (90/80/70/60/50)...")
final_scores = map_to_percentile_tier(raw_scores)

# Show final distribution
final_dist = Counter()
for s in final_scores.values():
    bucket = (s // 5) * 5
    final_dist[bucket] += 1

print("\nFinal score distribution:", flush=True)
for bucket in sorted(final_dist.keys()):
    count = final_dist[bucket]
    bar = '#' * (count // 10)
    label = f"{bucket:3d}-{bucket+4:3d}"
    tier = " [90档]" if bucket >= 90 else (" [80档]" if bucket >= 80 else (" [70档]" if bucket >= 70 else (" [60档]" if bucket >= 60 else " [50档]")))
    print(f"  {label}: {count:4d} {bar}{tier}", flush=True)

# Update database with final scores
print("\nUpdating ratings in database (percentile-based 0-100 scores)...")
updated = 0
errors = 0

for slug, rating in final_scores.items():
    patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
    data = json.dumps({"rating": rating}).encode('utf-8')
    req = urllib.request.Request(patch_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    try:
        urllib.request.urlopen(req, timeout=15)
        updated += 1
    except Exception as e:
        errors += 1
        if errors <= 5:
            print(f"  Error on {slug}: {e}", flush=True)
    if (updated + errors) % 100 == 0:
        print(f"  Progress: {updated + errors}/{len(final_scores)} | updated:{updated} errors:{errors}", flush=True)

print(f"\n=== DONE ===")
print(f"Updated: {updated}")
print(f"Errors: {errors}")

# Show some examples
print("\nExample scores (0-100):")
samples = random.sample(list(final_scores.items()), 10)
for slug, score in sorted(samples, key=lambda x: -x[1]):
    print(f"  {slug}: Ops Score={score}/100")

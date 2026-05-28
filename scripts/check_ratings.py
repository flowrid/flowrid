import urllib.request, json
from collections import Counter

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Get rating distribution
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=rating&limit=3000")
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

ratings = [item.get('rating', 0) or 0 for item in data]
print(f"Total records: {len(ratings)}")
print(f"Rating range: {min(ratings):.1f} - {max(ratings):.1f}")

# Distribution
buckets = Counter()
for r in ratings:
    bucket = round(r * 2) / 2  # round to nearest 0.5
    buckets[bucket] += 1

print("\nRating distribution:")
for rating in sorted(buckets.keys()):
    count = buckets[rating]
    bar = '#' * (count // 20)
    print(f"  {rating:4.1f}: {count:5d} ({count/len(ratings)*100:5.1f}%) {bar}")

# Check sample scores
print("\nSample providers with extreme ratings:")
req2 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=name,rating,review_count,shipping_speed,cost_level,categories,platforms,state&or=(rating.gte.4.9,rating.lte.3.1)&limit=10")
req2.add_header('apikey', SERVICE_KEY)
req2.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp2 = urllib.request.urlopen(req2)
samples = json.loads(resp2.read())
for s in samples:
    cats = ', '.join(s.get('categories', [])[:3])
    print(f"  {s['name']}: rating={s['rating']}, reviews={s.get('review_count',0)}, speed={s.get('shipping_speed','')}, cats={cats}")

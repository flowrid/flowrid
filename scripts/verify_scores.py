import urllib.request, json
from collections import Counter

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=rating&limit=3000")
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

ratings = [item['rating'] for item in data if item.get('rating') is not None]
print(f"Records with ratings: {len(ratings)}")
print(f"Range: {min(ratings):.0f} - {max(ratings):.0f}")

# Distribution in 5-point buckets
dist = Counter()
for r in ratings:
    bucket = (int(r) // 5) * 5
    dist[bucket] += 1

print("\nScore distribution (5-point buckets):")
for bucket in sorted(dist.keys()):
    count = dist[bucket]
    bar = '#' * (count // 20)
    print(f"  {bucket:3d}-{bucket+4:3d}: {count:4d} {bar}")

# Also show exact values for a sampling
import random
samples = random.sample(ratings, min(20, len(ratings)))
print(f"\nSample ratings: {sorted(samples)[:10]}")

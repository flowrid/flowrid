import json, urllib.request
from collections import Counter

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjIwMTUsImV4cCI6MjA5NDYzODAxNX0.PApacanvLxJhR8iiuFYoUEOTPCXz3fegPwQPmne2GHw"

def fetch_all(table, select="*", limit=1000):
    all_data = []
    offset = 0
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}&limit={limit}&offset={offset}"
        req = urllib.request.Request(url)
        req.add_header('apikey', ANON_KEY)
        resp = urllib.request.urlopen(req)
        batch = json.loads(resp.read())
        if not batch:
            break
        all_data.extend(batch)
        offset += limit
        if len(batch) < limit:
            break
    return all_data

print("Fetching all providers...")
data = fetch_all("pl_providers", "name,slug,state,city,rating,review_count,description", 1000)
print(f"Total: {len(data)}")

# Rating distribution
ratings = [r['rating'] for r in data if r.get('rating') is not None]
dist = Counter(ratings)
print(f"\n=== Rating Distribution (Ops Score) ===")
for k in sorted(dist.keys()):
    pct = dist[k] / len(data) * 100
    bar = '#' * (int(pct) // 2)
    print(f"  Rating {k:.1f}: {dist[k]:5d} records ({pct:5.1f}%) {bar}")

ones = sum(1 for r in ratings if r <= 1.5)
threes = sum(1 for r in ratings if 2.8 <= r <= 3.2)
highs = sum(1 for r in ratings if r >= 4.5)
print(f"\n  <=1.5: {ones} ({ones/len(data)*100:.1f}%)")
print(f"  2.8-3.2: {threes} ({threes/len(data)*100:.1f}%)  <- was 90.7% before")
print(f"  >=4.5: {highs} ({highs/len(data)*100:.1f}%)")

# City = state
city_equals_state = 0
for r in data:
    city = (r.get('city') or '').lower()
    state = (r.get('state') or '').lower()
    state_display = state.replace("-", " ").title().lower()
    if city == state_display:
        city_equals_state += 1

print(f"\n=== City = State (placeholder) ===")
print(f"  Records: {city_equals_state} ({city_equals_state/len(data)*100:.1f}%)  <- was 98.8% before")

# Fake descriptions
fc_desc = sum(1 for r in data if 'fulfillment center' in (r.get('description') or '').lower())
empty_desc = sum(1 for r in data if not r.get('description'))
print(f"\n=== Descriptions ===")
print(f"  'Fulfillment center': {fc_desc} ({fc_desc/len(data)*100:.1f}%)  <- was 86.4% before")
print(f"  Empty: {empty_desc} ({empty_desc/len(data)*100:.1f}%)")

# State distribution
states = Counter(r.get('state') for r in data if r.get('state'))
print(f"\n=== Top 10 States ===")
for state, count in states.most_common(10):
    print(f"  {state}: {count} ({count/len(data)*100:.1f}%)")

# City sample
print(f"\n=== Sample cities ===")
import random
samples = random.sample(data, 15)
for r in samples:
    print(f"  {r['name'][:30]}: city={r.get('city','')}, state={r.get('state','')}, rating={r.get('rating')}")

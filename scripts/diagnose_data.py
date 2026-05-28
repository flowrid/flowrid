import json, urllib.request
from collections import Counter

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjIwMTUsImV4cCI6MjA5NDYzODAxNX0.PApacanvLxJhR8iiuFYoUEOTPCXz3fegPwQPmne2GHw"

def fetch_all(table, select="*", limit=1000):
    """Fetch all records with pagination"""
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
    print(f"  Rating {k}: {dist[k]} records ({pct:.1f}%)")

# City equals state (title case)
state_title = {}
for s in ["california","texas","georgia","new-jersey","nevada","utah","new-york","illinois",
           "pennsylvania","ohio","missouri","tennessee","connecticut","colorado","wisconsin",
           "indiana","oregon","south-carolina","florida","north-carolina","alabama","nebraska",
           "oklahoma","mississippi","kentucky","michigan","minnesota","arkansas","idaho","kansas"]:
    state_title[s] = s.replace("-", " ").title()

city_equals_state = 0
for r in data:
    city = (r.get('city') or '').lower()
    state = (r.get('state') or '').lower()
    expected = state_title.get(state, state).lower()
    if city == expected:
        city_equals_state += 1

print(f"\n=== City = State (placeholder) ===")
print(f"  Records: {city_equals_state} ({city_equals_state/len(data)*100:.1f}%)")

# Fulfillment center description
fc_desc = 0
for r in data:
    desc = (r.get('description') or '').lower()
    if 'fulfillment center' in desc:
        fc_desc += 1
print(f"\n=== 'Fulfillment center' descriptions ===")
print(f"  Records: {fc_desc} ({fc_desc/len(data)*100:.1f}%)")

# Empty description
empty_desc = sum(1 for r in data if not r.get('description'))
print(f"\n=== Empty descriptions ===")
print(f"  Records: {empty_desc} ({empty_desc/len(data)*100:.1f}%)")

# Review count distribution
rc = [r['review_count'] or 0 for r in data]
print(f"\n=== Review Count ===")
print(f"  Min: {min(rc)}, Max: {max(rc)}, Avg: {sum(rc)/len(rc):.1f}")
zero_rc = sum(1 for x in rc if x == 0)
print(f"  Zero reviews: {zero_rc} ({zero_rc/len(data)*100:.1f}%)")

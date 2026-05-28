import json, os, random

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
files = [f for f in os.listdir(PROFILES_DIR) if f.endswith('.json')]

# Check what data is available across profiles
print("Checking data availability across 500 random profiles...\n")

has_warehouse = 0
has_tags = 0
has_clients = 0
has_awards = 0
has_team = 0
has_reviews = 0
total_locations = 0

warehouse_counts = []
tag_counts = []
client_counts = []
specialty_counts = []

for filename in random.sample(files, min(500, len(files))):
    with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
        p = json.load(f)

    wh = p.get('warehouseCount', 0) or 0
    if wh > 0:
        has_warehouse += 1
        warehouse_counts.append(wh)

    tags = p.get('tags', [])
    if isinstance(tags, list) and len(tags) > 0 and tags[0]:
        has_tags += 1
        tag_counts.append(len(tags))

    clients = p.get('clients', [])
    if isinstance(clients, list) and len(clients) > 0 and clients[0]:
        has_clients += 1
        client_counts.append(len(clients))

    awards = p.get('awards', [])
    if isinstance(awards, list) and len(awards) > 0 and awards[0]:
        has_awards += 1

    team = p.get('team', [])
    if isinstance(team, list) and len(team) > 0 and team[0]:
        has_team += 1

    reviews = p.get('reviewCount', 0) or 0
    if reviews > 0:
        has_reviews += 1

    locs = p.get('locations', [])
    if isinstance(locs, list):
        total_locations += len(locs)

    specialties = p.get('specialties', [])
    if isinstance(specialties, list):
        specialty_counts.append(len(specialties))

print(f"Has warehouseCount: {has_warehouse}/500")
if warehouse_counts:
    print(f"  Range: {min(warehouse_counts)}-{max(warehouse_counts)}, avg: {sum(warehouse_counts)/len(warehouse_counts):.1f}")

print(f"Has tags: {has_tags}/500")
if tag_counts:
    print(f"  Range: {min(tag_counts)}-{max(tag_counts)}, avg: {sum(tag_counts)/len(tag_counts):.1f}")

print(f"Has clients: {has_clients}/500")
if client_counts:
    print(f"  Range: {min(client_counts)}-{max(client_counts)}, avg: {sum(client_counts)/len(client_counts):.1f}")

print(f"Has awards: {has_awards}/500")
print(f"Has team: {has_team}/500")
print(f"Has reviews: {has_reviews}/500")
print(f"Locations: avg {total_locations/500:.1f} per profile")
if specialty_counts:
    print(f"Specialties: {min(specialty_counts)}-{max(specialty_counts)}, avg: {sum(specialty_counts)/len(specialty_counts):.1f}")

# Show a few sample profiles
print("\n--- Sample profiles ---")
for filename in random.sample(files, 3):
    with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
        p = json.load(f)
    print(f"\n{p['name']} (slug: {p.get('slug','')})")
    print(f"  warehouseCount: {p.get('warehouseCount')}")
    print(f"  tags: {p.get('tags')}")
    print(f"  clients count: {len(p.get('clients', []))}")
    print(f"  awards: {p.get('awards')}")
    print(f"  reviewCount: {p.get('reviewCount')}")
    print(f"  specialties count: {len(p.get('specialties', []))}")

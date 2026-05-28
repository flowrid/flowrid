import json, os, urllib.request, time, re, concurrent.futures

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

# Get all slugs
print("Loading slugs...")
slugs = []
for filename in os.listdir(PROFILES_DIR):
    if filename.endswith('.json'):
        filepath = os.path.join(PROFILES_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                profile = json.load(f)
            slug = profile.get('slug', '')
            if slug:
                slugs.append(slug)
        except:
            pass

print(f"Total slugs: {len(slugs)}")

# Test extraction on a few first
def extract_logo_from_page(html):
    """Extract the first cdn.prod.website-files.com image URL that's not fulfill.png"""
    pattern = r'https://cdn\.prod\.website-files\.com/[^"\'\s]+'
    matches = re.findall(pattern, html)
    for url in matches:
        # Skip fulfill.png placeholder
        if 'fulfill.png' in url.lower():
            continue
        # Skip small icons
        if 'favicon' in url.lower() or 'icon' in url.lower():
            continue
        return url
    return None

def fetch_logo(slug):
    """Fetch a single profile page and extract logo"""
    url = f"https://www.fulfill.com/3pl/profile/{slug}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='ignore')
        logo = extract_logo_from_page(html)
        return (slug, logo)
    except Exception as e:
        return (slug, None)

# Test with 3 samples
print("\nTesting extraction...")
for slug in slugs[:3]:
    slug, logo = fetch_logo(slug)
    print(f"  {slug}: {logo[:100] if logo else 'NOT FOUND'}")

# Now batch scrape all
print(f"\nStarting batch scrape of {len(slugs)} profiles (5 workers)...")
results = {}
start_time = time.time()
completed = 0

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(fetch_logo, slug): slug for slug in slugs}
    for future in concurrent.futures.as_completed(futures):
        slug, logo = future.result()
        results[slug] = logo
        completed += 1
        if completed % 100 == 0:
            elapsed = time.time() - start_time
            rate = completed / elapsed
            remaining = (len(slugs) - completed) / rate
            found = sum(1 for v in results.values() if v)
            print(f"  {completed}/{len(slugs)} ({rate:.0f}/s, ~{remaining:.0f}s left) | found: {found}")

elapsed = time.time() - start_time
found = sum(1 for v in results.values() if v)
not_found = len(slugs) - found
print(f"\n=== SCRAPE DONE in {elapsed:.0f}s ===")
print(f"Found logos: {found}")
print(f"Not found: {not_found}")

# Save results to file for safety
with open(r'E:\Flowrid\flowrid\scripts\logo_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False)
print(f"Results saved to scripts/logo_results.json")

# Update Supabase in batches
print("\nUpdating Supabase...")
batch = []
updated = 0
for slug, logo in results.items():
    if logo:
        batch.append((slug, logo))

for i, (slug, logo) in enumerate(batch):
    patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
    data = json.dumps({"logo": logo}).encode('utf-8')
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
    if (i + 1) % 200 == 0:
        print(f"  Updated: {i+1}/{len(batch)}")

print(f"\n=== ALL DONE ===")
print(f"Logos updated in DB: {updated}/{len(batch)}")

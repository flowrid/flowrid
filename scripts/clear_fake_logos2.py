import urllib.request, json, time

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Get all providers with fulfill.com placeholder logos
print("Finding providers with fulfill.com placeholder logos...")
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/pl_providers?select=id,name,slug,logo&limit=3000"
)
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
all_providers = json.loads(resp.read())
providers = [p for p in all_providers if 'website-files.com' in (p.get('logo') or '')]
print(f"  Found {len(providers)} with fulfill.com placeholder logos")

# Update one by one
print(f"\nClearing logos...")
cleared = 0
errors = 0
start_time = time.time()

for i, provider in enumerate(providers):
    slug = provider['slug']
    patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
    data = json.dumps({"logo": None}).encode('utf-8')
    req = urllib.request.Request(patch_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')

    try:
        resp = urllib.request.urlopen(req)
        cleared += 1
    except Exception as e:
        errors += 1
        if errors <= 3:
            print(f"  Error: {slug} - {e}")

    if (i + 1) % 100 == 0:
        elapsed = time.time() - start_time
        rate = (i + 1) / elapsed
        remaining = (len(providers) - i - 1) / rate
        print(f"  {i+1}/{len(providers)} ({rate:.0f}/s, ~{remaining:.0f}s left)")

elapsed = time.time() - start_time
print(f"\n=== DONE in {elapsed:.0f}s ===")
print(f"Cleared: {cleared}")
print(f"Errors: {errors}")

import urllib.request, json, time

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Get all providers with fulfill.com placeholder logos
# The URL contains 'website-files.com' which is fulfill.com's CDN
print("Finding providers with fulfill.com placeholder logos...")
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/pl_providers?select=id,name,slug,logo&logo=like.*website-files*"
)
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
providers = json.loads(resp.read())
print(f"  Found {len(providers)} providers with fulfill.com placeholder logos")

if len(providers) == 0:
    # Try different query pattern
    print("  Trying different query...")
    # Get all and filter in Python
    req2 = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/pl_providers?select=id,name,slug,logo&limit=3000"
    )
    req2.add_header('apikey', SERVICE_KEY)
    req2.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    resp2 = urllib.request.urlopen(req2)
    all_providers = json.loads(resp2.read())
    providers = [p for p in all_providers if 'website-files.com' in (p.get('logo') or '')]
    print(f"  Found {len(providers)} providers (Python filtered)")

# Batch update: set logo to null
print(f"\nClearing {len(providers)} fake logos...")
batch_size = 50
cleared = 0
errors = 0

for i in range(0, len(providers), batch_size):
    batch = providers[i:i+batch_size]
    slugs = [p['slug'] for p in batch]

    # Build OR filter: slug=eq.A,slug=eq.B,...
    filter_str = ','.join([f'slug=eq.{s}' for s in slugs])
    patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?or=({filter_str})"
    data = json.dumps({"logo": None}).encode('utf-8')
    req = urllib.request.Request(patch_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')

    try:
        resp = urllib.request.urlopen(req)
        cleared += len(batch)
        if (i // batch_size + 1) % 20 == 0:
            print(f"  Progress: {cleared}/{len(providers)}")
    except Exception as e:
        print(f"  Batch error at offset {i}: {e}")
        errors += len(batch)

    time.sleep(0.2)

print(f"\n=== DONE ===")
print(f"Cleared: {cleared}")
print(f"Errors: {errors}")

# Verify final state
req3 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=count")
req3.add_header('apikey', SERVICE_KEY)
req3.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp3 = urllib.request.urlopen(req3)
total = json.loads(resp3.read())[0]['count']

req4 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=count&logo=not.is.null")
req4.add_header('apikey', SERVICE_KEY)
req4.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp4 = urllib.request.urlopen(req4)
with_logo = json.loads(resp4.read())[0]['count']

print(f"\nFinal: {total} total, {with_logo} with logos, {total - with_logo} without logos (will show first-letter fallback)")

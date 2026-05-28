import urllib.request, json, time

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

print("Fetching ALL providers with pagination...")

# Get total count first
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=count&logo=like.*website-files*")
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
total_fulfill = json.loads(resp.read())[0]['count']
print(f"Total with fulfill.com logos: {total_fulfill}")

# Fetch in pages
all_providers = []
offset = 0
page_size = 1000
while True:
    url = f"{SUPABASE_URL}/rest/v1/pl_providers?select=slug,logo&logo=like.*website-files*&limit={page_size}&offset={offset}"
    req = urllib.request.Request(url)
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    resp = urllib.request.urlopen(req)
    page = json.loads(resp.read())
    if not page:
        break
    all_providers.extend(page)
    offset += page_size
    print(f"  Fetched {len(all_providers)}/{total_fulfill}")
    if len(page) < page_size:
        break

print(f"\nTotal to clear: {len(all_providers)}")

# Clear them all
cleared = 0
errors = 0
start = time.time()

for i, p in enumerate(all_providers):
    patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{p['slug']}"
    data = json.dumps({"logo": None}).encode('utf-8')
    req = urllib.request.Request(patch_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    try:
        urllib.request.urlopen(req)
        cleared += 1
    except:
        errors += 1

    if (i + 1) % 200 == 0:
        elapsed = time.time() - start
        rate = (i + 1) / elapsed
        remaining = (len(all_providers) - i - 1) / rate
        print(f"  {i+1}/{len(all_providers)} ({rate:.0f}/s, ~{remaining:.0f}s left)")

elapsed = time.time() - start
print(f"\n=== DONE in {elapsed:.0f}s === Cleared: {cleared}, Errors: {errors}")

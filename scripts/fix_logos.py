import urllib.request, json, time

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Step 1: Get providers with fulfill.com default logos (website-files.com in logo URL)
print("Step 1: Finding providers with fulfill.com placeholder logos...")
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/pl_providers?select=id,name,slug,logo,website&logo=like.*website-files.com*"
)
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
fulfill_logo_providers = json.loads(resp.read())
print(f"  Found {len(fulfill_logo_providers)} providers with fulfill.com placeholder logos")

# Step 2: For each, check if they have a real website and try to get favicon
updated_count = 0
cleared_count = 0
errors = 0

for i, provider in enumerate(fulfill_logo_providers):
    slug = provider['slug']
    website = provider.get('website', '') or ''

    # Extract domain from website
    domain = ''
    if website and 'example.com' not in website:
        # Clean up domain
        domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0].strip()

    new_logo = None

    if domain:
        # Try Google Favicon API
        favicon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
        try:
            test_req = urllib.request.Request(favicon_url)
            test_resp = urllib.request.urlopen(test_req, timeout=5)
            if test_resp.status == 200:
                new_logo = favicon_url
        except:
            pass

    # Update the record
    patch_data = {"logo": new_logo}  # null if no domain/favicon found
    patch_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
    data = json.dumps(patch_data).encode('utf-8')
    req = urllib.request.Request(patch_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')

    try:
        resp = urllib.request.urlopen(req)
        if new_logo:
            updated_count += 1
        else:
            cleared_count += 1
    except Exception as e:
        errors += 1
        if errors <= 3:
            print(f"  Error updating {slug}: {e}")

    if (i + 1) % 200 == 0:
        print(f"  Progress: {i+1}/{len(fulfill_logo_providers)} | updated: {updated_count} cleared: {cleared_count}")
        time.sleep(0.3)

print(f"\n=== DONE ===")
print(f"Updated with favicon: {updated_count}")
print(f"Cleared (no logo): {cleared_count}")
print(f"Errors: {errors}")
print(f"Total processed: {updated_count + cleared_count + errors}")

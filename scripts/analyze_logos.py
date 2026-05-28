import urllib.request, json

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Get all unique logo URLs and their counts
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=logo&logo=not.is.null")
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

# Count unique logos
from collections import Counter
logo_counts = Counter()
for item in data:
    logo = item.get('logo', '')
    # Simplify URL (remove query params)
    logo_base = logo.split('?')[0]
    logo_counts[logo_base] += 1

print(f"Unique logo URLs: {len(logo_counts)}")
print("\nTop logo URLs:")
for url, count in logo_counts.most_common(10):
    print(f"  {count}x: {url[:100]}")

# Check how many have fulfill.com CDN logos
fulfill_logos = sum(1 for url in logo_counts if 'website-files.com' in url or 'fulfill' in url.lower())
print(f"\nFulfill.com CDN logos: {fulfill_logos} unique URLs, {sum(logo_counts[url] for url in logo_counts if 'website-files.com' in url or 'fulfill' in url.lower())} total records")

# Check websites
req2 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=website&website=not.is.null&limit=10")
req2.add_header('apikey', SERVICE_KEY)
req2.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp2 = urllib.request.urlopen(req2)
sites = json.loads(resp2.read())
print("\nSample websites:")
for s in sites[:5]:
    print(f"  {s.get('website', 'N/A')[:100]}")

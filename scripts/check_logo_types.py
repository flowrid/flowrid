import urllib.request, json
from collections import Counter

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/pl_providers?select=logo&logo=not.is.null&limit=3000"
)
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

# Count by domain
domains = Counter()
for item in data:
    logo = item.get('logo', '')
    if logo.startswith('/logos/'):
        domains['local files'] += 1
    elif 'google.com/s2/favicons' in logo:
        domains['google favicon'] += 1
    elif 'website-files.com' in logo:
        domains['fulfill.com CDN (still)'] += 1
    else:
        domains[f'other: {logo[:60]}'] += 1

print(f"Total with logos: {len(data)}")
for domain, count in domains.most_common():
    print(f"  {count}: {domain}")

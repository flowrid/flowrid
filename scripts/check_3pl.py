import urllib.request, json

url = 'https://cdwbbfzfjakkdwnqfffw.supabase.co/rest/v1/pl_providers?select=id,name,slug,logo,website'
req = urllib.request.Request(url)
req.add_header('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk')
req.add_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
for item in data:
    logo_status = "HAS LOGO" if item.get('logo') else "NO LOGO"
    print(f"{logo_status} | {item['name']} | {item['slug']} | website: {item.get('website','')[:80]}")
print(f"\nTotal: {len(data)} providers")

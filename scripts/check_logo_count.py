import urllib.request, json

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Count total
req1 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=count")
req1.add_header('apikey', SERVICE_KEY)
req1.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp1 = urllib.request.urlopen(req1)
total_count = json.loads(resp1.read())[0]['count']

# Count with logos
req2 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=count&logo=not.is.null")
req2.add_header('apikey', SERVICE_KEY)
req2.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp2 = urllib.request.urlopen(req2)
logo_count = json.loads(resp2.read())[0]['count']

# Count without logos
req3 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=count&logo=is.null")
req3.add_header('apikey', SERVICE_KEY)
req3.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp3 = urllib.request.urlopen(req3)
no_logo_count = json.loads(resp3.read())[0]['count']

print("Total 3PLs:", total_count)
print("With logo:", logo_count)
print("Without logo:", no_logo_count)

# Show a few logos
req4 = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=name,logo&logo=not.is.null&limit=5")
req4.add_header('apikey', SERVICE_KEY)
req4.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp4 = urllib.request.urlopen(req4)
samples = json.loads(resp4.read())
print("\nSample logos:")
for s in samples:
    print("  " + s['name'] + ": " + s['logo'][:80])

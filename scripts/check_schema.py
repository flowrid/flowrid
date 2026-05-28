import urllib.request, json

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Get a single existing record to see all columns
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?limit=1")
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
if data:
    record = data[0]
    print("Existing columns:")
    for key, value in record.items():
        val_type = type(value).__name__
        val_preview = str(value)[:80]
        print(f"  {key}: {val_type} = {val_preview}")
else:
    print("No records found")

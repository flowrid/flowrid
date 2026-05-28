import json, os, urllib.request, time

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

# Test connection first
print("Testing Supabase connection...")
try:
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers?select=count")
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    resp = urllib.request.urlopen(req)
    print(f"  Connection OK: {resp.status} - {resp.read()}")
except Exception as e:
    print(f"  Connection FAILED: {e}")

# Test insert
print("\nTesting insert...")
test_data = {
    "name": "Test 3PL",
    "slug": "test-3pl-import-001",
    "country": "US",
    "state": "california",
    "city": "Test City",
    "categories": ["apparel"],
    "platforms": ["shopify"],
    "shipping_speed": "3-5 days",
    "cost_level": "Medium",
    "rating": 4.5,
    "review_count": 10,
    "order_capacity": 1000,
    "sku_capacity": 500,
    "integrations": ["shopify"],
    "description": "Test description",
}
data = json.dumps(test_data).encode('utf-8')
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers", data=data, method='POST')
req.add_header('apikey', SERVICE_KEY)
req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
req.add_header('Content-Type', 'application/json')
req.add_header('Prefer', 'return=representation')
try:
    resp = urllib.request.urlopen(req)
    print(f"  Insert OK: {resp.status}")
    print(f"  Response: {resp.read()}")
except urllib.error.HTTPError as e:
    print(f"  Insert FAILED: {e.code}")
    print(f"  Response: {e.read()}")

# Test a single profile transform
files = sorted(os.listdir(PROFILES_DIR))
test_file = files[0]
print(f"\nTesting profile transform: {test_file}")
with open(os.path.join(PROFILES_DIR, test_file), 'r', encoding='utf-8') as f:
    profile = json.load(f)
print(f"  Name: {profile.get('name')}")
print(f"  Slug: {profile.get('slug')}")
print(f"  Specialties: {profile.get('specialties', [])[:3]}")
print(f"  Locations: {profile.get('locations', [])}")
print(f"  Logo: {profile.get('logo', '')[:80]}")

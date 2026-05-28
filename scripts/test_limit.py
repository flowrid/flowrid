import urllib.request, json

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjIwMTUsImV4cCI6MjA5NDYzODAxNX0.PApacanvLxJhR8iiuFYoUEOTPCXz3fegPwQPmne2GHw"

# Test 1: Request with limit=5000
print("Test 1: limit=5000")
url = f"{SUPABASE_URL}/rest/v1/pl_providers?select=id&limit=5000"
req = urllib.request.Request(url)
req.add_header('apikey', ANON_KEY)
req.add_header('Authorization', f'Bearer {ANON_KEY}')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
print(f"  Returned: {len(data)} rows")
ct = resp.headers.get('Content-Range', 'no Content-Range header')
print(f"  Content-Range: {ct}")

# Test 2: Using Range header
print("\nTest 2: Using Range header (0-1999)")
url2 = f"{SUPABASE_URL}/rest/v1/pl_providers?select=id"
req2 = urllib.request.Request(url2)
req2.add_header('apikey', ANON_KEY)
req2.add_header('Authorization', f'Bearer {ANON_KEY}')
req2.add_header('Range-Unit', 'items')
req2.add_header('Range', '0-1999')
req2.add_header('Prefer', 'count=exact')
try:
    resp2 = urllib.request.urlopen(req2)
    data2 = json.loads(resp2.read())
    print(f"  Returned: {len(data2)} rows")
    ct2 = resp2.headers.get('Content-Range', 'no Content-Range header')
    print(f"  Content-Range: {ct2}")
except Exception as e:
    print(f"  Error: {e}")

# Test 3: Using offset
print("\nTest 3: offset=0 limit=2000")
url3 = f"{SUPABASE_URL}/rest/v1/pl_providers?select=id&offset=0&limit=2000"
req3 = urllib.request.Request(url3)
req3.add_header('apikey', ANON_KEY)
req3.add_header('Authorization', f'Bearer {ANON_KEY}')
resp3 = urllib.request.urlopen(req3)
data3 = json.loads(resp3.read())
print(f"  Returned: {len(data3)} rows")

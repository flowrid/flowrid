import urllib.request, json

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Map of slug -> logo filename (8 user-provided logos)
updates = [
    ("aps-fulfillment", "/logos/aps-fulfillment.jpg"),
    ("caliship-fulfillment", "/logos/caliship-fulfillment.jpg"),
    ("flowx-fulfillment", "/logos/flowx-fulfillment.jpg"),
    ("golden-state-logistics", "/logos/golden-state-logistics.jpg"),
    ("lonestar-logistics", "/logos/lonestar-logistics.jpg"),
    ("nyc-express-fulfillment", "/logos/nyc-express-fulfillment.jpg"),
    ("peach-state-logistics", "/logos/peach-state-logistics.jpg"),
    ("verst-logistics", "/logos/verst-logistics.jpg"),
]

for slug, logo_url in updates:
    patch_url = SUPABASE_URL + "/rest/v1/pl_providers?slug=eq." + slug
    data = json.dumps({"logo": logo_url}).encode('utf-8')
    req = urllib.request.Request(patch_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', 'Bearer ' + SERVICE_KEY)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    resp = urllib.request.urlopen(req)
    print("UPDATED: " + slug + " -> " + logo_url + " (status=" + str(resp.status) + ")")

print("\nDone! All 8 logos updated.")

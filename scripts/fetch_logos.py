import urllib.request, json, ssl

# All providers with real websites
providers = [
    ("shipbob", "www.shipbob.com"),
    ("shipmonk", "www.shipmonk.com"),
    ("red-stag-fulfillment", "www.redstagfulfillment.com"),
    ("ids-fulfillment", "www.idsfulfillment.com"),
    ("verst-logistics", "www.verstlogistics.com"),
    ("stord", "www.stord.com"),
    ("nitro-logistics", "www.nitrologistics.com"),
    ("selery-fulfillment", "www.seleryfulfillment.com"),
    ("aps-fulfillment", "www.apsfulfillment.com"),
    ("3pl-center", "www.3plcenter.com"),
    ("capacity-llc", "www.capacityllc.com"),
    ("otw-shipping", "www.otwshipping.com"),
]

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

# Test if Clearbit logo API works for each provider
# Try multiple logo sources
logo_sources = []

for slug, domain in providers:
    found = False

    # Source 1: Clearbit Logo API
    clearbit_url = f"https://logo.clearbit.com/{domain}"
    try:
        req = urllib.request.Request(clearbit_url)
        resp = urllib.request.urlopen(req, timeout=5)
        if resp.status == 200 and resp.headers.get('Content-Type', '').startswith('image/'):
            logo_sources.append((slug, domain, clearbit_url, 'clearbit'))
            print(f"FOUND (Clearbit): {slug} -> {clearbit_url}")
            found = True
    except Exception as e:
        pass

    # Source 2: Google Favicon (fallback, lower quality)
    if not found:
        favicon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
        try:
            req = urllib.request.Request(favicon_url)
            resp = urllib.request.urlopen(req, timeout=5)
            if resp.status == 200:
                logo_sources.append((slug, domain, favicon_url, 'favicon'))
                print(f"FOUND (Favicon): {slug} -> {favicon_url}")
                found = True
        except:
            pass

    if not found:
        print(f"NOT FOUND: {slug} ({domain})")

print(f"\nTotal found: {len(logo_sources)} / {len(providers)}")

# Now update Supabase with logo URLs
for slug, domain, logo_url, source in logo_sources:
    update_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}"
    data = json.dumps({"logo": logo_url}).encode('utf-8')
    req = urllib.request.Request(update_url, data=data, method='PATCH')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    try:
        resp = urllib.request.urlopen(req)
        print(f"UPDATED: {slug} ({source}) status={resp.status}")
    except Exception as e:
        print(f"UPDATE FAILED: {slug} -> {e}")

print("\nDone!")

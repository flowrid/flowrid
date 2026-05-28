import json, os, urllib.request, time, re, concurrent.futures, sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
OUTPUT_FILE = r"E:\Flowrid\flowrid\scripts\scraped_locations.json"

US_STATE_MAP = {
    "AL": "alabama", "AK": "alaska", "AZ": "arizona", "AR": "arkansas",
    "CA": "california", "CO": "colorado", "CT": "connecticut",
    "DE": "delaware", "FL": "florida", "GA": "georgia", "HI": "hawaii",
    "ID": "idaho", "IL": "illinois", "IN": "indiana", "IA": "iowa",
    "KS": "kansas", "KY": "kentucky", "LA": "louisiana", "ME": "maine",
    "MD": "maryland", "MA": "massachusetts", "MI": "michigan",
    "MN": "minnesota", "MS": "mississippi", "MO": "missouri",
    "MT": "montana", "NE": "nebraska", "NV": "nevada",
    "NH": "new-hampshire", "NJ": "new-jersey", "NM": "new-mexico",
    "NY": "new-york", "NC": "north-carolina", "ND": "north-dakota",
    "OH": "ohio", "OK": "oklahoma", "OR": "oregon", "PA": "pennsylvania",
    "RI": "rhode-island", "SC": "south-carolina",
    "SD": "south-dakota", "TN": "tennessee", "TX": "texas",
    "UT": "utah", "VT": "vermont", "VA": "virginia", "WA": "washington",
    "WV": "west-virginia", "WI": "wisconsin", "WY": "wyoming",
}

KNOWN_STATES = set(US_STATE_MAP.values())

def parse_locations_for_map(html):
    match = re.search(r'var locationsForMap\s*=\s*"(.*?)"', html)
    if not match:
        return None, None
    locations_str = match.group(1).strip()
    if not locations_str:
        return None, None
    first = locations_str.split(";")[0].strip()

    # 简单策略: 按逗号分割，找到 2 字母州代码，前一段即为城市
    parts = [p.strip() for p in first.split(",")]
    for i, part in enumerate(parts):
        # 处理 "ST ZIP" 格式: "NV 89521" 或 "MD 21536"
        # 提取纯州代码部分
        code = part.split()[0] if part else ""
        if len(code) == 2 and code.isupper() and code in US_STATE_MAP:
            if i > 0:
                # 前一段是城市名（可能是地址的最后一部分）
                city = parts[i - 1].strip()
                # 如果城市包含数字或特殊字符，取最后的有意义部分
                # 例如 "Ste D-2" → None, 取再前一段
                if re.search(r'\d', city) or len(city) < 2:
                    if i > 1:
                        city = parts[i - 2].strip()
                # 清理城市名（去掉街道编号等杂项）
                city = re.sub(r'^(Ste|Suite|Unit|Apt|Building|Bldg)\s+', '', city)
                if city and len(city) >= 2 and not re.match(r'^[\d\s#.-]+$', city):
                    return city, US_STATE_MAP[code]
            break
    return None, None


def extract_city_state_from_text(text):
    if not text:
        return None, None

    # "in City, ST" 或 "in City, StateName"
    m = re.search(
        r'(?:in|at|near)\s+([A-Z][A-Za-z\s\.\'-]+?),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)',
        text
    )
    if m:
        city = m.group(1).strip()
        state_str = m.group(2).strip()
        if len(state_str) == 2 and state_str.isupper():
            state = US_STATE_MAP.get(state_str.upper())
        else:
            state = state_str.lower().replace(" ", "-")
        if state and state in KNOWN_STATES:
            return city, state

    # "City-based"
    m = re.search(r'([A-Z][A-Za-z\s\.\'-]+?)-based', text)
    if m:
        return m.group(1).strip(), None

    # "in StateName"
    m = re.search(r'(?:in|of)\s+((?:New|North|South|West|East|Rhode)\s+)?([A-Z][a-z]+)', text)
    if m:
        full = m.group(0).replace("in ", "").replace("of ", "").strip()
        slug = full.lower().replace(" ", "-")
        if slug in KNOWN_STATES:
            return None, slug

    return None, None


def extract_description(html):
    # 第一个 detailed-page_location_sub-title text-align-left
    m = re.search(
        r'<div class="detailed-page_location_sub-title text-align-left">(.*?)</div>',
        html, re.DOTALL
    )
    if m:
        desc = m.group(1).strip()
        desc = desc.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        desc = desc.replace('&#x27;', "'").replace('&quot;', '"').replace('&#39;', "'")
        desc = re.sub(r'<[^>]+>', '', desc).strip()
        if desc and len(desc) > 20:
            boilerplate = [
                r'has fulfillment centers? strategically located',
                r'offers (premier |)3PL services? with a',
                r'provides fulfillment services? across',
            ]
            if not any(re.search(p, desc.lower()) for p in boilerplate):
                return desc
    return ""


def extract_states_from_locations_section(html):
    states = []
    for m in re.finditer(r'href="/3pl/location/([^"]+)"', html):
        s = m.group(1).strip()
        if s and s not in states:
            states.append(s)
    return states


def fetch_profile(slug):
    url = f"https://www.fulfill.com/3pl/profile/{slug}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        resp = urllib.request.urlopen(req, timeout=20)
        html = resp.read().decode('utf-8', errors='ignore')

        city, state = parse_locations_for_map(html)
        description = extract_description(html)
        extra_states = extract_states_from_locations_section(html)

        # 备用: 从描述提取
        if not city and not state:
            city, state = extract_city_state_from_text(description)
        if not state and extra_states:
            state = extra_states[0]

        return {"slug": slug, "city": city, "state": state, "description": description, "extra_states": extra_states}
    except Exception as e:
        return {"slug": slug, "city": None, "state": None, "description": None, "extra_states": [], "error": str(e)}


# ============================================================
print("Loading slugs...")
slugs = []
for fn in os.listdir(PROFILES_DIR):
    if fn.endswith('.json'):
        try:
            with open(os.path.join(PROFILES_DIR, fn), 'r', encoding='utf-8') as f:
                p = json.load(f)
            s = p.get('slug', '')
            if s:
                slugs.append(s)
        except:
            pass
print(f"Total: {len(slugs)}")

# 测试前 10 个
print("\n--- Testing 10 samples ---")
for slug in slugs[:10]:
    r = fetch_profile(slug)
    err = f" ERR={r['error']}" if r.get('error') else ""
    d = (r.get('description') or '')[:80]
    print(f"  {slug}: city={r['city']}, state={r['state']}{err}")
    print(f"    desc: {d}")

# 批量抓取
print(f"\n--- Batch scraping {len(slugs)} profiles (5 workers) ---")
results = {}
start = time.time()
done = 0
found_c = 0
found_d = 0

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    futs = {ex.submit(fetch_profile, s): s for s in slugs}
    for fut in concurrent.futures.as_completed(futs):
        r = fut.result()
        slug = r['slug']
        results[slug] = r
        done += 1
        if r.get('city'):
            found_c += 1
        if r.get('description'):
            found_d += 1

        if done % 100 == 0:
            elapsed = time.time() - start
            rate = done / elapsed
            rem = (len(slugs) - done) / rate if rate > 0 else 0
            print(f"  {done}/{len(slugs)} ({rate:.1f}/s, ~{rem:.0f}s) | city:{found_c} desc:{found_d}")

elapsed = time.time() - start
print(f"\n=== SCRAPE DONE ({elapsed:.0f}s) ===")
print(f"Found city: {found_c}/{len(slugs)} ({found_c/len(slugs)*100:.1f}%)")
print(f"Found desc: {found_d}/{len(slugs)} ({found_d/len(slugs)*100:.1f}%)")

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False)
print(f"Saved to {OUTPUT_FILE}")

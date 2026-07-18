#!/usr/bin/env python3
"""
Phase 1b: 并发网站爬取地理位置
从 3PL 官网首页提取地址/城市/州信息
"""

import json, os, re, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import Counter

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
OUTPUT = r"E:\Flowrid\fullfill\fulfill-data\scraped_locations.json"
STATE_CACHE = r"E:\Flowrid\fullfill\fulfill-data\state_cache.json"

# 州缩写映射
STATE_ABBREV = {
    'AL':'alabama','AK':'alaska','AZ':'arizona','AR':'arkansas','CA':'california',
    'CO':'colorado','CT':'connecticut','DE':'delaware','FL':'florida','GA':'georgia',
    'HI':'hawaii','ID':'idaho','IL':'illinois','IN':'indiana','IA':'iowa',
    'KS':'kansas','KY':'kentucky','LA':'louisiana','ME':'maine','MD':'maryland',
    'MA':'massachusetts','MI':'michigan','MN':'minnesota','MS':'mississippi',
    'MO':'missouri','MT':'montana','NE':'nebraska','NV':'nevada','NH':'new-hampshire',
    'NJ':'new-jersey','NM':'new-mexico','NY':'new-york','NC':'north-carolina',
    'ND':'north-dakota','OH':'ohio','OK':'oklahoma','OR':'oregon','PA':'pennsylvania',
    'RI':'rhode-island','SC':'south-carolina','SD':'south-dakota','TN':'tennessee',
    'TX':'texas','UT':'utah','VT':'vermont','VA':'virginia','WA':'washington',
    'WV':'west-virginia','WI':'wisconsin','WY':'wyoming',
}

# 非美国地区关键词 (用于识别国际3PL)
NON_US_PATTERNS = {
    'canada': ['canada', 'ontario', 'quebec', 'british columbia', 'alberta', 'manitoba',
               'toronto', 'montreal', 'vancouver', 'burnaby', 'mississauga', 'calgary',
               'ottawa', 'edmonton', 'north york', 'bc', 'on ', 'quebec'],
    'uk': ['united kingdom', 'london', 'manchester', 'birmingham', 'oxfordshire',
           'warwickshire', 'cornwall', 'england', 'scotland', 'wales', 'bristol',
           'leeds', 'liverpool', 'sheffield'],
    'australia': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
                  'new south wales', 'victoria', 'queensland'],
    'ireland': ['ireland', 'dublin', 'cork', 'galway'],
    'europe': ['germany', 'france', 'netherlands', 'belgium', 'spain', 'italy',
               'poland', 'sweden', 'denmark', 'norway', 'finland'],
    'asia': ['china', 'hong kong', 'japan', 'korea', 'singapore', 'india', 'turkey',
             'thailand', 'vietnam', 'malaysia', 'philippines'],
    'mexico': ['mexico', 'mexico city', 'guadalajara', 'monterrey'],
    'latam': ['brazil', 'argentina', 'colombia', 'chile', 'peru'],
}

def normalize_url(url):
    if not url: return None
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    return url

def extract_location(text):
    """从文本中提取 (city, state_slug, country) 或 None"""
    # US state abbrev pattern: "City, ST"
    m = re.search(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),\s*([A-Z]{2})', text)
    if m:
        city, abbr = m.group(1), m.group(2).upper()
        state = STATE_ABBREV.get(abbr)
        if state:
            return (city, state, 'US', f'addr_pattern:{abbr}')

    # UK postcode pattern
    m = re.search(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),\s*([A-Z]{1,2}\d[A-Z]?\s*\d[A-Z]{2})', text)
    if m:
        return (m.group(1), '', 'UK', 'uk_postcode')

    return None

def scrape_site(slug, website, desc):
    """抓取单个网站首页，提取位置"""
    url = normalize_url(website)
    if not url:
        return slug, None

    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; FlowridBot/1.0; +https://flowrid.com)'
        })
        resp = urllib.request.urlopen(req, timeout=6)
        html = resp.read().decode('utf-8', errors='ignore')[:100000]
    except Exception:
        return slug, None

    # Strip HTML
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    # Try address extraction
    loc = extract_location(text)
    if loc:
        return slug, {'city': loc[0], 'state': loc[1], 'country': loc[2], 'source': loc[3]}

    # Check description too (from first pass)
    loc = extract_location(desc)
    if loc:
        return slug, {'city': loc[0], 'state': loc[1], 'country': loc[2], 'source': 'desc:' + loc[3]}

    return slug, None

def check_international(desc, website):
    """检查是否非美国 3PL"""
    text = (desc + ' ' + (website or '')).lower()
    for region, keywords in NON_US_PATTERNS.items():
        for kw in keywords:
            if kw in text:
                return region
    return None

def main():
    print("=== Phase 1b: 并发网站爬取地理位置 ===\n")

    # Load profiles
    files = sorted([f for f in os.listdir(PROFILES_DIR) if f.endswith('.json')])
    profiles = []
    for fname in files:
        with open(os.path.join(PROFILES_DIR, fname), encoding='utf-8') as f:
            p = json.load(f)
        profiles.append(p)

    total = len(profiles)
    print(f"Total profiles: {total}")

    # Load existing cache
    cache = {}
    if os.path.exists(STATE_CACHE):
        with open(STATE_CACHE, encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Cached entries: {len(cache)}")

    # Filter: only scrape those not in cache and with websites
    to_scrape = []
    for p in profiles:
        slug = p.get('slug', '')
        website = p.get('website', '')
        if slug in cache:
            continue
        if website:
            to_scrape.append((slug, website, p.get('description', '')))

    print(f"Need to scrape: {len(to_scrape)}")

    # Concurrent scraping
    results = dict(cache)
    stats = Counter()
    batch_size = 15  # concurrent connections

    with ThreadPoolExecutor(max_workers=batch_size) as executor:
        futures = {executor.submit(scrape_site, s, w, d): s for s, w, d in to_scrape}

        for i, future in enumerate(as_completed(futures)):
            slug, loc = future.result()
            if loc:
                results[slug] = loc
                stats[f'found_{loc["country"]}'] += 1
            else:
                # Check if international
                p = next((pr for pr in profiles if pr.get('slug') == slug), None)
                intl = check_international(p.get('description','') if p else '', p.get('website','') if p else '')
                if intl:
                    results[slug] = {'country': intl.upper(), 'source': 'desc_keyword', 'state': '', 'city': ''}
                    stats[f'intl_{intl}'] += 1
                else:
                    results[slug] = None
                    stats['not_found'] += 1

            stats['processed'] += 1
            if stats['processed'] % 100 == 0:
                print(f"  {stats['processed']}/{len(to_scrape)} | "
                      f"US={stats.get('found_US',0)} "
                      f"intl={sum(v for k,v in stats.items() if k.startswith('intl_'))} "
                      f"miss={stats.get('not_found',0)}")
                # Save checkpoint
                with open(STATE_CACHE, 'w', encoding='utf-8') as f:
                    json.dump(results, f, ensure_ascii=False)

    # Final save
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    with open(STATE_CACHE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False)

    print(f"\n=== DONE ===")
    us = stats.get('found_US', 0)
    intl_total = sum(v for k, v in stats.items() if k.startswith('intl_'))
    miss = stats.get('not_found', 0)
    cached = total - len(to_scrape)
    print(f"US 3PLs: {us}")
    print(f"International: {intl_total}")
    print(f"Not found: {miss}")
    print(f"Cached: {cached}")
    for k, v in sorted(stats.items()):
        if k.startswith('intl_'):
            print(f"  {k}: {v}")
    print(f"\nOutput: {OUTPUT}")

if __name__ == '__main__':
    main()

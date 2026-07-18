#!/usr/bin/env python3
"""
Flowrid 数据质量修复 — Phase 1: 地理位置修复
策略:
  1. 从 description 提取 city, state (最可靠)
  2. 抓取 3PL 官网首页提取地址/位置信息
  3. specialties "X 3PL" 交叉验证 (帮助缩小范围)
  4. 找不到的设为 NULL 而非默认 "california"

输出: fixed_locations.json — 每个 profile 的修正后地理位置
"""

import json, os, re, urllib.request, urllib.error, time
from collections import Counter
from html.parser import HTMLParser

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
OUTPUT_FILE = r"E:\Flowrid\fullfill\fulfill-data\fixed_locations.json"
STATE_CACHE_FILE = r"E:\Flowrid\fullfill\fulfill-data\state_cache.json"

# ============================================================
# 州名映射
# ============================================================
STATE_SLUGS = {
    'alabama':'alabama','alaska':'alaska','arizona':'arizona','arkansas':'arkansas',
    'california':'california','colorado':'colorado','connecticut':'connecticut',
    'delaware':'delaware','florida':'florida','georgia':'georgia','hawaii':'hawaii',
    'idaho':'idaho','illinois':'illinois','indiana':'indiana','iowa':'iowa',
    'kansas':'kansas','kentucky':'kentucky','louisiana':'louisiana','maine':'maine',
    'maryland':'maryland','massachusetts':'massachusetts','michigan':'michigan',
    'minnesota':'minnesota','mississippi':'mississippi','missouri':'missouri',
    'montana':'montana','nebraska':'nebraska','nevada':'nevada',
    'new hampshire':'new-hampshire','new jersey':'new-jersey','new mexico':'new-mexico',
    'new york':'new-york','north carolina':'north-carolina','north dakota':'north-dakota',
    'ohio':'ohio','oklahoma':'oklahoma','oregon':'oregon','pennsylvania':'pennsylvania',
    'rhode island':'rhode-island','south carolina':'south-carolina',
    'south dakota':'south-dakota','tennessee':'tennessee','texas':'texas','utah':'utah',
    'vermont':'vermont','virginia':'virginia','washington':'washington',
    'west virginia':'west-virginia','wisconsin':'wisconsin','wyoming':'wyoming',
}

STATE_ABBREV = {v.split('-')[-1].upper()[:2]: v for v in STATE_SLUGS.values()}
# Manual overrides for ambiguous abbreviations
STATE_ABBREV.update({
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
})

# ============================================================
# 1. 从 description 提取位置
# ============================================================
def extract_from_description(desc):
    """从描述文本中提取城市和州，返回 {city, state, confidence} 或 None"""
    if not desc:
        return None

    results = []

    # Pattern 1: "in City, ST" or "in City, StateName"
    p1 = re.findall(r'(?:in|at)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),\s*([A-Z]{2})(?:\s|,|\.|$)', desc)
    for city, abbr in p1:
        state = STATE_ABBREV.get(abbr.upper())
        if state:
            results.append({'city': city.strip(), 'state': state, 'confidence': 'high', 'source': 'desc_pattern_in'})

    # Pattern 2: "warehouse in City, ST"
    p2 = re.findall(r'(?:warehouse|facility|located|based|headquarters?|HQ)\s+(?:in|at)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),\s*([A-Z]{2})', desc)
    for city, abbr in p2:
        state = STATE_ABBREV.get(abbr.upper())
        if state and not any(r['city'] == city.strip() for r in results):
            results.append({'city': city.strip(), 'state': state, 'confidence': 'high', 'source': 'desc_pattern_warehouse'})

    # Pattern 3: City + state name in text
    for state_name, state_slug in STATE_SLUGS.items():
        if state_name in desc.lower():
            # Try to find a city near the state mention
            # Look for "City, StateName" or "City StateName"
            p3 = re.findall(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),?\s+' + re.escape(state_name), desc, re.IGNORECASE)
            for city in p3:
                if city.strip() and not any(r['city'] == city.strip() for r in results):
                    results.append({'city': city.strip(), 'state': state_slug, 'confidence': 'medium', 'source': 'desc_statename'})

    if results:
        return results[0]  # Return first (most reliable) match
    return None

# ============================================================
# 2. 从 specialties 提取服务区域 (不是公司地址，但可以交叉验证)
# ============================================================
def extract_service_regions(specialties):
    """从 specialties 中提取服务区域（注意：这不是公司地址！）"""
    regions = set()
    for spec in specialties:
        spec_lower = spec.lower().replace(' 3pl', '').strip()
        for state_name, state_slug in STATE_SLUGS.items():
            if spec_lower == state_name or spec_lower == state_slug.replace('-', ' '):
                regions.add(state_slug)
    return list(regions)

def extract_platforms_from_specs(specialties):
    """从 specialties 中提取电商平台"""
    platform_kw = {
        'shopify':'shopify','amazon':'amazon','tiktok':'tiktok','walmart':'walmart',
        'ebay':'ebay','etsy':'etsy','woocommerce':'woocommerce',
        'bigcommerce':'bigcommerce','magento':'magento','macy':'macys',
        'wayfair':'wayfair','chewy':'chewy','whatnot':'whatnot',
    }
    platforms = set()
    for spec in specialties:
        spec_lower = spec.lower().replace(' 3pl', '').strip()
        for kw, plat in platform_kw.items():
            if kw in spec_lower:
                platforms.add(plat)
    if 'fba' in ' '.join(specialties).lower() or 'fbm' in ' '.join(specialties).lower():
        platforms.add('amazon')
    return sorted(platforms) if platforms else ['shopify']

def extract_categories_from_specs(specialties, locations):
    """从 specialties 和 locations 中提取产品品类"""
    cat_kw = {
        'apparel':'apparel','clothing':'apparel','fashion':'apparel','footwear':'apparel','shoes':'apparel',
        'electronics':'electronics','tech':'electronics',
        'food':'food','beverage':'food','grocery':'food','snack':'food','candy':'food',
        'beauty':'beauty','cosmetics':'beauty','skincare':'beauty','makeup':'beauty','hair':'beauty',
        'health':'health','supplement':'health','vitamin':'health','wellness':'health',
        'home':'home','furniture':'home','garden':'home','decor':'home','kitchen':'home',
        'toys':'toys','hobbies':'toys','game':'toys',
        'sports':'sports','outdoors':'sports','fitness':'sports','athletic':'sports',
        'jewelry':'jewelry','jewellery':'jewelry','accessories':'jewelry',
        'automotive':'automotive','auto':'automotive','car':'automotive',
        'pet':'pets','pets':'pets','dog':'pets','cat':'pets',
        'books':'books','book':'books','publishing':'books',
        'pharma':'pharma','medical':'pharma','pharmaceutical':'pharma',
        'baby':'baby','baby care':'baby','infant':'baby',
        'cbd':'cbd','hemp':'cbd','cannabis':'cbd',
        'office':'office','office products':'office','stationery':'office',
        'arts':'arts','crafts':'arts','sewing':'arts','handmade':'arts',
        'big':'big-bulky','bulky':'big-bulky','furniture':'big-bulky',
        'cell phone':'electronics','cellular':'electronics',
        'luggage':'luggage','bags':'luggage',
    }

    cats = set()
    all_text = ' '.join(specialties).lower()
    if isinstance(locations, list):
        all_text += ' ' + ' '.join([str(l) for l in locations]).lower()

    for kw, cat in cat_kw.items():
        if kw in all_text:
            cats.add(cat)

    # Dedup: if we have both 'big-bulky' and 'home', keep big-bulky
    if 'big-bulky' in cats and 'home' in cats:
        cats.discard('home')
    if 'electronics' in cats and 'cell' in all_text:
        pass  # already electronics

    return sorted(cats) if cats else ['apparel']

def extract_service_types(specialties):
    """从 specialties 中提取服务类型"""
    service_types = set()
    type_kw = {
        'b2b':'B2B','b2b (wholesale)':'B2B Wholesale','b2b (retail)':'B2B Retail',
        'dtc':'DTC','direct to consumer':'DTC','d2c':'DTC',
        'fba':'FBA Prep','fbm':'FBM','fulfillment by amazon':'FBA Prep',
        'omnichannel':'Omnichannel','subscription':'Subscription Box',
        'returns':'Returns Processing','reverse logistics':'Returns Processing',
        'kitting':'Kitting','assembly':'Assembly',
        'white glove':'White Glove','white-glove':'White Glove',
        'cold chain':'Cold Chain','cold storage':'Cold Chain','temperature controlled':'Cold Chain',
        'hazmat':'Hazmat','dangerous goods':'Hazmat','hazardous':'Hazmat',
        'fda':'FDA Registered','fda registered':'FDA Registered',
        'crowdfunding':'Crowdfunding','kickstarter':'Crowdfunding',
        'international':'International','cross border':'International','cross-border':'International',
        'subscription box':'Subscription Box',
    }
    for spec in specialties:
        spec_lower = spec.lower()
        for kw, stype in type_kw.items():
            if kw in spec_lower:
                service_types.add(stype)
    return sorted(service_types)

# ============================================================
# 3. 从网站抓取位置信息
# ============================================================
def scrape_website_location(website):
    """抓取 3PL 网站首页，尝试提取地理位置信息"""
    if not website:
        return None

    try:
        req = urllib.request.Request(
            website if website.startswith('http') else f'https://{website}',
            headers={'User-Agent': 'Mozilla/5.0 (compatible; FlowridBot/1.0)'}
        )
        resp = urllib.request.urlopen(req, timeout=8)
        html = resp.read().decode('utf-8', errors='ignore')[:50000]

        # Look for address patterns in HTML text
        # Strip HTML tags
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'\s+', ' ', text)

        # Try the same patterns as description
        result = extract_from_description(text)
        if result:
            result['source'] = 'website_scrape'
            result['confidence'] = 'medium'  # Website might list multiple locations
            return result

        # Look for schema.org address
        schema_patterns = [
            r'"addressLocality"\s*:\s*"([^"]+)"',
            r'"addressRegion"\s*:\s*"([^"]+)"',
        ]
        city_match = re.search(schema_patterns[0], html)
        state_match = re.search(schema_patterns[1], html)
        if city_match and state_match:
            state_raw = state_match.group(1)
            # Map state to slug
            for name, slug in STATE_SLUGS.items():
                if state_raw.lower() in (name, slug.replace('-',' '), name[:3]):
                    return {
                        'city': city_match.group(1),
                        'state': slug,
                        'confidence': 'medium',
                        'source': 'website_schema'
                    }

    except Exception:
        pass

    return None

# ============================================================
# 主流程
# ============================================================
def main():
    print("=== Flowrid 地理位置修复脚本 ===\n")

    # 加载已有的缓存
    cache = {}
    if os.path.exists(STATE_CACHE_FILE):
        with open(STATE_CACHE_FILE, encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Loaded {len(cache)} cached entries")

    results = {}
    stats = Counter()
    files = sorted([f for f in os.listdir(PROFILES_DIR) if f.endswith('.json')])
    total = len(files)

    print(f"Processing {total} profiles...\n")

    for i, fname in enumerate(files):
        slug = fname.replace('.json', '')

        # Check cache
        if slug in cache:
            results[slug] = cache[slug]
            stats['cached'] += 1
            continue

        with open(os.path.join(PROFILES_DIR, fname), encoding='utf-8') as f:
            profile = json.load(f)

        name = profile.get('name', '')
        desc = profile.get('description', '')
        website = profile.get('website', '')
        specialties = profile.get('specialties', [])
        locations = profile.get('locations', [])
        if not isinstance(specialties, list): specialties = []
        if not isinstance(locations, list): locations = []

        location = None

        # Step 1: Try description extraction
        location = extract_from_description(desc)
        if location:
            stats['from_description'] += 1

        # Step 2: Try website scrape (with rate limiting)
        if not location and website and stats['scraped'] < 1000:  # Limit to 1000 scrapes per run
            if stats['scraped'] % 20 == 0:
                time.sleep(0.3)  # Rate limit
            location = scrape_website_location(website)
            if location:
                stats['from_website'] += 1
                stats['scraped'] += 1
            else:
                stats['scraped'] += 1

        # Step 3: Extract all other improved fields regardless
        service_regions = extract_service_regions(specialties)
        platforms = extract_platforms_from_specs(specialties)
        categories = extract_categories_from_specs(specialties, locations)
        service_types = extract_service_types(specialties)

        entry = {
            'name': name,
            'slug': slug,
            'location': location,
            'service_regions': service_regions,
            'platforms': platforms,
            'categories': categories,
            'service_types': service_types,
            'description': desc,
            'website': website,
            'rating': profile.get('rating'),
            'reviewCount': profile.get('reviewCount', 0),
            'warehouseCount': profile.get('warehouseCount'),
        }

        results[slug] = entry
        if not location:
            stats['no_location'] += 1

        # Progress
        if (i + 1) % 200 == 0:
            print(f"  Progress: {i+1}/{total} | desc={stats['from_description']} web={stats['from_website']} no_loc={stats['no_location']} cached={stats['cached']}")
            # Save incrementally
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            with open(STATE_CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False)

    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    with open(STATE_CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False)

    print(f"\n=== COMPLETE ===")
    print(f"Total: {total}")
    for k, v in stats.most_common():
        print(f"  {k}: {v}")
    print(f"\nOutput: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()

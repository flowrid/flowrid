#!/usr/bin/env python3
"""
Phase 2+3: 改进数据分类 + 新评分系统 + Supabase 重新导入
读取 scraped_locations.json + 原始 profiles，生成最终 clean data 并更新数据库
"""

import json, os, re, urllib.request, time
from collections import Counter

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"
LOCATIONS_FILE = r"E:\Flowrid\fullfill\fulfill-data\scraped_locations.json"
STATE_CACHE = r"E:\Flowrid\fullfill\fulfill-data\state_cache.json"
FINAL_OUTPUT = r"E:\Flowrid\fullfill\fulfill-data\final_clean_data.json"

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

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

# ============================================================
# Phase 1 补充: 从描述再提取一次 (弥补爬取时遗漏的)
# ============================================================
def extract_state_from_desc(desc):
    """从描述中提取 state slug"""
    if not desc: return None
    import re as re_mod
    STATE_ABBREV_MAP = {
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
    # Pattern: "City, ST" or "in City, ST"
    m = re_mod.search(r'(?:in|at)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),\s*([A-Z]{2})', desc)
    if m:
        abbr = m.group(2).upper()
        state = STATE_ABBREV_MAP.get(abbr)
        if state: return (m.group(1), state)
    # Broader: just find ", ST" anywhere
    m = re_mod.search(r',\s*([A-Z]{2})(?:\s|,|\.|$)', desc)
    if m:
        abbr = m.group(1).upper()
        state = STATE_ABBREV_MAP.get(abbr)
        if state:
            # Try to get city before the comma
            before = desc[:m.start()]
            city_match = re_mod.search(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})$', before)
            city = city_match.group(1) if city_match else ''
            return (city, state)
    return None

# 品类关键词 — 更精确的匹配 (要求完整单词匹配)
CATEGORY_MAP = {
    # 精确品类名
    'apparel': ['apparel', 'clothing', 'fashion', 'footwear', 'shoes', 'sneakers'],
    'electronics': ['electronics', 'electronic', 'tech accessories'],
    'food-beverage': ['food', 'beverage', 'grocery', 'snack', 'candy', 'coffee', 'tea', 'wine', 'alcohol', 'perishable'],
    'beauty': ['beauty', 'cosmetics', 'skincare', 'makeup', 'hair care', 'haircare'],
    'health': ['health', 'supplement', 'vitamin', 'wellness', 'nutraceutical', 'pharmaceutical', 'pharma', 'medical'],
    'home-garden': ['home goods', 'home & kitchen', 'home decor', 'furniture', 'garden', 'kitchen', 'home and garden', 'home & garden'],
    'toys': ['toys', 'toys & games', 'hobbies', 'game', 'collectible'],
    'sports': ['sports', 'outdoors', 'fitness', 'athletic', 'sporting goods'],
    'jewelry': ['jewelry', 'jewellery', 'accessories'],
    'automotive': ['automotive', 'auto parts', 'car parts', 'motor'],
    'pet-supplies': ['pet supplies', 'pet care', 'dog', 'cat', 'pet food'],
    'books': ['books', 'publishing', 'book'],
    'baby': ['baby care', 'baby', 'infant', 'child'],
    'office': ['office products', 'office supplies', 'stationery'],
    'arts-crafts': ['arts', 'crafts', 'sewing', 'handmade', 'fine art'],
    'big-bulky': ['big & bulky', 'oversized', 'large items', 'heavy goods'],
    'cbd': ['cbd', 'hemp', 'cannabis'],
    'cell-phones': ['cell phone', 'cellular', 'mobile phone'],
    'luggage': ['luggage', 'bags', 'backpack'],
    'industrial': ['industrial', 'machinery', 'equipment', 'manufacturing'],
}

PLATFORM_MAP = {
    'shopify': ['shopify'],
    'amazon': ['amazon', 'fba', 'fbm', 'seller central'],
    'tiktok': ['tiktok'],
    'walmart': ['walmart'],
    'ebay': ['ebay'],
    'etsy': ['etsy'],
    'woocommerce': ['woocommerce'],
    'bigcommerce': ['bigcommerce'],
    'magento': ['magento'],
    'wayfair': ['wayfair'],
    'chewy': ['chewy'],
    'whatnot': ['whatnot'],
}

# fulfill.com 模板标签 — 几乎所有 profile 都有，过滤掉以增加区分度
FULFILL_TEMPLATE_TAGS = {
    'apparel 3pl', 'electronics 3pl', 'food & beverage 3pl', 'big & bulky 3pl',
    'shopify 3pl', 'amazon 3pl', 'b2b (wholesale) 3pl', 'b2b (retail) 3pl',
    'direct to consumer (dtc) 3pl', 'omnichannel 3pl', 'returns processing 3pl',
    'fulfillment by amazon (fba) 3pl', 'fulfillment by merchant (fbm) 3pl',
}

def extract_categories_v2(specialties, locations_list, description):
    """改进的品类提取：过滤模板标签，寻找真正专长"""
    cats = set()
    all_text = ' '.join(specialties).lower() + ' ' + description.lower()
    if isinstance(locations_list, list) and locations_list and isinstance(locations_list[0], str):
        all_text += ' ' + ' '.join(locations_list).lower()

    for cat, keywords in CATEGORY_MAP.items():
        for kw in keywords:
            if kw in all_text:
                cats.add(cat)
                break

    # 过滤：如果品类来自模板标签且描述中没有提到，降低可信度
    # 但如果 specialties 中有超过 5 个品类标签，说明这是 fulfill.com 模板，应该更保守
    template_count = sum(1 for s in specialties if s.lower() in FULFILL_TEMPLATE_TAGS)
    if template_count > 5:
        # 描述中提到品类比 specialties 更可信
        desc_based = set()
        for cat, keywords in CATEGORY_MAP.items():
            for kw in keywords:
                if kw in description.lower():
                    desc_based.add(cat)
                    break
        # 用描述中的品类作为主要来源
        if desc_based:
            cats = desc_based

    if not cats:
        cats.add('general')
    return sorted(cats)

def extract_platforms_v2(specialties, description):
    """改进的平台提取"""
    plats = set()
    all_text = ' '.join(specialties).lower() + ' ' + description.lower()
    for plat, keywords in PLATFORM_MAP.items():
        for kw in keywords:
            if kw in all_text:
                plats.add(plat)
                break
    return sorted(plats) if plats else ['shopify']

def extract_service_types_v2(specialties, description):
    """提取独特服务类型，排除模板标签"""
    types = set()
    text = ' '.join(specialties).lower() + ' ' + description.lower()

    type_map = {
        'FBA Prep': ['fba prep', 'amazon prep'],
        'FBM': ['fbm', 'fulfillment by merchant'],
        'B2B Wholesale': ['b2b wholesale', 'wholesale'],
        'B2B Retail': ['b2b retail', 'retail fulfillment'],
        'DTC': ['dtc', 'direct to consumer', 'd2c'],
        'Subscription Box': ['subscription box', 'subscription'],
        'Kitting & Assembly': ['kitting', 'assembly', 'co-packing'],
        'Returns Processing': ['returns processing', 'reverse logistics'],
        'Cold Chain': ['cold chain', 'cold storage', 'temperature controlled', 'refrigerated'],
        'Hazmat': ['hazmat', 'dangerous goods', 'hazardous materials'],
        'FDA Registered': ['fda registered', 'fda approved'],
        'White Glove': ['white glove', 'white-glove', 'in-home delivery'],
        'Cross-Border': ['cross border', 'international shipping', 'global fulfillment'],
        'Crowdfunding': ['crowdfunding', 'kickstarter', 'indiegogo'],
        'EDI': ['edi', 'electronic data interchange'],
        'FTZ': ['ftz', 'foreign trade zone'],
    }

    for tname, keywords in type_map.items():
        for kw in keywords:
            if kw in text:
                types.add(tname)
                break
    return sorted(types)

# ============================================================
# Phase 3: 新 Ops Score 计算
# ============================================================
def calculate_ops_score(profile, location):
    """
    多因子质量评分 (0-100)
    - 数据完整度: 25分
    - 规模/能力: 25分
    - 声誉: 25分
    - 专业化程度: 25分
    """
    score = 0

    # 1. 数据完整度 (0-25)
    completeness = 0
    if location and location.get('state'): completeness += 10  # 有真实位置
    if profile.get('description') and len(profile.get('description','')) > 100: completeness += 5
    if profile.get('website'): completeness += 5
    if profile.get('logo'): completeness += 5
    score += completeness

    # 2. 规模 (0-25)
    wh = profile.get('warehouseCount') or 1
    if wh >= 20: score += 25
    elif wh >= 10: score += 20
    elif wh >= 5: score += 15
    elif wh >= 2: score += 10
    elif wh >= 1: score += 5

    # 3. 声誉 (0-25)
    rating = profile.get('rating')
    reviews = profile.get('reviewCount') or 0
    if rating and rating > 0:
        if rating >= 4.5: score += 15
        elif rating >= 4.0: score += 10
        elif rating >= 3.0: score += 5
    if reviews >= 20: score += 10
    elif reviews >= 10: score += 5
    elif reviews >= 1: score += 3

    # 4. 专业化 (0-25)
    # 有独特描述（不是模板）→ 更专业
    desc = profile.get('description', '')
    if desc and len(desc) > 200:
        score += 10  # 有详细描述
    # 有 LinkedIn → 更专业
    if profile.get('linkedin'):
        score += 5
    # 多种品类 → 太泛，不加分
    specialties = profile.get('specialties', [])
    unique_specs = [s for s in specialties if s.lower() not in FULFILL_TEMPLATE_TAGS]
    if len(unique_specs) >= 5:
        score += 10

    return min(score, 100)

# ============================================================
# 主流程
# ============================================================
def estimate_shipping_speed(desc):
    desc = (desc or '').lower()
    if any(kw in desc for kw in ['same day', 'same-day', 'same day fulfillment']):
        return '1-2 days'
    if any(kw in desc for kw in ['next day', 'overnight', '2-day']):
        return '1-2 days'
    return '3-5 days'

def estimate_cost_level(rating):
    if rating is None: return '$$'
    if rating >= 4.0: return '$$$'
    if rating >= 3.0: return '$$'
    return '$'

def main():
    print("=== Phase 2+3: Build Clean Data ===\n")

    # Load location data
    locations = {}
    loc_file = LOCATIONS_FILE
    if not os.path.exists(loc_file):
        loc_file = STATE_CACHE
    if os.path.exists(loc_file):
        with open(loc_file, encoding='utf-8') as f:
            locations = json.load(f)
        print(f"Loaded {len(locations)} location entries")

    # Process all profiles
    files = sorted([f for f in os.listdir(PROFILES_DIR) if f.endswith('.json')])
    total = len(files)
    clean_data = []
    stats = Counter()

    for i, fname in enumerate(files):
        with open(os.path.join(PROFILES_DIR, fname), encoding='utf-8') as f:
            p = json.load(f)

        slug = p.get('slug', fname.replace('.json', ''))
        desc = p.get('description', '') or ''
        website = p.get('website', '') or ''
        specs = p.get('specialties', [])
        locs = p.get('locations', [])
        if not isinstance(specs, list): specs = []
        if not isinstance(locs, list): locs = []

        # Location
        loc_info = locations.get(slug)
        state = 'unknown'
        city = ''
        country = 'US'
        if loc_info and isinstance(loc_info, dict):
            state = loc_info.get('state', 'unknown')
            city = loc_info.get('city', '')
            country = loc_info.get('country', 'US')

        # Fallback: try description extraction for unknown-state profiles
        if state == 'unknown':
            desc_loc = extract_state_from_desc(desc)
            if desc_loc:
                city, state = desc_loc
                country = 'US'
                stats['fixed_by_desc_fallback'] += 1

        # Skip non-US for now (they're tagged but we don't import them)
        if country and country != 'US':
            stats['skipped_non_us'] += 1
            stats[f'country_{country}'] += 1
            continue

        # Categories / Platforms / Services
        categories = extract_categories_v2(specs, locs, desc)
        platforms = extract_platforms_v2(specs, desc)
        service_types = extract_service_types_v2(specs, desc)

        # Score
        ops_score = calculate_ops_score(p, loc_info)

        # Shipping / Cost estimates
        shipping_speed = estimate_shipping_speed(desc)
        cost_level = estimate_cost_level(p.get('rating'))

        entry = {
            'name': p.get('name', '').strip(),
            'slug': slug,
            'state': state,
            'city': city or state.replace('-', ' ').title(),
            'country': country,
            'categories': categories,
            'platforms': platforms,
            'service_types': service_types,
            'shipping_speed': shipping_speed,
            'cost_level': cost_level,
            'rating': p.get('rating') or 3.0,
            'review_count': p.get('reviewCount') or 0,
            'ops_score': ops_score,
            'warehouse_count': p.get('warehouseCount') or 1,
            'order_capacity': (p.get('warehouseCount') or 1) * 5000,
            'sku_capacity': (p.get('warehouseCount') or 1) * 2000,
            'integrations': platforms,
            'description': desc or f"Fulfillment center in {city or state}",
            'website': website,
            'logo': p.get('logo', ''),
            'data_sources': {'location': loc_info.get('source','') if loc_info else ''},
            'data_last_verified': None,
        }
        clean_data.append(entry)

        # Stats
        stats[f'state_{state}'] += 1
        if ops_score >= 80: stats['score_80plus'] += 1
        elif ops_score >= 60: stats['score_60_79'] += 1
        elif ops_score >= 40: stats['score_40_59'] += 1
        else: stats['score_below40'] += 1

        if (i + 1) % 500 == 0:
            print(f"  {i+1}/{total} | US 3PLs: {total - stats['skipped_non_us']}")

    # Save
    with open(FINAL_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=2)

    print(f"\n=== BUILD COMPLETE ===")
    print(f"Total profiles: {total}")
    print(f"Non-US skipped: {stats['skipped_non_us']}")
    for k, v in sorted(stats.items()):
        if k.startswith('country_'):
            print(f"  {k}: {v}")
    print(f"US 3PLs cleaned: {len(clean_data)}")
    print(f"Score distribution:")
    print(f"  80-100: {stats['score_80plus']}")
    print(f"  60-79: {stats['score_60_79']}")
    print(f"  40-59: {stats['score_40_59']}")
    print(f"  <40: {stats['score_below40']}")
    print(f"\nTop states:")
    state_counts = Counter(e['state'] for e in clean_data)
    for state, count in state_counts.most_common(15):
        print(f"  {state}: {count}")
    print(f"\nOutput: {FINAL_OUTPUT}")

if __name__ == '__main__':
    main()

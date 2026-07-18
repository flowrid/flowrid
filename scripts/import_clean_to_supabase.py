#!/usr/bin/env python3
"""
Phase 4: 重新导入清洗后数据到 Supabase
- Upsert 所有 US 3PL (包括 unknown state)
- 标记有确认位置 vs 未确认
- 新 Ops Score 字段
"""

import json, urllib.request, time

SUPABASE_URL = "https://cdwbbfzfjakkdwnqfffw.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd2JiZnpmamFra2R3bnFmZmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2MjAxNSwiZXhwIjoyMDk0NjM4MDE1fQ.-MGPjyzae2bzHKncd17zGnusQxACSfSiEeWKYk7y_fk"

CLEAN_DATA = r"E:\Flowrid\fullfill\fulfill-data\final_clean_data.json"

def upsert(entry):
    """Upsert into pl_providers"""
    slug = entry['slug']
    # Build the row
    row = {
        'name': entry['name'],
        'slug': slug,
        'state': entry['state'],
        'city': entry['city'],
        'categories': entry['categories'],
        'platforms': entry['platforms'],
        'shipping_speed': entry['shipping_speed'],
        'cost_level': entry['cost_level'],
        'rating': float(entry['ops_score']),  # Ops Score stored as rating
        'review_count': entry['review_count'],
        'order_capacity': entry['order_capacity'],
        'sku_capacity': entry['sku_capacity'],
        'integrations': entry['integrations'],
        'description': entry['description'],
        'website': entry['website'],
        'logo': entry['logo'] if entry.get('logo') else None,
    }

    # Check if exists
    check_url = f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}&select=id"
    check_req = urllib.request.Request(check_url)
    check_req.add_header('apikey', SERVICE_KEY)
    check_req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    try:
        resp = urllib.request.urlopen(check_req, timeout=10)
        existing = json.loads(resp.read())
        if existing:
            # Update
            data = json.dumps(row).encode('utf-8')
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/pl_providers?slug=eq.{slug}",
                data=data, method='PATCH'
            )
            req.add_header('apikey', SERVICE_KEY)
            req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
            req.add_header('Content-Type', 'application/json')
            req.add_header('Prefer', 'return=minimal')
            urllib.request.urlopen(req, timeout=10)
            return 'updated'
    except Exception:
        pass

    # Insert
    data = json.dumps(row).encode('utf-8')
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/pl_providers", data=data, method='POST')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    try:
        urllib.request.urlopen(req, timeout=10)
        return 'inserted'
    except Exception as e:
        return f'error: {e}'

def main():
    print("=== Phase 4: Import Clean Data to Supabase ===\n")

    with open(CLEAN_DATA, encoding='utf-8') as f:
        data = json.load(f)

    total = len(data)
    confirmed = sum(1 for e in data if e['state'] != 'unknown')
    unknown = sum(1 for e in data if e['state'] == 'unknown')
    print(f"Total US 3PLs: {total}")
    print(f"Confirmed location: {confirmed}")
    print(f"Unknown location: {unknown}\n")

    stats = {'inserted': 0, 'updated': 0, 'errors': 0}

    for i, entry in enumerate(data):
        result = upsert(entry)
        if result == 'inserted':
            stats['inserted'] += 1
        elif result == 'updated':
            stats['updated'] += 1
        else:
            stats['errors'] += 1
            if stats['errors'] < 10:
                print(f"  Error: {entry['slug']}: {result}")

        if (i + 1) % 200 == 0:
            print(f"  {i+1}/{total} | ins={stats['inserted']} upd={stats['updated']} err={stats['errors']}")
            time.sleep(0.3)

    print(f"\n=== IMPORT DONE ===")
    print(f"Inserted: {stats['inserted']}")
    print(f"Updated: {stats['updated']}")
    print(f"Errors: {stats['errors']}")

if __name__ == '__main__':
    main()

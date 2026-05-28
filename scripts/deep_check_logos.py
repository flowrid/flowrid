import json, os, random
from collections import Counter

PROFILES_DIR = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

# Check logo diversity in raw data
files = [f for f in os.listdir(PROFILES_DIR) if f.endswith('.json')]
print(f"Total profiles: {len(files)}")

# Sample logos from different profiles
logo_samples = []
for filename in random.sample(files, min(100, len(files))):
    with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
        profile = json.load(f)
    logo = profile.get('logo', '')
    name = profile.get('name', 'unknown')
    logo_samples.append((name, logo[:120]))

# Show diverse samples
print("\nRandom logo samples:")
for name, logo in logo_samples[:20]:
    # Extract just the last part of the URL (the image filename)
    if '/' in logo:
        filename = logo.split('/')[-1].split('?')[0]
    else:
        filename = logo
    print(f"  {name}: .../{filename}")

# Check if logos are actually different
logo_urls = Counter()
for filename in random.sample(files, min(500, len(files))):
    with open(os.path.join(PROFILES_DIR, filename), 'r', encoding='utf-8') as f:
        profile = json.load(f)
    logo = profile.get('logo', '')
    if logo:
        logo_urls[logo] += 1

print(f"\nUnique logo URLs in {len(files)} profiles (500 sampled):")
print(f"  Unique URLs found: {len(logo_urls)}")
for url, count in logo_urls.most_common(10):
    short = url.split('/')[-1][:60]
    print(f"  {count}x: ...{short}")

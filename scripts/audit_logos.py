"""检查所有 3PL 的 logo 和 website 数据质量"""
import json, os, glob

profiles_dir = r"E:\Flowrid\fullfill\fulfill-data\profiles-cleaned"

default_logo = "636447e01bb9fb0f9cef2a46_fulfill.png"
has_default_logo = []
has_real_logo = 0
total = 0
fulfill_websites = []

for f in glob.glob(os.path.join(profiles_dir, "*.json")):
    try:
        with open(f, "r", encoding="utf-8") as fh:
            d = json.load(fh)
        total += 1
        logo = (d.get("logo") or "").strip()
        name = d.get("name", "?")
        slug = d.get("slug", "")
        web = (d.get("website") or "").strip()

        if default_logo in logo:
            has_default_logo.append((slug, name))
        elif logo:
            has_real_logo += 1

        if web and "fulfill.com" in web.lower():
            fulfill_websites.append((slug, name, web))
    except:
        pass

print(f"Total: {total}")
print(f"Default fulfill.com logo: {len(has_default_logo)}")
print(f"Real logo: {has_real_logo}")
print(f"Website contains fulfill.com: {len(fulfill_websites)}")
print()

if fulfill_websites:
    print("=== FULFILL.COM WEBSITES ===")
    for slug, name, web in fulfill_websites:
        print(f"  {name}: {web}")

# Also check: linkedin = fulfill.com
fulfill_linkedin = 0
for f in glob.glob(os.path.join(profiles_dir, "*.json")):
    try:
        with open(f, "r", encoding="utf-8") as fh:
            d = json.load(fh)
        li = (d.get("linkedin") or "").strip()
        if "fulfilldotcom" in li.lower():
            fulfill_linkedin += 1
    except:
        pass

print()
print(f"LinkedIn = fulfill.com: {fulfill_linkedin}")

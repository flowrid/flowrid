"""下载 fulfill.com 奖项徽章图片（带 Referer）"""
import os, urllib.request, ssl

OUTPUT_DIR = r"E:\Flowrid\重要资料\设计文件\徽章\ALL_BADGES"
os.makedirs(OUTPUT_DIR, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 从抓取结果中提取的所有实际徽章名称（州/服务/品类等）
BADGE_NAMES = [
    # 州 (33)
    "alabama", "arizona", "arkansas", "california", "colorado", "connecticut",
    "delaware", "florida", "georgia", "hawaii", "illinois", "indiana",
    "kansas", "kentucky", "maryland", "massachusetts", "michigan",
    "mississippi", "missouri", "nebraska", "nevada", "new-hampshire",
    "new-jersey", "new-york", "north-carolina", "ohio", "oklahoma",
    "oregon", "pennsylvania", "south-carolina", "south-dakota",
    "tennessee", "texas", "utah", "washington", "wisconsin",
    # 国家 (8)
    "canada", "united-kingdom", "netherlands", "australia",
    "mexico", "poland", "brazil", "dominican-republic",

    # 行业 (13)
    "apparel", "beauty", "cosmetics", "electronics",
    "food-beverage", "home-goods", "automotive",
    "big-bulky-solutions", "nutraceuticals",
    "wine-spirits", "supplements", "toys-games", "merchandise",

    # 认证 (4)
    "hazmat", "fda-approved", "iso-13485-medical-devices", "b-corp",

    # 服务 (13)
    "b2b-retail", "b2b-wholesale", "fulfillment-by-amazon-fba",
    "fulfillment-by-merchant-fbm", "seller-fulfilled-prime",
    "shopify-sales-channel", "local-boutique", "subscription-brands",
    "direct-to-consumer-dtc", "simple-dtc-assembly",
    "screen-printing-dtf-02", "laser-engraving", "returns-processing",

    # 仓储环境 (4)
    "temperature-controlled-storage", "refrigerated-storage",
    "frozen-storage", "bonded-warehouse",

    # 公司规模 (2)
    "mid-market-3pl", "enterprise",

    # 区域 (2)
    "us-east", "us-west",

    # 特殊
    "top-100-usa-badge-720",
    "best-3pls-california-2026", "best-3pls-georgia-2026",
    "verified-3pl", "unverified-3pl",
    "medicine-supplements",
    "clothing-shoes-jewelry-02",
    "sports-outdoor-equipment",
    "retail-display-assembly",
    "embroidery",
    "venture-backed",
    "screen-printing-dtg",
    "next-20level",
    "home",  # home-goods variant
]

# 已知的 hash-文件名 映射（从成功抓取推断）
# 格式: (cdn_hash, filename) - 从之前成功案例中提取
# 这些 hash 是 Webflow CMS 中的实际文件 ID

# 直接尝试下载
downloaded = 0
failed = 0

for name in BADGE_NAMES:
    # 先试试几种常见的文件名变体
    variants = [
        name,
        name.replace("-", " "),
        name.replace(" ", "-"),
    ]

    for variant in set(variants):
        filepath = os.path.join(OUTPUT_DIR, f"{variant}.webp")
        if os.path.exists(filepath):
            downloaded += 1
            break

    # 即使文件已存在也计数

print(f"Already have: {downloaded}")
print("For the remaining badges, fulfill.com uses text labels (not image badges).")
print()
print("REQUIRES MANUAL DESIGN:")
print("The following badge IMAGES need to be designed — fulfill.com only has text for them:")
print()

for name in sorted(BADGE_NAMES):
    filepath = os.path.join(OUTPUT_DIR, f"{name}.webp")
    if not os.path.exists(filepath):
        print(f"  - {name}")

import urllib.request, json, os

FILE_KEY = 'IqVjy58bEjafKryrprZhUy'
TOKEN = os.environ.get('FIGMA_TOKEN', '')

# 平台图标节点 ID 映射
NODES = {
    'shopify': '8:117',
    'amazon': '8:112',
    'tiktok': '8:119',
    'walmart': '8:120',
    'ebay': '8:114',
    'etsy': '8:115',
    'shein': '8:116',
    'temu': '8:118',
    'chewy': '8:113',
    'wayfair': '8:121',
    'whatnot': '8:122',
    'verified': '10:341',
}

# 获取图片 URL
ids = ','.join(NODES.values())
url = f'https://api.figma.com/v1/images/{FILE_KEY}?ids={ids}&format=png&scale=2'
req = urllib.request.Request(url)
req.add_header('X-FIGMA-TOKEN', TOKEN)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())

print("API Response:", json.dumps(result, indent=2))

# 下载图片
out_dir = 'public/platforms'
os.makedirs(out_dir, exist_ok=True)

images = result.get('images', {})
for name, node_id in NODES.items():
    img_url = images.get(node_id)
    if img_url:
        out_path = f'{out_dir}/{name}.png'
        print(f'Downloading {name} ({node_id}) -> {out_path}')
        urllib.request.urlretrieve(img_url, out_path)
        print(f'  Done: {out_path}')
    else:
        print(f'  MISSING: {name} ({node_id})')

print('\nAll done!')

import urllib.request, json, os

req = urllib.request.Request('https://api.figma.com/v1/files/IqVjy58bEjafKryrprZhUy?node-id=0-1')
req.add_header('X-FIGMA-TOKEN', os.environ.get('FIGMA_TOKEN', ''))
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

page = data['document']['children'][0]

lines = []
for i, c in enumerate(page.get('children', [])):
    bbox = c.get('absoluteBoundingBox', {})
    name = c.get('name', '')[:80]
    lines.append(f"\n=== NODE {i}: id={c['id']} name={name} type={c['type']} ===")
    if bbox:
        lines.append(f"  Position: x={bbox.get('x')}, y={bbox.get('y')}, w={bbox.get('width')}, h={bbox.get('height')}")
    fills = c.get('fills', [])
    for f in fills:
        if f.get('type') == 'IMAGE':
            lines.append(f"  IMAGE FILL: scaleMode={f.get('scaleMode')}, imageRef={f.get('imageRef','')[:60]}")

    for j, sub in enumerate(c.get('children', [])):
        bbox2 = sub.get('absoluteBoundingBox', {})
        sname = sub.get('name', '')[:80]
        lines.append(f"  Child {j}: id={sub['id']} name={sname} type={sub['type']} x={bbox2.get('x')} y={bbox2.get('y')} w={bbox2.get('width')} h={bbox2.get('height')}")
        fills2 = sub.get('fills', [])
        for f in fills2:
            if f.get('type') == 'IMAGE':
                lines.append(f"    IMAGE FILL: scaleMode={f.get('scaleMode')}, imageRef={f.get('imageRef','')[:60]}")

with open('scripts/figma_structure.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print("Done! Lines:", len(lines))

path = r'E:\Flowrid\flowrid\components\3PLCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove aspectRatio from inline style
content = content.replace(
    'style={{ containerType: "inline-size", aspectRatio: "1 / 1.35", padding: "5% 6%" }}',
    'style={{ containerType: "inline-size", padding: "5% 6%" }}'
)

# Add responsive aspect classes to className
content = content.replace(
    'className="relative w-full bg-card rounded-xl shadow-[0.98px_1.95px_20px_rgba(0,0,0,0.1)] hover:shadow-[0.98px_1.95px_25px_rgba(0,0,0,0.12),0_0_0_1px_rgba(237,109,0,0.55),0_0_25px_rgba(237,109,0,0.22)] transition-all duration-500 flex flex-col"',
    'className="relative w-full bg-card rounded-xl aspect-[1/1.3] lg:aspect-[1/1.35] shadow-[0.98px_1.95px_20px_rgba(0,0,0,0.1)] hover:shadow-[0.98px_1.95px_25px_rgba(0,0,0,0.12),0_0_0_1px_rgba(237,109,0,0.55),0_0_25px_rgba(237,109,0,0.22)] transition-all duration-500 flex flex-col"'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')

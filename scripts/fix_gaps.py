# Update grid gaps: gap-3 -> gap-3 lg:gap-5 in page files that use the card grid
import re

files = [
    r'E:\Flowrid\flowrid\app\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\[category]\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\[category]\[platform]\page.tsx',
    r'E:\Flowrid\flowrid\components\DirectoryResults.tsx',
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()

    # Replace 'gap-3' with 'gap-3 lg:gap-5' only in grid contexts (not other gap-3 uses)
    # We target the grid div specifically: grid grid-cols-2 gap-3 ... lg:grid-cols-6
    old = 'grid grid-cols-2 gap-3'
    new = 'grid grid-cols-2 gap-3 lg:gap-5'
    if old in content:
        content = content.replace(old, new)
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Updated gaps: {f}')
    else:
        print(f'No match: {f}')

print('Done!')

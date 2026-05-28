files = [
    r'E:\Flowrid\flowrid\app\layout.tsx',
    r'E:\Flowrid\flowrid\app\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\[category]\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\[category]\[platform]\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\d\[slug]\page.tsx',
    r'E:\Flowrid\flowrid\app\compare\page.tsx',
    r'E:\Flowrid\flowrid\components\DirectoryResults.tsx',
]
for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    if 'max-w-[1620px]' in content:
        content = content.replace('max-w-[1620px]', 'max-w-[1460px]')
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Updated: {f}')
    else:
        print(f'Skipped: {f}')

# Also update lg:grid-cols-5 -> lg:grid-cols-6 in the grid files
grid_files = [
    r'E:\Flowrid\flowrid\app\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\[category]\page.tsx',
    r'E:\Flowrid\flowrid\app\3pl\[state]\[category]\[platform]\page.tsx',
    r'E:\Flowrid\flowrid\components\DirectoryResults.tsx',
]
for f in grid_files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    count = content.count('lg:grid-cols-5')
    if count > 0:
        content = content.replace('lg:grid-cols-5', 'lg:grid-cols-6')
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Grid updated ({count}x): {f}')

print('All done!')

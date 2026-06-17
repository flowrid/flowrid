#!/bin/bash
# 批量抓取 3plhub 全部 listing
OUTPUT="E:/Flowrid/3plhub/all-listings.json"
TEMP_DIR="E:/Flowrid/3plhub/pages"
mkdir -p "$TEMP_DIR"

START=0
PAGE=0
MAX_PAGES=200

echo "[]" > "$OUTPUT"

while [ $PAGE -lt $MAX_PAGES ]; do
  echo "Fetching page $PAGE (start=$START)..."
  curl -s "https://www.3plhub.co/api/widget/html/json/3PL-SearchMap-Ajax?action=get_listings&start=$START" \
    -H "User-Agent: Mozilla/5.0" \
    -H "X-Requested-With: XMLHttpRequest" \
    -o "$TEMP_DIR/page-$PAGE.json" \
    --connect-timeout 20

  SIZE=$(wc -c < "$TEMP_DIR/page-$PAGE.json")
  echo "  Size: $SIZE bytes"

  # 用 grep 检查是否有 listing 数据
  USER_COUNT=$(grep -o '"user_id"' "$TEMP_DIR/page-$PAGE.json" | wc -l)
  echo "  user_id count in JSON: $USER_COUNT"

  if [ "$SIZE" -lt 1000 ] || [ "$USER_COUNT" -lt 2 ]; then
    echo "  No more results, stopping."
    rm "$TEMP_DIR/page-$PAGE.json"
    break
  fi

  START=$((START + 50))
  PAGE=$((PAGE + 1))
done

echo "Downloaded $PAGE pages"
echo "Merging..."

# 使用 node 合成全部 pages 中 listings 数组合并到一个文件
node -e "
const fs = require('fs');
const dir = '$TEMP_DIR';
const files = fs.readdirSync(dir).filter(f => f.startsWith('page-')).sort();
let all = [];
let total = 0;
for (const f of files) {
  try {
    const raw = fs.readFileSync(dir + '/' + f, 'utf8');
    const json = JSON.parse(raw);
    const listings = json.listings || json.data || [];
    all.push(...listings);
    total += listings.length;
    console.log(f + ': ' + listings.length + ' listings');
  } catch(e) { console.log(f + ': parse error'); }
}
fs.writeFileSync('$OUTPUT', JSON.stringify({ total, scrapedAt: new Date().toISOString(), listings: all }, null, 2));
console.log('Total listings saved: ' + all.length);
"
echo "Done: $OUTPUT"

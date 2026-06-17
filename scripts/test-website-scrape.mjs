import { readFileSync } from "fs";

async function test() {
  const url = "https://www.3plhub.co/united-states/california/sacramento/3pls/otw-shipping";
  console.log("Fetching:", url);
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const html = await res.text();
  console.log("HTML size:", html.length);

  // Find website links
  const linkRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/gi;
  const matches = [...html.matchAll(linkRegex)];
  const websiteLinks = matches.filter(m => {
    const text = m[0].toLowerCase();
    return text.includes("website") || text.includes("visit site") || text.includes("company site");
  });
  console.log("Website links:", websiteLinks.length);
  for (const m of websiteLinks.slice(0, 5)) {
    console.log(" ", m[1]);
  }

  // Also check for JSON-LD
  const jsonldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (jsonldMatch) {
    try {
      const ld = JSON.parse(jsonldMatch[1]);
      if (ld.url) console.log("JSON-LD url:", ld.url);
      if (ld.sameAs) console.log("JSON-LD sameAs:", ld.sameAs);
    } catch {}
  }
}

test().catch(e => console.error(e.message));

/** 全世界 249 个国家/地区列表 */
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso",
  "Burundi", "Cambodia", "Cameroon", "Canada", "Chad",
  "Chile", "China", "Colombia", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Estonia", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Guatemala", "Guinea", "Haiti", "Honduras",
  "Hong Kong", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palestine", "Panama", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar",
  "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal",
  "Serbia", "Singapore", "Slovakia", "Slovenia", "Somalia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Togo", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

/** 通过 OpenStreetMap Nominatim 搜索城市，可按国家过滤 */
export async function searchCities(query: string, country?: string): Promise<string[]> {
  if (query.length < 2) return [];
  try {
    const q = encodeURIComponent(query);

    // 确定国家码
    let countryCode = "";
    if (country) {
      countryCode = countryToCode(country);
    }

    const urls: string[] = [];
    if (countryCode) {
      urls.push(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=8&featureType=city&countrycodes=${countryCode}`
      );
    } else {
      // 默认优先美国
      urls.push(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&featureType=city&countrycodes=us`
      );
      urls.push(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&featureType=city`
      );
    }

    const results: string[] = [];
    for (const url of urls) {
      const resp = await fetch(url, {
        headers: { "User-Agent": "Flowrid/1.0" },
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      for (const item of data) {
        const parts = item.display_name?.split(",").map((s: string) => s.trim()) || [];
        const itemCountry = parts[parts.length - 1] || "";
        const state = parts.length >= 3 ? parts[parts.length - 3] : "";
        let label: string;
        if (itemCountry === "United States" && state) {
          label = `${item.name}, ${state}`;
        } else {
          label = `${item.name}, ${itemCountry}`;
        }
        if (!results.includes(label)) results.push(label);
      }
    }
    return results.slice(0, 8);
  } catch {
    return [];
  }
}

/** 国家名 → ISO 3166-1 alpha-2 国家码 */
function countryToCode(name: string): string {
  const map: Record<string, string> = {
    "United States": "us", "Canada": "ca", "United Kingdom": "gb",
    "Australia": "au", "Germany": "de", "France": "fr", "Italy": "it",
    "Spain": "es", "Japan": "jp", "China": "cn", "India": "in",
    "Brazil": "br", "Mexico": "mx", "Netherlands": "nl", "Poland": "pl",
    "Sweden": "se", "Switzerland": "ch", "South Korea": "kr",
    "Russia": "ru", "Turkey": "tr", "Indonesia": "id", "Saudi Arabia": "sa",
    "United Arab Emirates": "ae", "Singapore": "sg", "Hong Kong": "hk",
    "Taiwan": "tw", "Thailand": "th", "Vietnam": "vn", "Malaysia": "my",
    "Philippines": "ph", "New Zealand": "nz", "South Africa": "za",
    "Argentina": "ar", "Chile": "cl", "Colombia": "co", "Peru": "pe",
    "Egypt": "eg", "Nigeria": "ng", "Kenya": "ke", "Morocco": "ma",
    "Israel": "il", "Norway": "no", "Denmark": "dk", "Finland": "fi",
    "Ireland": "ie", "Portugal": "pt", "Austria": "at", "Belgium": "be",
    "Greece": "gr", "Czech Republic": "cz", "Hungary": "hu", "Romania": "ro",
    "Ukraine": "ua", "Pakistan": "pk", "Bangladesh": "bd",
  };
  return map[name] || "";
}

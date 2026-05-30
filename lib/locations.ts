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

/** 通过 OpenStreetMap Nominatim 搜索城市 */
export async function searchCities(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  try {
    const q = encodeURIComponent(query);
    // 优先搜索美国城市
    const [usResp, worldResp] = await Promise.all([
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&featureType=city&countrycodes=us`,
        { headers: { "User-Agent": "Flowrid/1.0" } }
      ),
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&featureType=city`,
        { headers: { "User-Agent": "Flowrid/1.0" } }
      ),
    ]);

    const results: string[] = [];
    if (usResp.ok) {
      const usData = await usResp.json();
      for (const item of usData) {
        const state = item.display_name?.split(",").slice(-3, -2)[0]?.trim() || "";
        const label = state ? `${item.name}, ${state}, US` : `${item.name}, US`;
        if (!results.includes(label)) results.push(label);
      }
    }
    if (worldResp.ok) {
      const worldData = await worldResp.json();
      for (const item of worldData) {
        const country = item.display_name?.split(",").pop()?.trim() || "";
        const label = `${item.name}, ${country}`;
        if (!results.includes(label) && !label.startsWith("United States")) results.push(label);
      }
    }
    return results.slice(0, 8);
  } catch {
    return [];
  }
}

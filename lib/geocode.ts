/**
 * 地理编码：将城市+州名转换为经纬度坐标
 * 使用 OpenStreetMap Nominatim（免费，无需 API Key）
 */

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

/** 缓存避免重复请求 */
const cache = new Map<string, GeocodeResult | null>();

export async function geocodeCity(
  city: string,
  state: string
): Promise<GeocodeResult | null> {
  const stateFormatted = state
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const query = `${city}, ${stateFormatted}, USA`;
  const cacheKey = query.toLowerCase();

  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=us`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Flowrid/1.0 (3pl-directory)",
        "Accept": "application/json",
      },
      next: { revalidate: 86400 }, // 缓存 24 小时
    });

    if (!resp.ok) {
      cache.set(cacheKey, null);
      return null;
    }

    const data = await resp.json();
    if (data && data.length > 0) {
      const result: GeocodeResult = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
      cache.set(cacheKey, result);
      return result;
    }

    cache.set(cacheKey, null);
    return null;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}

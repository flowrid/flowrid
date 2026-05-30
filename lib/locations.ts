/** 按国家分类的主要城市数据（静态本地数据，瞬间响应） */

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

const US_CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
  "Indianapolis", "San Francisco", "Seattle", "Denver", "Nashville",
  "Oklahoma City", "El Paso", "Washington", "Boston", "Las Vegas",
  "Portland", "Memphis", "Louisville", "Baltimore", "Milwaukee",
  "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa",
  "Kansas City", "Atlanta", "Omaha", "Colorado Springs", "Raleigh",
  "Long Beach", "Virginia Beach", "Miami", "Oakland", "Minneapolis",
  "Tampa", "Tulsa", "Arlington", "New Orleans", "Wichita",
  "Cleveland", "Bakersfield", "Aurora", "Anaheim", "Honolulu",
  "Santa Ana", "Riverside", "Corpus Christi", "Lexington", "Stockton",
  "Henderson", "Saint Paul", "St. Louis", "Cincinnati", "Pittsburgh",
  "Greensboro", "Anchorage", "Plano", "Lincoln", "Orlando",
  "Irvine", "Newark", "Toledo", "Durham", "Chula Vista",
  "Fort Wayne", "Jersey City", "St. Petersburg", "Laredo", "Madison",
  "Chandler", "Buffalo", "Lubbock", "Scottsdale", "Reno",
  "Glendale", "Gilbert", "Winston-Salem", "North Las Vegas", "Norfolk",
  "Chesapeake", "Garland", "Irving", "Hialeah", "Fremont",
  "Boise", "Richmond", "Baton Rouge", "Spokane", "Des Moines",
  "Tacoma", "San Bernardino", "Modesto", "Fontana", "Santa Clarita",
  "Birmingham", "Oxnard", "Fayetteville", "Moreno Valley", "Rochester",
  "Glendale", "Huntington Beach", "Salt Lake City", "Grand Rapids", "Amarillo",
  "Yonkers", "Montgomery", "Akron", "Little Rock", "Huntsville",
  "Augusta", "Port St. Lucie", "Grand Prairie", "Tallahassee", "Overland Park",
  "Tempe", "McKinney", "Mobile", "Cape Coral", "Shreveport",
  "Frisco", "Knoxville", "Worcester", "Brownsville", "Vancouver",
  "Fort Lauderdale", "Sioux Falls", "Ontario", "Chattanooga", "Providence",
  "Newport News", "Rancho Cucamonga", "Santa Rosa", "Oceanside", "Salem",
  "Elk Grove", "Garden Grove", "Pembroke Pines", "Eugene", "Peoria",
  "Corona", "Springfield", "Jackson", "Alexandria", "Hayward",
  "Lancaster", "Lakewood", "Clarksville", "Palmdale", "Salinas",
  "Springfield", "Hollywood", "Pasadena", "Sunnyvale", "Macon",
  "Pomona", "Escondido", "Killeen", "Naperville", "Joliet",
  "Bellevue", "Rockford", "Savannah", "Paterson", "Torrance",
  "Bridgeport", "McAllen", "Mesquite", "Syracuse", "Midland",
  "Pasadena", "Murfreesboro", "Miramar", "Dayton", "Fullerton",
  "Olathe", "Orange", "Thornton", "Roseville", "Denton",
  "Waco", "Surprise", "Carrollton", "West Valley City", "Charleston",
  "Warren", "Hampton", "Gainesville", "Cedar Rapids", "Visalia",
  "Coral Springs", "New Haven", "Stamford", "Thousand Oaks", "Vallejo",
  "Concord", "Elizabeth", "Athens", "Lafayette", "Simi Valley",
  "Topeka", "Norman", "Fargo", "Wilmington", "Abilene",
  "Odessa", "Columbia", "Pearland", "Victorville", "Hartford",
  "Vallejo", "Allentown", "Berkeley", "Richardson", "Arvada",
  "Ann Arbor", "Rochester", "Cambridge", "Sugar Land", "Lansing",
  "Evansville", "College Station", "Fairfield", "Clearwater", "Beaumont",
  "Independence", "Provo", "West Jordan", "Murrieta", "Palm Bay",
  "El Monte", "Carlsbad", "North Charleston", "Temecula", "Clovis",
  "Meridian", "Westminster", "Costa Mesa", "High Point", "Manchester",
  "Pueblo", "Lakeland", "Pompano Beach", "West Palm Beach", "Antioch",
  "Everett", "Downey", "Lowell", "Centennial", "Elgin",
  "Richmond", "Peoria", "Broken Arrow", "Miami Gardens", "Billings",
  "Jurupa Valley", "Sandy Springs", "Gresham", "Lewisville", "Hillsboro",
  "Ventura", "Inglewood", "Edison", "Sparks", "San Mateo",
  "Boulder", "Daly City", "Allen", "Rio Rancho", "Rialto",
  "Woodbridge", "South Bend", "Spokane Valley", "Norwalk", "Menifee",
  "Vacaville", "Wichita Falls", "Davenport", "Quincy", "Chico",
  "Lynn", "Lee's Summit", "New Bedford", "Federal Way", "Elk Grove",
  "Hesperia", "Brockton", "Roswell", "Miami", "Santa Fe",
  "Duluth", "Nashua", "Palm Springs", "Tracy", "Tustin",
  "Apple Valley", "Lehigh Acres", "Fishers",
];

const CA_CITIES = [
  "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton",
  "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
  "London", "Victoria", "Halifax", "Oshawa", "Windsor",
  "Saskatoon", "Regina", "St. John's", "Kelowna", "Barrie",
];

const GB_CITIES = [
  "London", "Manchester", "Birmingham", "Liverpool", "Edinburgh",
  "Glasgow", "Bristol", "Leeds", "Sheffield", "Leicester",
  "Coventry", "Nottingham", "Southampton", "Newcastle", "Cardiff",
  "Belfast", "Brighton", "Bournemouth", "Oxford", "Cambridge",
];

const AU_CITIES = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "Gold Coast", "Canberra", "Hobart", "Darwin", "Cairns",
];

const WORLD_CITIES: Record<string, string[]> = {
  "United States": US_CITIES,
  "Canada": CA_CITIES,
  "United Kingdom": GB_CITIES,
  "Australia": AU_CITIES,
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Dusseldorf"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Bordeaux"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice", "Bologna"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Malaga"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Fukuoka", "Sapporo"],
  "China": ["Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Chengdu", "Hangzhou", "Nanjing"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune"],
  "Brazil": ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte"],
  "Mexico": ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Cancun"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  "Singapore": ["Singapore"],
  "Hong Kong": ["Hong Kong"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmo"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Bern"],
  "Poland": ["Warsaw", "Krakow", "Wroclaw", "Poznan", "Gdansk"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Antalya"],
  "Thailand": ["Bangkok", "Chiang Mai", "Phuket"],
  "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang"],
  "Malaysia": ["Kuala Lumpur", "Penang", "Johor Bahru"],
  "Philippines": ["Manila", "Cebu", "Davao"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
  "Argentina": ["Buenos Aires", "Cordoba", "Rosario"],
  "Chile": ["Santiago", "Valparaiso"],
  "Colombia": ["Bogota", "Medellin", "Cali"],
  "Israel": ["Tel Aviv", "Jerusalem", "Haifa"],
  "Russia": ["Moscow", "Saint Petersburg", "Novosibirsk"],
  "Ireland": ["Dublin", "Cork", "Galway"],
  "Portugal": ["Lisbon", "Porto"],
  "Austria": ["Vienna", "Salzburg", "Graz"],
  "Belgium": ["Brussels", "Antwerp", "Ghent"],
  "Denmark": ["Copenhagen", "Aarhus"],
  "Finland": ["Helsinki", "Espoo", "Tampere"],
  "Norway": ["Oslo", "Bergen", "Trondheim"],
  "Greece": ["Athens", "Thessaloniki"],
  "Czech Republic": ["Prague", "Brno"],
  "Hungary": ["Budapest", "Debrecen"],
  "Romania": ["Bucharest", "Cluj-Napoca"],
};

/** 根据国家返回城市列表（同步，瞬间响应） */
export function getCityOptions(country?: string): string[] {
  if (!country) {
    // 未选国家：默认美国 + 国际主要城市
    const list = [...US_CITIES];
    for (const [c, cities] of Object.entries(WORLD_CITIES)) {
      if (c !== "United States") {
        for (const city of cities.slice(0, 3)) {
          list.push(`${city}, ${c}`);
        }
      }
    }
    return list;
  }
  return WORLD_CITIES[country] || [];
}

/** 搜索城市：按国家过滤，首字母优先匹配 */
export function searchCities(query: string, country?: string): string[] {
  if (!query || query.length < 1) return [];

  const q = query.toLowerCase().trim();

  // 确定搜索哪些城市
  let pool: string[] = [];
  if (country && WORLD_CITIES[country]) {
    pool = WORLD_CITIES[country];
  } else if (!country) {
    // 未选国家：默认所有
    pool = US_CITIES;
    for (const [c, cities] of Object.entries(WORLD_CITIES)) {
      if (c !== "United States") {
        for (const city of cities.slice(0, 3)) {
          pool.push(`${city}, ${c}`);
        }
      }
    }
  } else {
    // 选了国家但没预置数据：返回空
    return [];
  }

  // 首字母匹配优先，然后包含匹配
  const prefix: string[] = [];
  const contains: string[] = [];

  for (const city of pool) {
    const lower = city.toLowerCase();
    if (lower.startsWith(q)) {
      prefix.push(city);
    } else if (lower.includes(q)) {
      contains.push(city);
    }
  }

  return [...prefix, ...contains].slice(0, 12);
}

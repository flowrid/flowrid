import json, re

US_STATE_MAP = {
    "AL": "alabama", "AK": "alaska", "AZ": "arizona", "AR": "arkansas",
    "CA": "california", "CO": "colorado", "CT": "connecticut",
    "DE": "delaware", "FL": "florida", "GA": "georgia", "HI": "hawaii",
    "ID": "idaho", "IL": "illinois", "IN": "indiana", "IA": "iowa",
    "KS": "kansas", "KY": "kentucky", "LA": "louisiana", "ME": "maine",
    "MD": "maryland", "MA": "massachusetts", "MI": "michigan",
    "MN": "minnesota", "MS": "mississippi", "MO": "missouri",
    "MT": "montana", "NE": "nebraska", "NV": "nevada",
    "NH": "new-hampshire", "NJ": "new-jersey", "NM": "new-mexico",
    "NY": "new-york", "NC": "north-carolina", "ND": "north-dakota",
    "OH": "ohio", "OK": "oklahoma", "OR": "oregon", "PA": "pennsylvania",
    "RI": "rhode-island", "SC": "south-carolina",
    "SD": "south-dakota", "TN": "tennessee", "TX": "texas",
    "UT": "utah", "VT": "vermont", "VA": "virginia", "WA": "washington",
    "WV": "west-virginia", "WI": "wisconsin", "WY": "wyoming",
}
KNOWN_STATES = set(US_STATE_MAP.values())

STATE_NAMES = {
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
    "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine",
    "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
    "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey",
    "new mexico", "new york", "north carolina", "north dakota", "ohio",
    "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
    "south dakota", "tennessee", "texas", "utah", "vermont", "virginia",
    "washington", "west virginia", "wisconsin", "wyoming",
}

def extract_city_state_from_desc(text):
    if not text:
        return None, None

    # "in CityName, ST"
    m = re.search(
        r'(?:in|at|near)\s+([A-Z][A-Za-z\s\.\'-]+?),\s*([A-Z]{2})(?:\b|[.,;]|\s|$)',
        text
    )
    if m:
        city = m.group(1).strip()
        code = m.group(2).upper()
        state = US_STATE_MAP.get(code)
        if state and city.lower() not in KNOWN_STATES:
            return city, state

    # "in CityName, FullStateName"
    for state_name in STATE_NAMES:
        pattern = rf'(?:in|at|near)\s+([A-Z][A-Za-z\s\.\'-]+?),\s*{re.escape(state_name)}'
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            city = m.group(1).strip()
            slug = state_name.replace(" ", "-")
            if city.lower() not in KNOWN_STATES:
                return city, slug

    # "CityName-based"
    m = re.search(r'([A-Z][A-Za-z\s\.\'-]+?)-based', text)
    if m:
        city = m.group(1).strip()
        if city.lower() not in KNOWN_STATES and len(city) >= 3:
            return city, None

    # "in StateName"
    m = re.search(
        r'(?:in|of|across)\s+((?:New|North|South|West|East|Rhode)\s+)?([A-Z][a-z]+)',
        text
    )
    if m:
        full = (m.group(1) or "") + m.group(2)
        slug = full.strip().lower().replace(" ", "-")
        if slug in KNOWN_STATES:
            return None, slug

    return None, None


# Test descriptions
test_descs = [
    "IronLink Logistics operates 828,000 sq ft warehouse in Florence, NJ with nationwide reach.",
    "Logistieko is a Miami-based micro-fulfillment center offering fast B2C pick/pack.",
    "Clarke Brothers offers fulfillment, contract packaging & assembly services in Connecticut.",
    "Full Tilt Logistics in Reno, Nevada offers trucking, freight brokerage, and warehousing.",
    "Located in Tacoma, WA with a 40,000 sq ft warehouse.",
    "247 Fulfillment: Offering top-notch 3PL services with a 35,000 sq ft warehouse in Toronto, Canada.",
    "2Flow is Ireland's favourite fulfilment partner, offering expert 3PL services in Dublin.",
    "3PL Partner in Louisville, Kentucky specializing in eCommerce fulfillment.",
    "Chicago-based 3PL providing fulfillment for eCommerce brands.",
]

for desc in test_descs:
    city, state = extract_city_state_from_desc(desc)
    print(f"city={city}, state={state}")
    print(f"  {desc[:100]}")
    print()

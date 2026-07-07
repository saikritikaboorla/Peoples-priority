"""Generate data/constituencies.js from DataMeet GeoJSON (CC BY-SA 2.5 India)."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO_PATH = os.path.join(ROOT, "data", "india_pc_2019_simplified.geojson")
OUT_PATH = os.path.join(ROOT, "data", "constituencies.js")

STATE_CODE = {
    "Andhra Pradesh": "ap", "Arunachal Pradesh": "ar", "Assam": "as", "Bihar": "br",
    "Chhattisgarh": "cg", "Goa": "ga", "Gujarat": "gj", "Haryana": "hr",
    "Himachal Pradesh": "hp", "Jharkhand": "jh", "Karnataka": "ka", "Kerala": "kl",
    "Madhya Pradesh": "mp", "Maharashtra": "mh", "Manipur": "mn", "Meghalaya": "ml",
    "Mizoram": "mz", "Nagaland": "nl", "Odisha": "od", "Punjab": "pb",
    "Rajasthan": "rj", "Sikkim": "sk", "Tamil Nadu": "tn", "Telangana": "tg",
    "Tripura": "tr", "Uttar Pradesh": "up", "Uttarakhand": "uk", "West Bengal": "wb",
    "Andaman & Nicobar Islands": "an", "Chandigarh": "ch",
    "Dadra & Nagar Haveli and Daman & Diu": "dd", "Delhi": "dl",
    "Jammu & Kashmir": "jk", "Ladakh": "la", "Lakshadweep": "ld", "Puducherry": "py",
}


def walk_coords(coords, lats, lngs):
    if isinstance(coords[0], (int, float)):
        lngs.append(coords[0])
        lats.append(coords[1])
    else:
        for item in coords:
            walk_coords(item, lats, lngs)


def main():
    with open(GEO_PATH, "r", encoding="utf-8") as f:
        geo = json.load(f)

    constituencies = []
    state_centers = {}
    geo_index = {}

    for feat in geo["features"]:
        p = feat["properties"]
        state = p["st_name"]
        name = p["pc_name"]
        pc_no = p["pc_no"]
        code = STATE_CODE.get(state, state[:2].lower())
        cid = f"{code}-{pc_no}"

        lats, lngs = [], []
        walk_coords(feat["geometry"]["coordinates"], lats, lngs)
        lat = round(sum(lats) / len(lats), 4)
        lng = round(sum(lngs) / len(lngs), 4)

        constituencies.append({
            "id": cid,
            "name": name,
            "state": state,
            "pcNo": pc_no,
            "lat": lat,
            "lng": lng,
            "category": p.get("pc_category", "GEN"),
        })

        if state not in state_centers:
            state_centers[state] = [0.0, 0.0, 0]
        state_centers[state][0] += lat
        state_centers[state][1] += lng
        state_centers[state][2] += 1

        geo_index[cid] = {
            "bbox": [round(min(lats), 4), round(min(lngs), 4), round(max(lats), 4), round(max(lngs), 4)],
            "center": [lat, lng],
        }

    for state, acc in state_centers.items():
        count = acc[2]
        state_centers[state] = [round(acc[0] / count, 4), round(acc[1] / count, 4)]

    states = sorted(state_centers.keys())

    helpers = r"""
function getConstituenciesByState(state) {
  return ALL_CONSTITUENCIES.filter(function(c) { return c.state === state; });
}

function getConstituencyById(id) {
  return ALL_CONSTITUENCIES.find(function(c) { return c.id === id; }) || null;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectStateFromCoords(lat, lng) {
  var closestState = INDIAN_STATES[0];
  var minDist = Infinity;
  INDIAN_STATES.forEach(function(state) {
    var center = STATE_CENTERS[state];
    if (!center) return;
    var d = haversineKm(lat, lng, center[0], center[1]);
    if (d < minDist) { minDist = d; closestState = state; }
  });
  return closestState;
}

function detectConstituencyFromCoords(lat, lng, state) {
  var pool = state ? getConstituenciesByState(state) : ALL_CONSTITUENCIES;
  var closest = null;
  var minDist = Infinity;
  pool.forEach(function(c) {
    var d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < minDist) { minDist = d; closest = c; }
  });
  return closest;
}

function normalizeStateName(name) {
  if (!name) return null;
  var lower = name.toLowerCase().trim();
  var aliases = {
    "nct of delhi": "Delhi", "delhi": "Delhi",
    "national capital territory of delhi": "Delhi",
    "orissa": "Odisha", "odisha": "Odisha",
    "pondicherry": "Puducherry", "puducherry": "Puducherry",
    "uttaranchal": "Uttarakhand",
    "jammu and kashmir": "Jammu & Kashmir",
    "dadra and nagar haveli and daman and diu": "Dadra & Nagar Haveli and Daman & Diu",
    "andaman and nicobar islands": "Andaman & Nicobar Islands"
  };
  if (aliases[lower]) return aliases[lower];
  for (var i = 0; i < INDIAN_STATES.length; i++) {
    var st = INDIAN_STATES[i];
    if (lower === st.toLowerCase() || lower.indexOf(st.toLowerCase()) >= 0 ||
        st.toLowerCase().indexOf(lower) >= 0) return st;
  }
  return null;
}

const DEMO_SCENARIOS = [
  { label: "North Delhi — Water Crisis", state: "Delhi", constituencyId: "dl-1",
    content: "Our area has been facing severe water shortage for the past 2 weeks. Taps run dry from 6 AM onwards. Women have to walk 3 km to fetch water.",
    locationName: "Rohini Sector 15" },
  { label: "Varanasi — Road Damage", state: "Uttar Pradesh", constituencyId: "up-64",
    content: "The road connecting our village to the main highway has completely broken down after monsoon. Ambulances cannot pass.",
    locationName: "Lamhi Village" },
  { label: "Mumbai North — Healthcare", state: "Maharashtra", constituencyId: "mh-25",
    content: "Primary health centre lacks doctors and essential medicines. Patients wait 6 hours for basic treatment.",
    locationName: "Borivali West" },
  { label: "Chennai Central — Sanitation", state: "Tamil Nadu", constituencyId: "tn-4",
    content: "Open drainage near residential blocks causing mosquito breeding and dengue outbreak. Garbage not collected for 10 days.",
    locationName: "Triplicane" },
  { label: "Hyderabad — Power Outage", state: "Telangana", constituencyId: "tg-9",
    content: "Our colony faces 8-10 hours of load shedding daily. Small businesses have closed. Transformers are overloaded.",
    locationName: "Malakpet Colony" },
  { label: "Bangalore South — Education", state: "Karnataka", constituencyId: "ka-18",
    content: "Government school building wall cracked during heavy rains. Classrooms flooded and unsafe for 400 children.",
    locationName: "Jayanagar 4th Block" }
];
"""

    parts = [
        "// Auto-generated from DataMeet india_pc_2019_simplified.geojson (CC BY-SA 2.5 India)",
        "const INDIAN_STATES = " + json.dumps(states, ensure_ascii=False) + ";",
        "const STATE_CENTERS = " + json.dumps(state_centers, ensure_ascii=False) + ";",
        "const ALL_CONSTITUENCIES = " + json.dumps(constituencies, ensure_ascii=False) + ";",
        "const CONSTITUENCY_GEO_INDEX = " + json.dumps(geo_index, ensure_ascii=False) + ";",
        helpers.strip(),
    ]

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(parts))

    print(f"Generated {len(constituencies)} constituencies across {len(states)} states/UTs")
    print(f"Written to {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)")


if __name__ == "__main__":
    main()

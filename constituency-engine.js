// Constituency synthetic data engine & Leaflet map (uses data/constituencies.js)

let constituencyGeoJsonCache = null;
let constituencyMapInstance = null;
let constituencyMapLayers = { boundary: null, heat: null, wards: null };

const ZONE_BY_STATE = {
  "Andhra Pradesh": "South Zone", "Telangana": "South Zone", "Karnataka": "South Zone",
  "Kerala": "South Zone", "Tamil Nadu": "South Zone", "Puducherry": "South Zone",
  "Maharashtra": "West Zone", "Goa": "West Zone", "Gujarat": "West Zone",
  "Rajasthan": "North-West Zone", "Haryana": "North Zone", "Punjab": "North Zone",
  "Delhi": "North Zone", "Chandigarh": "North Zone", "Himachal Pradesh": "North Zone",
  "Uttarakhand": "North Zone", "Uttar Pradesh": "North Zone", "Jammu & Kashmir": "North Zone",
  "Ladakh": "North Zone", "West Bengal": "East Zone", "Odisha": "East Zone",
  "Bihar": "East Zone", "Jharkhand": "East Zone", "Assam": "North-East Zone",
  "Sikkim": "North-East Zone", "Arunachal Pradesh": "North-East Zone", "Manipur": "North-East Zone",
  "Meghalaya": "North-East Zone", "Mizoram": "North-East Zone", "Nagaland": "North-East Zone",
  "Tripura": "North-East Zone", "Madhya Pradesh": "Central Zone", "Chhattisgarh": "Central Zone",
  "Andaman & Nicobar Islands": "Islands", "Lakshadweep": "Islands",
  "Dadra & Nagar Haveli and Daman & Diu": "West Zone"
};

const THEME_PALETTE = [
  { category: "Water Supply", fillHex: "#0ea5e9", themeClass: "water" },
  { category: "Road Infrastructure", fillHex: "#a855f7", themeClass: "road" },
  { category: "Sanitation", fillHex: "#14b8a6", themeClass: "sanitation" },
  { category: "Healthcare", fillHex: "#f43f5e", themeClass: "healthcare" },
  { category: "Education", fillHex: "#10b981", themeClass: "education" },
  { category: "Power & Grid", fillHex: "#eab308", themeClass: "power" }
];

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function seededRandom(seed, offset) {
  const x = Math.sin(seed + offset * 9999) * 10000;
  return x - Math.floor(x);
}

function getConstituencyPcNo(constituencyId) {
  const c = getConstituencyById(constituencyId);
  return c ? c.pcNo : 1;
}

function constituencyFeatureId(state, pcNo) {
  const prefix = (state || "").slice(0, 2).toLowerCase();
  const entry = ALL_CONSTITUENCIES.find(function(c) {
    return c.state === state && c.pcNo === pcNo;
  });
  return entry ? entry.id : null;
}

function populateStateSelect(selectEl, selectedState) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  INDIAN_STATES.forEach(function(state) {
    const opt = document.createElement("option");
    opt.value = state;
    opt.textContent = state;
    if (state === selectedState) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function populateConstituencySelect(selectEl, state, selectedId) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">Select constituency</option>';
  const list = state ? getConstituenciesByState(state) : ALL_CONSTITUENCIES;
  list.forEach(function(c) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name + " (" + c.state + ")";
    if (c.id === selectedId) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function getConstituencyData(constituencyId) {
  const c = getConstituencyById(constituencyId);
  if (!c) return null;

  const seed = hashSeed(constituencyId);
  const region = ZONE_BY_STATE[c.state] || "India";
  const densityVal = Math.round(180 + seededRandom(seed, 1) * 900);
  const literacyVal = Math.round(62 + seededRandom(seed, 2) * 32 * 10) / 10;
  const enrollmentVal = Math.round(85 + seededRandom(seed, 3) * 12 * 10) / 10;
  const waterVal = Math.round(68 + seededRandom(seed, 4) * 28 * 10) / 10;
  const submissions = Math.round(120 + seededRandom(seed, 5) * 620);
  const urgent = Math.round(8 + seededRandom(seed, 6) * 45);
  const budgetCr = (8 + seededRandom(seed, 7) * 14).toFixed(1);

  const demands = THEME_PALETTE.map(function(t, idx) {
    return {
      category: t.category,
      count: Math.round(30 + seededRandom(seed, 10 + idx) * 180),
      fillHex: t.fillHex
    };
  }).sort(function(a, b) { return b.count - a.count; });

  const feedbackSamples = [
    { channel: "WhatsApp", time: "2 hours ago", language: "Regional", urgency: "High" },
    { channel: "Web", time: "5 hours ago", language: "English", urgency: "Medium" },
    { channel: "IVR", time: "1 day ago", language: "Hindi", urgency: "Critical" },
    { channel: "SMS", time: "Yesterday", language: "Regional", urgency: "High" }
  ];
  const fb = feedbackSamples[seed % feedbackSamples.length];
  fb.text = "Citizens in " + c.name + " report urgent " + demands[0].category.toLowerCase() +
    " issues near ward clusters. MP office review requested.";

  const projectTemplates = [
    { title: c.name + " Water Pipeline Upgrade", theme: "Water Supply", themeClass: "water" },
    { title: c.name + " Primary Health Centre Expansion", theme: "Healthcare", themeClass: "healthcare" },
    { title: c.name + " Road Resurfacing Phase II", theme: "Road Infrastructure", themeClass: "road" },
    { title: c.name + " Drainage & Sanitation Network", theme: "Sanitation", themeClass: "sanitation" },
    { title: c.name + " Government School Modernisation", theme: "Education", themeClass: "education" },
    { title: c.name + " Rural Electrification Grid", theme: "Power & Grid", themeClass: "power" }
  ];

  const projects = projectTemplates.map(function(p, idx) {
    return {
      title: p.title,
      theme: p.theme,
      themeClass: p.themeClass,
      demandBase: Math.round(55 + seededRandom(seed, 20 + idx) * 42),
      gapBase: Math.round(50 + seededRandom(seed, 30 + idx) * 45),
      costBase: Math.round(15 + seededRandom(seed, 40 + idx) * 75),
      costText: seededRandom(seed, 50 + idx) > 0.66 ? "High" : seededRandom(seed, 50 + idx) > 0.33 ? "Medium" : "Low"
    };
  });

  return {
    constituencyId: c.id,
    constituencyName: c.name,
    stateName: c.state,
    region: region,
    density: densityVal + " / sq km",
    densityVal: densityVal,
    literacy: literacyVal + "%",
    literacyVal: literacyVal,
    enrollment: enrollmentVal + "%",
    enrollmentVal: enrollmentVal,
    water: waterVal + "%",
    waterVal: waterVal,
    submissions: submissions,
    urgent: urgent,
    budget: "₹" + budgetCr + " Cr",
    demands: demands,
    recentFeedback: fb,
    projects: projects,
    wardPoints: generateWardPoints(c.id, c.lat, c.lng, seed)
  };
}

function generateWardPoints(constituencyId, centerLat, centerLng, seed) {
  const geo = CONSTITUENCY_GEO_INDEX[constituencyId];
  const points = [];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const latSpan = geo ? (geo.bbox[2] - geo.bbox[0]) * 0.35 : 0.08;
    const lngSpan = geo ? (geo.bbox[3] - geo.bbox[1]) * 0.35 : 0.08;
    points.push({
      lat: centerLat + (seededRandom(seed, i * 3) - 0.5) * latSpan,
      lng: centerLng + (seededRandom(seed, i * 3 + 1) - 0.5) * lngSpan,
      demand: Math.round(20 + seededRandom(seed, i * 3 + 2) * 80),
      gap: Math.round(25 + seededRandom(seed, i * 3 + 3) * 70),
      literacy: Math.round(55 + seededRandom(seed, i * 3 + 4) * 40)
    });
  }
  return points;
}

async function loadConstituencyGeoJson() {
  if (constituencyGeoJsonCache) return constituencyGeoJsonCache;
  const res = await fetch("data/india_pc_2019_simplified.geojson");
  constituencyGeoJsonCache = await res.json();
  return constituencyGeoJsonCache;
}

function findGeoFeature(geojson, constituencyId) {
  const c = getConstituencyById(constituencyId);
  if (!c || !geojson) return null;
  return geojson.features.find(function(f) {
    return f.properties.st_name === c.state && f.properties.pc_no === c.pcNo;
  }) || null;
}

async function renderConstituencyMap(constituencyId, layer) {
  const container = document.getElementById("constituency-map-container");
  if (!container || typeof L === "undefined") return;

  const data = getConstituencyData(constituencyId);
  if (!data) return;

  const geojson = await loadConstituencyGeoJson();
  const feature = findGeoFeature(geojson, constituencyId);

  if (constituencyMapInstance) {
    constituencyMapInstance.remove();
    constituencyMapInstance = null;
    constituencyMapLayers = { boundary: null, heat: null, wards: null };
  }

  const center = feature
    ? [data.wardPoints[0].lat, data.wardPoints[0].lng]
    : [getConstituencyById(constituencyId).lat, getConstituencyById(constituencyId).lng];

  constituencyMapInstance = L.map(container, { scrollWheelZoom: false }).setView(center, 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · DataMeet PC 2019',
    maxZoom: 18
  }).addTo(constituencyMapInstance);

  if (feature) {
    constituencyMapLayers.boundary = L.geoJSON(feature, {
      style: {
        color: "#6366f1",
        weight: 2.5,
        fillColor: layer === "literacy" ? "#10b981" : layer === "gap" ? "#ef4444" : "#a855f7",
        fillOpacity: 0.18
      }
    }).addTo(constituencyMapInstance);
    constituencyMapInstance.fitBounds(constituencyMapLayers.boundary.getBounds(), { padding: [20, 20] });
  }

  constituencyMapLayers.wards = L.layerGroup();
  data.wardPoints.forEach(function(pt) {
    let color = "#10b981";
    let radius = 7;
    if (layer === "demands") {
      color = pt.demand > 70 ? "#a855f7" : pt.demand > 45 ? "#c084fc" : "#ddd6fe";
      radius = 6 + pt.demand / 18;
    } else if (layer === "gap") {
      color = pt.gap > 70 ? "#ef4444" : pt.gap > 45 ? "#f97316" : "#fde68a";
      radius = 6 + pt.gap / 18;
    } else {
      color = pt.literacy > 80 ? "#10b981" : pt.literacy > 70 ? "#eab308" : "#ef4444";
      radius = 6 + pt.literacy / 20;
    }
    L.circleMarker([pt.lat, pt.lng], {
      radius: radius,
      color: "#fff",
      weight: 1,
      fillColor: color,
      fillOpacity: 0.75
    }).bindPopup("Ward cluster · " + (layer === "demands" ? "Demand: " + pt.demand : layer === "gap" ? "Gap: " + pt.gap : "Literacy: " + pt.literacy + "%"))
      .addTo(constituencyMapLayers.wards);
  });
  constituencyMapLayers.wards.addTo(constituencyMapInstance);

  setTimeout(function() { constituencyMapInstance.invalidateSize(); }, 150);
}

function applyDemoScenario(scenario) {
  const stateSelect = document.getElementById("portal-state-select");
  const constSelect = document.getElementById("portal-constituency-select");
  const textArea = document.getElementById("portal-feedback-text");
  const gpsLabel = document.getElementById("gps-status-label");

  if (stateSelect) {
    stateSelect.value = scenario.state;
    populateConstituencySelect(constSelect, scenario.state, scenario.constituencyId);
  }
  if (constSelect) constSelect.value = scenario.constituencyId;
  if (textArea) textArea.value = scenario.content;
  if (gpsLabel) {
    const c = getConstituencyById(scenario.constituencyId);
    gpsLabel.innerText = "Demo data loaded: " + (c ? c.name + ", " + c.state : scenario.state);
    gpsLabel.style.color = "#818cf8";
  }
}

function renderDemoScenarioButtons() {
  const grid = document.getElementById("demo-scenario-grid");
  if (!grid || typeof DEMO_SCENARIOS === "undefined") return;
  grid.innerHTML = "";
  DEMO_SCENARIOS.forEach(function(scenario) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "demo-scenario-btn";
    btn.textContent = scenario.label;
    btn.addEventListener("click", function() { applyDemoScenario(scenario); });
    grid.appendChild(btn);
  });
}

async function detectLocationAndConstituency(onStatus) {
  return new Promise(function(resolve, reject) {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            "https://nominatim.openstreetmap.org/reverse?lat=" + latitude + "&lon=" + longitude + "&format=json",
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const address = data.address || {};
          const stateFromApi = normalizeStateName(address.state || address.region || "") ||
            detectStateFromCoords(latitude, longitude);
          const constituency = detectConstituencyFromCoords(latitude, longitude, stateFromApi);
          const city = address.city || address.town || address.village || address.suburb || address.county || "Your area";
          resolve({
            latitude, longitude,
            state: stateFromApi,
            constituency: constituency,
            placeLabel: city + " (" + latitude.toFixed(4) + "°, " + longitude.toFixed(4) + "°)"
          });
        } catch (err) {
          const state = detectStateFromCoords(latitude, longitude);
          const constituency = detectConstituencyFromCoords(latitude, longitude, state);
          resolve({
            latitude, longitude, state, constituency,
            placeLabel: latitude.toFixed(4) + "°, " + longitude.toFixed(4) + "°"
          });
        }
      },
      function() { reject(new Error("Location denied or unavailable")); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

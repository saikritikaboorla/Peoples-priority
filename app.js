// Global State
let currentUserRole = "citizen"; // citizen or mp
let currentLanguage = "en"; // en, hi, ta, te, kn, bn
let activeStateName = "Tamil Nadu";
let activeConstituency = "Chennai Central";
let activeConstituencyId = "tn-4";
let mpActiveLayer = "literacy";
let isRecording = false;
let recordTimerInterval = null;
let recordSeconds = 0;
let speechRecognition = null;
let cameraStream = null;
let detectedLocation = null;

// Speech recognition language codes
const speechLangMap = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  bn: "bn-IN"
};

// Official multi-channel grievance desk (demo helpline — same routing logic as production)
const OFFICIAL_CHANNELS = {
  Web: {
    icon: "fa-globe",
    color: "#6366f1",
    title: "Web Application Portal",
    desc: "Submit your grievance securely through this portal. Your MP office receives it instantly."
  },
  WhatsApp: {
    icon: "fa-brands fa-whatsapp",
    color: "#25D366",
    title: "WhatsApp Grievance Desk",
    desc: "Message the official People's Priority WhatsApp helpline. Include your constituency and issue.",
    number: "xxxxxxx",
    hours: "9:00 AM – 6:00 PM, Mon–Sat",
    actionLabel: "Open WhatsApp",
    actionIcon: "fa-brands fa-whatsapp"
  },
  IVR: {
    icon: "fa-solid fa-phone-volume",
    color: "#0ea5e9",
    title: "Voice Call (IVR) — Toll Free",
    desc: "Dial the 24×7 IVR helpline. Follow voice prompts and state your constituency PIN.",
    number: "xxxxxxx",
    hours: "24×7 Automated + Operator (9 AM – 6 PM)",
    actionLabel: "Call IVR Helpline",
    actionIcon: "fa-solid fa-phone"
  },
  SMS: {
    icon: "fa-solid fa-comment-sms",
    color: "#f59e0b",
    title: "SMS Grievance Portal",
    desc: "Send an SMS in the format: PP <Constituency> <Issue>. Standard SMS charges apply.",
    number: "xxxxxxx",
    hours: "24×7",
    actionLabel: "Compose SMS",
    actionIcon: "fa-solid fa-comment-sms"
  }
};

// Essential themes always ranked as high priority
const ESSENTIAL_THEMES = ["Water Supply", "Healthcare"];

// API base (optional backend integration)
const API_BASE = "http://localhost:3001/api";

// Permissions State
let permissions = {
  microphone: false,
  camera: false,
  location: false
};

// Simulated GPS locations per state
const stateGpsData = {
  "Tamil Nadu": { city: "Chennai", code: "TN", gps: "13.0827° N, 80.2707° E" },
  "Karnataka": { city: "Bengaluru", code: "KA", gps: "12.9716° N, 77.5946° E" },
  "Maharashtra": { city: "Mumbai", code: "MH", gps: "19.0760° N, 72.8777° E" },
  "Uttar Pradesh": { city: "Lucknow", code: "UP", gps: "26.8467° N, 80.9462° E" },
  "West Bengal": { city: "Kolkata", code: "WB", gps: "22.5726° N, 88.3639° E" }
};

// Mock Datasets per State
const stateData = {
  "Tamil Nadu": {
    region: "South Zone",
    density: "555 / sq km",
    densityVal: 555,
    literacy: "80.1%",
    literacyVal: 80.1,
    enrollment: "96.2%",
    enrollmentVal: 96.2,
    water: "92.0%",
    waterVal: 92,
    submissions: 410,
    urgent: 22,
    budget: "₹12.0 Cr",
    demands: [
      { category: "Water Supply", count: 120, fillHex: "#0ea5e9" },
      { category: "Road Infrastructure", count: 95, fillHex: "#a855f7" },
      { category: "Sanitation", count: 80, fillHex: "#14b8a6" },
      { category: "Healthcare", count: 40, fillHex: "#f43f5e" }
    ],
    recentFeedback: {
      channel: "WhatsApp",
      time: "2 hours ago",
      text: "Water pipe leakage in Madurai Anna Nagar causing sewage mixing in drinking water pipelines. Severe health hazard.",
      language: "Tamil",
      urgency: "High"
    },
    projects: [
      { title: "Anna Nagar Water Filtration Plant", theme: "Water Supply", themeClass: "water", demandBase: 95, gapBase: 82, costBase: 40, costText: "Medium" },
      { title: "Madurai Road Pothole Resurfacing", theme: "Road Infrastructure", themeClass: "road", demandBase: 90, gapBase: 78, costBase: 20, costText: "Low" },
      { title: "Sanitation Drainage Upgrade Chennai", theme: "Sanitation", themeClass: "sanitation", demandBase: 80, gapBase: 75, costBase: 35, costText: "Low" },
      { title: "Primary Health Unit Coimbatore", theme: "Healthcare", themeClass: "healthcare", demandBase: 65, gapBase: 70, costBase: 75, costText: "High" }
    ]
  },
  "Karnataka": {
    region: "South Zone",
    density: "319 / sq km",
    densityVal: 319,
    literacy: "75.4%",
    literacyVal: 75.4,
    enrollment: "94.1%",
    enrollmentVal: 94.1,
    water: "86.5%",
    waterVal: 86.5,
    submissions: 345,
    urgent: 18,
    budget: "₹10.0 Cr",
    demands: [
      { category: "Power & Grid", count: 110, fillHex: "#eab308" },
      { category: "Road Infrastructure", count: 105, fillHex: "#a855f7" },
      { category: "Sanitation", count: 55, fillHex: "#14b8a6" },
      { category: "Healthcare", count: 30, fillHex: "#f43f5e" }
    ],
    recentFeedback: {
      channel: "Web",
      time: "5 hours ago",
      text: "Heavy potholes on Outer Ring Road Bangalore causing traffic jams and minor two-wheeler accidents. Urgent repair needed.",
      language: "Kannada",
      urgency: "Medium"
    },
    projects: [
      { title: "Bangalore Grid Stabilizer Installation", theme: "Power & Grid", themeClass: "power", demandBase: 90, gapBase: 85, costBase: 50, costText: "Medium" },
      { title: "ORR Bangalore Pothole Resection", theme: "Road Infrastructure", themeClass: "road", demandBase: 88, gapBase: 80, costBase: 25, costText: "Low" },
      { title: "Village School Renovation Hubli", theme: "Education", themeClass: "education", demandBase: 70, gapBase: 72, costBase: 45, costText: "Medium" }
    ]
  },
  "Maharashtra": {
    region: "West Zone",
    density: "365 / sq km",
    densityVal: 365,
    literacy: "82.3%",
    literacyVal: 82.3,
    enrollment: "95.0%",
    enrollmentVal: 95,
    water: "88.0%",
    waterVal: 88,
    submissions: 512,
    urgent: 31,
    budget: "₹15.0 Cr",
    demands: [
      { category: "Sanitation", count: 140, fillHex: "#14b8a6" },
      { category: "Water Supply", count: 115, fillHex: "#0ea5e9" },
      { category: "Healthcare", count: 60, fillHex: "#f43f5e" },
      { category: "Road Infrastructure", count: 50, fillHex: "#a855f7" }
    ],
    recentFeedback: {
      channel: "SMS",
      time: "1 day ago",
      text: "Garbage sorting plant near Pune bypass is overflowing, causing heavy pollution and bad smell in residential sector.",
      language: "Marathi",
      urgency: "High"
    },
    projects: [
      { title: "Pune Garbage Management Facility", theme: "Sanitation", themeClass: "sanitation", demandBase: 96, gapBase: 84, costBase: 65, costText: "Medium" },
      { title: "Mumbai Drinking Water Conduit", theme: "Water Supply", themeClass: "water", demandBase: 85, gapBase: 78, costBase: 70, costText: "High" },
      { title: "Rural Hospital Sub-Center Nagpur", theme: "Healthcare", themeClass: "healthcare", demandBase: 78, gapBase: 80, costBase: 80, costText: "High" }
    ]
  },
  "Uttar Pradesh": {
    region: "North Zone",
    density: "829 / sq km",
    densityVal: 829,
    literacy: "67.7%",
    literacyVal: 67.7,
    enrollment: "89.2%",
    enrollmentVal: 89.2,
    water: "74.0%",
    waterVal: 74,
    submissions: 684,
    urgent: 49,
    budget: "₹18.0 Cr",
    demands: [
      { category: "Education", count: 220, fillHex: "#10b981" },
      { category: "Healthcare", count: 130, fillHex: "#f43f5e" },
      { category: "Water Supply", count: 90, fillHex: "#0ea5e9" },
      { category: "Road Infrastructure", count: 75, fillHex: "#a855f7" }
    ],
    recentFeedback: {
      channel: "IVR",
      time: "3 hours ago",
      text: "Government primary school wall in Varanasi cracked during heavy rains. Classrooms are flooded and unsafe for children.",
      language: "Hindi",
      urgency: "Critical"
    },
    projects: [
      { title: "Primary School Reconstruction Varanasi", theme: "Education", themeClass: "education", demandBase: 98, gapBase: 95, costBase: 30, costText: "Low" },
      { title: "District Clinic Doctor Quarters Lucknow", theme: "Healthcare", themeClass: "healthcare", demandBase: 85, gapBase: 88, costBase: 60, costText: "Medium" },
      { title: "Bundelkhand Water Pipeline Upgrade", theme: "Water Supply", themeClass: "water", demandBase: 80, gapBase: 90, costBase: 85, costText: "High" }
    ]
  },
  "West Bengal": {
    region: "East Zone",
    density: "1029 / sq km",
    densityVal: 1029,
    literacy: "76.3%",
    literacyVal: 76.3,
    enrollment: "92.5%",
    enrollmentVal: 92.5,
    water: "81.0%",
    waterVal: 81,
    submissions: 290,
    urgent: 15,
    budget: "₹11.0 Cr",
    demands: [
      { category: "Healthcare", count: 105, fillHex: "#f43f5e" },
      { category: "Sanitation", count: 90, fillHex: "#14b8a6" },
      { category: "Education", count: 75, fillHex: "#10b981" },
      { category: "Power & Grid", count: 45, fillHex: "#eab308" }
    ],
    recentFeedback: {
      channel: "Web",
      time: "Yesterday",
      text: "Rural clinic in Purulia has no doctor available during morning hours. Patients travel long distances for primary care.",
      language: "Bengali",
      urgency: "High"
    },
    projects: [
      { title: "Purulia Community Clinic Expansion", theme: "Healthcare", themeClass: "healthcare", demandBase: 92, gapBase: 85, costBase: 50, costText: "Medium" },
      { title: "Sanitation System Upgrade Howrah", theme: "Sanitation", themeClass: "sanitation", demandBase: 86, gapBase: 80, costBase: 30, costText: "Low" },
      { title: "Rural Power Grid Reconstruction Darjeeling", theme: "Education", themeClass: "education", demandBase: 70, gapBase: 75, costBase: 75, costText: "High" }
    ]
  }
};

// Sandbox scenarios
const sandboxScenarios = {
  "hindi-road": {
    text: "वार्ड 5 की मुख्य सड़क पर बड़े-बड़े गड्ढे हैं। वाहनों का निकलना मुश्किल हो रहा है। सुधार किया जाना चाहिए।",
    lang: "Hindi (hi)",
    langConf: "98.4%",
    translated: "There are large potholes on the main road of ward 5. It is difficult for vehicles to pass. Improvements must be made.",
    ner: [
      { text: "वार्ड 5", type: "location" },
      { text: "मुख्य सड़क", type: "keyword" },
      { text: "बड़े-बड़े गड्ढे", type: "problem" }
    ],
    topic: "Road Infrastructure",
    topicConf: "96%",
    sentiment: 18
  },
  "tamil-water": {
    text: "வார்டு 2 இல் உள்ள குடிநீர் குழாயில் கசிவு ஏற்பட்டுள்ளது. தண்ணீர் வீணாகிறது, வறட்சி ஏற்படுகிறது.",
    lang: "Tamil (ta)",
    langConf: "97.1%",
    translated: "There is a leak in the drinking water pipe in ward 2. Water is wasted, causing shortage.",
    ner: [
      { text: "வார்டு 2", type: "location" },
      { text: "குடிநீர் குழாய்", type: "keyword" },
      { text: "கசிவு", type: "problem" }
    ],
    topic: "Water Supply",
    topicConf: "98%",
    sentiment: 22
  },
  "telugu-health": {
    text: "మా వార్డు 6 లో తగినంత మంది డాక్టర్లు లేరు. వైద్య చికిత్స కోసం చాలా సమయం వేచి ఉండాల్సి వస్తుంది.",
    lang: "Telugu (te)",
    langConf: "95.8%",
    translated: "There are not enough doctors in our ward 6. We have to wait a long time for medical treatment.",
    ner: [
      { text: "వార్డు 6", type: "location" },
      { text: "డాక్టర్లు లేరు", type: "keyword" },
      { text: "వైద్య చికిత్స", type: "problem" }
    ],
    topic: "Healthcare",
    topicConf: "94%",
    sentiment: 29
  },
  "bengali-school": {
    text: "ওয়ার্ড ৩ এ স্কুলের ছাদ ফুটো হয়ে গেছে। বৃষ্টির জল ক্লাসরুমের ভেতরে পড়ছে, ছাত্ররা বসতে পারছে না।",
    lang: "Bengali (bn)",
    langConf: "96.5%",
    translated: "The school roof is leaking in ward 3. Rainwater is falling inside the classroom, students cannot sit.",
    ner: [
      { text: "ওয়ার্ড ৩", type: "location" },
      { text: "স্কুলের ছাদ", type: "keyword" },
      { text: "বৃষ্টির জল", type: "problem" }
    ],
    topic: "Education",
    topicConf: "97%",
    sentiment: 15
  },
  "kannada-power": {
    text: "ವಾರ್ಡ್ 4 ರಲ್ಲಿ ದಿನಕ್ಕೆ 6 ಗಂಟೆ ವಿದ್ಯುತ್ ಕಡಿತವಾಗುತ್ತಿದೆ. ವ್ಯಾಪಾರ ಮತ್ತು ಓದಿಗೆ ತೊಂದರೆಯಾಗಿದೆ.",
    lang: "Kannada (kn)",
    langConf: "97.9%",
    translated: "There is 6 hours of power cut daily in ward 4. Business and studies are affected.",
    ner: [
      { text: "ವಾರ್ಡ್ 4", type: "location" },
      { text: "ವಿದ್ಯುತ್ ಕಡಿತ", type: "keyword" },
      { text: "ತೊಂದರೆಯಾಗಿದೆ", type: "problem" }
    ],
    topic: "Power & Grid",
    topicConf: "95%",
    sentiment: 26
  }
};

// Dynamic Translation Dictionary (covering all data-i18n attributes)
const translations = {
  en: {
    login_title: "Demo Login Dashboard",
    login_subtitle: "Select your portal access mode and default language",
    login_role_lbl: "Access Portal Mode",
    role_citizen_title: "Citizen Portal",
    role_citizen_desc: "Submit issues & track progress",
    role_mp_title: "MP Dashboard",
    role_mp_desc: "Analyze needs & rank projects",
    login_lang_lbl: "Choose Language",
    login_constituency_lbl: "Lok Sabha Constituency",
    login_constituency_hint: "Select your state first, then choose your constituency. Dashboard shows only your constituency issues.",
    login_state_lbl: "State / Union Territory",
    login_citizen_loc_lbl: "Your Location",
    login_detect_loc_btn: "Allow Location & Detect Constituency",
    login_loc_hint: "We will detect your state and Lok Sabha constituency automatically",
    login_loc_found: "Constituency detected",
    lbl_submission_constituency: "Lok Sabha Constituency",
    lbl_demo_scenarios: "Sample Templates",
    lbl_demo_hint: "Click a sample case to auto-fill state, constituency, and grievance text",
    lbl_constituency_label: "Constituency:",
    map_heading: "Constituency Geographic View",
    map_source_note: "Map boundary: DataMeet Parliamentary Constituencies 2019 · Sample demand points are synthetic for demo",
    login_btn: "Enter Portal",
    side_subtitle: "AI Decision Support",
    nav_citizen_submit: "Submit Suggestions",
    nav_citizen_history: "My Submissions",
    nav_mp_dashboard: "MP Analytics",
    nav_mp_sandbox: "AI Parsing Sandbox",
    nav_mp_recommend: "Project Priorities",
    nav_sys_architecture: "System Architecture",
    welcome_back: "Welcome Back,",
    ai_status: "AI Engine Active",
    cit_portal_title: "Tell Us What Your Area Needs",
    cit_portal_desc: "Speak, type, or take a photo — we will send it to your MP office",
    cit_form_heading: "Share Your Problem",
    cit_form_sub: "Use simple words in any language. Tap the mic to speak or camera to show the issue.",
    gps_enable_btn: "Find My Location",
    gps_disabled: "Tap the button above so we know where you are",
    gps_enabled: "Location found",
    gps_loading: "Finding your location...",
    gps_error: "Could not find location. Please select your state below.",
    lbl_submission_state: "State / Territory",
    lbl_submission_channel: "Submission Channel",
    lbl_text_transcript: "Write your problem here",
    lbl_text_hint: "Example: \"No clean water for 3 days\" or \"Road has big holes near school\"",
    lbl_attachments: "Or use voice / photo",
    slot_record_voice: "Tap to Speak",
    slot_upload_photo: "Take a Photo",
    recording_active: "Listening... Tap again to stop and finish.",
    btn_submit_feedback: "Send to MP Office",
    visualizer_heading: "Processing Status",
    step_1_short: "Location",
    step_2_short: "Voice & Photo",
    step_3_short: "Translation",
    step_4_short: "Classification",
    cam_modal_title: "Take a Photo of the Issue",
    btn_snap_photo: "Take Photo",
    btn_cancel: "Cancel",
    top_constituency_issues: "Ranked Issues in Your Constituency",
    issues_rank_hint: "Water & healthcare are always high priority. Others ranked by how often citizens report them.",
    metadata_header: "Processed Output Metadata",
    meta_orig: "Original Text:",
    meta_trans: "Translation:",
    meta_theme: "Theme Tag:",
    meta_urgency: "Severity:",
    meta_loc: "Routed Constituency:",
    cit_history_title: "My Submitted Suggestions",
    cit_history_desc: "Track responses and prioritizing stats for your requests",
    th_date: "Date Submitted",
    th_state: "State Area",
    th_content: "Feedback Statement Summary",
    th_theme: "Classified Theme",
    th_urgency: "Severity",
    th_status: "Status",
    kpi_total: "Total State Submissions",
    kpi_urgent: "Urgent Issues",
    kpi_accuracy: "AI Core Accuracy",
    kpi_budget: "State Fund Limit",
    kpi_pill_action: "Requires Action",
    kpi_pill_whisper: "Bhashini LLM",
    map_heading: "Constituency Geographic View",
    map_btn_demands: "Citizen Demands",
    map_btn_gap: "Infrastructure Gap",
    map_btn_lit: "Literacy Index",
    lbl_select_state_quick: "Quick Switch State:",
    lbl_pop_density: "Population Density",
    lbl_literacy_rate: "Literacy Index",
    lbl_school_enroll: "School Enrollment",
    lbl_water_access: "Clean Water Access",
    top_state_demands: "Top State Public Demands",
    recent_state_feedback: "Latest Feedback Submitted in State",
    sandbox_title: "AI Parsing Sandbox",
    sandbox_desc: "Test Bhashini translations, NER chips, and topic classifier confidence on raw inputs",
    sandbox_heading: "NLP Real-time Statement Parser",
    sandbox_sub: "Write or paste any statement in regional languages. The NLP parser runs immediate entity mappings.",
    lbl_sandbox_input: "Input Statement",
    lbl_sandbox_quick: "Quick Load Statements",
    lbl_nlp_threshold: "NLP Topic Match Threshold",
    lang_ident: "Language Identification",
    detected_lang_lbl: "Detected Lang:",
    confidence_lbl: "Confidence:",
    machine_trans: "Machine Translation (Bhashini)",
    ner_extract: "Named Entities Extracted (NER)",
    topic_class: "Topic Classification",
    sentiment_analysis: "Sentiment & Severity Index",
    sentiment_neg: "Negative (Urgent)",
    sentiment_neu: "Neutral",
    sentiment_pos: "Positive",
    recommendations_title: "Which Projects to Fund First?",
    recommendations_desc: "Adjust weights below. Water and healthcare always stay high priority.",
    weights_heading: "Prioritization Mechanics Weights Settings",
    weights_desc: "Modify sliders to calculate composite priority rankings for public works in the active state.",
    w_demand: "Citizen Demand Weight",
    desc_w_demand: "Prioritize based on volume and urgency of incoming submissions.",
    w_gap: "Infrastructure Gap Weight",
    desc_w_gap: "Prioritize projects in states with poor literacy, low enrollment, or water shortages.",
    w_impact: "Population Impact Weight",
    desc_w_impact: "Prioritize projects that benefit the largest absolute population density.",
    w_cost: "Cost / Budget Factor",
    desc_w_cost: "Subtracted weight. Lower cost projects score higher to yield better cost efficiency.",
    btn_reset_weights: "Reset Weights",
    priority_ranks_heading: "Recommended Projects & Infrastructure Priority Rankings",
    btn_report: "Generate Executive MP Report",
    th_rank: "Rank",
    th_project: "Project Proposal",
    th_location: "Location",
    th_demand: "Citizen Demand",
    th_gap: "Infra Gap",
    th_cost: "Budget Cost",
    th_priority: "Priority Score",
    arch_title: "System Architecture",
    arch_desc: "End-to-end design configurations and pipeline structure",
    arch_heading: "Multilingual Feedback Parsing System Diagram",
    arch_c1_title: "Speech Processing & OCR",
    arch_c1_desc: "Integrates OpenAI Whisper v3 API for transcribing citizen voice files. Infrastructure photo uploads are analyzed via custom Vision model pipelines detecting anomalies like blockages, potholes, and leakages.",
    arch_c2_title: "Translation & NLU",
    arch_c2_desc: "Supports regional Indian languages using the Bhashini API, converting speech or text suggestions directly into English. Extracted text is processed via Llama 3 models for Named Entity Recognition (NER).",
    arch_c3_title: "Geospatial Analytics (PostGIS)",
    arch_c3_desc: "Locations parsed from text or attached GPS points are correlated with state boundary shapefiles via PostGIS spatial overlay mapping, ensuring every submission is correctly mapped to a state constituency.",
    arch_c4_title: "Prioritization Mechanics",
    arch_c4_desc: "Calculates project urgency scores by joining citizen feedback density with factual baseline data (literacy rates, school enrollment, water shortage index) and budget values dynamically based on MP weights.",
    perm_mic_title: "Allow Microphone Access?",
    perm_mic_desc: "People's Priority needs microphone access to record voice requests and convert them to text.",
    perm_cam_title: "Allow Camera & File Access?",
    perm_cam_desc: "Allow access to take a photo of the infrastructure issue or upload images from your local files.",
    perm_loc_title: "Allow Location Tracking?",
    perm_loc_desc: "Share your exact location to automatically sort your complaint state-wise for your respective MP dashboard.",
    btn_deny: "Block",
    btn_allow: "Allow Access",
    mp_report_header: "Generated Executive MP Report",
    btn_print: "Print / Save PDF",
    btn_export: "Export Data",
    logout_tooltip: "Log Out"
  },
  hi: {
    login_title: "डेमो लॉगिन डैशबोर्ड",
    login_subtitle: "अपनी पोर्टल एक्सेस मोड और डिफ़ॉल्ट भाषा चुनें",
    login_role_lbl: "एक्सेस पोर्टल मोड",
    role_citizen_title: "नागरिक पोर्टल",
    role_citizen_desc: "मुद्दे सबमिट करें और प्रगति ट्रैक करें",
    role_mp_title: "सांसद डैशबोर्ड",
    role_mp_desc: "आवश्यकताओं का विश्लेषण करें और परियोजनाओं को रैंक करें",
    login_lang_lbl: "भाषा चुनें",
    login_btn: "पोर्टल में प्रवेश करें",
    side_subtitle: "एआई निर्णय समर्थन",
    nav_citizen_submit: "सुझाव सबमिट करें",
    nav_citizen_history: "मेरे सबमिशन",
    nav_mp_dashboard: "सांसद विश्लेषण",
    nav_mp_sandbox: "एआई पार्सिंग सैंडबॉक्स",
    nav_mp_recommend: "परियोजना प्राथमिकताएं",
    nav_sys_architecture: "सिस्टम आर्किटेक्चर",
    welcome_back: "वापसी पर स्वागत है,",
    ai_status: "एआई इंजन सक्रिय",
    cit_portal_title: "प्रतिक्रिया और सुझाव सबमिट करें",
    cit_portal_desc: "अपने क्षेत्रीय सांसद कार्यालय को सीधे अपने विकास अनुरोध बोलें या टाइप करें",
    cit_form_heading: "नागरिक विवरण सबमिशन",
    cit_form_sub: "सभी सबमिशन स्वचालित एआई अनुवाद परतों के माध्यम से संसाधित किए जाते हैं।",
    gps_enable_btn: "स्थान साझाकरण सक्षम करें",
    gps_disabled: "स्थान डेटा: अक्षम (डिफ़ॉल्ट का उपयोग कर रहे हैं)",
    gps_enabled: "स्थान डेटा: सक्रिय (सिम्युलेटेड जीपीएस लॉक)",
    lbl_submission_state: "राज्य / केंद्र शासित प्रदेश",
    lbl_submission_channel: "सबमिशन चैनल",
    lbl_text_transcript: "सीधे प्रतिक्रिया टाइप करें (या भाषण रिकॉर्ड करने के लिए माइक्रोफ़ोन टैप करें)",
    lbl_attachments: "मीडिया अटैचमेंट (रिकॉर्ड ऑडियो / फोटो अपलोड)",
    slot_record_voice: "आवाज रिकॉर्ड करने के लिए टैप करें",
    slot_upload_photo: "फोटो अपलोड / स्नैप करें",
    recording_active: "रिकॉर्डिंग सक्रिय है। रोकने और ट्रांसक्राइब करने के लिए फिर से टैप करें...",
    btn_submit_feedback: "प्रतिक्रिया सबमिट करें",
    visualizer_heading: "बहुभाषी एआई पाइपलाइन ट्रैकर",
    visualizer_sub: "इंजेशन, अनुवाद, ओसीआर और वर्गीकरण चरणों की कल्पना",
    step_1_title: "1. स्थान और चैनल सत्यापन",
    step_1_desc: "जीपीएस बिंदुओं को जियोकोड करना, राज्य सीमा बहुभुजों की पुष्टि करना, और संदेशों को कतारबद्ध करना।",
    step_2_title: "2. वॉयस ट्रांसक्राइब और ओसीआर स्कैनिंग",
    step_2_desc: "व्हिस्पर के माध्यम से स्पीच-टू-टेक्स्ट ट्रांसक्रिप्शन निष्पादित करना और छवि दोषों का वर्गीकरण।",
    step_3_title: "3. भाषिनी एआई अनुवाद परत",
    step_3_desc: "भाषाओं का पता लगाना और एकीकृत अंग्रेजी अनुवाद तैयार करना।",
    step_4_title: "4. थीम एनईआर वर्गीकरण",
    step_4_desc: "वार्डों, क्षेत्रों और मुद्दों को अलग करने के लिए नामित इकाई टोकन पार्सिंग चलाना।",
    metadata_header: "संसाधित आउटपुट मेटाडेटा",
    meta_orig: "मूल पाठ:",
    meta_trans: "अनुवाद:",
    meta_theme: "थीम टैग:",
    meta_urgency: "गंभीरता:",
    meta_loc: "रूट किया गया राज्य:",
    cit_history_title: "मेरे सबमिट किए गए सुझाव",
    cit_history_desc: "अपने अनुरोधों के जवाब और प्राथमिकता आंकड़ों को ट्रैक करें",
    th_date: "सबमिट करने की तिथि",
    th_state: "राज्य क्षेत्र",
    th_content: "प्रतिक्रिया विवरण सारांश",
    th_theme: "वर्गीकृत थीम",
    th_urgency: "गंभीरता",
    th_status: "स्थिति",
    kpi_total: "कुल राज्य सबमिशन",
    kpi_urgent: "अत्यावश्यक मुद्दे",
    kpi_accuracy: "एआई कोर सटीकता",
    kpi_budget: "राज्य कोष सीमा",
    kpi_pill_action: "कार्रवाई की आवश्यकता है",
    kpi_pill_whisper: "भाषिनी एलएलएम",
    map_heading: "भारत राज्य चयन मानचित्र",
    map_btn_demands: "नागरिक मांगें",
    map_btn_gap: "इन्फ्रास्ट्रक्चर गैप",
    map_btn_lit: "साक्षरता सूचकांक",
    lbl_select_state_quick: "त्वरित स्विच राज्य:",
    lbl_pop_density: "जनसंख्या घनत्व",
    lbl_literacy_rate: "साक्षरता सूचकांक",
    lbl_school_enroll: "स्कूल नामांकन",
    lbl_water_access: "साफ पानी तक पहुंच",
    top_state_demands: "शीर्ष राज्य सार्वजनिक मांगें",
    recent_state_feedback: "राज्य में सबमिट की गई नवीनतम प्रतिक्रिया",
    sandbox_title: "एआई पार्सिंग सैंडबॉक्स",
    sandbox_desc: "रॉ इनपुट पर भाषिनी अनुवाद, एनईआर चिप्स और विषय वर्गीकरण की जांच करें",
    sandbox_heading: "एनएलपी रीयल-टाइम स्टेटमेंट पार्सर",
    sandbox_sub: "क्षेत्रीय भाषाओं में कोई भी विवरण लिखें या पेस्ट करें। एनएलपी पार्सर तुरंत मैपिंग चलाता है।",
    lbl_sandbox_input: "इनपुट विवरण",
    lbl_sandbox_quick: "त्वरित लोड विवरण",
    lbl_nlp_threshold: "एनएलपी विषय मिलान सीमा",
    lang_ident: "भाषा पहचान",
    detected_lang_lbl: "पहचानी गई भाषा:",
    confidence_lbl: "सटीकता:",
    machine_trans: "मशीन अनुवाद (भाषिनी)",
    ner_extract: "निकालें गए नामित तत्व (NER)",
    topic_class: "विषय वर्गीकरण",
    sentiment_analysis: "भावना और गंभीरता सूचकांक",
    sentiment_neg: "नकारात्मक (अत्यावश्यक)",
    sentiment_neu: "तटस्थ",
    sentiment_pos: "सकारात्मक",
    recommendations_title: "परियोजना प्राथमिकता डैशबोर्ड",
    recommendations_desc: "वेट एडजस्टमेंट का उपयोग करके बजट सीमाओं और सार्वजनिक मांगों को संतुलित करें",
    weights_heading: "प्राथमिकता यांत्रिकी वेट सेटिंग्स",
    weights_desc: "सक्रिय राज्य में सार्वजनिक कार्यों के लिए प्राथमिकता रैंकिंग की गणना करने के लिए स्लाइडर्स को बदलें।",
    w_demand: "नागरिक मांग वेट",
    desc_w_demand: "आने वाले सबमिशन की मात्रा और तात्कालिकता के आधार पर प्राथमिकता दें।",
    w_gap: "इन्फ्रास्ट्रक्चर गैप वेट",
    desc_w_gap: "कम साक्षरता, कम नामांकन या पानी की कमी वाले राज्यों में परियोजनाओं को प्राथमिकता दें।",
    w_impact: "जनसंख्या प्रभाव वेट",
    desc_w_impact: "उन परियोजनाओं को प्राथमिकता दें जो सबसे बड़े निरपेक्ष जनसंख्या घनत्व को लाभ पहुंचाती हैं।",
    w_cost: "लागत / बजट कारक",
    desc_w_cost: "घटाया गया वेट। बेहतर लागत दक्षता प्राप्त करने के लिए कम लागत वाली परियोजनाएं उच्च स्कोर करती हैं।",
    btn_reset_weights: "वेट रीसेट करें",
    priority_ranks_heading: "अनुशंसित परियोजनाएं और इन्फ्रास्ट्रक्चर प्राथमिकता रैंकिंग",
    btn_report: "कार्यकारी सांसद रिपोर्ट तैयार करें",
    th_rank: "रैंक",
    th_project: "परियोजना प्रस्ताव",
    th_location: "स्थान",
    th_demand: "नागरिक मांग",
    th_gap: "इन्फ्रा गैप",
    th_cost: "बजट लागत",
    th_priority: "प्राथमिकता स्कोर",
    arch_title: "सिस्टम आर्किटेक्चर",
    arch_desc: "एंड-टू-एंड डिज़ाइन कॉन्फ़िगरेशन और पाइपलाइन संरचना",
    arch_heading: "बहुभाषी प्रतिक्रिया पार्सिंग सिस्टम आरेख",
    arch_c1_title: "स्पीच प्रोसेसिंग और OCR",
    arch_c1_desc: "नागरिक आवाज फाइलों को ट्रांसक्राइब करने के लिए ओपनएआई व्हिस्पर वी3 एपीआई को एकीकृत करता है। ढांचागत फोटो का विश्लेषण विजन मॉडल्स द्वारा किया जाता है।",
    arch_c2_title: "अनुवाद और NLU",
    arch_c2_desc: "भाषिनी एपीआई का उपयोग करके क्षेत्रीय भारतीय भाषाओं का समर्थन करता है, सुझावों को सीधे अंग्रेजी में परिवर्तित करता है।",
    arch_c3_title: "भू-स्थानिक विश्लेषण (PostGIS)",
    arch_c3_desc: "जीपीएस बिंदुओं को पोस्टजीआईएस स्थानिक ओवरले मैपिंग के माध्यम से राज्य सीमाओं से सहसंबद्ध किया जाता है।",
    arch_c4_title: "प्राथमिकता यांत्रिकी",
    arch_c4_desc: "सांसद वेट के आधार पर जनसांख्यिकीय डेटा (साक्षरता दर, स्कूल नामांकन) और बजट मूल्यों को जोड़कर प्राथमिकता स्कोर की गणना करता है।",
    perm_mic_title: "माइक्रोफ़ोन एक्सेस की अनुमति दें?",
    perm_mic_desc: "वॉयस अनुरोधों को रिकॉर्ड करने और उन्हें टेक्स्ट में बदलने के लिए पीपल्स प्रायोरिटी को माइक्रोफ़ोन एक्सेस की आवश्यकता है।",
    perm_cam_title: "कैमरा और फ़ाइल एक्सेस की अनुमति दें?",
    perm_cam_desc: "समस्या की तस्वीर लेने या अपनी स्थानीय फाइलों से फोटो अपलोड करने की अनुमति दें।",
    perm_loc_title: "स्थान ट्रैकिंग की अनुमति दें?",
    perm_loc_desc: "सांसद डैशबोर्ड के लिए अपनी शिकायत को स्वचालित रूप से राज्य-वार सॉर्ट करने के लिए अपना सटीक स्थान साझा करें।",
    btn_deny: "अस्वीकार करें",
    btn_allow: "अनुमति दें",
    mp_report_header: "तैयार की गई कार्यकारी सांसद रिपोर्ट",
    btn_print: "प्रिंट / पीडीएफ सहेजें",
    btn_export: "डेटा निर्यात करें",
    logout_tooltip: "लॉग आउट"
  },
  ta: {
    login_title: "டெமோ உள்நுழைவு டாஷ்போர்டு",
    login_subtitle: "உங்கள் போர்டல் அணுகல் முறை மற்றும் இயல்புநிலை மொழியைத் தேர்ந்தெடுக்கவும்",
    login_role_lbl: "அணுகல் போர்டல் முறை",
    role_citizen_title: "குடிமகன் போர்டல்",
    role_citizen_desc: "சிக்கல்களைச் சமர்ப்பித்து முன்னேற்றத்தைக் கண்காணிக்கவும்",
    role_mp_title: "எம்.பி டாஷ்போர்டு",
    role_mp_desc: "தேவைகளை பகுப்பாய்வு செய்து திட்டங்களை வரிசைப்படுத்தவும்",
    login_lang_lbl: "மொழியைத் தேர்ந்தெடுக்கவும்",
    login_btn: "போர்டலுக்குள் நுழையவும்",
    side_subtitle: "AI முடிவு ஆதரவு",
    nav_citizen_submit: "பரிந்துரைகளை சமர்ப்பிக்கவும்",
    nav_citizen_history: "எனது சமர்ப்பிப்புகள்",
    nav_mp_dashboard: "எம்.பி பகுப்பாய்வு",
    nav_mp_sandbox: "AI பகுப்பாய்வு சாண்ட்பாக்ஸ்",
    nav_mp_recommend: "திட்ட முன்னுரிமைகள்",
    nav_sys_architecture: "கணினி கட்டமைப்பு",
    welcome_back: "மீண்டும் வருக,",
    ai_status: "AI இயந்திரம் செயலில் உள்ளது",
    cit_portal_title: "கருத்துகள் & பரிந்துரைகளை சமர்ப்பிக்கவும்",
    cit_portal_desc: "உங்கள் வளர்ச்சி கோரிக்கைகளை உங்கள் பிராந்திய எம்.பி அலுவலகத்திற்கு நேரடியாக பேசவும் அல்லது தட்டச்சு செய்யவும்",
    cit_form_heading: "குடிமகன் அறிக்கை சமர்ப்பிப்பு",
    cit_form_sub: "அனைத்து பதிவேற்றங்களும் தானியங்கி AI மொழிபெயர்ப்பு அடுக்குகள் மூலம் செயலாக்கப்படுகின்றன.",
    gps_enable_btn: "இருப்பிடப் பகிர்வை இயக்கவும்",
    gps_disabled: "இருப்பிட தரவு: முடக்கப்பட்டது (இயல்புநிலையைப் பயன்படுத்துகிறது)",
    gps_enabled: "இருப்பிட தரவு: செயலில் உள்ளது (சிமுலேட்டட் ஜிபிஎஸ் பூட்டு)",
    lbl_submission_state: "மாநிலம் / யூனியன் பிரதேசம்",
    lbl_submission_channel: "சமர்ப்பிப்பு சேனல்",
    lbl_text_transcript: "கருத்தை நேரடியாக தட்டச்சு செய்யவும் (அல்லது பேச மைக்ரோஃபோனைத் தட்டவும்)",
    lbl_attachments: "ஊடக இணைப்புகள் (ஆடியோ பதிவு / புகைப்பட பதிவேற்றம்)",
    slot_record_voice: "குரலைப் பதிவு செய்ய தட்டவும்",
    slot_upload_photo: "புகைப்படத்தை பதிவேற்றவும் / எடுக்கவும்",
    recording_active: "பதிவு செயலில் உள்ளது. நிறுத்த மற்றும் மொழிபெயர்க்க மீண்டும் தட்டவும்...",
    btn_submit_feedback: "கருத்தைச் சமர்ப்பிக்கவும்",
    visualizer_heading: "பன்மொழி AI பைப்லைன் டிராக்கர்",
    visualizer_sub: "உட்செலுத்துதல், மொழிபெயர்ப்பு, OCR மற்றும் வகைப்படுத்தல் படிகளை காட்சிப்படுத்துதல்",
    step_1_title: "1. இருப்பிடம் & சேனல் சரிபார்ப்பு",
    step_1_desc: "ஜிபிஎஸ் புள்ளிகளை புவிக்குறியீடு செய்தல், மாநில எல்லைகளைச் சரிபார்த்தல் மற்றும் செய்திகளை வரிசைப்படுத்துதல்.",
    step_2_title: "2. குரல் டிரான்ஸ்கிரைப் & OCR ஸ்கேனிங்",
    step_2_desc: "விஸ்பர் வழியாக ஸ்பீச்-டு-டெக்ஸ்ட் டிரான்ஸ்கிரிப்ஷனை இயக்குதல் மற்றும் படக் குறைபாடுகளை வகைப்படுத்துதல்.",
    step_3_title: "3. பாஷினி AI மொழிபெயர்ப்பு அடுக்கு",
    step_3_desc: "மொழிகளைக் கண்டறிந்து ஒருங்கிணைந்த ஆங்கில மொழிபெயர்ப்புகளை உருவாக்குதல்.",
    step_4_title: "4. தீம் NER வகைப்பாடு",
    step_4_desc: "வார்டுகள், துறைகள் மற்றும் சிக்கல்களைப் பிரிக்க பெயரிடப்பட்ட உட்பொருள் டோக்கன் பகுப்பாய்வை இயக்குதல்.",
    metadata_header: "செயலாக்கப்பட்ட வெளியீட்டு மெட்டாடேட்டா",
    meta_orig: "அசல் உரை:",
    meta_trans: "மொழிபெயர்ப்பு:",
    meta_theme: "தீம் குறிச்சொல்:",
    meta_urgency: "தீவிரம்:",
    meta_loc: "வழித்தட மாநிலம்:",
    cit_history_title: "நான் சமர்ப்பித்த பரிந்துரைகள்",
    cit_history_desc: "உங்கள் கோரிக்கைகளுக்கான பதில்கள் மற்றும் முன்னுரிமை புள்ளிவிவரங்களைக் கண்காணிக்கவும்",
    th_date: "சமர்ப்பிக்கப்பட்ட தேதி",
    th_state: "மாநில பகுதி",
    th_content: "கருத்து அறிக்கை சுருக்கம்",
    th_theme: "வகைப்படுத்தப்பட்ட தீம்",
    th_urgency: "தீவிரம்",
    th_status: "நிலை",
    kpi_total: "மொத்த மாநில சமர்ப்பிப்புகள்",
    kpi_urgent: "அவசர சிக்கல்கள்",
    kpi_accuracy: "AI முக்கிய துல்லியம்",
    kpi_budget: "மாநில நிதி வரம்பு",
    kpi_pill_action: "நடவடிக்கை தேவை",
    kpi_pill_whisper: "பாஷினி LLM",
    map_heading: "இந்திய மாநில தேர்வு வரைபடம்",
    map_btn_demands: "குடிமக்கள் கோரிக்கைகள்",
    map_btn_gap: "கட்டமைப்பு இடைவெளி",
    map_btn_lit: "எழுத்தறிவு குறியீடு",
    lbl_select_state_quick: "விரைவு மாநில மாற்றம்:",
    lbl_pop_density: "மக்கள் தொகை அடர்த்தி",
    lbl_literacy_rate: "எழுத்தறிவு குறியீடு",
    lbl_school_enroll: "பள்ளி சேர்க்கை",
    lbl_water_access: "சுத்தமான நீர் அணுகல்",
    top_state_demands: "மாநிலத்தின் முக்கிய பொது கோரிக்கைகள்",
    recent_state_feedback: "மாநிலத்தில் சமர்ப்பிக்கப்பட்ட சமீபத்திய கருத்து",
    sandbox_title: "AI பகுப்பாய்வு சாண்ட்பாக்ஸ்",
    sandbox_desc: "பாஷினி மொழிபெயர்ப்புகள், NER சில்லுகள் மற்றும் தலைப்பு வகைப்படுத்தியைச் சோதிக்கவும்",
    sandbox_heading: "NLP நிகழ்நேர அறிக்கை பாகுபடுத்தி",
    sandbox_sub: "பிராந்திய மொழிகளில் எந்தவொரு அறிக்கையையும் தட்டச்சு செய்யவும் அல்லது ஒட்டவும். NLP பாகுபடுத்தி உடனடியாக வரைபடமாக்குகிறது.",
    lbl_sandbox_input: "உள்ளீட்டு அறிக்கை",
    lbl_sandbox_quick: "விரைவான உள்ளீடுகள்",
    lbl_nlp_threshold: "NLP தலைப்பு பொருத்தம் வரம்பு",
    lang_ident: "மொழி அடையாளம் காணல்",
    detected_lang_lbl: "கண்டறியப்பட்ட மொழி:",
    confidence_lbl: "துல்லியம்:",
    machine_trans: "இயந்திர மொழிபெயர்ப்பு (பாஷினி)",
    ner_extract: "பிரித்தெடுக்கப்பட்ட உட்பொருட்கள் (NER)",
    topic_class: "தலைப்பு வகைப்பாடு",
    sentiment_analysis: "மனநிலை & தீவிரத்தன்மை குறியீடு",
    sentiment_neg: "எதிர்மறை (அவசரம்)",
    sentiment_neu: "நடுநிலை",
    sentiment_pos: "நேர்மறை",
    recommendations_title: "திட்ட முன்னுரிமை டாஷ்போர்டு",
    recommendations_desc: "எடைகளை சரிசெய்து பட்ஜெட் வரம்புகள் மற்றும் பொதுக் கோரிக்கைகளை சமநிலைப்படுத்தவும்",
    weights_heading: "முன்னுரிமை எடைகள் அமைப்புகள்",
    weights_desc: "செயலில் உள்ள மாநிலத்தின் பொதுப் பணிகளுக்கான முன்னுரிமை தரவரிசைகளைக் கணக்கிட ஸ்லைடர்களை மாற்றவும்.",
    w_demand: "குடிமக்கள் தேவை எடை",
    desc_w_demand: "சமர்ப்பிப்புகளின் அளவு மற்றும் அவசரத்தின் அடிப்படையில் முன்னுரிமை கொடுங்கள்.",
    w_gap: "கட்டமைப்பு இடைவெளி எடை",
    desc_w_gap: "குறைந்த எழுத்தறிவு, குறைந்த சேர்க்கை அல்லது தண்ணீர் பற்றாக்குறை உள்ள மாநிலங்களில் திட்டங்களுக்கு முன்னுரிமை கொடுங்கள்.",
    w_impact: "மக்கள் தொகை தாக்க எடை",
    desc_w_impact: "அதிக மக்கள் தொகை அடர்த்திக்கு பயனளிக்கும் திட்டங்களுக்கு முன்னுரிமை கொடுங்கள்.",
    w_cost: "செலவு / பட்ஜெட் காரணி",
    desc_w_cost: "குறைக்கப்பட்ட எடை. சிறந்த செலவு செயல்திறனைப் பெற குறைந்த செலவுத் திட்டங்கள் அதிக மதிப்பெண் பெறுகின்றன.",
    btn_reset_weights: "எடைகளை மீட்டமைக்கவும்",
    priority_ranks_heading: "பரிந்துரைக்கப்பட்ட திட்டங்கள் & கட்டமைப்பு முன்னுரிமை தரவரிசை",
    btn_report: "எம்.பி நிர்வாக அறிக்கையை உருவாக்கு",
    th_rank: "தரவரிசை",
    th_project: "திட்ட முன்மொழிவு",
    th_location: "இருப்பிடம்",
    th_demand: "குடிமக்கள் தேவை",
    th_gap: "இடைவெளி",
    th_cost: "பட்ஜெட் செலவு",
    th_priority: "முன்னுரிமை மதிப்பெண்",
    arch_title: "கணினி கட்டமைப்பு",
    arch_desc: "முழுமையான வடிவமைப்பு உள்ளமைவுகள் மற்றும் பைப்லைன் அமைப்பு",
    arch_heading: "பன்மொழி கருத்து பகுப்பாய்வு கணினி வரைபடம்",
    arch_c1_title: "குரல் செயலாக்கம் & OCR",
    arch_c1_desc: "குடிமக்களின் குரல் கோப்புகளை உரைநடையாக மாற்ற OpenAI விஸ்பர் v3 API ஐ ஒருங்கிணைக்கிறது. புகைப்படங்கள் விஷன் மாதிரிகள் மூலம் பகுப்பாய்வு செய்யப்படுகின்றன.",
    arch_c2_title: "மொழிபெயர்ப்பு & NLU",
    arch_c2_desc: "பாஷினி API ஐப் பயன்படுத்தி பிராந்திய இந்திய மொழிகளை ஆதரிக்கிறது, பரிந்துரைகளை நேரடியாக ஆங்கிலத்திற்கு மாற்றுகிறது.",
    arch_c3_title: "புவிசார் பகுப்பாய்வு (PostGIS)",
    arch_c3_desc: "ஜிபிஎஸ் புள்ளிகள் போஸ்ட்ஜிஐஎஸ் மூலம் மாநில எல்லைகளுடன் தொடர்புபடுத்தப்படுகின்றன.",
    arch_c4_title: "முன்னுரிமை மெக்கானிக்ஸ்",
    arch_c4_desc: "எழுத்தறிவு மற்றும் பள்ளி சேர்க்கை போன்ற காரணிகளை எம்.பி எடைகளுடன் இணைத்து முன்னுரிமை மதிப்பெண்ணைக் கணக்கிடுகிறது.",
    perm_mic_title: "மைக்ரோஃபோன் அணுகலை அனுமதிக்கவா?",
    perm_mic_desc: "குரல் கோரிக்கைகளைப் பதிவுசெய்து அவற்றை உரையாக மாற்ற பீப்பள்ஸ் பிரையாரிட்டிக்கு மைக்ரோஃபோன் அணுகல் தேவை.",
    perm_cam_title: "கேமரா & கோப்பு அணுகலை அனுமதிக்கவா?",
    perm_cam_desc: "சிக்கலின் புகைப்படத்தை எடுக்க அல்லது உங்கள் உள்ளூர் கோப்புகளிலிருந்து புகைப்படங்களை பதிவேற்ற அனுமதிக்கவும்.",
    perm_loc_title: "இருப்பிட கண்காணிப்பை அனுமதிக்கவா?",
    perm_loc_desc: "உங்கள் புகாரை தானாகவே மாநில வாரியாக வரிசைப்படுத்த உங்கள் சரியான இருப்பிடத்தைப் பகிரவும்.",
    btn_deny: "தடு",
    btn_allow: "அனுமதி",
    mp_report_header: "உருவாக்கப்பட்ட எம்.பி நிர்வாக அறிக்கை",
    btn_print: "அச்சிடுக / PDF ஆக சேமி",
    btn_export: "தரவை ஏற்றுமதி செய்",
    logout_tooltip: "வெளியேறு"
  },
  te: {
    login_title: "డెమో లాగిన్ డాష్‌బోర్డ్",
    login_subtitle: "మీ పోర్టల్ యాక్సెస్ మోడ్ మరియు డిఫాల్ట్ భాషను ఎంచుకోండి",
    login_role_lbl: "యాక్సెస్ పోర్టల్ మోడ్",
    role_citizen_title: "సిటిజన్ పోర్టల్",
    role_citizen_desc: "సమస్యలను సమర్పించండి & పురోగతిని ట్రాక్ చేయండి",
    role_mp_title: "ఎంపీ డాష్‌బోర్డ్",
    role_mp_desc: "అవసరాలను విశ్లేషించండి & ప్రాజెక్ట్‌లను ర్యాంక్ చేయండి",
    login_lang_lbl: "భాషను ఎంచుకోండి",
    login_btn: "పోర్టల్‌లోకి ప్రవేశించండి",
    side_subtitle: "AI నిర్ణయ మద్దతు",
    nav_citizen_submit: "సూచనలను సమర్పించండి",
    nav_citizen_history: "నా సమర్పణలు",
    nav_mp_dashboard: "ఎంపీ విశ్లేషణలు",
    nav_mp_sandbox: "AI పార్సింగ్ శాండ్‌బాక్స్",
    nav_mp_recommend: "ప్రాజెక్ట్ ప్రాధాన్యతలు",
    nav_sys_architecture: "సిస్టమ్ ఆర్కిటెక్చర్",
    welcome_back: "స్వాగతం,",
    ai_status: "AI ఇంజిన్ సక్రియంగా ఉంది",
    cit_portal_title: "అభిప్రాయాలు & సూచనలను సమర్పించండి",
    cit_portal_desc: "మీ అభివృద్ధి అభ్యర్థనలను నేరుగా మీ ప్రాంతీయ ఎంపీ కార్యాలయానికి మాట్లాడండి లేదా టైప్ చేయండి",
    cit_form_heading: "సిటిజన్ స్టేట్‌మెంట్ సమర్పణ",
    cit_form_sub: "అన్ని అప్‌లోడ్‌లు ఆటోమేటెడ్ AI అనువాద లేయర్‌ల ద్వారా ప్రాసెస్ చేయబడతాయి.",
    gps_enable_btn: "స్థాన భాగస్వామ్యాన్ని ప్రారంభించండి",
    gps_disabled: "స్థాన డేటా: నిలిపివేయబడింది (డిఫాల్ట్‌ని ఉపయోగిస్తోంది)",
    gps_enabled: "స్థాన డేటా: సక్రియంగా ఉంది (సిమ్యులేటెడ్ జీపీఎస్ లాక్)",
    lbl_submission_state: "రాష్ట్రం / కేంద్రపాలిత ప్రాంతం",
    lbl_submission_channel: "సమర్పణ ఛానెల్",
    lbl_text_transcript: "అభిప్రాయాన్ని నేరుగా టైప్ చేయండి (లేదా మాట్లాడటానికి మైక్రోఫోన్‌ను నొక్కండి)",
    lbl_attachments: "మీడియా జోడింపులు (ఆడియో రికార్డ్ / ఫోటో అప్‌లోడ్)",
    slot_record_voice: "వాయిస్ రికార్డ్ చేయడానికి నొక్కండి",
    slot_upload_photo: "ఫోటోను అప్‌లోడ్ చేయండి / తీయండి",
    recording_active: "రికార్డింగ్ సక్రియంగా ఉంది. ఆపడానికి మరియు అనువదించడానికి మళ్లీ నొక్కండి...",
    btn_submit_feedback: "అభిప్రాయాన్ని సమర్పించండి",
    visualizer_heading: "బహుభాషా AI పైప్‌లైన్ ట్రాకర్",
    visualizer_sub: "సంగ్రహణ, అనువాదం, OCR మరియు వర్గీకరణ దశల విజువలైజేషన్",
    step_1_title: "1. స్థానం & ఛానెల్ ధృవీకరణ",
    step_1_desc: "జీపీఎస్ పాయింట్లను జియోకోడింగ్ చేయడం, రాష్ట్ర సరిహద్దులను ధృవీకరించడం మరియు సందేశాలను క్యూలో ఉంచడం.",
    step_2_title: "2. వాయిస్ ట్రాన్స్‌క్రైబ్ & OCR స్కానింగ్",
    step_2_desc: "విస్పర్ ద్వారా స్పీచ్-టు-టెక్స్ట్ ట్రాన్స్‌క్రిప్షన్‌ను అమలు చేయడం మరియు ఇమేజ్ లోపాలను వర్గీకరించడం.",
    step_3_title: "3. భాషిణి AI అనువాద లేయర్",
    step_3_desc: "భాషలను గుర్తించడం మరియు ఏకీకృత ఆంగ్ల అనువాదాలను రూపొందించడం.",
    step_4_title: "4. థీమ్ NER వర్గీకరణ",
    step_4_desc: "వార్డులు, రంగాలు మరియు సమస్యలను వేరు చేయడానికి నేమ్డ్ ఎంటిటీ టోకెన్ పార్సింగ్‌ను అమలు చేయడం.",
    metadata_header: "ప్రాసెస్ చేయబడిన అవుట్‌పుట్ మెటాడేటా",
    meta_orig: "అసలు వచనం:",
    meta_trans: "అనువాదం:",
    meta_theme: "థీమ్ ట్యాగ్:",
    meta_urgency: "తీవ్రత:",
    meta_loc: "రూట్ చేయబడిన రాష్ట్రం:",
    cit_history_title: "నేను సమర్పించిన సూచనలు",
    cit_history_desc: "మీ అభ్యర్థనల సమాధానాలు మరియు ప్రాధాన్యత గణాంకాలను ట్రాక్ చేయండి",
    th_date: "సమర్పించిన తేదీ",
    th_state: "రాష్ట్ర ప్రాంతం",
    th_content: "అభిప్రాయ ప్రకటన సారాంశం",
    th_theme: "వర్గీకరించబడిన థీమ్",
    th_urgency: "తీవ్రత",
    th_status: "స్థితి",
    kpi_total: "మొత్తం రాష్ట్ర సమర్పణలు",
    kpi_urgent: "అత్యవసర సమస్యలు",
    kpi_accuracy: "AI ప్రధాన ఖచ్చితత్వం",
    kpi_budget: "రాష్ట్ర నిధుల పరిమితి",
    kpi_pill_action: "చర్య అవసరం",
    kpi_pill_whisper: "భాషిణి LLM",
    map_heading: "భారతదేశ రాష్ట్ర ఎంపిక మ్యాప్",
    map_btn_demands: "సిటిజన్ డిమాండ్లు",
    map_btn_gap: "ఇన్‌ఫ్రాస్ట్రక్చర్ గ్యాప్",
    map_btn_lit: "అక్షరాస్యత సూచిక",
    lbl_select_state_quick: "త్వరిత రాష్ట్ర మార్పు:",
    lbl_pop_density: "జనసాంద్రత",
    lbl_literacy_rate: "అక్షరాస్యత సూచిక",
    lbl_school_enroll: "బడి నమోదు",
    lbl_water_access: "స్వచ్ఛమైన నీటి యాక్సెస్",
    top_state_demands: "రాష్ట్ర ముఖ్య ప్రజా డిమాండ్లు",
    recent_state_feedback: "రాష్ట్రంలో సమర్పించిన తాజా అభిప్రాయం",
    sandbox_title: "AI పార్సింగ్ శాండ్‌బాక్స్",
    sandbox_desc: "భాషిణి అనువాదాలు, NER చిప్స్ మరియు టాపిక్ వర్గీకరణను పరీక్షించండి",
    sandbox_heading: "NLP నిజ-సమయ ప్రకటన పార్సర్",
    sandbox_sub: "ప్రాంతీయ భాషల్లో ఏదైనా ప్రకటనను టైప్ చేయండి లేదా పేస్ట్ చేయండి. NLP పార్సర్ వెంటనే మ్యాపింగ్ చేస్తుంది.",
    lbl_sandbox_input: "ఇన్‌పుట్ ప్రకటన",
    lbl_sandbox_quick: "త్వరిత ఇన్‌పుట్‌లు",
    lbl_nlp_threshold: "NLP టాపిక్ మ్యాచ్ థ్రెషోల్డ్",
    lang_ident: "భాష గుర్తింపు",
    detected_lang_lbl: "గుర్తించబడిన భాష:",
    confidence_lbl: "ఖచ్చితత్వం:",
    machine_trans: "మెషిన్ అనువాదం (భాషిణి)",
    ner_extract: "ప్రిత్తెడుక్కప్పట్ట ఉట్పొరుట్కళ్ (NER)",
    topic_class: "టాపిక్ వర్గీకరణ",
    sentiment_analysis: "మనోభావం & తీవ్రత సూచిక",
    sentiment_neg: "ప్రతికూల (అత్యవసరం)",
    sentiment_neu: "తటస్థ",
    sentiment_pos: "సానుకూల",
    recommendations_title: "ప్రాజెక్ట్ ప్రాధాన్యత డాష్‌బోర్డ్",
    recommendations_desc: "బడ్జెట్ పరిమితులు మరియు ప్రజా డిమాండ్లను సమతుల్యం చేయడానికి బరువులను సర్దుబాటు చేయండి",
    weights_heading: "ప్రాధాన్యత బరువుల సెట్టింగ్‌లు",
    weights_desc: "సక్రియ రాష్ట్రంలో ప్రజా పనుల ప్రాధాన్యత ర్యాంకింగ్‌లను లెక్కించడానికి స్లైడర్‌లను మార్చండి.",
    w_demand: "సిటిజన్ డిమాండ్ బరువు",
    desc_w_demand: "సమర్పణల పరిమాణం మరియు అత్యవసరత ఆధారంగా ప్రాధాన్యత ఇవ్వండి.",
    w_gap: "ఇన్‌ఫ్రాస్ట్రక్చర్ గ్యాప్ బరువు",
    desc_w_gap: "తక్కువ అక్షరాస్యత, తక్కువ నమోదు లేదా నీటి కొరత ఉన్న రాష్ట్రాల్లో ప్రాజెక్టులకు ప్రాధాన్యత ఇవ్వండి.",
    w_impact: "జనాభా ఇంపాక్ట్ బరువు",
    desc_w_impact: "అధిక జనాభా సాంద్రతకు ప్రయోజనం చేకూర్చే ప్రాజెక్టులకు ప్రాధాన్యత ఇవ్వండి.",
    w_cost: "ఖర్చు / బడ్జెట్ కారకం",
    desc_w_cost: "తగ్గించబడిన బరువు. మెరుగైన వ్యయ సామర్థ్యాన్ని పొందడానికి తక్కువ వ్యయ ప్రాజెక్టులు అధిక స్కోర్‌ను పొందుతాయి.",
    btn_reset_weights: "బరువులను రీసెట్ చేయండి",
    priority_ranks_heading: "సిఫార్సు చేయబడిన ప్రాజెక్ట్‌లు & ఇన్‌ఫ్రాస్ట్రక్చర్ ప్రాధాన్యత ర్యాంకింగ్‌లు",
    btn_report: "కార్యనిర్వాహక ఎంపీ నివేదికను రూపొందించు",
    th_rank: "ర్యాంక్",
    th_project: "ప్రాజెక్ట్ ప్రతిపాదన",
    th_location: "స్థానం",
    th_demand: "సిటిజన్ డిమాండ్",
    th_gap: "మధ్య ఖాళీ",
    th_cost: "బడ్జెట్ ఖర్చు",
    th_priority: "ప్రాధాన్యత స్కోరు",
    arch_title: "సిస్టమ్ ఆర్కిటెక్చర్",
    arch_desc: "ఎండ్-టు-ఎండ్ డిజైన్ కాన్ఫిగరేషన్లు మరియు పైప్‌లైన్ నిర్మాణం",
    arch_heading: "బహుభాషా అభిప్రాయ విశ్లేషణ సిస్టమ్ మ్యాప్",
    arch_c1_title: "వాయిస్ ప్రాసెసింగ్ & OCR",
    arch_c1_desc: "సిటిజన్ వాయిస్ ఫైళ్లను టెక్స్ట్‌గా మార్చడానికి OpenAI విస్పర్ v3 APIని అనుసంధానిస్తుంది. ఫోటోలను విజన్ మోడల్స్ విశ్లేషిస్తాయి.",
    arch_c2_title: "అనువాదం & NLU",
    arch_c2_desc: "భాషిణి APIని ఉపయోగించి ప్రాంతీయ భారతీయ భాషలకు మద్దతు ఇస్తుంది, సిఫార్సులను నేరుగా ఆంగ్లంలోకి మారుస్తుంది.",
    arch_c3_title: "భూగోళ విశ్లేషణ (PostGIS)",
    arch_c3_desc: "జీపీఎస్ పాయింట్లు పోస్ట్ జీఐఎస్ ద్వారా రాష్ట్ర సరిహద్దులతో అనుసంధానించబడతాయి.",
    arch_c4_title: "ప్రాధాన్యత మెకానిక్స్",
    arch_c4_desc: "అక్షరాస్యత మరియు బడి నమోదు వంటి అంశాలను ఎంపీ బరువులతో కలిపి ప్రాధాన్యత స్కోరును లెక్కిస్తుంది.",
    perm_mic_title: "మైక్రోఫోన్ యాక్సెస్‌ను అనుమతించాలా?",
    perm_mic_desc: "వాయిస్ అభ్యర్థనలను రికార్డ్ చేయడానికి మరియు వాటిని టెక్స్ట్‌గా మార్చడానికి పీపుల్స్ ప్రయారిటీకి మైక్రోఫోన్ యాక్సెస్ అవసరం.",
    perm_cam_title: "కెమెరా & ఫైల్ యాక్సెస్‌ను అనుమతించాలా?",
    perm_cam_desc: "సమస్య యొక్క ఫోటో తీయడానికి లేదా మీ స్థానిక ఫైల్‌ల నుండి ఫోటోలను అప్‌లోడ్ చేయడానికి అనుమతించండి.",
    perm_loc_title: "స్థాన ట్రాకింగ్‌ను అనుమతించాలా?",
    perm_loc_desc: "మీ ఫిర్యాదును స్వయంచాలకంగా రాష్ట్రాల వారీగా క్రమబద్ధీకరించడానికి మీ ఖచ్చితమైన స్థానాన్ని భాగస్వామ్యం చేయండి.",
    btn_deny: "తిరస్కరించు",
    btn_allow: "అనుమతించు",
    mp_report_header: "రూపొందించబడిన ఎంపీ కార్యనిర్వాహక నివేదిక",
    btn_print: "ప్రింట్ / PDFగా సేవ్ చేయి",
    btn_export: "డేటాను ఎగుమతి చేయి",
    logout_tooltip: "లాగ్ అవుట్"
  },
  kn: {
    login_title: "ಡೆಮೊ ಲಾಗಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    login_subtitle: "ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಪ್ರವೇಶ ಮೋಡ್ ಮತ್ತು ಡೀಫಾಲ್ಟ್ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    login_role_lbl: "ಪ್ರವೇಶ ಪೋರ್ಟಲ್ ಮೋಡ್",
    role_citizen_title: "ನಾಗರಿಕ ಪೋರ್ಟಲ್",
    role_citizen_desc: "ಸಮಸ್ಯೆಗಳನ್ನು ಸಲ್ಲಿಸಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    role_mp_title: "ಸಂಸದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    role_mp_desc: "ಅಗತ್ಯಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಯೋಜನೆಗಳನ್ನು ಶ್ರೇಣೀಕರಿಸಿ",
    login_lang_lbl: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    login_btn: "ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ",
    side_subtitle: "AI ನಿರ್ಧಾರ ಬೆಂಬಲ",
    nav_citizen_submit: "ಸಲಹೆಗಳನ್ನು ಸಲ್ಲಿಸಿ",
    nav_citizen_history: "ನನ್ನ ಸಲ್ಲಿಕೆಗಳು",
    nav_mp_dashboard: "ಸಂಸದ ವಿಶ್ಲೇಷಣೆ",
    nav_mp_sandbox: "AI ಪಾರ್ಸಿಂಗ್ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್",
    nav_mp_recommend: "ಯೋಜನಾ ಆದ್ಯತೆಗಳು",
    nav_sys_architecture: "ಸಿಸ್ಟಮ್ ಆರ್ಕಿಟೆಕ್ಚರ್",
    welcome_back: "ನಮಸ್ಕಾರ,",
    ai_status: "AI ಎಂಜಿನ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    cit_portal_title: "ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ಸಲಹೆಗಳನ್ನು ಸಲ್ಲಿಸಿ",
    cit_portal_desc: "ನಿಮ್ಮ ಅಭಿವೃದ್ಧಿ ವಿನಂತಿಗಳನ್ನು ನಿಮ್ಮ ಪ್ರಾದೇಶಿಕ ಸಂಸದ ಕಚೇರಿಗೆ ನೇರವಾಗಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ",
    cit_form_heading: "ನಾಗರಿಕ ಹೇಳಿಕೆ ಸಲ್ಲಿಕೆ",
    cit_form_sub: "ಎಲ್ಲಾ ಅಪ್‌ಲೋಡ್‌ಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತ AI ಅನುವಾದ ಲೇಯರ್‌ಗಳ ಮೂಲಕ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ.",
    gps_enable_btn: "ಸ್ಥಳ ಹಂಚಿಕೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ",
    gps_disabled: "ಸ್ಥಳ ಡೇಟಾ: ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ (ಡೀಫಾಲ್ಟ್ ಬಳಸಲಾಗುತ್ತಿದೆ)",
    gps_enabled: "ಸ್ಥಳ ಡೇಟಾ: ಸಕ್ರಿಯವಾಗಿದೆ (ಸಿಮ್ಯುಲೇಟಡ್ ಜಿಪಿಎಸ್ ಲಾಕ್)",
    lbl_submission_state: "ರಾಜ್ಯ / ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ",
    lbl_submission_channel: "ಸಲ್ಲಿಕೆ ಚಾನಲ್",
    lbl_text_transcript: "ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ (ಅಥವಾ ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡಿ)",
    lbl_attachments: "ಮಾಧ್ಯಮ ಲಗತ್ತುಗಳು (ಆಡಿಯೋ ರೆಕಾರ್ಡ್ / ಫೋಟೋ ಅಪ್‌ಲೋಡ್)",
    slot_record_voice: "ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    slot_upload_photo: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ / ಸೆರೆಹಿಡಿಯಿರಿ",
    recording_active: "ರೆಕಾರ್ಡಿಂಗ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಲ್ಲಿಸಲು ಮತ್ತು ಅನುವಾದಿಸಲು ಮತ್ತೊಮ್ಮೆ ಟ್ಯಾಪ್ ಮಾಡಿ...",
    btn_submit_feedback: "ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ",
    visualizer_heading: "ಬಹುಭಾಷಾ AI ಪೈಪ್‌ಲೈನ್ ಟ್ರ್ಯಾಕರ್",
    visualizer_sub: "ಸಂಗ್ರಹಣೆ, ಅನುವಾದ, ಒಸಿಆರ್ ಮತ್ತು ವರ್ಗೀಕರಣ ಹಂತಗಳ ದೃಶ್ಯೀಕರಣ",
    step_1_title: "1. ಸ್ಥಳ ಮತ್ತು ಚಾನಲ್ ಪರಿಶೀಲನೆ",
    step_1_desc: "ಜಿಪಿಎಸ್ ಬಿಂದುಗಳನ್ನು ಜಿಯೋಕೋಡಿಂಗ್ ಮಾಡುವುದು, ರಾಜ್ಯ ಗಡಿಗಳನ್ನು ಪರಿಶೀಲಿಸುವುದು ಮತ್ತು ಸಂದೇಶಗಳನ್ನು ಕ್ಯೂನಲ್ಲಿಡುವುದು.",
    step_2_title: "2. ಧ್ವನಿ ಲಿಪ್ಯಂತರ ಮತ್ತು ಒಸಿಆರ್ ಸ್ಕ್ಯಾನಿಂಗ್",
    step_2_desc: "ವಿಸ್ಪರ್ ಮೂಲಕ ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್ ಲಿಪ್ಯಂತರವನ್ನು ಚಲಾಯಿಸುವುದು ಮತ್ತು ಚಿತ್ರ ದೋಷಗಳನ್ನು ವರ್ಗೀಕರಿಸುವುದು.",
    step_3_title: "3. ಭಾಷಿಣಿ AI ಅನುವಾದ ಲೇಯರ್",
    step_3_desc: "ಭಾಷೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುವುದು ಮತ್ತು ಏಕೀಕೃತ ಇಂಗ್ಲಿಷ್ ಅನುವಾದಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುವುದು.",
    step_4_title: "4. ಥೀಮ್ NER ವರ್ಗೀಕರಣ",
    step_4_desc: "ವಾರ್ಡ್‌ಗಳು, ಕ್ಷೇತ್ರಗಳು ಮತ್ತು ಸಮಸ್ಯೆಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಲು ನೇಮ್ಡ್ ಎಂಟಿಟಿ ಟೋಕನ್ ಪಾರ್ಸಿಂಗ್ ಅನ್ನು ಚಲಾಯಿಸುವುದು.",
    metadata_header: "ಸಂಸ್ಕರಿಸಿದ ಔಟ್‌ಪುಟ್ ಮೆಟಾಡೇಟಾ",
    meta_orig: "ಮೂಲ ಪಠ್ಯ:",
    meta_trans: "ಅನುವಾದ:",
    meta_theme: "ಥೀಮ್ ಟ್ಯಾಗ್:",
    meta_urgency: "ತೀವ್ರತೆ:",
    meta_loc: "ರೂಟ್ ಮಾಡಿದ ರಾಜ್ಯ:",
    cit_history_title: "ನಾನು ಸಲ್ಲಿಸಿದ ಸಲಹೆಗಳು",
    cit_history_desc: "ನಿಮ್ಮ ವಿನಂತಿಗಳ ಉತ್ತರಗಳು ಮತ್ತು ಆದ್ಯತೆಯ ಅಂಕಿಅಂಶಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    th_date: "ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ",
    th_state: "ರಾಜ್ಯ ಪ್ರದೇಶ",
    th_content: "ಪ್ರತಿಕ್ರಿಯೆ ಹೇಳಿಕೆಯ ಸಾರಾಂಶ",
    th_theme: "ವರ್ಗೀಕರಿಸಿದ ಥೀಮ್",
    th_urgency: "ತೀವ್ರತೆ",
    th_status: "ಸ್ಥಿತಿ",
    kpi_total: "ಒಟ್ಟು ರಾಜ್ಯ ಸಲ್ಲಿಕೆಗಳು",
    kpi_urgent: "ತುರ್ತು ಸಮಸ್ಯೆಗಳು",
    kpi_accuracy: "AI ಪ್ರಮುಖ ನಿಖರತೆ",
    kpi_budget: "ರಾಜ್ಯ ನಿಧಿ ಮಿತಿ",
    kpi_pill_action: "ಕ್ರಮದ ಅಗತ್ಯವಿದೆ",
    kpi_pill_whisper: "ಭಾಷಿಣಿ LLM",
    map_heading: "ಭಾರತದ ರಾಜ್ಯ ಆಯ್ಕೆ ನಕ್ಷೆ",
    map_btn_demands: "ನಾಗರಿಕರ ಬೇಡಿಕೆಗಳು",
    map_btn_gap: "ಮೂಲಸೌಕರ್ಯ ಅಂತರ",
    map_btn_lit: "ಸಾಕ್ಷರತಾ ಸೂಚ್ಯಂಕ",
    lbl_select_state_quick: "ತ್ವರಿತ ರಾಜ್ಯ ಬದಲಾವಣೆ:",
    lbl_pop_density: "ಜನಸಾಂದ್ರತೆ",
    lbl_literacy_rate: "ಸಾಕ್ಷರತಾ ಸೂಚ್ಯಂಕ",
    lbl_school_enroll: "ಶಾಲೆ ದಾಖಲಾತಿ",
    lbl_water_access: "ಶುದ್ಧ ನೀರಿನ ಪ್ರವೇಶ",
    top_state_demands: "ರಾಜ್ಯದ ಮುಖ್ಯ ಸಾರ್ವಜನಿಕ ಬೇಡಿಕೆಗಳು",
    recent_state_feedback: "ರಾಜ್ಯದಲ್ಲಿ ಸಲ್ಲಿಸಲಾದ ಇತ್ತೀಚಿನ ಪ್ರತಿಕ್ರಿಯೆ",
    sandbox_title: "AI ಪಾರ್ಸಿಂಗ್ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್",
    sandbox_desc: "ಭಾಷಿಣಿ ಅನುವಾದಗಳು, NER ಚಿಪ್ಸ್ ಮತ್ತು ವಿಷಯ ವರ್ಗೀಕರಣವನ್ನು ಪರೀಕ್ಷಿಸಿ",
    sandbox_heading: "NLP ನೈಜ-ಸಮಯದ ಹೇಳಿಕೆ ಪಾರ್ಸರ್",
    sandbox_sub: "ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ ಯಾವುದೇ ಹೇಳಿಕೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಪೇಸ್ಟ್ ಮಾಡಿ. NLP ಪಾರ್ಸರ್ ತಕ್ಷಣವೇ ಮ್ಯಾಪಿಂಗ್ ಮಾಡುತ್ತದೆ.",
    lbl_sandbox_input: "ಇನ್‌ಪುಟ್ ಹೇಳಿಕೆ",
    lbl_sandbox_quick: "ತ್ವರಿತ ಇನ್‌ಪುಟ್‌ಗಳು",
    lbl_nlp_threshold: "NLP ವಿಷಯ ಹೊಂದಾಣಿಕೆ ಮಿತಿ",
    lang_ident: "ಭಾಷೆ ಗುರುತಿಸುವಿಕೆ",
    detected_lang_lbl: "ಪತ್ತೆಯಾದ ಭಾಷೆ:",
    confidence_lbl: "ನಿಖರತೆ:",
    machine_trans: "ಯಂತ್ರ ಅನುವಾದ (ಭಾಷಿಣಿ)",
    ner_extract: "ತೆಗೆದ ಹೆಸರಿಸಿದ ಅಂಶಗಳು (NER)",
    topic_class: "ವಿಷಯ ವರ್ಗೀಕರಣ",
    sentiment_analysis: "ಭಾವನೆ ಮತ್ತು ತೀವ್ರತೆ ಸೂಚ್ಯಂಕ",
    sentiment_neg: "ನಕಾರಾತ್ಮಕ (ತುರ್ತು)",
    sentiment_neu: "ತಟಸ್ಥ",
    sentiment_pos: "ಸಕಾರಾತ್ಮಕ",
    recommendations_title: "ಯೋಜನೆ ಆದ್ಯತೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    recommendations_desc: "ಬಜೆಟ್ ಮಿತಿಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಬೇಡಿಕೆಗಳನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ತೂಕಗಳನ್ನು ಹೊಂದಿಸಿ",
    weights_heading: "ಆದ್ಯತೆ ತೂಕಗಳ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    weights_desc: "ಸಕ್ರಿಯ ರಾಜ್ಯದಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಕಾರ್ಯಗಳ ಆದ್ಯತೆಯ ಶ್ರೇಯಾಂಕಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲು ಸ್ಲೈಡರ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ.",
    w_demand: "ನಾಗರಿಕ ಬೇಡಿಕೆ ತೂಕ",
    desc_w_demand: "ಸಲ್ಲಿಕೆಗಳ ಪ್ರಮಾಣ ಮತ್ತು ತುರ್ತು ಆಧಾರದ ಮೇಲೆ ಆದ್ಯತೆ ನೀಡಿ.",
    w_gap: "ಮೂಲಸೌಕರ್ಯ ಅಂತರ ತೂಕ",
    desc_w_gap: "ಕಡಿಮೆ ಸಾಕ್ಷರತೆ, ಕಡಿಮೆ ದಾಖಲಾತಿ ಅಥವಾ ನೀರಿನ ಕೊರತೆಯಿರುವ ರಾಜ್ಯಗಳಲ್ಲಿ ಯೋಜನೆಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.",
    w_impact: "ಜನಸಂಖ್ಯೆ ಪ್ರಭಾವದ ತೂಕ",
    desc_w_impact: "ಹೆಚ್ಚಿನ ಜನಸಂಖ್ಯಾ ಸಾಂದ್ರತೆಗೆ ಪ್ರಯೋಜನವನ್ನು ನೀಡುವ ಯೋಜನೆಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.",
    w_cost: "ವೆಚ್ಚ / ಬಜೆಟ್ ಅಂಶ",
    desc_w_cost: "ಕಡಿತಗೊಳಿಸಿದ ತೂಕ. ಉತ್ತಮ ವೆಚ್ಚ ದಕ್ಷತೆಯನ್ನು ಪಡೆಯಲು ಕಡಿಮೆ ವೆಚ್ಚದ ಯೋಜನೆಗಳು ಹೆಚ್ಚಿನ ಸ್ಕೋರ್ ಪಡೆಯುತ್ತವೆ.",
    btn_reset_weights: "ತೂಕಗಳನ್ನು ಮರುಹೊಂದಿಸಿ",
    priority_ranks_heading: "ಶಿಫಾರಸು ಮಾಡಿದ ಯೋಜನೆಗಳು ಮತ್ತು ಮೂಲಸೌಕರ್ಯ ಆದ್ಯತೆಯ ಶ್ರೇಯಾಂಕಗಳು",
    btn_report: "ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಂಸದ ವರದಿಯನ್ನು ತಯಾರಿಸಿ",
    th_rank: "ಶ್ರೇಣಿ",
    th_project: "ಯೋಜನೆ ಪ್ರಸ್ತಾವನೆ",
    th_location: "ಸ್ಥಳ",
    th_demand: "ನಾಗರಿಕ ಬೇಡಿಕೆ",
    th_gap: "ಅಂತರ",
    th_cost: "ಬಜೆಟ್ ವೆಚ್ಚ",
    th_priority: "ಆದ್ಯತೆಯ ಸ್ಕೋರ್",
    arch_title: "ಸಿಸ್ಟಮ್ ಆರ್ಕಿಟೆಕ್ಚರ್",
    arch_desc: "ಎಂಡ್-ಟು-ಎಂಡ್ ವಿನ್ಯಾಸ ಸಂರಚನೆಗಳು ಮತ್ತು ಪೈಪ್‌ಲೈನ್ ರಚನೆ",
    arch_heading: "ಬಹುಭಾಷಾ ಪ್ರತಿಕ್ರಿಯೆ ವಿಶ್ಲೇಷಣೆ ಸಿಸ್ಟಮ್ ನಕ್ಷೆ",
    arch_c1_title: "ಧ್ವನಿ ಪ್ರಕ್ರಿಯೆ ಮತ್ತು ಒಸಿಆರ್",
    arch_c1_desc: "ನಾಗರಿಕರ ಧ್ವನಿ ಫೈಲ್‌ಗಳನ್ನು ಪಠ್ಯವಾಗಿ ಪರಿವರ್ತಿಸಲು OpenAI ವಿಸ್ಪರ್ v3 API ಅನ್ನು ಸಂಯೋಜಿಸುತ್ತದೆ. ಫೋಟೋಗಳನ್ನು ವಿಷನ್ ಮಾದರಿಗಳು ವಿಶ್ಲೇಷಿಸುತ್ತವೆ.",
    arch_c2_title: "ಅನುವಾದ ಮತ್ತು NLU",
    arch_c2_desc: "ಭಾಷಿಣಿ API ಅನ್ನು ಬಳಸಿಕೊಂಡು ಪ್ರಾದೇಶಿಕ ಭಾರತೀಯ ಭಾಷೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ, ಶಿಫಾರಸುಗಳನ್ನು ನೇರವಾಗಿ ಇಂಗ್ಲಿಷ್‌ಗೆ ಬದಲಾಯಿಸುತ್ತದೆ.",
    arch_c3_title: "ಭೂಗೋಳ ವಿಶ್ಲೇಷಣೆ (PostGIS)",
    arch_c3_desc: "ಜಿಪಿಎಸ್ ಬಿಂದುಗಳು ಪೋಸ್ಟ್ ಜಿಐಎಸ್ ಮೂಲಕ ರಾಜ್ಯ ಗಡಿಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಹೊಂದುತ್ತವೆ.",
    arch_c4_title: "ಆದ್ಯತೆಯ ಯಂತ್ರಶಾಸ್ತ್ರ",
    arch_c4_desc: "ಸಾಕ್ಷರತೆ ಮತ್ತು ಶಾಲಾ ದಾಖಲಾತಿಯಂತಹ ಅಂಶಗಳನ್ನು ಸಂಸದ ತೂಕಗಳೊಂದಿಗೆ ಸಂಯೋಜಿಸಿ ಆದ್ಯತೆಯ ಸ್ಕೋರ್ ಅನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ.",
    perm_mic_title: "ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಬೇಕೆ?",
    perm_mic_desc: "ಧ್ವನಿ ವಿನಂತಿಗಳನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಲು ಮತ್ತು ಅವುಗಳನ್ನು ಪಠ್ಯವಾಗಿ ಪರಿವರ್ತಿಸಲು ಪೀಪಲ್ಸ್ ಪ್ರpriorityಗೆ ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶದ ಅಗತ್ಯವಿದೆ.",
    perm_cam_title: "ಕ್ಯಾಮೆರಾ ಮತ್ತು ಫೈಲ್ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಬೇಕೆ?",
    perm_cam_desc: "ಸಮಸ್ಯೆಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಲು ಅಥವಾ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಫೈಲ್‌ಗಳಿಂದ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಅನುಮತಿಸಿ.",
    perm_loc_title: "ಸ್ಥಳ ಟ್ರ್ಯಾಕಿಂಗ್ ಅನ್ನು ಅನುಮತಿಸಬೇಕೆ?",
    perm_loc_desc: "ನಿಮ್ಮ ದೂರನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರಾಜ್ಯವಾರು ವಿಂಗಡಿಸಲು ನಿಮ್ಮ ನಿಖರವಾದ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
    btn_deny: "ನಿರಾಕರಿಸಿ",
    btn_allow: "ಅನುಮತಿಸಿ",
    mp_report_header: "ತಯಾರಿಸಿದ ಸಂಸದ ಕಾರ್ಯನಿರ್ವಾಹಕ ವರದಿ",
    btn_print: "ಪ್ರಿಂಟ್ / PDF ಆಗಿ ಉಳಿಸಿ",
    btn_export: "ಡೇಟಾವನ್ನು ರಫ್ತು ಮಾಡಿ",
    logout_tooltip: "ಲಾಗ್ ಔಟ್"
  },
  bn: {
    login_title: "ডেমো লগইন ড্যাশবোর্ড",
    login_subtitle: "আপনার পোর্টাল অ্যাক্সেস মোড এবং ডিফল্ট ভাষা নির্বাচন করুন",
    login_role_lbl: "অ্যাক্সেস পোর্টাল মোড",
    role_citizen_title: "নাগরিক পোর্টাল",
    role_citizen_desc: "সমস্যা জমা দিন এবং অগ্রগতি ট্র্যাক করুন",
    role_mp_title: "এমপি ড্যাশবোর্ড",
    role_mp_desc: "চাহিদা বিশ্লেষণ করুন এবং প্রকল্পগুলি র্যাঙ্ক করুন",
    login_lang_lbl: "ভাষা চয়ন করুন",
    login_btn: "পোর্টালে প্রবেশ করুন",
    side_subtitle: "এআই সিদ্ধান্ত সমর্থন",
    nav_citizen_submit: "পরামর্শ জমা দিন",
    nav_citizen_history: "আমার জমা সমূহ",
    nav_mp_dashboard: "এমপি বিশ্লেষণ",
    nav_mp_sandbox: "এআই পার্সিং স্যান্ডবক্স",
    nav_mp_recommend: "প্রকল্পের অগ্রাধিকার",
    nav_sys_architecture: "সিস্টেম আর্কিটেকচার",
    welcome_back: "স্বাগতম,",
    ai_status: "এআই ইঞ্জিন সক্রিয়",
    cit_portal_title: "প্রতিক্রিয়া ও পরামর্শ জমা দিন",
    cit_portal_desc: "আপনার উন্নয়নমূলক অনুরোধগুলি সরাসরি আপনার আঞ্চলিক এমপি কার্যালয়ে বলুন বা টাইপ করুন",
    cit_form_heading: "নাগরিক বিবরণ জমা দেওয়া",
    cit_form_sub: "সমস্ত আপলোড স্বয়ংক্রিয় এআই অনুবাদ স্তরগুলির মাধ্যমে প্রক্রিয়াভুক্ত করা হয়।",
    gps_enable_btn: "অবস্থান ভাগ করে নেওয়া সক্রিয় করুন",
    gps_disabled: "অবস্থান ডেটা: নিষ্ক্রিয় (ডিফল্ট ব্যবহার করা হচ্ছে)",
    gps_enabled: "অবস্থান ডেটা: সক্রিয় (সিমুলেটেড জিপিএস লক)",
    lbl_submission_state: "রাজ্য / কেন্দ্রশাসিত অঞ্চল",
    lbl_submission_channel: "জমাদানের চ্যানেল",
    lbl_text_transcript: "সরাসরি প্রতিক্রিয়া টাইপ করুন (অথবা কথা রেকর্ড করতে মাইক্রোফোন আলতো চাপুন)",
    lbl_attachments: "মিডিয়া সংযুক্তি (রেকর্ড অডিও / ফটো আপলোড)",
    slot_record_voice: "কণ্ঠ রেকর্ড করতে আলতো চাপুন",
    slot_upload_photo: "ফটো আপলোড / স্ন্যাপ করুন",
    recording_active: "রেকর্ডিং সক্রিয় আছে। থামাতে এবং অনুবাদ করতে আবার আলতো চাপুন...",
    btn_submit_feedback: "প্রতিক্রিয়া জমা দিন",
    visualizer_heading: "বহুভাষী এআই পাইপলাইন ট্র্যাকার",
    visualizer_sub: "ইনজেশন, অনুবাদ, ওসিআর এবং শ্রেণীবিন্যাস পদক্ষেপের দৃশ্যায়ন",
    step_1_title: "১. অবস্থান ও চ্যানেল যাচাইকরণ",
    step_1_desc: "জিপিএস পয়েন্টগুলি জিওকোডিং করা, রাজ্য সীমানা যাচাই করা এবং বার্তাগুলি সারিবদ্ধ করা।",
    step_2_title: "২. ভয়েস ট্রান্সক্রাইব ও ওসিআর স্ক্যানিং",
    step_2_desc: "হুইস্পারের মাধ্যমে স্পিচ-টু-টেক্সট ট্রান্সক্রিপশন সম্পাদন করা এবং চিত্রের ত্রুটিগুলি শ্রেণীবদ্ধ করা।",
    step_3_title: "৩. ভাষিণী এআই অনুবাদ স্তর",
    step_3_desc: "ভাষা সনাক্ত করা এবং ইউনিফাইড ইংরেজি অনুবাদ তৈরি করা।",
    step_4_title: "৪. থিম এনইআর শ্রেণীবিন্যাস",
    step_4_desc: "ওয়ার্ড, সেক্টর এবং সমস্যাগুলি আলাদা করার জন্য নামযুক্ত সত্তা টোকেন পার্সিং চালানো।",
    metadata_header: "প্রক্রিয়াজাত আউটপুট মেটাডেটা",
    meta_orig: "মূল পাঠ্য:",
    meta_trans: "অনুবাদ:",
    meta_theme: "থিম ট্যাগ:",
    meta_urgency: "তীব্রতা:",
    meta_loc: "রুট করা রাজ্য:",
    cit_history_title: "আমার জমা দেওয়া পরামর্শ",
    cit_history_desc: "আপনার অনুরোধের প্রতিক্রিয়া এবং অগ্রাধিকার পরিসংখ্যান ট্র্যাক করুন",
    th_date: "জমা দেওয়ার তারিখ",
    th_state: "রাজ্য এলাকা",
    th_content: "প্রতিক্রিয়া বিবৃতির সারাংশ",
    th_theme: "শ্রেণীবদ্ধ থিম",
    th_urgency: "তীব্রতা",
    th_status: "অবস্থা",
    kpi_total: "মোট রাজ্য জমা",
    kpi_urgent: "জরুরী সমস্যা",
    kpi_accuracy: "এআই কোর নির্ভুলতা",
    kpi_budget: "রাজ্য তহবিল সীমা",
    kpi_pill_action: "পদক্ষেপ প্রয়োজন",
    kpi_pill_whisper: "ভাষিণী এলএলএম",
    map_heading: "ভারত রাজ্য নির্বাচন মানচিত্র",
    map_btn_demands: "নাগরিক চাহিদা",
    map_btn_gap: "ইনফ্রাস্ট্রাকচার গ্যাপ",
    map_btn_lit: "সাক্ষরতা সূচক",
    lbl_select_state_quick: "দ্রুত রাজ্য পরিবর্তন:",
    lbl_pop_density: "জনসংখ্যার ঘনত্ব",
    lbl_literacy_rate: "সাক্ষরতা সূচক",
    lbl_school_enroll: "স্কুল তালিকাভুক্তি",
    lbl_water_access: "বিশুদ্ধ জলের অ্যাক্সেস",
    top_state_demands: "রাজ্যের শীর্ষ পাবলিক চাহিদা",
    recent_state_feedback: "রাজ্যে জমা দেওয়া সর্বশেষ প্রতিক্রিয়া",
    sandbox_title: "এআই পার্সিং স্যান্ডবক্স",
    sandbox_desc: "ভাষিণী অনুবাদ, এনইআর চিপস এবং বিষয় শ্রেণীবিন্যাস পরীক্ষা করুন",
    sandbox_heading: "এনএলপি রিয়েল-টাইম স্টেটমেন্ট পার্সার",
    sandbox_sub: "আঞ্চলিক ভাষায় যেকোনো বিবৃতি টাইপ করুন বা পেস্ট করুন। এনএলপি পার্সার অবিলম্বে ম্যাপিং চালায়।",
    lbl_sandbox_input: "ইনপুট বিবৃতি",
    lbl_sandbox_quick: "দ্রুত ইনপুট সমূহ",
    lbl_nlp_threshold: "এনএলপি বিষয় ম্যাচ থ্রেশহোল্ড",
    lang_ident: "ভাষা সনাক্তকরণ",
    detected_lang_lbl: "শনাক্ত ভাষা:",
    confidence_lbl: "নির্ভুলতা:",
    machine_trans: "মেশিন অনুবাদ (ভাষিণী)",
    ner_extract: "নিষ্কাশিত নামযুক্ত সত্ত্বা (NER)",
    topic_class: "বিষয় শ্রেণীবিন্যাস",
    sentiment_analysis: "মানসিকতা ও তীব্রতা সূচক",
    sentiment_neg: "নেতিবাচক (জরুরী)",
    sentiment_neu: "নিরপেক্ষ",
    sentiment_pos: "ইতিবাচক",
    recommendations_title: "প্রকল্প অগ্রাধিকার ড্যাশবোর্ড",
    recommendations_desc: "ওজন সমন্বয় ব্যবহার করে বাজেট সীমাবদ্ধতা এবং পাবলিক চাহিদা ভারসাম্য করুন",
    weights_heading: "অগ্রাধিকার ওজন সেটিংস",
    weights_desc: "সক্রিয় রাজ্যে পাবলিক কাজের জন্য অগ্রাধিকার র্যাঙ্কিং গণনা করতে স্লাইডারগুলি পরিবর্তন করুন।",
    w_demand: "নাগরিক চাহিদা ওজন",
    desc_w_demand: "আগত জমা দেওয়ার পরিমাণ এবং জরুরিতার ভিত্তিতে অগ্রাধিকার দিন।",
    w_gap: "ইনফ্রাস্ট্রাকচার গ্যাপ ওজন",
    desc_w_gap: "কম সাক্ষরতা, কম তালিকাভুক্তি বা জলের ঘাটতিযুক্ত রাজ্যগুলিতে প্রকল্পগুলিকে অগ্রাধিকার দিন।",
    w_impact: "জনসংখ্যা প্রভাব ওজন",
    desc_w_impact: "সবচেয়ে বড় জনসংখ্যার ঘনত্বকে উপকৃত করে এমন প্রকল্পগুলিকে অগ্রাধিকার দিন।",
    w_cost: "খরচ / বাজেট ফ্যাক্টর",
    desc_w_cost: "হ্রাস করা ওজন। আরও ভাল ব্যয় দক্ষতা পেতে কম ব্যয়ের প্রকল্পগুলি উচ্চ স্কোর করে।",
    btn_reset_weights: "ওজন রিসেট করুন",
    priority_ranks_heading: "প্রস্তাবিত প্রকল্প এবং ইনফ্রাস্ট্রাকচার অগ্রাধিকার র্যাঙ্কিং",
    btn_report: "কার্যনির্বাহী এমপি রিপোর্ট তৈরি করুন",
    th_rank: "র‍্যাংক",
    th_project: "প্রকল্পের প্রস্তাব",
    th_location: "অবস্থান",
    th_demand: "নাগরিক চাহিদা",
    th_gap: "ঘাটতি",
    th_cost: "বাজেট খরচ",
    th_priority: "অগ্রাধিকার স্কোর",
    arch_title: "সিস্টেম আর্কিটেকচার",
    arch_desc: "এন্ড-টু-এন্ড ডিজাইন কনফিগারেশন এবং পাইপলাইন কাঠামো",
    arch_heading: "বহুভাষী প্রতিক্রিয়া বিশ্লেষণ সিস্টেম মানচিত্র",
    arch_c1_title: "ভয়েস প্রসেসিং ও ওসিআর",
    arch_c1_desc: "নাগরিকের ভয়েস ফাইলগুলি পাঠ্যে রূপান্তর করতে OpenAI হুইস্পার v3 API সংযুক্ত করে। ফটোগুলি ভিশন মডেল বিশ্লেষণ করে।",
    arch_c2_title: "অনুবাদ ও NLU",
    arch_c2_desc: "ভাষিণী API ব্যবহার করে আঞ্চলিক ভারতীয় ভাষা সমর্থন করে, সরাসরি ইংরেজিতে অনুবাদ করে।",
    arch_c3_title: "ভূ-স্থানিক বিশ্লেষণ (PostGIS)",
    arch_c3_desc: "জিপিএস পয়েন্টগুলি পোস্টজিআইএস-এর মাধ্যমে রাজ্য সীমানার সাথে সংযুক্ত করা হয়।",
    arch_c4_title: "অগ্রাধিকার মেকানিক্স",
    arch_c4_desc: "সাক্ষরতা এবং স্কুল তালিকাভুক্তির মতো উপাদানগুলিকে এমপি ওজনের সাথে একত্রিত করে অগ্রাধিকার স্কোর গণনা করে।",
    perm_mic_title: "মাইক্রোফোন অ্যাক্সেসের অনুমতি দেবেন?",
    perm_mic_desc: "ভয়েস অনুরোধ রেকর্ড করতে এবং টেক্সটে রূপান্তর করতে পিপলস প্রায়োরিটির মাইক্রোফোন অ্যাক্সেস প্রয়োজন।",
    perm_cam_title: "ক্যামেরা ও ফাইল অ্যাক্সেসের অনুমতি দেবেন?",
    perm_cam_desc: "সমস্যার ছবি তুলতে বা আপনার স্থানীয় ফাইল থেকে ফটো আপলোড করার অনুমতি দিন।",
    perm_loc_title: "অবস্থান ট্র্যাকিংয়ের অনুমতি দেবেন?",
    perm_loc_desc: "আপনার অভিযোগটি স্বয়ংক্রিয়ভাবে রাজ্য অনুসারে সাজানোর জন্য আপনার সঠিক অবস্থান ভাগ করুন।",
    btn_deny: "প্রত্যাখ্যান",
    btn_allow: "অনুমতি দিন",
    mp_report_header: "তৈরি করা এমপি কার্যনির্বাহী রিপোর্ট",
    btn_print: "প্রিন্ট / পিডিএফ হিসেবে সংরক্ষণ",
    btn_export: "উপাত্ত রপ্তানি করুন",
    logout_tooltip: "লগ আউট"
  }
};

// Simulated voice recording transcripts based on chosen language
const simulatedTranscripts = {
  en: "The water supply pipe is broken in our area and there is no clean drinking water since last Friday. Please fix this soon.",
  hi: "हमारे इलाके में पानी की पाइपलाइन टूट गई है और पिछले शुक्रवार से पीने का साफ पानी नहीं आ रहा है। कृपया इसे जल्द ठीक करें।",
  ta: "எங்கள் பகுதியில் குடிநீர் குழாய் உடைந்து கடந்த வெள்ளிக்கிழமை முதல் குடிநீர் வரவில்லை. தயவுசெய்து இதை விரைவில் சரிசெய்யவும்.",
  te: "మా ప్రాంతంలో మంచినీటి పైప్‌లైన్ పగిలిపోయి గత శుక్రవారం నుండి నీరు రావడం లేదు. దయచేసి దీనిని త్వరగా సరిచేయండి.",
  kn: "ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒಡೆದು ಕಳೆದ ಶುಕ್ರವಾರದಿಂದ ನೀರು ಬರುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಇದನ್ನು ಕೂಡಲೇ ಸರಿಪಡಿಸಿ.",
  bn: "আমাদের এলাকায় পানীয় জলের পাইপ ভেঙে গেছে এবং গত শুক্রবার থেকে কোনো পরিষ্কার জল আসছে না। অনুগ্রহ করে এটি দ্রুত মেরামত করুন।"
};

// Array of submitted feedback (initialized with mock values for Citizen Portal History)
// Added comprehensive seed data with 10 submissions across different languages, themes, and severity levels
let userSubmissions = [
  {
    date: "2026-07-01",
    state: "Tamil Nadu",
    text: "Potholes on Chennai bypass road near school crossing causing minor bicycle slips.",
    originalText: "Potholes on Chennai bypass road near school crossing causing minor bicycle slips.",
    translation: "Potholes on Chennai bypass road near school crossing causing minor bicycle slips.",
    theme: "Road Infrastructure",
    themeClass: "road",
    urgency: "Medium",
    status: "Processed & Queued"
  },
  {
    date: "2026-07-02",
    state: "Tamil Nadu",
    text: "Clogged storm drains in Salem ward office lane causing street flooding during rainfall.",
    originalText: "Clogged storm drains in Salem ward office lane causing street flooding during rainfall.",
    translation: "Clogged storm drains in Salem ward office lane causing street flooding during rainfall.",
    theme: "Sanitation",
    themeClass: "sanitation",
    urgency: "High",
    status: "MP Reviewed"
  },
  {
    date: "2026-07-03",
    state: "Karnataka",
    text: "No clean water supply in Bengaluru ward 4 for past 5 days, affecting 200 families.",
    originalText: "No clean water supply in Bengaluru ward 4 for past 5 days, affecting 200 families.",
    translation: "No clean water supply in Bengaluru ward 4 for past 5 days, affecting 200 families.",
    theme: "Water Supply",
    themeClass: "water",
    urgency: "Critical",
    status: "Under Review"
  },
  {
    date: "2026-07-04",
    state: "Maharashtra",
    text: "Primary health center in Mumbai suburb lacks doctor and basic medicines.",
    originalText: "Primary health center in Mumbai suburb lacks doctor and basic medicines.",
    translation: "Primary health center in Mumbai suburb lacks doctor and basic medicines.",
    theme: "Healthcare",
    themeClass: "healthcare",
    urgency: "High",
    status: "Processed & Queued"
  },
  {
    date: "2026-07-05",
    state: "Uttar Pradesh",
    text: "Government school roof leaking in Varanasi, students unable to attend classes during rain.",
    originalText: "Government school roof leaking in Varanasi, students unable to attend classes during rain.",
    translation: "Government school roof leaking in Varanasi, students unable to attend classes during rain.",
    theme: "Education",
    themeClass: "education",
    urgency: "Critical",
    status: "MP Reviewed"
  },
  {
    date: "2026-07-06",
    state: "West Bengal",
    text: "Frequent power outages in Kolkata residential area affecting daily life and studies.",
    originalText: "Frequent power outages in Kolkata residential area affecting daily life and studies.",
    translation: "Frequent power outages in Kolkata residential area affecting daily life and studies.",
    theme: "Power & Grid",
    themeClass: "power",
    urgency: "Medium",
    status: "Processed & Queued"
  },
  {
    date: "2026-07-07",
    state: "Tamil Nadu",
    text: "Street lights not working in Madurai residential colony for 2 weeks, safety concern.",
    originalText: "Street lights not working in Madurai residential colony for 2 weeks, safety concern.",
    translation: "Street lights not working in Madurai residential colony for 2 weeks, safety concern.",
    theme: "Road Infrastructure",
    themeClass: "road",
    urgency: "Medium",
    status: "Under Review"
  },
  {
    date: "2026-07-08",
    state: "Karnataka",
    text: "Garbage collection irregular in Hubli ward 3, causing bad smell and health issues.",
    originalText: "Garbage collection irregular in Hubli ward 3, causing bad smell and health issues.",
    translation: "Garbage collection irregular in Hubli ward 3, causing bad smell and health issues.",
    theme: "Sanitation",
    themeClass: "sanitation",
    urgency: "High",
    status: "Processed & Queued"
  },
  {
    date: "2026-07-09",
    state: "Maharashtra",
    text: "Water pipeline burst in Pune causing water wastage and shortage in nearby areas.",
    originalText: "Water pipeline burst in Pune causing water wastage and shortage in nearby areas.",
    translation: "Water pipeline burst in Pune causing water wastage and shortage in nearby areas.",
    theme: "Water Supply",
    themeClass: "water",
    urgency: "Critical",
    status: "MP Reviewed"
  },
  {
    date: "2026-07-10",
    state: "Uttar Pradesh",
    text: "Community center wall cracked in Lucknow, needs immediate repair for safety.",
    originalText: "Community center wall cracked in Lucknow, needs immediate repair for safety.",
    translation: "Community center wall cracked in Lucknow, needs immediate repair for safety.",
    theme: "Road Infrastructure",
    themeClass: "road",
    urgency: "High",
    status: "Under Review"
  }
];

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  initConstituencyDropdowns();
  renderDemoScenarioButtons();
  setupChannelSelector();
  setupLoginFlow();
  setupRoleSelector();
  setupPostLoginLangSelector();
  setupNavigation();
  setupConstituencyMap();
  setupHardwarePermissions();
  setupCitizenPortalActions();
  setupCameraCapture();
  setupRecommendationSliders();
  setupReportModal();
  setupThemeToggle();
  setupDemoBanner();
  setupAccessibilityFeatures();
  setupMobileMenu();
  
  // Set date
  const dateEl = document.getElementById("live-date");
  if (dateEl) {
    const today = new Date();
    dateEl.innerText = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
});

function setupMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const navItems = document.querySelectorAll(".nav-item");

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("open");
      overlay.classList.add("active");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    });

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
      });
    });
  }
}

// Initialize all state/constituency dropdowns from official dataset
function initConstituencyDropdowns() {
  const portalState = document.getElementById("portal-state-select");
  const portalConst = document.getElementById("portal-constituency-select");
  const loginMpState = document.getElementById("login-mp-state");
  const loginConst = document.getElementById("login-constituency");

  populateStateSelect(portalState, "Tamil Nadu");
  populateConstituencySelect(portalConst, "Tamil Nadu", "tn-4");
  populateStateSelect(loginMpState, "Delhi");
  populateConstituencySelect(loginConst, "Delhi", "dl-1");

  if (portalState) {
    portalState.addEventListener("change", (e) => {
      populateConstituencySelect(portalConst, e.target.value, "");
    });
  }
  if (loginMpState) {
    loginMpState.addEventListener("change", (e) => {
      populateConstituencySelect(loginConst, e.target.value, "");
    });
  }
}

// 1. Login & Role Flow
function setupLoginFlow() {
  const btnLogin = document.getElementById("btn-login");
  const loginScreen = document.getElementById("login-screen");
  const appWrapper = document.getElementById("app-wrapper");
  const loginLang = document.getElementById("login-language");
  const btnLoginLoc = document.getElementById("btn-login-detect-location");

  if (btnLoginLoc) {
    btnLoginLoc.addEventListener("click", () => {
      document.getElementById("location-permission-prompt").style.display = "flex";
    });
  }

  btnLogin.addEventListener("click", async () => {
    const selectedRoleCard = document.querySelector(".role-card.active");
    currentUserRole = selectedRoleCard ? selectedRoleCard.getAttribute("data-role") : "citizen";
    currentLanguage = loginLang.value;

    if (currentUserRole === "mp") {
      const mpState = document.getElementById("login-mp-state").value;
      const constituencySelect = document.getElementById("login-constituency");
      activeConstituencyId = constituencySelect ? constituencySelect.value : "";
      if (!activeConstituencyId) {
        alert("Please select your state and Lok Sabha constituency before entering the MP dashboard.");
        return;
      }
      const cObj = getConstituencyById(activeConstituencyId);
      activeConstituency = cObj ? cObj.name : "Constituency";
      activeStateName = cObj ? cObj.state : mpState;
    } else {
      const portalConst = document.getElementById("portal-constituency-select");
      activeConstituencyId = portalConst && portalConst.value ? portalConst.value : "tn-4";
      const cObj = getConstituencyById(activeConstituencyId);
      activeConstituency = cObj ? cObj.name : "Constituency";
      activeStateName = cObj ? cObj.state : document.getElementById("portal-state-select").value;
    }

    loginScreen.style.display = "none";
    appWrapper.style.display = "grid";

    document.getElementById("post-language-selector").value = currentLanguage;
    configureWorkspaceForRole();
    translateApp(currentLanguage);
    updateDashboardForConstituency(activeConstituencyId);
    updateRecommendationsTable();
  });

  // Logout button handler
  document.getElementById("btn-logout").addEventListener("click", () => {
    appWrapper.style.display = "none";
    loginScreen.style.display = "flex";
    
    // Reset recording if active
    if (isRecording) {
      stopVoiceRecording(false);
    }
  });
}

function setupRoleSelector() {
  const roleCards = document.querySelectorAll(".role-card");
  const mpStateGroup = document.getElementById("mp-state-group");
  const constituencyGroup = document.getElementById("mp-constituency-group");
  const citizenLocGroup = document.getElementById("citizen-location-group");

  roleCards.forEach(card => {
    card.addEventListener("click", () => {
      roleCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      const role = card.getAttribute("data-role");
      if (mpStateGroup) mpStateGroup.style.display = role === "mp" ? "flex" : "none";
      if (constituencyGroup) constituencyGroup.style.display = role === "mp" ? "flex" : "none";
      if (citizenLocGroup) citizenLocGroup.style.display = role === "citizen" ? "flex" : "none";
    });
  });
}

function setupPostLoginLangSelector() {
  const postSelector = document.getElementById("post-language-selector");
  postSelector.addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    translateApp(currentLanguage);
    
    // Synchronize login screen dropdown too
    document.getElementById("login-language").value = currentLanguage;
    
    // Re-render components with translated dynamic data
    updateDashboardForConstituency(activeConstituencyId);
    updateRecommendationsTable();
    renderCitizenHistory();
  });
}

function configureWorkspaceForRole() {
  const footerUsername = document.getElementById("footer-username");
  const footerRole = document.getElementById("footer-role");
  const greetingUsername = document.getElementById("greeting-username");
  const footerAvatar = document.getElementById("footer-avatar");

  // Adjust headings & details
  if (currentUserRole === "mp") {
    footerUsername.innerText = "Honorable MP";
    footerRole.innerText = activeConstituency;
    greetingUsername.innerText = "Honorable MP";
    footerAvatar.innerHTML = '<i class="fa-solid fa-user-tie"></i>';
    lockMpConstituencyView();
    switchActiveTab("mp-dashboard");
  } else {
    footerUsername.innerText = "Citizen Portal";
    footerRole.setAttribute("data-i18n", "role_citizen_title");
    greetingUsername.innerText = "Citizen Demo User";
    footerAvatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    
    // Set active tab to Citizen portal
    switchActiveTab("citizen-portal");
    // Prompt citizen to allow location on first entry
    setTimeout(() => {
      if (!permissions.location) {
        document.getElementById("location-permission-prompt").style.display = "flex";
      }
    }, 400);
  }

  // Adjust sidebar navigation tabs visibility
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    const itemRole = item.getAttribute("data-nav-role");
    if (itemRole === "both" || itemRole === currentUserRole) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });

  renderCitizenHistory();
}

function lockMpConstituencyView() {
  const cObj = getConstituencyById(activeConstituencyId);
  if (cObj) {
    activeStateName = cObj.state;
    activeConstituency = cObj.name;
  }
  const labelEl = document.getElementById("mp-constituency-label");
  if (labelEl) {
    labelEl.innerText = activeConstituency + " · " + activeStateName;
  }
}

function switchActiveTab(tabId) {
  const navItems = document.querySelectorAll(".nav-item");
  const tabViews = document.querySelectorAll(".tab-view");

  navItems.forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    }
  });

  tabViews.forEach(view => {
    view.classList.remove("active");
    if (view.getAttribute("id") === tabId) {
      view.classList.add("active");
    }
  });
}

// 2. UI Translation Engine
function translateApp(langCode) {
  const transMap = translations[langCode] || translations.en;
  
  // Update elements containing data-i18n attributes
  const translatableElements = document.querySelectorAll("[data-i18n]");
  translatableElements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (transMap[key]) {
      // Check if input element or placeholder
      if (el.tagName === "INPUT" && el.type === "button") {
        el.value = transMap[key];
      } else if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
        el.placeholder = transMap[key];
      } else {
        el.innerText = transMap[key];
      }
    }
  });
}

// 3. Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabViews = document.querySelectorAll(".tab-view");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      if (!tabId) return;

      navItems.forEach(n => n.classList.remove("active"));
      tabViews.forEach(v => v.classList.remove("active"));

      item.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });
}

// 4. Constituency Map Dashboard (Leaflet + public boundary data)
function setupConstituencyMap() {
  const layerButtons = document.querySelectorAll(".map-control-btn[data-mp-layer]");

  layerButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      layerButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      mpActiveLayer = btn.getAttribute("data-mp-layer");
      renderConstituencyMap(activeConstituencyId, mpActiveLayer);
      updateConstituencyMapLegend();
    });
  });
}

function updateDashboardForConstituency(constituencyId) {
  const data = getConstituencyData(constituencyId) || getConstituencyData("tn-4");
  if (!data) return;

  activeConstituencyId = constituencyId;
  activeStateName = data.stateName;
  activeConstituency = data.constituencyName;

  document.getElementById("mp-state-title").innerText = data.stateName;
  document.getElementById("mp-state-region").innerText = data.region;
  const labelEl = document.getElementById("mp-constituency-label");
  if (labelEl) {
    const cMeta = getConstituencyById(constituencyId);
    labelEl.innerText = data.constituencyName + " · PC " + (cMeta ? cMeta.pcNo : "—");
  }

  document.getElementById("kpi-val-submissions").innerText = data.submissions;
  document.getElementById("kpi-val-urgent").innerText = data.urgent;
  document.getElementById("kpi-val-budget").innerText = data.budget;

  document.getElementById("mp-state-density").innerText = data.density;
  document.getElementById("mp-state-literacy").innerText = data.literacy;
  document.getElementById("mp-state-enrollment").innerText = data.enrollment;
  document.getElementById("mp-state-water").innerText = data.water;

  // Severity breakdown calculations
  const total = data.submissions;
  const urgentVal = data.urgent;
  const critical = Math.round(urgentVal * 0.35);
  const high = urgentVal - critical;
  const medium = Math.round((total - urgentVal) * 0.45);
  const low = total - critical - high - medium;

  const pctCritical = (critical / total * 100).toFixed(1) + "%";
  const pctHigh = (high / total * 100).toFixed(1) + "%";
  const pctMedium = (medium / total * 100).toFixed(1) + "%";
  const pctLow = (low / total * 100).toFixed(1) + "%";

  const barCritical = document.getElementById("severity-bar-critical");
  const barHigh = document.getElementById("severity-bar-high");
  const barMedium = document.getElementById("severity-bar-medium");
  const barLow = document.getElementById("severity-bar-low");

  if (barCritical) barCritical.style.width = pctCritical;
  if (barHigh) barHigh.style.width = pctHigh;
  if (barMedium) barMedium.style.width = pctMedium;
  if (barLow) barLow.style.width = pctLow;

  const valCritical = document.getElementById("severity-val-critical");
  const valHigh = document.getElementById("severity-val-high");
  const valMedium = document.getElementById("severity-val-medium");
  const valLow = document.getElementById("severity-val-low");

  if (valCritical) valCritical.innerText = critical;
  if (valHigh) valHigh.innerText = high;
  if (valMedium) valMedium.innerText = medium;
  if (valLow) valLow.innerText = low;

  const container = document.getElementById("mp-state-demands-container");
  container.innerHTML = "";

  const rankedDemands = [...data.demands].sort((a, b) => {
    const aEssential = ESSENTIAL_THEMES.includes(a.category) ? 1 : 0;
    const bEssential = ESSENTIAL_THEMES.includes(b.category) ? 1 : 0;
    if (aEssential !== bEssential) return bEssential - aEssential;
    return b.count - a.count;
  });

  const maxVal = Math.max(...rankedDemands.map(d => d.count));
  rankedDemands.forEach((d, idx) => {
    const widthPct = (d.count / maxVal) * 100;
    const isEssential = ESSENTIAL_THEMES.includes(d.category);
    const row = document.createElement("div");
    row.className = "demand-bar-row";
    row.style.marginBottom = "8px";
    row.innerHTML = `
      <div class="demand-bar-label">
        <span style="display:flex; align-items:center;">
          <span class="priority-rank-num">${idx + 1}</span>
          <span style="color: var(--text-muted); font-size: 0.78rem;">${d.category}</span>
          ${isEssential ? '<span class="priority-badge-essential">High Priority</span>' : ''}
        </span>
        <span style="color: var(--text-main); font-weight: 600; font-size: 0.78rem;">${d.count} reports</span>
      </div>
      <div class="demand-bar-bg">
        <div class="demand-bar-fill" style="width: ${widthPct}%; background: ${d.fillHex};"></div>
      </div>
    `;
    container.appendChild(row);
  });

  const feedBox = document.getElementById("mp-state-recent-feedback-feed");
  const fb = data.recentFeedback;

  let channelClass = "web";
  let channelIcon = '<i class="fa-solid fa-globe"></i>';
  if (fb.channel === "WhatsApp") {
    channelClass = "whatsapp";
    channelIcon = '<i class="fa-brands fa-whatsapp"></i>';
  } else if (fb.channel === "IVR") {
    channelClass = "ivr";
    channelIcon = '<i class="fa-solid fa-phone"></i>';
  } else if (fb.channel === "SMS") {
    channelClass = "sms";
    channelIcon = '<i class="fa-solid fa-comment-sms"></i>';
  }

  feedBox.innerHTML = `
    <div class="feed-card-header">
      <span class="channel-tag ${channelClass}">${channelIcon} ${fb.channel}</span>
      <span class="feed-card-time">${fb.time}</span>
    </div>
    <p class="feed-card-body">"${fb.text}"</p>
    <div class="feed-card-footer">
      <span>Language: ${fb.language}</span>
      <span>•</span>
      <span>Urgency: ${fb.urgency}</span>
    </div>
  `;

  renderConstituencyMap(constituencyId, mpActiveLayer);
  updateConstituencyMapLegend();
}

function updateConstituencyMapLegend() {
  const title = document.getElementById("mp-legend-title");
  const gradient = document.getElementById("mp-legend-gradient");
  const minText = document.getElementById("mp-legend-min");
  const maxText = document.getElementById("mp-legend-max");

  const transMap = translations[currentLanguage] || translations.en;

  if (mpActiveLayer === "demands") {
    title.innerText = transMap.map_btn_demands;
    gradient.style.background = "linear-gradient(to right, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.9) 100%)";
    minText.innerText = "Low (<200)";
    maxText.innerText = "High (>600)";
  } else if (mpActiveLayer === "gap") {
    title.innerText = transMap.map_btn_gap;
    gradient.style.background = "linear-gradient(to right, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.9) 100%)";
    minText.innerText = "Low Deficit";
    maxText.innerText = "High Deficit";
  } else if (mpActiveLayer === "literacy") {
    title.innerText = transMap.map_btn_lit;
    gradient.style.background = "linear-gradient(to right, rgba(239, 68, 68, 0.7) 0%, rgba(234, 179, 8, 0.7) 50%, rgba(16, 185, 129, 0.7) 100%)";
    minText.innerText = "Low (<70%)";
    maxText.innerText = "High (>90%)";
  }
}

// 5. Simulated Permissions Handler with graceful fallback UI
function setupHardwarePermissions() {
  // Mic Prompts
  document.getElementById("btn-mic-allow").addEventListener("click", () => {
    permissions.microphone = true;
    document.getElementById("mic-permission-prompt").style.display = "none";
    startVoiceRecording();
  });
  document.getElementById("btn-mic-deny").addEventListener("click", () => {
    permissions.microphone = false;
    document.getElementById("mic-permission-prompt").style.display = "none";
    // Show friendly fallback message
    showFallbackMessage("Microphone access denied — You can still type your suggestion in the text box below.");
  });

  // Cam Prompts
  document.getElementById("btn-cam-allow").addEventListener("click", () => {
    permissions.camera = true;
    document.getElementById("cam-permission-prompt").style.display = "none";
    triggerCameraSnap();
  });
  document.getElementById("btn-cam-deny").addEventListener("click", () => {
    permissions.camera = false;
    document.getElementById("cam-permission-prompt").style.display = "none";
    // Show friendly fallback message
    showFallbackMessage("Camera access denied — You can still upload a photo from your device files using the 'Choose from Files' option.");
  });

  // Location GPS Prompts
  document.getElementById("btn-loc-allow").addEventListener("click", () => {
    permissions.location = true;
    document.getElementById("location-permission-prompt").style.display = "none";
    const loginVisible = document.getElementById("login-screen").style.display !== "none";
    if (loginVisible) {
      runLoginLocationDetection();
    } else {
      triggerLocationGpsLock();
    }
  });
  document.getElementById("btn-loc-deny").addEventListener("click", () => {
    permissions.location = false;
    document.getElementById("location-permission-prompt").style.display = "none";
    // Show friendly fallback message
    showFallbackMessage("Location access denied — Please select your state and constituency manually from the dropdown menus below.");
  });
}

function showFallbackMessage(message) {
  // Create or update a fallback message banner
  let fallbackBanner = document.getElementById("fallback-message-banner");
  if (!fallbackBanner) {
    fallbackBanner = document.createElement("div");
    fallbackBanner.id = "fallback-message-banner";
    fallbackBanner.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      z-index: 1000;
      max-width: 350px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(fallbackBanner);
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  fallbackBanner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; border: none; color: inherit; cursor: pointer; margin-left: auto;">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `;
  
  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    if (fallbackBanner && fallbackBanner.parentElement) {
      fallbackBanner.remove();
    }
  }, 8000);
}

function triggerCameraSnap() {
  const cameraInput = document.getElementById("portal-camera-input");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    openCameraModal();
  } else if (cameraInput) {
    cameraInput.click();
  }
}

function openCameraModal() {
  const modal = document.getElementById("camera-capture-modal");
  const video = document.getElementById("camera-preview-video");

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    .then((stream) => {
      cameraStream = stream;
      video.srcObject = stream;
      modal.style.display = "flex";
    })
    .catch(() => {
      const cameraInput = document.getElementById("portal-camera-input");
      if (cameraInput) cameraInput.click();
    });
}

function closeCameraModal() {
  const modal = document.getElementById("camera-capture-modal");
  const video = document.getElementById("camera-preview-video");
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  video.srcObject = null;
  modal.style.display = "none";
}

function capturePhotoFromCamera() {
  const video = document.getElementById("camera-preview-video");
  const canvas = document.getElementById("camera-capture-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const fileName = `citizen_photo_${Date.now()}.jpg`;
    showPhotoPreview(URL.createObjectURL(blob), fileName);
    closeCameraModal();
  }, "image/jpeg", 0.85);
}

function showPhotoPreview(src, fileName) {
  const txtCam = document.getElementById("txt-cam-status");
  const slotCam = document.getElementById("slot-camera-upload");
  const preview = document.getElementById("portal-photo-preview");
  const previewImg = document.getElementById("portal-preview-img");
  const previewFilename = document.getElementById("portal-photo-filename");

  simulatedPhotoFile = fileName;
  simulatedPhotoSrc = src;

  slotCam.classList.add("has-file");
  txtCam.innerText = fileName;
  preview.style.display = "flex";
  previewFilename.innerText = fileName;
  previewImg.src = src;
}

function setupCameraCapture() {
  const cameraInput = document.getElementById("portal-camera-input");
  const fileInput = document.getElementById("portal-file-input");
  const btnSnap = document.getElementById("btn-camera-snap");
  const btnCancel = document.getElementById("btn-camera-cancel");
  const slotCamera = document.getElementById("slot-camera-upload");
  const slotFile = document.getElementById("slot-file-upload");

  // Camera capture slot
  if (cameraInput && slotCamera) {
    slotCamera.addEventListener("click", () => cameraInput.click());
    slotCamera.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cameraInput.click();
      }
    });
  }

  // File upload slot
  if (fileInput && slotFile) {
    slotFile.addEventListener("click", () => fileInput.click());
    slotFile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
  }

  if (cameraInput) {
    cameraInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      showPhotoPreview(URL.createObjectURL(file), file.name);
      e.target.value = "";
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      showPhotoPreview(URL.createObjectURL(file), file.name);
      e.target.value = "";
    });
  }

  if (btnSnap) btnSnap.addEventListener("click", capturePhotoFromCamera);
  if (btnCancel) btnCancel.addEventListener("click", closeCameraModal);
}

function runLoginLocationDetection() {
  const statusEl = document.getElementById("login-location-status");
  const transMap = translations[currentLanguage] || translations.en;
  if (statusEl) {
    statusEl.innerText = transMap.gps_loading || "Finding your location...";
    statusEl.style.color = "#818cf8";
  }
  detectLocationAndConstituency()
    .then(function(result) {
      populateStateSelect(document.getElementById("portal-state-select"), result.state);
      populateConstituencySelect(document.getElementById("portal-constituency-select"), result.state, result.constituency ? result.constituency.id : "");
      if (result.constituency) {
        activeConstituencyId = result.constituency.id;
        activeConstituency = result.constituency.name;
        activeStateName = result.state;
      }
      if (statusEl) {
        const cName = result.constituency ? result.constituency.name : result.state;
        statusEl.innerText = (transMap.login_loc_found || "Constituency detected") + ": " + cName + " · " + result.placeLabel;
        statusEl.style.color = "#10b981";
      }
    })
    .catch(function() {
      if (statusEl) {
        statusEl.innerText = transMap.gps_error || "Could not find location. Select state and constituency manually.";
        statusEl.style.color = "#f87171";
      }
    });
}

function triggerLocationGpsLock() {
  const label = document.getElementById("gps-status-label");
  const dropState = document.getElementById("portal-state-select");
  const dropConst = document.getElementById("portal-constituency-select");
  const transMap = translations[currentLanguage] || translations.en;
  const btnGps = document.getElementById("btn-enable-gps");

  label.innerText = transMap.gps_loading || "Finding your location...";
  label.style.color = "#818cf8";
  if (btnGps) btnGps.disabled = true;

  detectLocationAndConstituency()
    .then(function(result) {
      detectedLocation = { latitude: result.latitude, longitude: result.longitude };
      if (dropState) dropState.value = result.state;
      populateConstituencySelect(dropConst, result.state, result.constituency ? result.constituency.id : "");
      const cName = result.constituency ? result.constituency.name + ", " + result.state : result.state;
      label.innerText = (transMap.gps_enabled || "Location found") + ": " + cName + " · " + result.placeLabel;
      label.style.color = "#10b981";
      label.style.fontWeight = "600";
      if (btnGps) btnGps.disabled = false;
    })
    .catch(function() {
      label.innerText = transMap.gps_error || "Could not find location. Please select your state below.";
      label.style.color = "#f87171";
      if (btnGps) btnGps.disabled = false;
    });
}

// 6. Citizen Portal — official multi-channel routing
function buildGrievancePayload() {
  const state = document.getElementById("portal-state-select").value;
  const constId = document.getElementById("portal-constituency-select").value;
  const textVal = document.getElementById("portal-feedback-text").value.trim();
  const cObj = getConstituencyById(constId);
  const constituencyName = cObj ? cObj.name : "Not specified";
  const ref = "PP-" + Date.now().toString(36).toUpperCase();
  return { state, constId, constituencyName, textVal, ref };
}

function buildChannelUrl(channel, payload) {
  const cfg = OFFICIAL_CHANNELS[channel];
  if (!cfg || channel === "Web") return null;

  if (channel === "WhatsApp") {
    const lines = [
      "*People's Priority — Citizen Grievance*",
      "State: " + payload.state,
      "Constituency: " + payload.constituencyName,
      "Ref: " + payload.ref,
      "",
      payload.textVal || "I wish to register a grievance for my area."
    ];
    return "https://wa.me/" + cfg.number + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  if (channel === "IVR") {
    return "tel:" + cfg.number;
  }

  if (channel === "SMS") {
    const body = "PP " + payload.constituencyName + " " + (payload.textVal || "Grievance");
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      return "sms:" + cfg.number + "?body=" + encodeURIComponent(body);
    }
    return "sms:" + cfg.number + "&body=" + encodeURIComponent(body);
  }

  return null;
}

function formatHelplineDisplay(number, channel) {
  if (number === "xxxxxxx") return "xxxxxxx";
  if (channel === "IVR" && number.length === 10) {
    return number.slice(0, 4) + "-" + number.slice(4, 6) + "-" + number.slice(6);
  }
  if (channel === "WhatsApp") {
    return "+91 " + number.slice(2, 7) + " " + number.slice(7);
  }
  return number;
}

function resolveFaIcon(icon) {
  if (!icon) return "fa-solid fa-circle";
  if (icon.indexOf("fa-brands ") === 0 || icon.indexOf("fa-solid ") === 0) return icon;
  return "fa-solid " + icon;
}

function updateChannelPanel(channel) {
  const panel = document.getElementById("portal-channel-panel");
  const icon = document.getElementById("portal-channel-icon");
  const title = document.getElementById("portal-channel-title");
  const desc = document.getElementById("portal-channel-desc");
  const meta = document.getElementById("portal-channel-meta");
  const link = document.getElementById("portal-channel-direct-link");
  const linkLabel = document.getElementById("portal-channel-link-label");
  const btnSubmit = document.getElementById("btn-citizen-submit");
  if (!panel || !icon || !title || !desc || !meta || !link || !btnSubmit) return;

  const cfg = OFFICIAL_CHANNELS[channel] || OFFICIAL_CHANNELS.Web;

  panel.setAttribute("data-channel", channel);
  icon.className = resolveFaIcon(cfg.icon);
  title.innerText = cfg.title;
  desc.innerText = cfg.desc;

  const payload = buildGrievancePayload();
  const url = buildChannelUrl(channel, payload);

  if (channel === "Web") {
    meta.innerHTML = "<span><i class=\"fa-solid fa-lock\"></i> Secured submission via encrypted web portal</span>";
    link.style.display = "none";
    btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span data-i18n="btn_submit_feedback">Send to MP Office</span>';
  } else {
    const displayNum = formatHelplineDisplay(cfg.number, channel);
    let helplineHref = "#";
    if (channel === "IVR") helplineHref = "tel:" + cfg.number;
    if (channel === "SMS") helplineHref = buildChannelUrl("SMS", payload) || "sms:" + cfg.number;
    if (channel === "WhatsApp") helplineHref = buildChannelUrl("WhatsApp", payload) || "#";

    let metaHtml = "";
    if (channel === "IVR") {
      metaHtml = "<a class=\"helpline-number\" href=\"tel:" + cfg.number + "\"><i class=\"fa-solid fa-headset\"></i> " + displayNum + "</a>";
    } else {
      metaHtml = "<a class=\"helpline-number\" href=\"" + helplineHref + "\" target=\"_blank\" rel=\"noopener noreferrer\"><i class=\"fa-solid fa-headset\"></i> " + displayNum + "</a>";
    }
    metaHtml += "<br><span><i class=\"fa-regular fa-clock\"></i> " + cfg.hours + "</span>";
    if (channel === "SMS") {
      metaHtml += "<br><span><i class=\"fa-solid fa-keyboard\"></i> Format: <code>PP &lt;Constituency&gt; &lt;Issue&gt;</code></span>";
    }
    if (channel === "IVR") {
      metaHtml += "<br><span><i class=\"fa-solid fa-list-ol\"></i> Press 1 for grievance · 2 for status · 3 for constituency PIN</span>";
    }
    meta.innerHTML = metaHtml;
    link.href = url || "#";
    link.style.display = "inline-flex";
    const linkIcon = link.querySelector("i");
    if (linkIcon) linkIcon.className = resolveFaIcon(cfg.actionIcon);
    if (linkLabel) linkLabel.innerText = cfg.actionLabel;
    const btnIcons = { WhatsApp: "fa-brands fa-whatsapp", IVR: "fa-solid fa-phone", SMS: "fa-solid fa-comment-sms" };
    btnSubmit.innerHTML = '<i class="' + btnIcons[channel] + '"></i> ' + cfg.actionLabel;
  }
}

function openOfficialChannel(channel) {
  const payload = buildGrievancePayload();
  const url = buildChannelUrl(channel, payload);
  if (!url) return false;
  if (channel === "WhatsApp") {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = url;
  }
  return true;
}

function setupChannelSelector() {
  const select = document.getElementById("portal-channel-select");
  const link = document.getElementById("portal-channel-direct-link");
  if (!select) return;

  select.addEventListener("change", () => updateChannelPanel(select.value));

  if (link) {
    link.addEventListener("click", (e) => {
      const channel = select.value;
      if (channel === "Web") {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      openOfficialChannel(channel);
    });
  }

  ["portal-state-select", "portal-constituency-select", "portal-feedback-text"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => {
      if (select.value !== "Web") updateChannelPanel(select.value);
    });
  });

  updateChannelPanel("Web");
}

// 6. Citizen Portal Actions
function setupCitizenPortalActions() {
  const slotMic = document.getElementById("slot-mic-record");
  const slotCam = document.getElementById("slot-camera-upload");
  const btnGps = document.getElementById("btn-enable-gps");
  const btnSubmit = document.getElementById("btn-citizen-submit");

  slotMic.addEventListener("click", () => {
    if (isRecording) {
      stopVoiceRecording(true);
    } else {
      if (permissions.microphone) {
        startVoiceRecording();
      } else {
        document.getElementById("mic-permission-prompt").style.display = "flex";
      }
    }
  });

  slotCam.addEventListener("click", () => {
    if (permissions.camera) {
      triggerCameraSnap();
    } else {
      document.getElementById("cam-permission-prompt").style.display = "flex";
    }
  });

  btnGps.addEventListener("click", () => {
    if (permissions.location) {
      triggerLocationGpsLock();
    } else {
      document.getElementById("location-permission-prompt").style.display = "flex";
    }
  });

  btnSubmit.addEventListener("click", () => {
    const textVal = document.getElementById("portal-feedback-text").value;
    const activeState = document.getElementById("portal-state-select").value;
    const constId = document.getElementById("portal-constituency-select").value;
    const channel = document.getElementById("portal-channel-select").value;

    if (channel !== "Web") {
      openOfficialChannel(channel);
      displayCitizenPipelineMetadata(
        textVal || "[" + channel + " channel — grievance registered via official helpline]",
        activeState, constId, channel
      );
      return;
    }

    if (!textVal.trim() && !simulatedVoiceFile) {
      alert("Please record a statement or enter some description before submitting.");
      return;
    }

    // Run simulated AI pipelines
    const steps = [
      document.getElementById("portal-step-1"),
      document.getElementById("portal-step-2"),
      document.getElementById("portal-step-3"),
      document.getElementById("portal-step-4")
    ];

    document.getElementById("portal-meta-card").style.display = "none";
    steps.forEach(st => {
      st.classList.remove("active");
      st.classList.remove("completed");
    });

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Pipelines...';

    let currentStepIdx = 0;
    function runCitizenPipeline() {
      if (currentStepIdx > 0) {
        steps[currentStepIdx - 1].classList.remove("active");
        steps[currentStepIdx - 1].classList.add("completed");
      }
      
      if (currentStepIdx < steps.length) {
        steps[currentStepIdx].classList.add("active");
        currentStepIdx++;
        setTimeout(runCitizenPipeline, 500);
      } else {
        // Pipeline completed
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Feedback';
        
        displayCitizenPipelineMetadata(textVal, activeState, constId, channel);
      }
    }

    runCitizenPipeline();
  });
}

function startVoiceRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice typing is not supported in this browser. Please type your problem instead.");
    return;
  }

  isRecording = true;
  const slotMic = document.getElementById("slot-mic-record");
  const txtMic = document.getElementById("txt-mic-status");
  const timerBar = document.getElementById("record-timer-bar");
  const timerClock = document.getElementById("record-timer-clock");
  const textarea = document.getElementById("portal-feedback-text");
  const transMap = translations[currentLanguage] || translations.en;

  slotMic.classList.add("recording");
  txtMic.innerText = transMap.recording_active || "Listening...";
  timerBar.style.display = "flex";
  recordSeconds = 0;
  timerClock.innerText = "00:00";

  recordTimerInterval = setInterval(() => {
    recordSeconds++;
    const mins = Math.floor(recordSeconds / 60).toString().padStart(2, "0");
    const secs = (recordSeconds % 60).toString().padStart(2, "0");
    timerClock.innerText = `${mins}:${secs}`;
  }, 1000);

  speechRecognition = new SpeechRecognition();
  speechRecognition.lang = speechLangMap[currentLanguage] || "en-IN";
  speechRecognition.continuous = true;
  speechRecognition.interimResults = true;

  let finalTranscript = textarea.value ? textarea.value + " " : "";

  speechRecognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interim += transcript;
      }
    }
    textarea.value = (finalTranscript + interim).trim();
  };

  speechRecognition.onerror = () => {
    stopVoiceRecording(false);
  };

  speechRecognition.start();
}

function stopVoiceRecording(shouldTranscribe) {
  isRecording = false;
  clearInterval(recordTimerInterval);

  if (speechRecognition) {
    try { speechRecognition.stop(); } catch (_) { /* already stopped */ }
    speechRecognition = null;
  }

  const slotMic = document.getElementById("slot-mic-record");
  const txtMic = document.getElementById("txt-mic-status");
  const timerBar = document.getElementById("record-timer-bar");
  const transMap = translations[currentLanguage] || translations.en;

  slotMic.classList.remove("recording");
  timerBar.style.display = "none";

  if (shouldTranscribe) {
    const textarea = document.getElementById("portal-feedback-text");
    if (textarea.value.trim()) {
      simulatedVoiceFile = "voice_input.webm";
      slotMic.classList.add("has-file");
      txtMic.innerText = transMap.slot_record_voice || "Tap to Speak";
    } else {
      simulatedVoiceFile = null;
      slotMic.classList.remove("has-file");
      txtMic.innerText = transMap.slot_record_voice || "Tap to Speak";
    }
  } else {
    simulatedVoiceFile = null;
    slotMic.classList.remove("has-file");
    txtMic.innerText = transMap.slot_record_voice || "Tap to Speak";
  }
}

function displayCitizenPipelineMetadata(txt, stateName, constituencyId, channelName) {
  const metaCard = document.getElementById("portal-meta-card");
  const outOriginal = document.getElementById("portal-meta-original");
  const outTranslation = document.getElementById("portal-meta-translation");
  const outTheme = document.getElementById("portal-meta-theme");
  const outUrgency = document.getElementById("portal-meta-urgency");
  const outState = document.getElementById("portal-meta-state");

  metaCard.style.display = "block";
  outOriginal.innerText = txt || "[Audio Voice note processed]";

  // Heuristic parser
  let theme = "Sanitation";
  let themeClass = "sanitation";
  const textLower = (txt || "").toLowerCase();

  if (textLower.includes("water") || textLower.includes("drinking") || textLower.includes("குடிநீர்") || textLower.includes("पानी")) {
    theme = "Water Supply";
    themeClass = "water";
  } else if (textLower.includes("road") || textLower.includes("pothole") || textLower.includes("सड़क") || textLower.includes("சாலை")) {
    theme = "Road Infrastructure";
    themeClass = "road";
  } else if (textLower.includes("school") || textLower.includes("education") || textLower.includes("பள்ளி") || textLower.includes("स्कूल")) {
    theme = "Education";
    themeClass = "education";
  } else if (textLower.includes("health") || textLower.includes("doctor") || textLower.includes("மருத்துவ") || textLower.includes("इलाज")) {
    theme = "Healthcare";
    themeClass = "healthcare";
  }

  outTranslation.innerText = (currentLanguage === "en") ? (txt || "Translation not needed.") : `[Auto-Translated] ` + (simulatedTranscripts.en);
  outTheme.className = `badge ${themeClass}`;
  outTheme.innerText = theme;
  
  outUrgency.className = "score-badge";
  outUrgency.innerText = "High";
  outUrgency.style.background = "rgba(249, 115, 22, 0.15)";
  outUrgency.style.color = "var(--urgency-high)";
  outUrgency.style.borderColor = "var(--urgency-high)";

  const cObj = getConstituencyById(constituencyId);
  const routeLabel = cObj ? cObj.name + ", " + cObj.state : stateName;
  outState.innerText = detectedLocation
    ? `${routeLabel} (${detectedLocation.latitude.toFixed(2)}°, ${detectedLocation.longitude.toFixed(2)}°)`
    : routeLabel;

  // Add to submitted suggestions history
  const today = new Date();
  const dateStr = today.toISOString().substring(0, 10);
  
  userSubmissions.unshift({
    date: dateStr,
    state: stateName,
    text: txt || "Recorded Speech Transcript note.",
    theme: theme,
    themeClass: themeClass,
    urgency: "High",
    status: "Processed & Queued"
  });

  renderCitizenHistory();

  // Scroll details into view
  metaCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderCitizenHistory() {
  const container = document.getElementById("citizen-submissions-list");
  if (!container) return;

  container.innerHTML = "";

  userSubmissions.forEach(sub => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Date Submitted">${sub.date}</td>
      <td data-label="State Area"><strong>${sub.state}</strong></td>
      <td data-label="Description">${sub.text}</td>
      <td data-label="Theme"><span class="badge ${sub.themeClass}">${sub.theme}</span></td>
      <td data-label="Severity"><span class="score-badge" style="background:transparent; border-color:var(--urgency-high); color:var(--urgency-high);">${sub.urgency}</span></td>
      <td data-label="Status"><span style="color:#fbbf24; font-weight:600; font-size:0.75rem;"><i class="fa-solid fa-clock"></i> ${sub.status}</span></td>
    `;
    container.appendChild(row);
  });
}

// 7. MP AI Sandbox Actions
function setupSandboxActions() {
  const sandboxInput = document.getElementById("sandbox-statement-input");
  const quickSandboxBtn = document.querySelectorAll(".tag-btn[data-sandbox-key]");
  const threshSlider = document.getElementById("sandbox-match-threshold");
  const threshVal = document.getElementById("sandbox-match-threshold-label");

  const outLang = document.getElementById("sandbox-lang-detected");
  const outLangConf = document.getElementById("sandbox-lang-confidence");
  const outTranslated = document.getElementById("sandbox-trans-text");
  const outNerChips = document.getElementById("sandbox-extracted-ner-chips");
  const outTopicName = document.getElementById("sandbox-extracted-topic");
  const outTopicScore = document.getElementById("sandbox-extracted-topic-score");
  const outTopicFill = document.getElementById("sandbox-extracted-topic-fill");
  const outSentimentMarker = document.getElementById("sandbox-sentiment-marker-bubble");

  // Default scenario loading
  loadSandboxScenario("tamil-water");

  quickSandboxBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      quickSandboxBtn.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const key = btn.getAttribute("data-sandbox-key");
      loadSandboxScenario(key);
    });
  });

  threshSlider.addEventListener("input", (e) => {
    threshVal.innerText = `${e.target.value}%`;
  });

  // Sandbox Custom input parser
  sandboxInput.addEventListener("input", () => {
    const textVal = sandboxInput.value;
    if (!textVal.trim()) return;

    const textLower = textVal.toLowerCase();

    // Heuristics
    let topic = "Road Infrastructure";
    let score = "91%";
    
    if (textLower.includes("water") || textLower.includes("pipe") || textLower.includes("குடிநீர்") || textLower.includes("पानी")) {
      topic = "Water Supply";
      score = "97%";
    } else if (textLower.includes("school") || textLower.includes("education") || textLower.includes("स्कूल") || textLower.includes("பள்ளி")) {
      topic = "Education";
      score = "95%";
    } else if (textLower.includes("health") || textLower.includes("clinic") || textLower.includes("doctor")) {
      topic = "Healthcare";
      score = "93%";
    } else if (textLower.includes("drain") || textLower.includes("waste") || textLower.includes("sewage")) {
      topic = "Sanitation";
      score = "94%";
    }

    outTopicName.innerText = topic;
    outTopicScore.innerText = `${score} match`;
    outTopicFill.style.width = score;

    let sentiment = 50; // neutral
    if (textLower.includes("broken") || textLower.includes("accident") || textLower.includes("worst") || textLower.includes("danger") || textLower.includes("leaking")) {
      sentiment = 18; // negative
    } else if (textLower.includes("issue") || textLower.includes("problem") || textLower.includes("leak")) {
      sentiment = 30;
    }

    outSentimentMarker.style.left = `${sentiment}%`;
    outLang.innerText = "English (en)";
    outLangConf.innerText = "99.9%";
    outTranslated.innerText = `"${textVal}"`;

    outNerChips.innerHTML = `
      <span class="ner-chip keyword">${topic} Tag</span>
      <span class="ner-chip problem">Issue Identified</span>
    `;
  });

  function loadSandboxScenario(key) {
    const data = sandboxScenarios[key];
    if (!data) return;

    sandboxInput.value = data.text;
    outLang.innerText = data.lang;
    outLangConf.innerText = data.langConf;
    outTranslated.innerText = `"${data.translated}"`;

    outNerChips.innerHTML = "";
    data.ner.forEach(n => {
      const chip = document.createElement("span");
      chip.className = `ner-chip ${n.type}`;
      chip.innerText = n.text;
      outNerChips.appendChild(chip);
    });

    outTopicName.innerText = data.topic;
    outTopicScore.innerText = `${data.topicConf} match`;
    outTopicFill.style.width = data.topicConf;
    outSentimentMarker.style.left = `${data.sentiment}%`;
  }
}

// 8. MP Project Prioritization Calculations
function setupRecommendationSliders() {
  const sliders = [
    document.getElementById("mp-w-demand"),
    document.getElementById("mp-w-gap"),
    document.getElementById("mp-w-impact"),
    document.getElementById("mp-w-cost")
  ];

  sliders.forEach(slider => {
    slider.addEventListener("input", (e) => {
      const label = document.getElementById(`${slider.id}-label`);
      if (label) label.innerText = `${e.target.value}%`;
      updateRecommendationsTable();
    });
  });

  document.getElementById("btn-reset-mp-sliders").addEventListener("click", () => {
    document.getElementById("mp-w-demand").value = 52;
    document.getElementById("mp-w-demand-label").innerText = "52%";

    document.getElementById("mp-w-gap").value = 39;
    document.getElementById("mp-w-gap-label").innerText = "39%";

    document.getElementById("mp-w-impact").value = 43;
    document.getElementById("mp-w-impact-label").innerText = "43%";

    document.getElementById("mp-w-cost").value = 28;
    document.getElementById("mp-w-cost-label").innerText = "28%";

    updateRecommendationsTable();
  });
}

function updateRecommendationsTable() {
  const wDemand = parseInt(document.getElementById("mp-w-demand").value);
  const wGap = parseInt(document.getElementById("mp-w-gap").value);
  const wImpact = parseInt(document.getElementById("mp-w-impact").value);
  const wCost = parseInt(document.getElementById("mp-w-cost").value);

  const sumWeights = wDemand + wGap + wImpact + wCost || 1;

  const activeStateObj = getConstituencyData(activeConstituencyId);
  if (!activeStateObj) return;

  const calculated = activeStateObj.projects.map(proj => {
    const stateDensity = activeStateObj.densityVal;
    const impactScore = (stateDensity / 1029) * 100;

    let score = (
      (wDemand / sumWeights) * proj.demandBase +
      (wGap / sumWeights) * proj.gapBase +
      (wImpact / sumWeights) * impactScore -
      (wCost / sumWeights) * proj.costBase
    );

    if (ESSENTIAL_THEMES.includes(proj.theme)) {
      score = Math.max(score, 80);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      ...proj,
      priorityScore: Math.round(score),
      isEssential: ESSENTIAL_THEMES.includes(proj.theme)
    };
  });

  calculated.sort((a, b) => {
    if (a.isEssential !== b.isEssential) return b.isEssential - a.isEssential;
    return b.priorityScore - a.priorityScore;
  });

  const tbody = document.getElementById("mp-priority-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  calculated.forEach((proj, idx) => {
    const row = document.createElement("tr");
    const essentialBadge = proj.isEssential
      ? '<span class="priority-badge-essential">Essential</span>'
      : '';
    row.innerHTML = `
      <td class="rank-col">#${idx + 1}</td>
      <td><strong>${proj.title}</strong>${essentialBadge}</td>
      <td>${activeConstituency}</td>
      <td><span class="badge ${proj.themeClass}">${proj.theme}</span></td>
      <td>${proj.demandBase}/100</td>
      <td>${proj.gapBase}/100</td>
      <td>${proj.costText}</td>
      <td><span class="score-badge">${proj.priorityScore}</span></td>
    `;
    tbody.appendChild(row);
  });

  // Render the Priority Bar Chart
  updatePriorityBarChart(calculated);
}

// 9. MP Executive Report Generator Modal
function setupReportModal() {
  const btnGenerate = document.getElementById("btn-generate-executive-report");
  const modal = document.getElementById("report-modal");
  const btnClose = document.getElementById("btn-close-modal");
  const btnPrint = document.getElementById("btn-print-report");
  const btnDownloadRaw = document.getElementById("btn-download-raw");

  const btnGenerateVis = document.getElementById("btn-generate-executive-report-vis");
  if (btnGenerateVis) btnGenerateVis.addEventListener("click", () => { modal.style.display = "flex"; renderExecutiveReportContent(); });
  btnGenerate.addEventListener("click", () => {
    modal.style.display = "flex";
    renderExecutiveReportContent();
  });

  btnClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  btnPrint.addEventListener("click", () => {
    window.print();
  });

  btnDownloadRaw.addEventListener("click", () => {
    alert("Project details exported as raw JSON dataset successfully.");
  });
}

function renderExecutiveReportContent() {
  const reportDoc = document.getElementById("report-doc");
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const wDemand = parseInt(document.getElementById("mp-w-demand").value);
  const wGap = parseInt(document.getElementById("mp-w-gap").value);
  const wImpact = parseInt(document.getElementById("mp-w-impact").value);
  const wCost = parseInt(document.getElementById("mp-w-cost").value);
  const sumWeights = wDemand + wGap + wImpact + wCost || 1;

  const activeStateObj = getConstituencyData(activeConstituencyId);
  const calculated = activeStateObj.projects.map(proj => {
    const stateDensity = activeStateObj.densityVal;
    const impactScore = (stateDensity / 1029) * 100;

    let score = (
      (wDemand / sumWeights) * proj.demandBase +
      (wGap / sumWeights) * proj.gapBase +
      (wImpact / sumWeights) * impactScore -
      (wCost / sumWeights) * proj.costBase
    );
    if (ESSENTIAL_THEMES.includes(proj.theme)) {
      score = Math.max(score, 80);
    }
    score = Math.max(0, Math.min(100, score));
    return { ...proj, priorityScore: Math.round(score) };
  }).sort((a, b) => {
    const aEss = ESSENTIAL_THEMES.includes(a.theme) ? 1 : 0;
    const bEss = ESSENTIAL_THEMES.includes(b.theme) ? 1 : 0;
    if (aEss !== bEss) return bEss - aEss;
    return b.priorityScore - a.priorityScore;
  });

  let projectRowsHtml = "";
  calculated.forEach((proj, idx) => {
    projectRowsHtml += `
      <tr>
        <td style="font-weight:700;">#${idx + 1}</td>
        <td><strong>${proj.title}</strong></td>
        <td>${activeConstituency}</td>
        <td>${proj.theme}</td>
        <td style="font-weight:600; text-align:center;">${proj.priorityScore}</td>
      </tr>
    `;
  });

  const topProject = calculated[0];

  reportDoc.innerHTML = `
    <div class="report-hdr">
      <h4>Constituency Development Advisory Report</h4>
      <p>Prepared for Member of Parliament (MP) Office | Generated on ${today}</p>
    </div>
    
    <div class="report-section">
      <h5>1. Executive Summary</h5>
      <p style="font-size:0.82rem; color:#475569; line-height:1.4;">
        This advisory ranks developmental projects by compiling citizen complaints from IVR, WhatsApp, SMS, and Web channels, mapping them geospatially, and balancing baseline demographic statistics (literacy, school enrollment, water shortage index). 
        The ranking weighs Citizen Demands at <strong>${wDemand}%</strong>, Baseline Gaps at <strong>${wGap}%</strong>, State Density Impact at <strong>${wImpact}%</strong>, and cost considerations at <strong>${wCost}%</strong>.
        Target State of evaluation: <strong>${activeStateName}</strong>.
      </p>
    </div>

    <div class="report-section">
      <h5>2. Prioritized Project Suggestions</h5>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width:60px;">Rank</th>
            <th>Proposed Project</th>
            <th>Location</th>
            <th>Theme</th>
            <th style="width:90px; text-align:center;">Priority Score</th>
          </tr>
        </thead>
        <tbody>
          ${projectRowsHtml}
        </tbody>
      </table>
    </div>

    <div class="report-section">
      <h5>3. High-Priority Action Item</h5>
      <p style="font-size:0.82rem; color:#475569;">
        Based on the current weight layout, the top recommendation is: <strong>${topProject.title}</strong> in <strong>${activeStateName}</strong> with a Priority Score of <strong>${topProject.priorityScore}/100</strong>. 
        It is highly recommended that the MP office submits this proposal to the Local Development Fund commission for immediate budgetary approval.
      </p>
    </div>

    <div class="report-footer">
      <p>© 2026 People's Priority Decision Engine. All rights reserved.</p>
    </div>
  `;
}

// Light / Dark Theme Toggle Logic
function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle-btn");
  if (!btn) return;

  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButtonUI(savedTheme);

  btn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeButtonUI(newTheme);
    updateRecommendationsTable();
  });
}

function updateThemeButtonUI(theme) {
  const btn = document.getElementById("theme-toggle-btn");
  if (!btn) return;
  const icon = btn.querySelector("i");
  const text = btn.querySelector("span");
  if (theme === "light") {
    icon.className = "fa-solid fa-moon";
    text.innerText = "Dark Mode";
  } else {
    icon.className = "fa-solid fa-sun";
    text.innerText = "Light Mode";
  }
}

// Demo Mode Banner - Dismissible functionality
function setupDemoBanner() {
  const banner = document.getElementById("demo-banner");
  const closeBtn = document.getElementById("demo-banner-close");
  
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (banner) {
        banner.style.display = "none";
        localStorage.setItem("demoBannerDismissed", "true");
      }
    });
  }
  
  // Check if banner was previously dismissed
  if (banner && localStorage.getItem("demoBannerDismissed") === "true") {
    banner.style.display = "none";
  }
}

// Accessibility Features - Voice cues, keyboard navigation, ARIA labels
function setupAccessibilityFeatures() {
  // Add voice cues for text-to-speech
  addVoiceCues();
  
  // Ensure keyboard navigation works for all interactive elements
  enhanceKeyboardNavigation();
  
  // Add ARIA labels where missing
  enhanceARIALabels();
  
  // Ensure minimum touch target sizes
  enhanceTouchTargets();
}

function addVoiceCues() {
  // Add speaker icons next to important text for TTS
  const importantLabels = document.querySelectorAll('label[data-i18n], .form-hint');
  importantLabels.forEach(label => {
    if (!label.querySelector('.voice-cue-icon')) {
      const speakerIcon = document.createElement('i');
      speakerIcon.className = 'fa-solid fa-volume-high voice-cue-icon';
      speakerIcon.style.cssText = 'margin-left: 6px; cursor: pointer; font-size: 0.75rem; color: var(--text-muted); opacity: 0.6;';
      speakerIcon.setAttribute('aria-label', 'Read text aloud');
      speakerIcon.setAttribute('role', 'button');
      speakerIcon.setAttribute('tabindex', '0');
      speakerIcon.addEventListener('click', () => speakText(label.innerText));
      speakerIcon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          speakText(label.innerText);
        }
      });
      label.appendChild(speakerIcon);
    }
  });
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 
                    currentLanguage === 'ta' ? 'ta-IN' :
                    currentLanguage === 'te' ? 'te-IN' :
                    currentLanguage === 'kn' ? 'kn-IN' :
                    currentLanguage === 'bn' ? 'bn-IN' : 'en-IN';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
}

function enhanceKeyboardNavigation() {
  // Ensure all buttons and interactive elements are keyboard accessible
  const interactiveElements = document.querySelectorAll('button, .upload-slot, .nav-item, .role-card');
  interactiveElements.forEach(el => {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
    if (!el.hasAttribute('role') && (el.classList.contains('upload-slot') || el.classList.contains('nav-item') || el.classList.contains('role-card'))) {
      el.setAttribute('role', 'button');
    }
  });
}

function enhanceARIALabels() {
  // Add ARIA labels to form controls
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(ta => {
    if (!ta.hasAttribute('aria-label')) {
      const label = ta.previousElementSibling;
      if (label && label.tagName === 'LABEL') {
        ta.setAttribute('aria-label', label.innerText);
      }
    }
  });
  
  const selects = document.querySelectorAll('select');
  selects.forEach(sel => {
    if (!sel.hasAttribute('aria-label')) {
      const label = sel.previousElementSibling;
      if (label && label.tagName === 'LABEL') {
        sel.setAttribute('aria-label', label.innerText);
      }
    }
  });
}

function enhanceTouchTargets() {
  // Ensure minimum touch target size of 44x44px for mobile
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      button, .upload-slot, .nav-item, .role-card, input[type="file"] {
        min-height: 44px !important;
        min-width: 44px !important;
      }
      .btn-primary, .btn-secondary {
        min-height: 48px !important;
        padding: 12px 20px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Render priority ranked list (replaces grouped bar chart)
function mockLlmReason(proj) {
  const theme = proj.theme;
  const isHigh = proj.priorityScore >= 75;
  const isMid = proj.priorityScore >= 50;
  const reasons = {
    "Water Supply":       isHigh ? "Many households lack clean drinking water and the situation is getting worse." : isMid ? "Water access is unreliable for a large part of the community." : "Water supply works but could be improved over time.",
    "Healthcare":         isHigh ? "People are travelling far for basic medical care with no local facility." : isMid ? "The local health centre is understaffed and needs urgent support." : "Healthcare is available but capacity needs gradual improvement.",
    "Road Infrastructure":isHigh ? "Damaged roads are blocking daily movement and emergency vehicle access." : isMid ? "Road conditions slow down commutes and increase vehicle wear." : "Roads are functional but resurfacing would help in the long run.",
    "Sanitation":         isHigh ? "Open drainage is causing health hazards for residents across the ward." : isMid ? "Sanitation coverage has gaps that affect daily hygiene for many families." : "Basic sanitation exists but the network needs expansion.",
    "Education":          isHigh ? "Children are dropping out because the school building is unsafe and overcrowded." : isMid ? "Classrooms are short on teachers and basic learning materials." : "School infrastructure is adequate but modernisation would help.",
    "Power & Grid":       isHigh ? "Frequent outages are disrupting livelihoods and essential services daily." : isMid ? "Power supply is inconsistent and affects small businesses and homes." : "Electricity is available but reliability needs improvement."
  };
  return reasons[theme] || (isHigh ? "This project addresses a critical gap affecting many residents." : isMid ? "This project would meaningfully improve daily life for the community." : "This project is useful but can be scheduled after more urgent needs.");
}

function updatePriorityBarChart(calculated) {
  const listEl = document.getElementById("priority-ranked-list");
  if (!listEl || !calculated || !calculated.length) return;

  listEl.innerHTML = calculated.map((proj, idx) => {
    const score = proj.priorityScore;
    const isHigh = score >= 75;
    const isMid  = score >= 50;
    const tier   = isHigh ? { label: "Act now",   cls: "prl-urgent"   }
                 : isMid  ? { label: "Plan soon",  cls: "prl-important"}
                 :          { label: "Can wait",   cls: "prl-low"      };
    const reason = mockLlmReason(proj);
    const detailId = "prl-detail-" + idx;
    return `<div class="prl-row ${tier.cls}" onclick="var d=document.getElementById('${detailId}');d.style.display=d.style.display==='block'?'none':'block'">
      <span class="prl-rank">#${idx + 1}</span>
      <div class="prl-main">
        <span class="prl-name">${proj.title}</span>
        <span class="prl-reason">${reason}</span>
      </div>
      <span class="prl-tag">${tier.label}</span>
      <div id="${detailId}" class="prl-detail" style="display:none;">
        <span>Citizen demand: ${proj.demandBase}/100</span>
        <span>Infrastructure gap: ${proj.gapBase}/100</span>
        <span>Budget cost: ${proj.costText}</span>
        <span>Priority score: ${score}/100</span>
      </div>
    </div>`;
  }).join("");
}

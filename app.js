// Global State
let currentUserRole = "citizen"; // citizen or mp
let currentLanguage = "en"; // en, hi, ta, te, kn, bn
let activeStateName = "Tamil Nadu";
let mpActiveLayer = "literacy";
let isRecording = false;
let recordTimerInterval = null;
let recordSeconds = 0;

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
    cit_portal_title: "Submit Feedback & Suggestions",
    cit_portal_desc: "Speak or type your developmental requests directly to your regional MP office",
    cit_form_heading: "Citizen Statement Submission",
    cit_form_sub: "All uploads are processed through automated AI translation layers.",
    gps_enable_btn: "Enable Location Sharing",
    gps_disabled: "Location data: Disabled (Using default)",
    gps_enabled: "Location data: Active (Simulated GPS Lock)",
    lbl_submission_state: "State / Territory",
    lbl_submission_channel: "Submission Channel",
    lbl_text_transcript: "Type feedback directly (or tap Microphone to record speech)",
    lbl_attachments: "Media Attachments (Record Audio / Photo Upload)",
    slot_record_voice: "Tap to Record Voice",
    slot_upload_photo: "Upload / Snap Photo",
    recording_active: "Recording Active. Tap slot again to STOP & Transcribe...",
    btn_submit_feedback: "Submit Feedback",
    visualizer_heading: "Multilingual AI Pipelines Tracker",
    visualizer_sub: "Visualizing ingestion, translation, OCR, and classification steps",
    step_1_title: "1. Location & Channel Validation",
    step_1_desc: "Geocoding GPS points, verifying state boundary polygons, and queuing messages.",
    step_2_title: "2. Voice Transcribe & OCR Scanning",
    step_2_desc: "Executing speech-to-text transcription via Whisper and classifying image faults.",
    step_3_title: "3. Bhashini AI Translation Layer",
    step_3_desc: "Detecting languages and producing unified English translations.",
    step_4_title: "4. Theme NER Classification",
    step_4_desc: "Running named entity token parsing to isolate wards, sectors, and issues.",
    metadata_header: "Processed Output Metadata",
    meta_orig: "Original Text:",
    meta_trans: "Translation:",
    meta_theme: "Theme Tag:",
    meta_urgency: "Severity:",
    meta_loc: "Routed State:",
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
    map_heading: "India State Selection Map",
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
    recommendations_title: "Project Prioritization Dashboard",
    recommendations_desc: "Balance budget limitations and public demands using weights adjustments",
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
let userSubmissions = [
  {
    date: "2026-07-05",
    state: "Tamil Nadu",
    text: "Potholes on Chennai bypass road near school crossing causing minor bicycle slips.",
    theme: "Road Infrastructure",
    themeClass: "road",
    urgency: "Medium",
    status: "Processed & Queued"
  },
  {
    date: "2026-07-06",
    state: "Tamil Nadu",
    text: "Clogged storm drains in Salem ward office lane causing street flooding during rainfall.",
    theme: "Sanitation",
    themeClass: "sanitation",
    urgency: "High",
    status: "MP Reviewed"
  }
];

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupLoginFlow();
  setupRoleSelector();
  setupPostLoginLangSelector();
  setupNavigation();
  setupStateMap();
  setupHardwarePermissions();
  setupCitizenPortalActions();
  setupSandboxActions();
  setupRecommendationSliders();
  setupReportModal();
  setupStateDropdownSelector();
  
  // Set date
  const dateEl = document.getElementById("live-date");
  if (dateEl) {
    const today = new Date();
    dateEl.innerText = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
});

// 1. Login & Role Flow
function setupLoginFlow() {
  const btnLogin = document.getElementById("btn-login");
  const loginScreen = document.getElementById("login-screen");
  const appWrapper = document.getElementById("app-wrapper");
  const loginLang = document.getElementById("login-language");

  btnLogin.addEventListener("click", () => {
    // Read selections
    const selectedRoleCard = document.querySelector(".role-card.active");
    currentUserRole = selectedRoleCard ? selectedRoleCard.getAttribute("data-role") : "citizen";
    currentLanguage = loginLang.value;

    // Apply login
    loginScreen.style.display = "none";
    appWrapper.style.display = "grid";

    // Set post-login language selectors sync
    document.getElementById("post-language-selector").value = currentLanguage;

    // Configure workspace based on role
    configureWorkspaceForRole();
    
    // Translate entire application UI
    translateApp(currentLanguage);

    // Initial render updates
    updateDashboardForState(activeStateName);
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
  roleCards.forEach(card => {
    card.addEventListener("click", () => {
      roleCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
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
    updateDashboardForState(activeStateName);
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
    footerRole.setAttribute("data-i18n", "role_mp");
    greetingUsername.innerText = "Honorable MP";
    footerAvatar.innerHTML = '<i class="fa-solid fa-user-tie"></i>';
    
    // Set active tab to MP dashboard
    switchActiveTab("mp-dashboard");
  } else {
    footerUsername.innerText = "Citizen Portal";
    footerRole.setAttribute("data-i18n", "role_citizen_title");
    greetingUsername.innerText = "Citizen Demo User";
    footerAvatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    
    // Set active tab to Citizen portal
    switchActiveTab("citizen-portal");
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

// 4. India Map & State Selection Dashboard
function setupStateMap() {
  const statePolys = document.querySelectorAll(".map-ward-poly");
  const layerButtons = document.querySelectorAll(".map-control-btn[data-mp-layer]");

  statePolys.forEach(poly => {
    poly.addEventListener("click", () => {
      statePolys.forEach(p => p.classList.remove("active"));
      poly.classList.add("active");

      const polyId = poly.getAttribute("id");
      let targetState = "Tamil Nadu";
      if (polyId === "state-tn") targetState = "Tamil Nadu";
      else if (polyId === "state-kn") targetState = "Karnataka";
      else if (polyId === "state-mh") targetState = "Maharashtra";
      else if (polyId === "state-up") targetState = "Uttar Pradesh";
      else if (polyId === "state-wb") targetState = "West Bengal";

      activeStateName = targetState;
      document.getElementById("mp-state-dropdown-selector").value = targetState;
      updateDashboardForState(targetState);
      updateRecommendationsTable();
    });
  });

  layerButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      layerButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const layer = btn.getAttribute("data-mp-layer");
      mpActiveLayer = layer;
      recolorIndiaStates();
      updateIndiaMapLegend();
    });
  });
}

function setupStateDropdownSelector() {
  const selector = document.getElementById("mp-state-dropdown-selector");
  selector.addEventListener("change", (e) => {
    const val = e.target.value;
    activeStateName = val;
    
    // Update map polygon highlights
    const statePolys = document.querySelectorAll(".map-ward-poly");
    statePolys.forEach(p => p.classList.remove("active"));
    
    let polyId = "state-tn";
    if (val === "Tamil Nadu") polyId = "state-tn";
    else if (val === "Karnataka") polyId = "state-kn";
    else if (val === "Maharashtra") polyId = "state-mh";
    else if (val === "Uttar Pradesh") polyId = "state-up";
    else if (val === "West Bengal") polyId = "state-wb";
    
    const poly = document.getElementById(polyId);
    if (poly) poly.classList.add("active");

    updateDashboardForState(val);
    updateRecommendationsTable();
  });
}

function updateDashboardForState(stateName) {
  const data = stateData[stateName];
  if (!data) return;

  // Title
  document.getElementById("mp-state-title").innerText = stateName;
  document.getElementById("mp-state-region").innerText = data.region;

  // KPI Values
  document.getElementById("kpi-val-submissions").innerText = data.submissions;
  document.getElementById("kpi-val-urgent").innerText = data.urgent;
  document.getElementById("kpi-val-budget").innerText = data.budget;

  // Stats List
  document.getElementById("mp-state-density").innerText = data.density;
  document.getElementById("mp-state-literacy").innerText = data.literacy;
  document.getElementById("mp-state-enrollment").innerText = data.enrollment;
  document.getElementById("mp-state-water").innerText = data.water;

  // Render demands chart
  const container = document.getElementById("mp-state-demands-container");
  container.innerHTML = "";
  
  const maxVal = Math.max(...data.demands.map(d => d.count));
  data.demands.forEach(d => {
    const widthPct = (d.count / maxVal) * 100;
    const row = document.createElement("div");
    row.className = "demand-bar-row";
    row.style.marginBottom = "8px";
    row.innerHTML = `
      <div class="demand-bar-label">
        <span style="color: var(--text-muted); font-size: 0.78rem;">${d.category}</span>
        <span style="color: #fff; font-weight: 600; font-size: 0.78rem;">${d.count} requests</span>
      </div>
      <div class="demand-bar-bg">
        <div class="demand-bar-fill" style="width: ${widthPct}%; background: ${d.fillHex};"></div>
      </div>
    `;
    container.appendChild(row);
  });

  // Recent Feedback Feed
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

  recolorIndiaStates();
  updateIndiaMapLegend();
}

function recolorIndiaStates() {
  const polygons = document.querySelectorAll(".map-ward-poly");
  polygons.forEach(poly => {
    const polyId = poly.getAttribute("id");
    let stateName = "Tamil Nadu";
    if (polyId === "state-tn") stateName = "Tamil Nadu";
    else if (polyId === "state-kn") stateName = "Karnataka";
    else if (polyId === "state-mh") stateName = "Maharashtra";
    else if (polyId === "state-up") stateName = "Uttar Pradesh";
    else if (polyId === "state-wb") stateName = "West Bengal";

    const data = stateData[stateName];
    if (!data) return;

    let fillHex = "";
    if (mpActiveLayer === "demands") {
      const density = Math.min((data.submissions / 700) * 100, 100);
      fillHex = `rgba(168, 85, 247, ${0.2 + (density / 100) * 0.7})`;
    } else if (mpActiveLayer === "gap") {
      const deficiency = (100 - data.waterVal) + (100 - data.enrollmentVal);
      const intensity = Math.min((deficiency / 100) * 100, 100);
      fillHex = `rgba(239, 68, 68, ${0.2 + (intensity / 100) * 0.7})`;
    } else if (mpActiveLayer === "literacy") {
      const lit = data.literacyVal;
      if (lit > 80) {
        fillHex = "rgba(16, 185, 129, 0.65)";
      } else if (lit > 75) {
        fillHex = "rgba(234, 179, 8, 0.55)";
      } else {
        fillHex = "rgba(239, 68, 68, 0.55)";
      }
    }
    poly.style.fill = fillHex;
  });
}

function updateIndiaMapLegend() {
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

// 5. Simulated Permissions Handler
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
    alert("Microphone permission denied. Voice recording simulation aborted.");
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
  });

  // Location GPS Prompts
  document.getElementById("btn-loc-allow").addEventListener("click", () => {
    permissions.location = true;
    document.getElementById("location-permission-prompt").style.display = "none";
    triggerLocationGpsLock();
  });
  document.getElementById("btn-loc-deny").addEventListener("click", () => {
    permissions.location = false;
    document.getElementById("location-permission-prompt").style.display = "none";
    alert("Location tracking denied. Reverting to default manual state routing.");
  });
}

function triggerCameraSnap() {
  const txtCam = document.getElementById("txt-cam-status");
  const slotCam = document.getElementById("slot-camera-upload");
  const preview = document.getElementById("portal-photo-preview");
  const previewImg = document.getElementById("portal-preview-img");
  const previewFilename = document.getElementById("portal-photo-filename");

  // Load a mock snapshot
  simulatedPhotoFile = "snap_infrastructure_damage_912.jpg";
  simulatedPhotoSrc = "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop";

  slotCam.classList.add("has-file");
  txtCam.innerText = simulatedPhotoFile;

  preview.style.display = "flex";
  previewFilename.innerText = simulatedPhotoFile;
  previewImg.src = simulatedPhotoSrc;
}

function triggerLocationGpsLock() {
  const label = document.getElementById("gps-status-label");
  const dropState = document.getElementById("portal-state-select");
  const transMap = translations[currentLanguage] || translations.en;

  // Pick state (default Tamil Nadu when sharing GPS in demo)
  const state = dropState.value || "Tamil Nadu";
  const gpsInfo = stateGpsData[state] || stateGpsData["Tamil Nadu"];

  label.innerText = `${transMap.gps_enabled || "Location data: Active"} (${gpsInfo.city}, ${gpsInfo.code} - ${gpsInfo.gps})`;
  label.style.color = "#10b981";
  label.style.fontWeight = "600";
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
    const channel = document.getElementById("portal-channel-select").value;

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
        
        displayCitizenPipelineMetadata(textVal, activeState, channel);
      }
    }

    runCitizenPipeline();
  });
}

function startVoiceRecording() {
  isRecording = true;
  const slotMic = document.getElementById("slot-mic-record");
  const txtMic = document.getElementById("txt-mic-status");
  const timerBar = document.getElementById("record-timer-bar");
  const timerClock = document.getElementById("record-timer-clock");

  slotMic.classList.add("recording");
  txtMic.innerText = "RECORDING ACTIVE";
  timerBar.style.display = "flex";
  
  recordSeconds = 0;
  timerClock.innerText = "00:00";

  recordTimerInterval = setInterval(() => {
    recordSeconds++;
    const mins = Math.floor(recordSeconds / 60).toString().padStart(2, "0");
    const secs = (recordSeconds % 60).toString().padStart(2, "0");
    timerClock.innerText = `${mins}:${secs}`;
  }, 1000);
}

function stopVoiceRecording(shouldTranscribe) {
  isRecording = false;
  clearInterval(recordTimerInterval);
  
  const slotMic = document.getElementById("slot-mic-record");
  const txtMic = document.getElementById("txt-mic-status");
  const timerBar = document.getElementById("record-timer-bar");

  slotMic.classList.remove("recording");
  timerBar.style.display = "none";

  if (shouldTranscribe) {
    simulatedVoiceFile = "recorded_voice_note_lock.wav";
    slotMic.classList.add("has-file");
    txtMic.innerText = simulatedVoiceFile;

    // Fill feedback text box based on selected language
    const transcriptText = simulatedTranscripts[currentLanguage] || simulatedTranscripts.en;
    document.getElementById("portal-feedback-text").value = transcriptText;
  } else {
    simulatedVoiceFile = null;
    slotMic.classList.remove("has-file");
    txtMic.innerText = "Tap to Record Voice";
  }
}

function displayCitizenPipelineMetadata(txt, stateName, channelName) {
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

  outState.innerText = stateName;

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
      <td>${sub.date}</td>
      <td><strong>${sub.state}</strong></td>
      <td>${sub.text}</td>
      <td><span class="badge ${sub.themeClass}">${sub.theme}</span></td>
      <td><span class="score-badge" style="background:transparent; border-color:var(--urgency-high); color:var(--urgency-high);">${sub.urgency}</span></td>
      <td><span style="color:#fbbf24; font-weight:600; font-size:0.75rem;"><i class="fa-solid fa-clock"></i> ${sub.status}</span></td>
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

  // Retrieve current active state projects
  const activeStateObj = stateData[activeStateName];
  if (!activeStateObj) return;

  const calculated = activeStateObj.projects.map(proj => {
    // Normalization of Population Density Impact score
    // UP has max density 829. TN has 555.
    const stateDensity = activeStateObj.densityVal;
    const impactScore = (stateDensity / 1029) * 100; // normalized to max density Bengal

    let score = (
      (wDemand / sumWeights) * proj.demandBase +
      (wGap / sumWeights) * proj.gapBase +
      (wImpact / sumWeights) * impactScore -
      (wCost / sumWeights) * proj.costBase
    );

    score = Math.max(0, Math.min(100, score));

    return {
      ...proj,
      priorityScore: Math.round(score)
    };
  });

  // Sort descending by calculated priority score
  calculated.sort((a, b) => b.priorityScore - a.priorityScore);

  const tbody = document.getElementById("mp-priority-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  calculated.forEach((proj, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="rank-col">#${idx + 1}</td>
      <td><strong>${proj.title}</strong></td>
      <td>${activeStateName}</td>
      <td><span class="badge ${proj.themeClass}">${proj.theme}</span></td>
      <td>${proj.demandBase}/100</td>
      <td>${proj.gapBase}/100</td>
      <td>${proj.costText}</td>
      <td><span class="score-badge">${proj.priorityScore}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// 9. MP Executive Report Generator Modal
function setupReportModal() {
  const btnGenerate = document.getElementById("btn-generate-executive-report");
  const modal = document.getElementById("report-modal");
  const btnClose = document.getElementById("btn-close-modal");
  const btnPrint = document.getElementById("btn-print-report");
  const btnDownloadRaw = document.getElementById("btn-download-raw");

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

  const activeStateObj = stateData[activeStateName];
  const calculated = activeStateObj.projects.map(proj => {
    const stateDensity = activeStateObj.densityVal;
    const impactScore = (stateDensity / 1029) * 100;

    let score = (
      (wDemand / sumWeights) * proj.demandBase +
      (wGap / sumWeights) * proj.gapBase +
      (wImpact / sumWeights) * impactScore -
      (wCost / sumWeights) * proj.costBase
    );
    score = Math.max(0, Math.min(100, score));
    return { ...proj, priorityScore: Math.round(score) };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  let projectRowsHtml = "";
  calculated.forEach((proj, idx) => {
    projectRowsHtml += `
      <tr>
        <td style="font-weight:700;">#${idx + 1}</td>
        <td><strong>${proj.title}</strong></td>
        <td>${activeStateName}</td>
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

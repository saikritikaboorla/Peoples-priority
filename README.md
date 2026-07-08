# People's Priority 🏛️

An AI-powered citizen feedback and decision-support platform that helps Members of Parliament (MPs) identify, prioritize, and address local development needs using citizen inputs, geospatial intelligence, and data-driven recommendations.

---

## Overview

People's Priority bridges the gap between citizens and decision-makers by transforming unstructured feedback from multiple channels into actionable development insights.

The platform enables citizens to submit issues through voice, text, and images while providing MPs with a centralized dashboard to analyze demand patterns, identify infrastructure gaps, and prioritize projects based on measurable community impact.

---

# Platform Preview

People's Priority provides dedicated interfaces for citizens and decision-makers, ensuring seamless participation, analysis, and development planning.

## 🔐 Login Portal

The login interface provides secure access to different user roles, allowing citizens and representatives to interact with the platform through personalized dashboards.

<p align="center">
  <img width="1600" height="999" alt="image" src="https://github.com/user-attachments/assets/1b011505-f553-4aa4-bfd7-2114cbbd69fd" />

</p>

---

## 🗣️ Citizen Dashboard

The citizen dashboard enables users to submit local issues through text, voice, and image-based feedback while ensuring their concerns are captured and processed effectively.

<p align="center">
  <img width="1600" height="999" alt="image" src="https://github.com/user-attachments/assets/0b447af3-ed41-4207-a9cf-9fd40ceb441b" />

</p>

---

## 🏛️ MP Dashboard

The MP dashboard provides constituency-level insights, issue analysis, demand trends, and prioritized recommendations to support evidence-based decision-making.

<p align="center">
  <img width="1600" height="999" alt="image" src="https://github.com/user-attachments/assets/0a5c637a-518a-4aa4-9645-d92420adaceb" />

</p>

---

# Features

## 🗣️ Multilingual Citizen Feedback

- Accepts voice, text, and image-based submissions.
- Supports regional language inputs through AI-powered transcription and translation.
- Enables accessible participation without requiring formal grievance procedures.

## 📍 Geospatial Issue Mapping

- Maps citizen issues based on location.
- Identifies constituency-level demand hotspots.
- Connects feedback with administrative boundaries using GIS analysis.

## 🤖 AI-Based Analysis

- Converts voice submissions into structured text.
- Classifies issues into relevant development categories.
- Performs sentiment and severity analysis.
- Analyzes uploaded images to identify infrastructure concerns.

## 📊 Priority Recommendation Engine

Ranks development needs using multiple factors:

- Citizen demand
- Infrastructure gaps
- Population impact
- Budget considerations

## 📄 Executive Reports

Generates summarized reports to support transparent and evidence-based development planning.

---

# Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Python |
| Database & GIS | PostgreSQL + PostGIS |
| Mapping | Leaflet.js, SVG-based visualization |
| AI Processing | Speech Recognition, NLP Classification, Computer Vision |
| Data Processing | Demographic and infrastructure datasets |
| Server | Python HTTP Server |

---

# System Architecture

The platform follows a pipeline-based architecture where citizen feedback is collected, processed, geographically analyzed, and converted into actionable recommendations.

```text
Citizen Input
(Audio / Text / Image)
          │
          ▼
AI Processing Layer
(Transcription, Translation, Classification)
          │
          ▼
Geospatial Processing
(Location Mapping & Constituency Routing)
          │
          ▼
Constituency Data Layer
          │
          ▼
Priority Scoring Engine
          │
          ▼
MP Dashboard & Reports
```

---

# Project Structure

```text
peoples-priority/
│
├── images/
│   ├── login-page.png
│   ├── citizen-dashboard.png
│   └── mp-dashboard.png
│
├── data/
│   └── Geospatial datasets and constituency information
│
├── scripts/
│   └── Data processing and map generation utilities
│
├── app.js
│   └── Application logic and routing
│
├── constituency-engine.js
│   └── Priority calculations and map rendering
│
├── index.html
│   └── Main application interface
│
├── styles.css
│   └── UI design and responsive styling
│
└── README.md
    └── Project documentation
```

---


# AI Processing Pipeline

The platform processes citizen feedback through multiple intelligent stages:

### 1. Speech Processing
Converts voice submissions into structured text.

### 2. Language Processing
Translates regional inputs and extracts important information such as:
- Issue category
- Location
- Severity level

### 3. Issue Classification
Groups similar issues to identify recurring community requirements.

### 4. Image Analysis
Analyzes uploaded images to detect infrastructure-related problems.

---

# Priority Scoring Model

Development priorities are calculated using multiple factors:

```text
Priority Score =
Citizen Demand +
Infrastructure Gap +
Population Impact +
Budget Consideration
```

This ensures development decisions are based on measurable community needs rather than complaint volume alone.

---

# Future Scope

- Mobile application support
- Government grievance platform integration
- Real-time constituency monitoring
- Predictive development planning
- Expanded multilingual capabilities

---

# Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/NewFeature
```

3. Commit changes:

```bash
git commit -m "Add NewFeature"
```

4. Push changes:

```bash
git push origin feature/NewFeature
```

5. Open a Pull Request.

---

# License

This project is licensed under the MIT License.

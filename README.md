# People's Priority 🏛️
    
    An AI-powered citizen grievance routing and MP decision-support platform designed to convert multi-channel feedback into prioritized, data-driven local infrastructure plans.
    
    ---
    
    ##  Table of Contents
    
    * [Features](#1-features)
    * [Tech Stack](#2-tech-stack)
    * [Architecture Overview](#3-architecture-overview)
    * [Project Structure](#4-project-structure)
    * [Getting Started](#5-getting-started)
    * [API Reference](#6-api-reference)
    * [AI Pipeline](#7-ai-pipeline)
    * [Team & Tasks](#8-team--tasks)
    * [Contributing](#9-contributing)
    
    ---
    
    ## 1. Features
    
    * **Multilingual Input & Transcriptions**: Converts local speech notes into text and translates regional Indian dialects using Bhashini.
    * **Geospatial post-routing**: Uses PostGIS queries to auto-route issues to their respective state constituencies based on geolocation coordinates.
    * **Tunable Priority Engine**: Sliders allow administrators to balance citizen request volume, baseline census indicators, and budgets to generate priority ranks.
    * **Infrastructure Image Inspection**: Uses vision models to detect and classify local faults (e.g. road damage, sanitation blocks) from citizen uploads.
    * **Executive Advisory Reports**: Instantly generates printed PDF reports summarizing constituency needs.
    
    ---
    
    ## 2. Tech Stack
    
    * **Frontend**: HTML5, Vanilla CSS3 (Custom variables, responsive layout, glassmorphic filters), Vanilla JavaScript (ES6+).
    * **Maps & GIS**: Leaflet.js (Constituency boundaries & hot spots), Inline SVG mapping.
    * **GIS Database**: PostgreSQL + PostGIS (Coordinate boundary overlays).
    * **AI Pipelines**: OpenAI Whisper v3 (Speech-to-text), Bhashini API (Translation), Llama 3 (NLP/NER), ResNet-50 (Computer Vision).
    * **Local Server**: Python 3.
    
    ---
    
    ## 3. Architecture Overview
    
    Citizen feedback enters via Web, WhatsApp, IVR, or SMS. Submissions are translated, geolocation-checked via PostGIS to route to the correct constituency, and stored. MPs select
  their constituency, apply dynamic weight sliders, and the prioritisation algorithm outputs ranked project works:
    
    
  [Citizen Input: Audio/Text/Image]
  ↓
  [AI Translation & Image Analyzer]
  ↓
  [PostGIS Coordinates Intersector]
  ↓
  [Constituency Database Storage]
  ↓
  [MP Priority Scoring Weight Sliders]
  ↓
  [Ranked Projects & Executive Reports]

    
    ---
    
    ## 4. Project Structure
    
    
  peoples-priority/
  ├── data/                    # Geopolitical shapefiles & constituency indexes
  ├── scripts/                 # Asset builders & geojson compilers
  ├── app.js                   # Client-side routing, navigation & i18n logic
  ├── constituency-engine.js   # Calculations, weights & map rendering code
  ├── index.html               # Multi-portal user interface
  ├── styles.css               # Core design system & responsive media overrides
  └── README.md                # System documentation

    
    ---
    
    ## 5. Getting Started
    
    Follow these steps to run the application locally:
    
    1. **Clone the Repo**:
       ```bash
       git clone https://github.com/username/peoples-priority.git
       cd peoples-priority
    
  2. Start the Local HTTP Server:
    python -m http.server 8080
    
  3. Launch the Portal:
  Open http://localhost:8080 in your browser.
  ──────
  ## 6. API Reference

   Method                                                    | Endpoint                                                  | Description
  -----------------------------------------------------------|-----------------------------------------------------------|-----------------------------------------------------------
    POST                                                     |  /api/feedback                                            | Accepts text, audio notes, and photos from citizens.
    GET                                                      |  /api/feedback                                            | Lists incoming complaints filtered by theme and state.
    GET                                                      |  /api/geo/heatmap                                         | Generates demand and infrastructure gap hot spot points.
    GET                                                      |  /api/dashboard/overview                                  | Fetches aggregated KPIs and recent feedback feeds.
    POST                                                     |  /api/recommendations                                     | Triggers project prioritisation score rankings.
  ──────
  ## 7. AI Pipeline

  1. Audio Transcription: Whisper v3 converts regional speech notes to string transcripts.
  2. Dynamic Translation: Bhashini translates inputs from 6 regional languages (Hindi, Tamil, Telugu, Kannada, Bengali) to English.
  3. Parameters Extraction: Llama 3 parses named entities (NER), topic category, and severity sentiment index.
  4. Issue Validation: ResNet-50 inspects citizen photos to verify infrastructure faults.
  ──────
  ## 8. Team & Tasks

  • Ingestion Pipeline: Automated channel routing (WhatsApp/SMS/IVR) and device access prompts.
  • Geospatial Engine: Coordinate overlays and shapefile database setup.
  • Prioritization Scoring: Tunable slider weight calculations and priority score lists.
  • Accessibility & UI: Custom mobile drawer menus, 44px tap targets, high color contrast, and automatic iOS zoom overrides.
  ──────
  ## 9. Contributing

  1. Fork the Project.
  2. Create a Feature Branch ( git checkout -b feature/NewFeature ).
  3. Commit Changes ( git commit -m 'Add NewFeature' ).
  4. Push to Branch ( git push origin feature/NewFeature ).
  5. Open a Pull Request.

# People's Priority

People's Priority is an AI-powered citizen engagement platform that enables Members of Parliament (MPs) to make evidence-based development decisions. The platform collects multilingual citizen feedback, analyzes it using AI, integrates public datasets, and prioritizes development works based on measurable community needs.

---
## Overview

Traditional feedback systems rely heavily on complaint volume, making it difficult to identify the most impactful development priorities. People's Priority addresses this challenge by combining citizen feedback with infrastructure and demographic data to generate transparent, data-driven project recommendations.

---

## Key Features

- **Multi-Channel Feedback Collection**
  - Web Portal
  - WhatsApp
  - SMS
  - IVR
  - Voice, Text, and Image submissions

- **AI-Powered Processing**
  - Speech-to-Text Transcription
  - Image Analysis
  - Language Detection
  - Theme Classification
  - Sentiment & Severity Analysis
  - Automatic Issue Clustering

- **Geospatial Analytics**
  - Constituency Heatmaps
  - District-wise Demand Analysis
  - Theme Distribution

- **Public Dataset Integration**
  - Census Data
  - Literacy Statistics
  - Infrastructure Indicators
  - Educational Data

- **Intelligent Project Prioritization**
  - Citizen Demand
  - Infrastructure Gap
  - Population Impact
  - Budget & Cost Considerations

- **MP Dashboard**
  - Constituency Insights
  - Analytics & Trends
  - AI-Generated Summaries
  - Project Recommendations

---

## System Architecture

```text
Citizen Portal (Next.js)
          │
          ▼
      NestJS API
          │
          ▼
 PostgreSQL + PostGIS
          │
          ▼
 AI Processing Pipeline
          │
   ┌──────┴──────┐
   ▼             ▼
 Redis        MinIO
```

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js, React |
| Backend | NestJS |
| Database | PostgreSQL + PostGIS |
| ORM | Prisma |
| Cache | Redis |
| Object Storage | MinIO |
| AI Services | OpenAI API, Whisper |
| Deployment | Docker & Docker Compose |

---

## Demo Credentials

| Field | Value |
|------|------|
| Email | `mp@demo.gov.in` |
| Password | `mp123456` |
| Constituency | Delhi North |

---

## Priority Scoring Model

Projects are ranked using a weighted scoring model that combines:

- Citizen Demand
- Infrastructure Gap
- Population Impact
- Project Cost
- Budget Availability
- Development Plan Alignment

This enables objective and transparent prioritization of development initiatives.

---

## Project Structure

```text
Peoples-Priority/
│
├── backend/
│   ├── prisma/
│   └── src/
│
├── frontend/
│   ├── app/
│   └── components/
│
└── docker-compose.yml
```

---

## License

This project is licensed under the **MIT License**.

# Peoples Priority

An AI-powered citizen feedback platform that helps Members of Parliament (MPs) make evidence-based development decisions by collecting, analyzing, and prioritizing citizen feedback across multiple channels.

## Features

- **Multi-channel feedback** — Web, mobile, WhatsApp, voice recordings, text, and image uploads
- **Multilingual AI processing** — Language detection, speech-to-text, theme classification, sentiment analysis
- **Image analysis** — Infrastructure issue detection from citizen photos
- **Theme detection** — Groups similar requests (roads, water, education, etc.)
- **Geographic demand mapping** — Heatmaps and district-level demand hotspots
- **Public dataset integration** — Census, literacy, enrollment, infrastructure indicators
- **Project recommendation engine** — Priority scoring combining demand, impact, cost, and budget
- **MP Dashboard** — Analytics, trends, recommendations, and AI-generated summaries

## Architecture

```
Citizen Portal (Next.js)  →  API (NestJS)  →  PostgreSQL + PostGIS
                                    ↓
                              AI Processing Pipeline
                                    ↓
                              Redis Cache / MinIO Storage
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (with PostGIS), Redis, and MinIO.

### 2. Backend setup

```bash
cd backend
cp ../.env.example .env
npm install
npx prisma db push
npm run seed
npm run start:dev
```

API runs at `http://localhost:3001` — Swagger docs at `http://localhost:3001/api/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Web app runs at `http://localhost:3000`

### Demo credentials

- **MP Dashboard**: `mp@demo.gov.in` / `mp123456`
- **Constituency**: Delhi North (pre-seeded with sample feedback)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/feedback` | Submit feedback (multipart: text, voice, images) |
| `GET /api/feedback` | List feedback with filters |
| `GET /api/themes/stats` | Theme statistics |
| `GET /api/geo/heatmap` | Geographic demand heatmap |
| `GET /api/geo/district-demand` | Demand by district |
| `GET /api/dashboard/overview` | Full MP dashboard data |
| `POST /api/recommendations/generate/:id` | Generate project recommendations |
| `GET /api/public-data/district/:id` | District demographic indicators |

## AI Configuration

The platform works out-of-the-box with mock AI processing. For production:

```env
OPENAI_API_KEY=sk-...          # LLM summarization, image analysis, translation
WHISPER_API_URL=http://...     # Speech-to-text service
```

## Project Structure

```
Peoples-priority/
├── backend/                 # NestJS API
│   ├── prisma/              # Database schema & seed
│   └── src/
│       ├── ai/              # AI processing pipeline
│       ├── feedback/        # Feedback collection
│       ├── themes/          # Theme detection
│       ├── geo/               # Geographic mapping
│       ├── recommendations/ # Priority engine
│       └── dashboard/       # MP dashboard API
├── frontend/                # Next.js web app
│   └── src/
│       ├── app/             # Pages (home, submit, dashboard)
│       └── components/      # UI components, maps, charts
└── docker-compose.yml       # PostgreSQL, Redis, MinIO
```

## Priority Scoring Formula

```
Priority = (Demand × 0.35) + (Impact × 0.25) + (CostFactor × 0.15) + (Budget × 0.15) + (PlanAlignment × 0.10)
```

Where demand comes from citizen request volume, impact from population and infrastructure gaps, and cost/budget from project estimates and allocation data.

## License

MIT

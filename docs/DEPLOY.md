# HAYAT - Deployment Guide

This guide covers production deployment for both the HAYAT Front-End and the Python FastAPI Backend sidecar for the **Future Health Digital Innovation Challenge** (Abu Dhabi).

---

## Architecture Overview

```
                         +-----------------------------------+
                         |         End-User Browser          |
                         |  (On-Device Rule Engine & Store)  |
                         +-----------------+-----------------+
                                           |
               +---------------------------+---------------------------+
               | (Optional AI plain text)                              | (Opt-in Anonymised Stats)
               v                                                       v
+-------------------------------+                     +-------------------------------+
|     FastAPI Backend Sidecar   |                     |     FastAPI Backend Sidecar   |
|       POST /api/explain       |                     |    POST /api/research-share   |
| (Enum factor IDs only, NO PII)|                     |  (Age bracket & totals only)  |
+---------------+---------------+                     +---------------+---------------+
                |                                                     |
                v                                                     v
  +---------------------------+                         +---------------------------+
  |    Google Gemini 2.5      |                         |      Firestore / SQLite   |
  |  (Safety Guardrails Active|                         |    (Anonymised Aggregates)|
  +---------------------------+                         +---------------------------+
```

---

## 1. Front-End Deployment

The front-end is a static single-page application (SPA) built with Vite, React 19, and Tailwind CSS. It can be hosted on any static hosting platform, such as **Cloudflare Pages**, **Vercel**, **Netlify**, or **Google Cloud Storage + Cloud CDN**.

### Build Command
```bash
npm install --legacy-peer-deps
npm run build
```
The output is generated in `./dist`.

### Required Environment Variables
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_USE_MOCK` | When `'false'`, enables calls to the FastAPI sidecar. When `'true'`, runs entirely offline with local mock fallbacks. | `'false'` |
| `VITE_API_BASE` | Base URL pointing to the deployed FastAPI sidecar. | `https://api.hayat.health/api` |

### Static Web Server Routing (SPA Fallback)
Ensure all unknown paths rewrite to `/index.html`.
- **Nginx**:
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **Vercel (`vercel.json`)**:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Netlify (`_redirects`)**:
  ```
  /*    /index.html   200
  ```

---

## 2. FastAPI Backend Sidecar Deployment

The backend is containerised with Docker and can be deployed to **Google Cloud Run**, **Azure Container Apps**, or **AWS ECS**.

### Docker Build & Run
```bash
cd backend
docker build -t hayat-backend:latest .
docker run -p 8000:8000 \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  -e CORS_ORIGINS="https://hayat.health" \
  hayat-backend:latest
```

### Google Cloud Run Deployment
```bash
gcloud run deploy hayat-backend \
  --source ./backend \
  --region me-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="projects/${PROJECT_ID}/secrets/gemini-api-key/versions/latest" \
  --set-env-vars CORS_ORIGINS="https://hayat.health" \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

### Backend Environment Variables
| Variable | Description | Required |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key used for plain-language factor rewriting. If omitted, the service falls back gracefully to deterministic rule templates. | Optional (recommended) |
| `GEMINI_MODEL` | Gemini model ID. Defaults to `gemini-2.5-flash`. | Optional |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins. | Required in production |
| `RATE_LIMIT_PER_MINUTE` | Rate limit per IP address for endpoints (default: `20/minute`). | Optional |
| `DATABASE_URL` | Optional Firestore or SQLite connection URL. If omitted, falls back to local SQLite at `backend/data/research_aggregates.db`. | Optional |

---

## 3. Verification & Smoke Testing

### 1. Backend Healthcheck
```bash
curl -s https://api.hayat.health/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "gemini_configured": true,
  "active_model": "models/gemini-2.5-flash",
  "timestamp": "..."
}
```

### 2. Zero-PII Explain Endpoint
```bash
curl -X POST https://api.hayat.health/api/explain \
  -H "Content-Type: application/json" \
  -d '{
    "band": "Moderate",
    "triage_level": "Primary care",
    "language": "en",
    "mode": "simple",
    "factors": [
      { "id": "smoking_occasional", "direction": "raises", "modifiable": true },
      { "id": "sleep_short", "direction": "raises", "modifiable": true }
    ]
  }'
```
Expected response:
```json
{
  "explanation": "...",
  "ai_used": true,
  "language": "en",
  "model": "models/gemini-2.5-flash"
}
```

### 3. Front-End Offline Integrity
Even if the backend sidecar is completely stopped or unreachable, the front-end will:
1. Complete 100% of the screening on-device using the TypeScript rule engine.
2. Render deterministic, clinically vetted explanations in English, Arabic, or Hindi.
3. Allow full What-If simulation, clinic navigation, and printable PDF generation without failure.

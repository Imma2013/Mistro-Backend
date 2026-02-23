# Astrid Backend

## Quick Start
1. Copy `.env.example` to `.env`
2. Install deps: `npm install`
3. Run dev server: `npm run dev`

## Base URL
- Local: `http://localhost:5000`
- Health: `GET /api/health`

## Available MVP Routes
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/jobs/search/live?q=&location=&page=`
- `POST /api/jobs/ingest`
- `POST /api/jobs/scrape`
- `GET /api/saved-jobs`
- `POST /api/saved-jobs`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/notifications`
- `POST /api/notifications/read-all`
- `GET /api/companies/:companyId/reviews?companyName=`
- `GET /api/companies/:companyId/hire-rate?companyName=&ticker=`
- `GET /api/companies/:companyId/job-stats?companyName=&jobTitle=`
- `POST /api/resumax/score` (free)
- `POST /api/resumax/optimize` (paid, send `x-user-plan: paid`)
- `POST /api/resumax/export` (paid, send `x-user-plan: paid`)
- `GET /api/billing/status`
- `POST /api/billing/checkout`
- `POST /api/sync/push`
- `POST /api/sync/pull`

## Notes
- Ingest uses SerpAPI when `SERPAPI_KEY` is set.
- Normalization uses Gemini when `GEMINI_API_KEY` is set and falls back to heuristics.
- Reviews/hire-rate include provider fallbacks when upstream keys are missing.
- Job-specific stats endpoint includes:
  - interview success rate proxy (offer outcomes from interview records)
  - applicant selectivity rate proxy (1/applicantCount benchmark)
  - low-sample and stale-data handling safeguards.

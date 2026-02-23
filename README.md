# Mistro Backend

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
- `GET /api/jobs/:id/stats`
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
- Backend normalization via Gemini is optional and disabled by default:
  - set `ENABLE_GEMINI_NORMALIZATION=true` and `GEMINI_API_KEY` only if you want it.
  - otherwise the backend uses heuristic normalization.
- Reviews/hire-rate include provider fallbacks when upstream keys are missing.
- Monthly auto-refresh is built in (cron):
  - controls: `AUTO_REFRESH_ENABLED`, `AUTO_REFRESH_CRON`, `AUTO_REFRESH_QUERY`, `AUTO_REFRESH_LOCATION`, `AUTO_REFRESH_PAGES`, `AUTO_REFRESH_COMPANY_LIMIT`
  - refreshes jobs ingest + cached company reviews + hire-rate snapshots.
- Job-specific stats endpoint includes:
  - interview success rate proxy (offer outcomes from interview records)
  - applicant selectivity rate proxy (1/applicantCount benchmark)
  - low-sample and stale-data handling safeguards.

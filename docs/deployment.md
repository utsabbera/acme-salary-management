# Deployment Guide

The application is continuously deployed via a GitHub Actions pipeline (`.github/workflows/deploy.yml`). 
Every push to `main` automatically runs CI (lint, typecheck, tests) and, if all checks pass, deploys the changed stack(s) to production. 

The pipeline is path-filtered — a backend-only change never triggers a frontend deploy, and vice versa.

| Service | Platform | Trigger |
|---------|----------|---------|
| Backend | [Render](https://render.com) | Render Deploy Hook |
| Frontend | [Vercel](https://vercel.com) | Vercel CLI (`vercel deploy --prebuilt`) |
| Database | [Neon](https://neon.tech) | n/a (managed PostgreSQL) |

## First-time setup

If you are forking this repository and want to set up your own deployment pipeline, follow these steps:

1. **Neon** — Create a project, copy the **pooled** connection string.
2. **Render** — Create a Web Service from this repo using the `render.yaml` Blueprint.
   Set `DATABASE_URL` to the Neon connection string and `CORS_ORIGINS` to your Vercel URL.
3. **Vercel** — Import this repo, set **Root Directory** to `frontend/`, add
   `NEXT_PUBLIC_API_URL` pointing to your Render backend URL.
4. **GitHub secrets** — Add the following under *Settings → Secrets and variables → Actions → Repository secrets*:

| Secret | Where to find it |
|--------|------------------|
| `RENDER_DEPLOY_HOOK_URL` | Render Dashboard → Service → Settings → Deploy Hook |
| `VERCEL_TOKEN` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | vercel.com/account (Personal) or team Settings |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General |

## Seeding production data

Once deployed, you can seed the production database from your local machine:

```bash
DATABASE_URL="<neon-pooled-url>" make seed   # populates 10,000 employees
```

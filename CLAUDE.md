# CLAUDE.md

SingLah: karaoke lyrics player. React/Vite SPA at the root, FastAPI party-mode relay in `backend/`.

## Commands

```bash
npm ci --legacy-peer-deps   # CI uses this flag; postinstall copies the kuromoji dict to public/dict
npm run dev
npm run build               # tsc -b && vite build (this is the frontend CI check)
npm run lint

cd backend && pip install -r requirements.txt -r requirements-dev.txt && python -m pytest -q
uvicorn main:app --reload --app-dir backend   # local party server
```

CI (`test.yml`) runs backend pytest and the frontend build on PRs and main.

## Deploy

Both deploy automatically on every push to `main`, docs-only pushes included:
- Frontend: GitHub Pages via `.github/workflows/deploy.yml` (singlah.kooexperience.com).
  `VITE_PARTY_BACKEND_URL` is baked in at build time from a repo secret.
- Backend: Railway project `natural-clarity`, built from `backend/Dockerfile` (`backend/railway.json`).

## Gotchas

- Party rooms live in process memory: a backend redeploy drops every open room, and it must stay one replica.
- CORS and the WebSocket origin check allow only `https://singlah.kooexperience.com` plus localhost (hardcoded in `backend/main.py`). A new domain needs a code change.
- Host actions need the host token returned by `POST /rooms`. Keep the token check when touching the relay.
- Rate limits key on `X-Real-IP` (set by Railway's edge). Do not switch to `X-Forwarded-For`, which clients can spoof.
- Song ID (AcoustID/Chromaprint) was removed as unreliable. Don't reintroduce it.

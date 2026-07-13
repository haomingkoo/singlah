# CLAUDE.md

SingLah — multilingual karaoke lyrics player with romanization (Pinyin, Romaji,
Korean), audio-based song identification, and a real-time party mode.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4, React Router
- **Backend**: FastAPI (Python) — WebSocket relay for party mode only
- **Storage**: IndexedDB (offline saved songs), no frontend database
- **Key libs**: kuroshiro (Japanese), pinyin-pro (Chinese), aromanize (Korean),
  rusty-chromaprint-wasm + AcoustID API (song ID), lrclib.net API (lyrics)
- **Deploy**: Frontend → GitHub Pages (`.github/workflows/deploy.yml`),
  Backend → Railway (Docker)

## Commands

```bash
npm install          # install deps (postinstall copies kuromoji dict to public/dict)
npm run dev           # start Vite dev server
npm run build          # tsc -b && vite build
npm run lint            # eslint .
npm run preview          # preview production build

# backend
pip install -r backend/requirements.txt
uvicorn main:app --reload --app-dir backend   # local party-mode server
```

No test suite exists in this repo.

## Architecture

- **`src/App.tsx`**: routes — `/` (search), `/saved`, `/play/:songId`
- **`src/lib/songIdentifier.ts`**: records mic audio, fingerprints via
  chromaprint WASM, looks up AcoustID for title/artist
- **`src/lib/lrclib.ts`**: fetches synced lyrics from lrclib.net
- **`src/lib/romanizer/`**: per-language romanization + ruby-text tokenizers
  (Chinese/Japanese/Korean), dispatched by `index.ts`
- **`src/lib/offlineStore.ts`** + **`src/hooks/useOfflineSongs.ts`**: IndexedDB
  persistence for saved songs
- **`src/lib/partySocket.ts`** + **`src/hooks/usePartyMode.ts`**: WebSocket
  client for synced multi-device playback
- **`backend/main.py`**: FastAPI app — `POST /rooms` creates a 4-digit room
  code, `GET /rooms/{code}` checks existence, `WS /ws/{code}` relays
  `sync`/`song_change` events from host to clients (in-memory rooms, no DB,
  stale rooms cleaned up after 1hr idle)
- **`src/components/player/`**: karaoke UI (lyrics scroller, pitch visualizer,
  party panel, word popups)

## Env Vars

- `VITE_ACOUSTID_API_KEY` — AcoustID lookup key
- `VITE_PARTY_BACKEND_URL` — Railway backend URL for party mode

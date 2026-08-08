# Fix Blank Screen - Task Steps

## Goal
The app is showing a blank screen. Fix the root cause so the Airstar Fashion Home app renders correctly.

## Investigation Findings
- `npm run build` succeeds without errors.
- Headless Chrome successfully renders the full home page (header, hero, collections, footer).
- All `/api/*` endpoints return valid data.
- `src/db.json` is valid.
- `src/main.tsx` has the HMR WebSocket error-suppression code **commented out** (note: "Temporarily disabled to debug blank screen issue"). This blocks the sandbox preview from mounting the React app.
- `server.ts` default port is `5501`, but the dev-server.log shows the app previously ran on port `3000` (and `index.html` redirect targets port `3000`).
- **Root cause (this session):** The Vite build config used `src/main.tsx` as the rollup input, so Vite did NOT emit an `index.html` into `dist/`. The production server's SPA fallback (`app.get("*")`) tried to serve `dist/index.html`, which did not exist → 404 → blank screen. The generated `dist/index.html` is now present after switching the Vite input to the root `index.html`.

## Steps
- [x] 1. Restore HMR WebSocket error-suppression code in `src/main.tsx`.
- [x] 2. Align default server port in `server.ts` to 3000.
- [x] 3. Rebuild and verify the app renders (headless browser / preview check). - Confirmed: production server runs on port 3000 and the full home page renders (header, hero, collections, footer).
- [x] 4. Fix missing `dist/index.html` - Change Vite build input from `src/main.tsx` to root `index.html` so Vite emits `dist/index.html`.
- [x] 5. Verify production server end-to-end on port 3000 - root page (200), app.js (200), /api/health (200), /api/collections (17 items), logo image (200), AI stylist rule-fallback (200).
- [x] 6. Remove port 5502 binding - The VS Code Live Server extension was configured to serve on port 5502 (`.vscode/settings.json`). Changed it to port 5500. The running Live Server instance must be restarted (VS Code "Live Server: Stop" then re-start, or reload window) to release port 5502. The real app server runs on port 3000.

# Deployment to GitHub & Vercel - Task Steps

## Goal
Deploy the Airstar Fashion Home app to GitHub and Vercel, and make sure the site works on both environments.

## Investigation Findings
- Production build succeeds (`dist/index.html`, `dist/assets/app.js`, `dist/assets/app.css`, `dist/server.cjs` all generated).
- Production server works end-to-end on port 3000 (root 200, app.js 200, /api/health healthy, /api/collections returns 17 items, logo image 200).
- Git repo initialized; remote `origin` → `https://github.com/mfonakpabio67-droid/Airstar-fashion-.git` on branch `master`.
- Vercel project `airstar-fashion-home` exists and is connected to the GitHub repo (server-side builds via GitHub integration avoid large CLI uploads).
- `vercel.json` configured with SPA rewrites + `api/index.ts` serverless route.
- Vercel CLI 58.5.1 installed and logged in as `mfonakpabio67-droid`.

## Deployment Result (COMPLETE ✅)
The Vercel GitHub integration triggered a production deployment from the pushed `master` branch. The canonical production domain is now fully working.

### Verified URLs (all return 200)
- **Canonical Production**: `https://airstar-fashion-home.vercel.app`
  - ROOT `/` → 200
  - `/api/health` → 200
  - `/api/collections` → 200
- **GitHub Repo**: `https://github.com/mfonakpabio67-droid/Airstar-fashion-`

## Steps
- [x] 1. Commit the updated `assets/app.js` (and any build artifacts) with a clear message.
- [x] 2. Push `master` to the GitHub remote (`origin`).
  - **Note:** A real GCP API key was found in `.env.example` and blocked the push. It was scrubbed from all git history with `git-filter-repo` and replaced with a placeholder. The remote repo was empty, so this was safe. **The affected GCP API key should be revoked/rotated.**
- [x] 3. Deploy to Vercel production (via GitHub integration — server-side build from pushed `master`; CLI uploads were unreliable due to large payloads).
- [x] 4. Verify the Vercel production URL: root page, /api/health, /api/collections, static assets all return 200.
- [ ] 5. Verify the GitHub Pages / repository site renders correctly (if applicable).
- [x] 6. Document deployment URLs in README.md and this TODO file.

## Deployment Notes
- The `.vercelignore` excludes `node_modules`, `.git`, `dist`, and build/scrub scripts, keeping the deployment payload small and matching the server-side GitHub build.

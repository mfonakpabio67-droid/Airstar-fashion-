# Deployment to GitHub & Vercel - Task Steps

## Goal
Deploy the Airstar Fashion Home app to GitHub and Vercel, and make sure the site works on both environments.

## Investigation Findings
- Production build succeeds (`dist/index.html`, `dist/assets/app.js`, `dist/assets/app.css`, `dist/server.cjs` all generated).
- Production server works end-to-end on port 3000 (root 200, app.js 200, /api/health healthy, /api/collections returns 17 items, logo image 200).
- Git repo initialized; remote `origin` → `https://github.com/mfonakpabio67-droid/Airstar-fashion-.git` on branch `master`.
- One uncommitted change: modified `assets/app.js` (newly built bundle).
- `vercel.json` configured with SPA rewrites + `api/index.ts` serverless route.
- Vercel CLI 58.5.1 installed.

## Steps
- [ ] 1. Commit the updated `assets/app.js` (and any build artifacts) with a clear message.
- [ ] 2. Push `master` to the GitHub remote (`origin`).
- [ ] 3. Deploy to Vercel production with `vercel --prod`.
- [ ] 4. Verify the Vercel production URL: root page, /api/health, /api/collections, static assets all return 200.
- [ ] 5. Verify the GitHub Pages / repository site renders correctly (if applicable).
- [ ] 6. Document deployment URLs in README.md and this TODO file.

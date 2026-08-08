# Airstar Fashion Home

A premier digital women's fashion boutique, custom tailoring house, and luxury couture atelier. Providing custom luxury traditional attire, exquisite bridal gowns, and bespoke tailoring blueprints with precise, digital craftsmanship.

---

## ✦ The Brand Concept
Located in **Nung Uyo, Idoro, Akwa Ibom State**, Airstar Fashion Home bridges the gap between historical heritage tailoring and modern haute couture. We specialize exclusively in celebrating female beauty, majesty, and elegance. From authentic local laces and premium imported raw silks to custom hand-beaded bridal wear, every garment is treated as a masterpiece of wearable art.

---

## ✦ Core Features

### 1. The Bespoke Couture Builder
- Choose your premium silhouette (Ethereal Bridal, Royal Kaftan, Boubou, Ankara Power Suit).
- Select exquisite fabrics, custom necklines, premium embroidery patterns, and intricate sleeve drapes.
- Estimate your budget instantly based on fabric volume and embellishment selections.

### 2. Private Atelier Fitting & Measurement Scheduler
- Book face-to-face appointments or digital pattern draping slots.
- Schedule physical or virtual fittings at specified windows (Mockup Structural, Contour Lining, Final Dress Drop).

### 3. Digital Sizing Matrix
- Create and store highly granular anatomical profiles (Bust, Waist, High Hip, Shoulder-to-Waist, Apex Height, Sleeve Inseam).
- Securely track measurements assigned to specific master tailors and pattern drapers.

### 4. Real-time Production Tracker
- Follow the journey of your gown with 12 real-time staging states:
  `Order Received` ➔ `Design Review` ➔ `Fabric Selection` ➔ `Pattern Drafting` ➔ `Cutting` ➔ `Sewing` ➔ `First Fitting` ➔ `Alterations` ➔ `Quality Inspection` ➔ `Packaging` ➔ `Ready for Pickup` ➔ `Delivered`

### 5. AI Fashion Concierge (Esther)
- Receive warm, professional, high-fashion styling advice from our digital concierge, Esther.
- Get suggestions for colors, fabrics, local drapes, and traditional Akwa Ibom laces.

### 6. Secure Operations Admin Dashboard
- Restricted admin panel to manage orders, update production phases, adjust fabrics inventory quantities, and process client inquiries.
- **Access Credentials**: Secured with Gmail verification and a secret system access key.

---

## ✦ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, and standard custom marquee animations.
- **Backend**: Express (Node.js), providing high-speed RESTful JSON interfaces.
- **Database**: In-memory DB state machine initialized from template seeds, supporting Vercel read-only filesystem fallbacks.

---

## ✦ Environment & Deployment Guide

This project is fully structured for simple, single-click deployments to **GitHub** and **Vercel** with full hybrid capability.

### 1. GitHub Repository Push
Initialize Git and push the repository to your GitHub account:
```bash
git init
git add .
git commit -m "Initial release: Airstar Custom Couture"
# Link and push to your private/public GitHub repo
```

### 2. Local Development
To run the server and frontend concurrently on your local machine:
```bash
# Install dependencies
npm install

# Run full-stack dev server (Express + Vite HMR)
npm run dev
```
The application will boot on `http://localhost:3000`.

### 3. Vercel Serverless Deployment
Airstar includes a seamless `vercel.json` rewrite configuration and a dedicated serverless route at `/api/index.ts`. To deploy to Vercel:

1. Import the GitHub repository in the **Vercel Dashboard**.
2. Vercel will automatically auto-detect the Vite build.
3. Keep default settings (Vercel automatically builds static assets using `npm run build` and serves `/api/*` endpoints using serverless functions).
4. (Optional) Set the `GEMINI_API_KEY` in Vercel environment variables to enable the AI Fashion Concierge.

---

## ✦ Operational Support & Protocol
For administrative assistance or custom inquiries regarding fabric cutting and drapes, reach out to the design drapers at `estherudoisang7@gmail.com`.

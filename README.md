# Nutriya — Daily Nutrition & Meal Planner PWA

A mobile-first, production-grade Progressive Web App (PWA) designed for personalized daily nutrition, micronutrients, hydration, sunlight exposure, and body weight tracking calibrated with ICMR-NIN 2020 and IFCT 2017 standards.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and connected to **Neon Serverless PostgreSQL** via `@neondatabase/serverless`.

---

## 🚀 Key Highlights & Architecture

1. **Vercel + Neon DB Ready:**
   - Serverless Next.js App Router route handlers (`/api/rda`, `/api/foods`, `/api/prepped-portions`, `/api/diet-plans`, `/api/daily-logs`, `/api/seed`).
   - Zero-config deployment on Vercel with standard `DATABASE_URL`.
   - Automatic seeding on first run via `/api/seed` or client initialization.

2. **Offline-First Resilience:**
   - Full client state cached in `localStorage` under `batch_care_state_v1`.
   - Complete functionality offline with clean minimal cloud sync indicator and background sync when online.
   - One-tap **Export JSON Backup** and **Import JSON Backup** to prevent data loss.

3. **5-Tab Architecture:**
   - **Tab 1: Overview Dashboard (`#dashboard`):** Active diet plan hero card in botanical sage with 4 nutrient circular progress rings (Calories, Protein, Calcium, Vitamin D), and interactive lifestyle check-in widgets (Hydration +150ml/+250ml/+500ml/-250ml, UV-B sunlight 10am-2pm tracker, weight logger with dynamic sparkline).
   - **Tab 2: RDA Targets & Body Metrics (`#rda`):** User Body Metrics & Profile (Age, Height, Weight, live auto-calculated BMI with category badge), Menopausal quick-switch (Post-menopausal 11mg Iron & 1200mg Calcium vs Pre-menopausal 29mg Iron & 1000mg Calcium), categorized targets for Macros, Bone Minerals, Vitamins, and Lifestyle, side-by-side with ICMR-NIN 2020 references.
   - **Tab 3: Food Database & Portion Prep (`#fooddb`):** Sub-View A features all 38 IFCT 2017 & USDA food items across 18 nutrients with custom food modal; Sub-View B allows configuring custom weight (g/ml) or multipliers into the Ready Menu Pool.
   - **Tab 4: Diet Builder & Saved Plans (`#builder`):** Switch between the 4 starter templates (*Plan A: High-Calcium Bone Focus*, *Plan B: High-Protein Lean Day*, *Plan C: Vegetarian Paneer & Dal*, *Plan D: Light Iron & Antioxidant Boost*) or create unlimited custom plans. Features structured category slots and a live floating totalizer strip for kcal, protein, calcium, iron, sodium, and cholesterol.
   - **Tab 5: Analysis & Doctor Summary (`#analysis`):** 18-nutrient progress grid color-coded by clinical status (Optimal, Caution, Alert), dynamic source-cited clinical evaluation engine (Calcium split-dose saturation, Vit D loading necessity, Iron vs Calcium timing, lipid & sodium guardrails, night meal caloric sufficiency), multi-plan comparison matrix, and **Print / PDF Summary** with `@media print` A4 formatting.

4. **Progressive Web App (PWA):**
   - Web App Manifest (`manifest.json`)
   - Service Worker (`sw.js`) with cache-first static strategy & network-first API fallback
   - 192x192 and 512x512 app icons featuring the botanical sage & sun/leaf emblem
   - iOS meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`)

---

## 🛠️ Local Development

1. **Clone repository & install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create `.env.local`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   ```

3. **Run database seed script (optional, runs automatically):**
   ```bash
   node scripts/seed-all.mjs
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## ☁️ Deploy to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In Vercel, click **Add New Project** and select this repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: your Neon connection string.
4. Click **Deploy**. Vercel will build the Next.js App Router app with zero configuration.

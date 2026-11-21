# Nutriya

Nutriya is a mobile-first, personalized daily nutrition, meal planner, and wellness Progressive Web App (PWA).

## Features

- **Personalized Profile & Body Metrics**: Dynamic BMI calculation, demographic profiles, and user-customizable nutritional targets aligned with ICMR-NIN 2020 standards.
- **Diet Builder & Plan Manager**: Multi-plan template selector with "Set as Default" persistence, category-based meal slots, and live nutrient totaling.
- **18-Nutrient Inspection & Portion Scaling**: Detailed nutrient breakdown and adjustable portion sizing across verified IFCT 2017 & USDA food items.
- **Wellness Tracking Dashboard**: Real-time progress monitoring for energy, protein, calcium, vitamin D, daily hydration, sunlight exposure, and weight trends.
- **Offline-First Resilience**: Full offline capability with local caching and seamless cloud synchronization.
- **Progressive Web App**: Installable on mobile and desktop devices with responsive layout and standalone mode.

## Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Icons & Animation**: Lucide React & Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Neon Serverless PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vjay-12/Nutriya.git
   cd Nutriya
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and provide your database connection string:
   ```bash
   cp .env.example .env.local
   ```
   In `.env.local`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   ```

4. Run database seed (optional, automatically seeds on first launch):
   ```bash
   node scripts/seed-all.mjs
   ```

### Commands

- `npm run dev` — Start the local development server at `http://localhost:3000`
- `npm run build` — Create an optimized production build
- `npm run start` — Run the production server
- `npm run lint` — Run ESLint code quality checks

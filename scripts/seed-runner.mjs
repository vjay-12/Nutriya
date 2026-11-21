import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local
const envPath = path.resolve('.env.local');
let dbUrl = process.env.DATABASE_URL;
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.substring('DATABASE_URL='.length).trim();
    }
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(dbUrl);

async function runSeed() {
  console.log('Connecting to Neon PostgreSQL...');

  // 1. Create Tables one by one
  console.log('Creating table rda_targets...');
  await sql`
    CREATE TABLE IF NOT EXISTS rda_targets (
      id TEXT PRIMARY KEY DEFAULT 'default',
      user_id TEXT NOT NULL DEFAULT 'patient_1',
      menopausal_status TEXT NOT NULL DEFAULT 'post',
      age INTEGER NOT NULL DEFAULT 50,
      height_cm NUMERIC(5,2) NOT NULL DEFAULT 156.0,
      target_weight_kg NUMERIC(5,2) NOT NULL DEFAULT 53.0,
      energy_min NUMERIC(7,1) NOT NULL DEFAULT 1600.0,
      energy_max NUMERIC(7,1) NOT NULL DEFAULT 1800.0,
      protein_min NUMERIC(6,1) NOT NULL DEFAULT 53.0,
      protein_max NUMERIC(6,1) NOT NULL DEFAULT 64.0,
      fibre_min NUMERIC(6,1) NOT NULL DEFAULT 25.0,
      fibre_max NUMERIC(6,1) NOT NULL DEFAULT 30.0,
      sodium_max NUMERIC(7,1) NOT NULL DEFAULT 2000.0,
      cholesterol_max NUMERIC(7,1) NOT NULL DEFAULT 300.0,
      calcium_min NUMERIC(7,1) NOT NULL DEFAULT 1200.0,
      calcium_max NUMERIC(7,1) NOT NULL DEFAULT 2000.0,
      phosphorus_min NUMERIC(7,1) NOT NULL DEFAULT 700.0,
      phosphorus_max NUMERIC(7,1) NOT NULL DEFAULT 1000.0,
      magnesium_min NUMERIC(6,1) NOT NULL DEFAULT 350.0,
      magnesium_max NUMERIC(6,1) NOT NULL DEFAULT 400.0,
      iron NUMERIC(6,1) NOT NULL DEFAULT 11.0,
      zinc_min NUMERIC(6,1) NOT NULL DEFAULT 10.0,
      zinc_max NUMERIC(6,1) NOT NULL DEFAULT 13.2,
      potassium NUMERIC(7,1) NOT NULL DEFAULT 3500.0,
      vitamin_d_min NUMERIC(6,1) NOT NULL DEFAULT 20.0,
      vitamin_d_max NUMERIC(6,1) NOT NULL DEFAULT 25.0,
      vitamin_c_min NUMERIC(6,1) NOT NULL DEFAULT 75.0,
      vitamin_c_max NUMERIC(6,1) NOT NULL DEFAULT 100.0,
      vitamin_k_min NUMERIC(6,1) NOT NULL DEFAULT 55.0,
      vitamin_k_max NUMERIC(6,1) NOT NULL DEFAULT 90.0,
      vitamin_b12 NUMERIC(6,2) NOT NULL DEFAULT 2.2,
      water_target_ml INTEGER NOT NULL DEFAULT 2250,
      sunlight_target_mins INTEGER NOT NULL DEFAULT 20,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('Creating table food_items...');
  await sql`
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      base_unit TEXT NOT NULL,
      base_weight_g NUMERIC(7,2) NOT NULL DEFAULT 100.0,
      calories NUMERIC(7,1) NOT NULL DEFAULT 0,
      protein NUMERIC(7,2) NOT NULL DEFAULT 0,
      carbs NUMERIC(7,2) NOT NULL DEFAULT 0,
      fat NUMERIC(7,2) NOT NULL DEFAULT 0,
      saturated_fat NUMERIC(7,2) NOT NULL DEFAULT 0,
      cholesterol NUMERIC(7,2) NOT NULL DEFAULT 0,
      fibre NUMERIC(7,2) NOT NULL DEFAULT 0,
      sodium NUMERIC(7,2) NOT NULL DEFAULT 0,
      calcium NUMERIC(7,2) NOT NULL DEFAULT 0,
      phosphorus NUMERIC(7,2) NOT NULL DEFAULT 0,
      iron NUMERIC(7,2) NOT NULL DEFAULT 0,
      potassium NUMERIC(7,2) NOT NULL DEFAULT 0,
      magnesium NUMERIC(7,2) NOT NULL DEFAULT 0,
      zinc NUMERIC(7,2) NOT NULL DEFAULT 0,
      vitamin_b12 NUMERIC(7,2) NOT NULL DEFAULT 0,
      vitamin_c NUMERIC(7,2) NOT NULL DEFAULT 0,
      vitamin_k NUMERIC(7,2) NOT NULL DEFAULT 0,
      vitamin_d NUMERIC(7,2) NOT NULL DEFAULT 0,
      is_custom BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('Creating table prepped_portions...');
  await sql`
    CREATE TABLE IF NOT EXISTS prepped_portions (
      id TEXT PRIMARY KEY,
      food_id TEXT NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      meal_slot TEXT NOT NULL,
      weight_g NUMERIC(7,2) NOT NULL,
      quantity_multiplier NUMERIC(6,2) NOT NULL DEFAULT 1.0,
      notes TEXT,
      is_default BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('Creating table diet_plans...');
  await sql`
    CREATE TABLE IF NOT EXISTS diet_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      planned_water_ml INTEGER NOT NULL DEFAULT 2250,
      planned_sunlight_mins INTEGER NOT NULL DEFAULT 20,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('Creating table diet_plan_items...');
  await sql`
    CREATE TABLE IF NOT EXISTS diet_plan_items (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
      meal_slot TEXT NOT NULL,
      food_id TEXT NOT NULL REFERENCES food_items(id) ON DELETE RESTRICT,
      portion_name TEXT NOT NULL,
      weight_g NUMERIC(7,2) NOT NULL,
      quantity NUMERIC(6,2) NOT NULL DEFAULT 1.0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('Creating table daily_logs...');
  await sql`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      water_intake_ml INTEGER NOT NULL DEFAULT 0,
      sunlight_mins INTEGER NOT NULL DEFAULT 0,
      body_weight_kg NUMERIC(5,2),
      bmi NUMERIC(4,1),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('All 6 tables created successfully. Now calling initAndSeedDatabase via tsx / seed module...');
}

runSeed()
  .then(() => console.log('Seed initialization script completed.'))
  .catch((err) => {
    console.error('Seed runner failed:', err);
    process.exit(1);
  });

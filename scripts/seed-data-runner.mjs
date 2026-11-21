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

const sql = neon(dbUrl);

// Read seed-data.ts lines or re-use JSON
// We can dynamically compile or load or read seed-data.ts:
// Or use node to execute the seed endpoint or function.
async function populate() {
  console.log('Seeding RDA Targets...');
  await sql`
    INSERT INTO rda_targets (
      id, user_id, menopausal_status, age, height_cm, target_weight_kg,
      energy_min, energy_max, protein_min, protein_max, fibre_min, fibre_max,
      sodium_max, cholesterol_max, calcium_min, calcium_max, phosphorus_min,
      phosphorus_max, magnesium_min, magnesium_max, iron, zinc_min, zinc_max,
      potassium, vitamin_d_min, vitamin_d_max, vitamin_c_min, vitamin_c_max,
      vitamin_k_min, vitamin_k_max, vitamin_b12, water_target_ml, sunlight_target_mins
    ) VALUES (
      'default', 'patient_1', 'post', 50, 156.0, 53.0,
      1600.0, 1800.0, 53.0, 64.0, 25.0, 30.0,
      2000.0, 300.0, 1200.0, 2000.0, 700.0,
      1000.0, 350.0, 400.0, 11.0, 10.0, 13.2,
      3500.0, 20.0, 25.0, 75.0, 100.0,
      55.0, 90.0, 2.2, 2250, 20
    )
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
  `;

  console.log('RDA Targets seeded.');
}

populate()
  .then(() => console.log('Base targets populated.'))
  .catch((err) => console.error('Error:', err));

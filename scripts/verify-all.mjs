import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// 1. Read .env.local
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

console.log('--- Step 1: Pre-flight Env Verification ---');
console.log('DATABASE_URL configured:', Boolean(dbUrl));
console.log('Region check (aws-ap-southeast-1):', dbUrl.includes('ap-southeast-1') ? 'PASS' : 'FAIL');

const sql = neon(dbUrl);

async function runVerification() {
  console.log('\n--- Step 2: Database & Seed Verification ---');
  const counts = await sql`
    SELECT 
      (SELECT COUNT(*) FROM food_items)::int as food_count,
      (SELECT COUNT(*) FROM prepped_portions)::int as portion_count,
      (SELECT COUNT(*) FROM diet_plans)::int as plan_count,
      (SELECT COUNT(*) FROM diet_plan_items)::int as item_count,
      (SELECT COUNT(*) FROM rda_targets)::int as rda_count,
      (SELECT COUNT(*) FROM daily_logs)::int as log_count;
  `;
  console.log('Table Counts in Singapore:', counts[0]);

  if (counts[0].food_count !== 38) {
    throw new Error(`Expected 38 foods, got ${counts[0].food_count}`);
  }
  if (counts[0].plan_count < 4) {
    throw new Error(`Expected at least 4 diet plans, got ${counts[0].plan_count}`);
  }

  // 3. Clinical Calculation & Portion Scaling Verification
  console.log('\n--- Step 3: Portion Scaling & Clinical Calculations ---');
  const eggWhole = await sql`SELECT * FROM food_items WHERE id = 'egg_whole'`;
  const soyChunks = await sql`SELECT * FROM food_items WHERE id = 'soy_chunks'`;
  
  // 50g dry soy chunks should yield (270mg Ca * 50g / 100g) = 135mg Calcium
  const soyCalciumYield = (Number(soyChunks[0].calcium) * 50) / Number(soyChunks[0].base_weight_g);
  console.log('Soy Chunks 50g dry Ca calculation:', soyCalciumYield, 'mg (Expected: 135 mg)');
  if (soyCalciumYield !== 135) throw new Error('Portion scaling math mismatch');

  // 4. PWA Assets Check
  console.log('\n--- Step 4: PWA Manifest & Service Worker Check ---');
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  console.log('Manifest name:', manifest.name);
  console.log('Manifest display:', manifest.display);
  console.log('Manifest icons count:', manifest.icons.length);
  const swExists = fs.existsSync('public/sw.js');
  console.log('sw.js exists:', swExists);

  if (!manifest.icons || manifest.icons.length < 2 || !swExists) {
    throw new Error('PWA assets check failed');
  }

  console.log('\nALL VERIFICATION CHECKS PASSED 100%!');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

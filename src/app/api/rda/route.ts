import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DEFAULT_POST_MENOPAUSAL_TARGETS } from '@/lib/seed-data';
import { RDATargets } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ targets: DEFAULT_POST_MENOPAUSAL_TARGETS, source: 'fallback' });
  }

  try {
    const rows = await sql`
      SELECT * FROM rda_targets WHERE id = 'default' LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ targets: DEFAULT_POST_MENOPAUSAL_TARGETS, source: 'default' });
    }

    const r = rows[0];
    const targets: RDATargets = {
      id: r.id,
      userId: r.user_id,
      menopausalStatus: r.menopausal_status,
      age: Number(r.age),
      heightCm: Number(r.height_cm),
      targetWeightKg: Number(r.target_weight_kg),
      energyMin: Number(r.energy_min),
      energyMax: Number(r.energy_max),
      proteinMin: Number(r.protein_min),
      proteinMax: Number(r.protein_max),
      fibreMin: Number(r.fibre_min),
      fibreMax: Number(r.fibre_max),
      sodiumMax: Number(r.sodium_max),
      cholesterolMax: Number(r.cholesterol_max),
      calciumMin: Number(r.calcium_min),
      calciumMax: Number(r.calcium_max),
      phosphorusMin: Number(r.phosphorus_min),
      phosphorusMax: Number(r.phosphorus_max),
      magnesiumMin: Number(r.magnesium_min),
      magnesiumMax: Number(r.magnesium_max),
      iron: Number(r.iron),
      zincMin: Number(r.zinc_min),
      zincMax: Number(r.zinc_max),
      potassium: Number(r.potassium),
      vitaminDMin: Number(r.vitamin_d_min),
      vitaminDMax: Number(r.vitamin_d_max),
      vitaminCMin: Number(r.vitamin_c_min),
      vitaminCMax: Number(r.vitamin_c_max),
      vitaminKMin: Number(r.vitamin_k_min),
      vitaminKMax: Number(r.vitamin_k_max),
      vitaminB12: Number(r.vitamin_b12),
      waterTargetMl: Number(r.water_target_ml),
      sunlightTargetMins: Number(r.sunlight_target_mins),
      updatedAt: r.updated_at,
    };

    return NextResponse.json({ targets, source: 'db' });
  } catch (error: any) {
    console.error('Error fetching RDA targets:', error);
    return NextResponse.json({ targets: DEFAULT_POST_MENOPAUSAL_TARGETS, source: 'fallback', error: error.message });
  }
}

export async function PUT(request: Request) {
  const sql = getDb();
  const body = (await request.json()) as Partial<RDATargets>;

  if (!sql) {
    return NextResponse.json({ success: true, targets: body, source: 'offline_ack' });
  }

  try {
    const t = { ...DEFAULT_POST_MENOPAUSAL_TARGETS, ...body };
    await sql`
      INSERT INTO rda_targets (
        id, user_id, menopausal_status, age, height_cm, target_weight_kg,
        energy_min, energy_max, protein_min, protein_max, fibre_min, fibre_max,
        sodium_max, cholesterol_max, calcium_min, calcium_max, phosphorus_min,
        phosphorus_max, magnesium_min, magnesium_max, iron, zinc_min, zinc_max,
        potassium, vitamin_d_min, vitamin_d_max, vitamin_c_min, vitamin_c_max,
        vitamin_k_min, vitamin_k_max, vitamin_b12, water_target_ml, sunlight_target_mins, updated_at
      ) VALUES (
        'default', ${t.userId}, ${t.menopausalStatus}, ${t.age}, ${t.heightCm}, ${t.targetWeightKg},
        ${t.energyMin}, ${t.energyMax}, ${t.proteinMin}, ${t.proteinMax}, ${t.fibreMin}, ${t.fibreMax},
        ${t.sodiumMax}, ${t.cholesterolMax}, ${t.calciumMin}, ${t.calciumMax}, ${t.phosphorusMin},
        ${t.phosphorusMax}, ${t.magnesiumMin}, ${t.magnesiumMax}, ${t.iron}, ${t.zincMin}, ${t.zincMax},
        ${t.potassium}, ${t.vitaminDMin}, ${t.vitaminDMax}, ${t.vitaminCMin}, ${t.vitaminCMax},
        ${t.vitaminKMin}, ${t.vitaminKMax}, ${t.vitaminB12}, ${t.waterTargetMl}, ${t.sunlightTargetMins}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        menopausal_status = EXCLUDED.menopausal_status,
        age = EXCLUDED.age,
        height_cm = EXCLUDED.height_cm,
        target_weight_kg = EXCLUDED.target_weight_kg,
        energy_min = EXCLUDED.energy_min,
        energy_max = EXCLUDED.energy_max,
        protein_min = EXCLUDED.protein_min,
        protein_max = EXCLUDED.protein_max,
        fibre_min = EXCLUDED.fibre_min,
        fibre_max = EXCLUDED.fibre_max,
        sodium_max = EXCLUDED.sodium_max,
        cholesterol_max = EXCLUDED.cholesterol_max,
        calcium_min = EXCLUDED.calcium_min,
        calcium_max = EXCLUDED.calcium_max,
        phosphorus_min = EXCLUDED.phosphorus_min,
        phosphorus_max = EXCLUDED.phosphorus_max,
        magnesium_min = EXCLUDED.magnesium_min,
        magnesium_max = EXCLUDED.magnesium_max,
        iron = EXCLUDED.iron,
        zinc_min = EXCLUDED.zinc_min,
        zinc_max = EXCLUDED.zinc_max,
        potassium = EXCLUDED.potassium,
        vitamin_d_min = EXCLUDED.vitamin_d_min,
        vitamin_d_max = EXCLUDED.vitamin_d_max,
        vitamin_c_min = EXCLUDED.vitamin_c_min,
        vitamin_c_max = EXCLUDED.vitamin_c_max,
        vitamin_k_min = EXCLUDED.vitamin_k_min,
        vitamin_k_max = EXCLUDED.vitamin_k_max,
        vitamin_b12 = EXCLUDED.vitamin_b12,
        water_target_ml = EXCLUDED.water_target_ml,
        sunlight_target_mins = EXCLUDED.sunlight_target_mins,
        updated_at = NOW();
    `;

    return NextResponse.json({ success: true, targets: t });
  } catch (error: any) {
    console.error('Error updating RDA targets in Neon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

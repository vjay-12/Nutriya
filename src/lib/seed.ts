import { getDb } from './db';
import {
  DEFAULT_POST_MENOPAUSAL_TARGETS,
  MASTER_FOOD_ITEMS,
  DEFAULT_PREPPED_PORTIONS,
  STARTER_DIET_PLANS,
  INITIAL_LOGS,
} from './seed-data';

export async function initAndSeedDatabase(force = false) {
  const sql = getDb();
  if (!sql) {
    return { success: false, message: 'DATABASE_URL is not configured' };
  }

  try {
    // 1. Create Tables
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

    // 2. Check if food items exist
    const foodCountRes = await sql`SELECT COUNT(*)::int as count FROM food_items;`;
    const foodCount = foodCountRes[0]?.count ?? 0;

    if (foodCount === 0 || force) {
      for (const item of MASTER_FOOD_ITEMS) {
        await sql`
          INSERT INTO food_items (
            id, name, category, base_unit, base_weight_g, calories, protein, carbs,
            fat, saturated_fat, cholesterol, fibre, sodium, calcium, phosphorus,
            iron, potassium, magnesium, zinc, vitamin_b12, vitamin_c, vitamin_k, vitamin_d, is_custom
          ) VALUES (
            ${item.id}, ${item.name}, ${item.category}, ${item.baseUnit}, ${item.baseWeightG},
            ${item.calories}, ${item.protein}, ${item.carbs}, ${item.fat}, ${item.saturatedFat},
            ${item.cholesterol}, ${item.fibre}, ${item.sodium}, ${item.calcium}, ${item.phosphorus},
            ${item.iron}, ${item.potassium}, ${item.magnesium}, ${item.zinc}, ${item.vitaminB12},
            ${item.vitaminC}, ${item.vitaminK}, ${item.vitaminD}, false
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            base_unit = EXCLUDED.base_unit,
            calories = EXCLUDED.calories,
            protein = EXCLUDED.protein,
            carbs = EXCLUDED.carbs,
            fat = EXCLUDED.fat,
            calcium = EXCLUDED.calcium,
            iron = EXCLUDED.iron;
        `;
      }
    }

    // 3. Prepped Portions
    const portionCountRes = await sql`SELECT COUNT(*)::int as count FROM prepped_portions;`;
    const portionCount = portionCountRes[0]?.count ?? 0;

    if (portionCount === 0 || force) {
      for (const p of DEFAULT_PREPPED_PORTIONS) {
        await sql`
          INSERT INTO prepped_portions (
            id, food_id, name, meal_slot, weight_g, quantity_multiplier, is_default
          ) VALUES (
            ${p.id}, ${p.foodId}, ${p.name}, ${p.mealSlot}, ${p.weightG}, ${p.quantityMultiplier}, true
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 4. RDA Targets
    const rdaCountRes = await sql`SELECT COUNT(*)::int as count FROM rda_targets;`;
    if ((rdaCountRes[0]?.count ?? 0) === 0 || force) {
      const t = DEFAULT_POST_MENOPAUSAL_TARGETS;
      await sql`
        INSERT INTO rda_targets (
          id, user_id, menopausal_status, age, height_cm, target_weight_kg,
          energy_min, energy_max, protein_min, protein_max, fibre_min, fibre_max,
          sodium_max, cholesterol_max, calcium_min, calcium_max, phosphorus_min,
          phosphorus_max, magnesium_min, magnesium_max, iron, zinc_min, zinc_max,
          potassium, vitamin_d_min, vitamin_d_max, vitamin_c_min, vitamin_c_max,
          vitamin_k_min, vitamin_k_max, vitamin_b12, water_target_ml, sunlight_target_mins
        ) VALUES (
          'default', ${t.userId}, ${t.menopausalStatus}, ${t.age}, ${t.heightCm}, ${t.targetWeightKg},
          ${t.energyMin}, ${t.energyMax}, ${t.proteinMin}, ${t.proteinMax}, ${t.fibreMin}, ${t.fibreMax},
          ${t.sodiumMax}, ${t.cholesterolMax}, ${t.calciumMin}, ${t.calciumMax}, ${t.phosphorusMin},
          ${t.phosphorusMax}, ${t.magnesiumMin}, ${t.magnesiumMax}, ${t.iron}, ${t.zincMin}, ${t.zincMax},
          ${t.potassium}, ${t.vitaminDMin}, ${t.vitaminDMax}, ${t.vitaminCMin}, ${t.vitaminCMax},
          ${t.vitaminKMin}, ${t.vitaminKMax}, ${t.vitaminB12}, ${t.waterTargetMl}, ${t.sunlightTargetMins}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 5. Diet Plans & Items
    const planCountRes = await sql`SELECT COUNT(*)::int as count FROM diet_plans;`;
    if ((planCountRes[0]?.count ?? 0) === 0 || force) {
      for (const plan of STARTER_DIET_PLANS) {
        await sql`
          INSERT INTO diet_plans (
            id, name, description, is_active, planned_water_ml, planned_sunlight_mins
          ) VALUES (
            ${plan.id}, ${plan.name}, ${plan.description || ''}, ${plan.isActive},
            ${plan.plannedWaterMl}, ${plan.plannedSunlightMins}
          )
          ON CONFLICT (id) DO NOTHING;
        `;

        for (const item of plan.items) {
          await sql`
            INSERT INTO diet_plan_items (
              id, plan_id, meal_slot, food_id, portion_name, weight_g, quantity
            ) VALUES (
              ${item.id}, ${plan.id}, ${item.mealSlot}, ${item.foodId},
              ${item.portionName}, ${item.weightG}, ${item.quantity}
            )
            ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    }

    // 6. Daily Logs
    const logCountRes = await sql`SELECT COUNT(*)::int as count FROM daily_logs;`;
    if ((logCountRes[0]?.count ?? 0) === 0 || force) {
      for (const log of INITIAL_LOGS) {
        await sql`
          INSERT INTO daily_logs (
            id, date, water_intake_ml, sunlight_mins, body_weight_kg, bmi, notes
          ) VALUES (
            ${log.id}, ${log.date}, ${log.waterIntakeMl}, ${log.sunlightMins},
            ${log.bodyWeightKg ?? 53.0}, ${log.bmi ?? 21.8}, ${log.notes || null}
          )
          ON CONFLICT (date) DO NOTHING;
        `;
      }
    }

    return {
      success: true,
      message: 'Neon database initialized and seeded successfully.',
      tables: ['rda_targets', 'food_items', 'prepped_portions', 'diet_plans', 'diet_plan_items', 'daily_logs'],
    };
  } catch (error: any) {
    console.error('Database initialization/seeding failed:', error);
    return { success: false, message: error.message || 'Seeding error' };
  }
}

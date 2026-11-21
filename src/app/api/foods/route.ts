import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MASTER_FOOD_ITEMS } from '@/lib/seed-data';
import { FoodItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ foods: MASTER_FOOD_ITEMS, source: 'fallback' });
  }

  try {
    const rows = await sql`
      SELECT * FROM food_items ORDER BY category ASC, name ASC;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ foods: MASTER_FOOD_ITEMS, source: 'seed_fallback' });
    }

    const foods: FoodItem[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      baseUnit: r.base_unit,
      baseWeightG: Number(r.base_weight_g || 100),
      calories: Number(r.calories),
      protein: Number(r.protein),
      carbs: Number(r.carbs),
      fat: Number(r.fat),
      saturatedFat: Number(r.saturated_fat || 0),
      cholesterol: Number(r.cholesterol || 0),
      fibre: Number(r.fibre || 0),
      sodium: Number(r.sodium || 0),
      calcium: Number(r.calcium || 0),
      phosphorus: Number(r.phosphorus || 0),
      iron: Number(r.iron || 0),
      potassium: Number(r.potassium || 0),
      magnesium: Number(r.magnesium || 0),
      zinc: Number(r.zinc || 0),
      vitaminB12: Number(r.vitamin_b12 || 0),
      vitaminC: Number(r.vitamin_c || 0),
      vitaminK: Number(r.vitamin_k || 0),
      vitaminD: Number(r.vitamin_d || 0),
      isCustom: Boolean(r.is_custom),
    }));

    return NextResponse.json({ foods, source: 'db' });
  } catch (error: any) {
    console.error('Error querying foods:', error);
    return NextResponse.json({ foods: MASTER_FOOD_ITEMS, source: 'fallback', error: error.message });
  }
}

export async function POST(request: Request) {
  const sql = getDb();
  const body = (await request.json()) as FoodItem;

  if (!body.id) {
    body.id = 'custom_' + Date.now();
  }
  body.isCustom = true;

  if (!sql) {
    return NextResponse.json({ success: true, food: body, source: 'offline_ack' });
  }

  try {
    await sql`
      INSERT INTO food_items (
        id, name, category, base_unit, base_weight_g, calories, protein, carbs,
        fat, saturated_fat, cholesterol, fibre, sodium, calcium, phosphorus,
        iron, potassium, magnesium, zinc, vitamin_b12, vitamin_c, vitamin_k, vitamin_d, is_custom
      ) VALUES (
        ${body.id}, ${body.name}, ${body.category}, ${body.baseUnit}, ${body.baseWeightG || 100},
        ${body.calories || 0}, ${body.protein || 0}, ${body.carbs || 0}, ${body.fat || 0},
        ${body.saturatedFat || 0}, ${body.cholesterol || 0}, ${body.fibre || 0}, ${body.sodium || 0},
        ${body.calcium || 0}, ${body.phosphorus || 0}, ${body.iron || 0}, ${body.potassium || 0},
        ${body.magnesium || 0}, ${body.zinc || 0}, ${body.vitaminB12 || 0}, ${body.vitaminC || 0},
        ${body.vitaminK || 0}, ${body.vitaminD || 0}, true
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        calories = EXCLUDED.calories,
        protein = EXCLUDED.protein,
        calcium = EXCLUDED.calcium,
        iron = EXCLUDED.iron;
    `;

    return NextResponse.json({ success: true, food: body });
  } catch (error: any) {
    console.error('Error saving custom food item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

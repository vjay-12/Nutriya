import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DEFAULT_PREPPED_PORTIONS } from '@/lib/seed-data';
import { PreppedPortion } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ portions: DEFAULT_PREPPED_PORTIONS, source: 'fallback' });
  }

  try {
    const rows = await sql`
      SELECT * FROM prepped_portions ORDER BY meal_slot ASC, name ASC;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ portions: DEFAULT_PREPPED_PORTIONS, source: 'seed_fallback' });
    }

    const portions: PreppedPortion[] = rows.map((r: any) => ({
      id: r.id,
      foodId: r.food_id,
      name: r.name,
      mealSlot: r.meal_slot,
      weightG: Number(r.weight_g),
      quantityMultiplier: Number(r.quantity_multiplier || 1),
      notes: r.notes || undefined,
      isDefault: Boolean(r.is_default),
    }));

    return NextResponse.json({ portions, source: 'db' });
  } catch (error: any) {
    console.error('Error querying prepped portions:', error);
    return NextResponse.json({ portions: DEFAULT_PREPPED_PORTIONS, source: 'fallback', error: error.message });
  }
}

export async function POST(request: Request) {
  const sql = getDb();
  const body = (await request.json()) as PreppedPortion;

  if (!body.id) {
    body.id = 'prep_' + Date.now();
  }

  if (!sql) {
    return NextResponse.json({ success: true, portion: body, source: 'offline_ack' });
  }

  try {
    await sql`
      INSERT INTO prepped_portions (
        id, food_id, name, meal_slot, weight_g, quantity_multiplier, notes, is_default
      ) VALUES (
        ${body.id}, ${body.foodId}, ${body.name}, ${body.mealSlot}, ${body.weightG},
        ${body.quantityMultiplier || 1}, ${body.notes || null}, false
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        meal_slot = EXCLUDED.meal_slot,
        weight_g = EXCLUDED.weight_g,
        quantity_multiplier = EXCLUDED.quantity_multiplier,
        notes = EXCLUDED.notes;
    `;

    return NextResponse.json({ success: true, portion: body });
  } catch (error: any) {
    console.error('Error saving prepped portion:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ success: true, source: 'offline_ack' });
  }

  try {
    await sql`DELETE FROM prepped_portions WHERE id = ${id};`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting prepped portion:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

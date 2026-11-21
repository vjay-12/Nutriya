import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { STARTER_DIET_PLANS } from '@/lib/seed-data';
import { DietPlan, DietPlanItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ plans: STARTER_DIET_PLANS, source: 'fallback' });
  }

  try {
    const planRows = await sql`SELECT * FROM diet_plans ORDER BY created_at ASC;`;
    if (!planRows || planRows.length === 0) {
      return NextResponse.json({ plans: STARTER_DIET_PLANS, source: 'seed_fallback' });
    }

    const itemRows = await sql`SELECT * FROM diet_plan_items ORDER BY created_at ASC;`;

    const itemsByPlan = new Map<string, DietPlanItem[]>();
    for (const r of itemRows) {
      const item: DietPlanItem = {
        id: r.id,
        planId: r.plan_id,
        mealSlot: r.meal_slot,
        foodId: r.food_id,
        portionName: r.portion_name,
        weightG: Number(r.weight_g),
        quantity: Number(r.quantity || 1),
      };
      if (!itemsByPlan.has(r.plan_id)) {
        itemsByPlan.set(r.plan_id, []);
      }
      itemsByPlan.get(r.plan_id)!.push(item);
    }

    const plans: DietPlan[] = planRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      isActive: Boolean(r.is_active),
      plannedWaterMl: Number(r.planned_water_ml || 2250),
      plannedSunlightMins: Number(r.planned_sunlight_mins || 20),
      items: itemsByPlan.get(r.id) || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ plans, source: 'db' });
  } catch (error: any) {
    console.error('Error querying diet plans:', error);
    return NextResponse.json({ plans: STARTER_DIET_PLANS, source: 'fallback', error: error.message });
  }
}

export async function POST(request: Request) {
  const sql = getDb();
  const plan = (await request.json()) as DietPlan;

  if (!plan.id) {
    plan.id = 'plan_' + Date.now();
  }

  if (!sql) {
    return NextResponse.json({ success: true, plan, source: 'offline_ack' });
  }

  try {
    // If setting active, deactivate others
    if (plan.isActive) {
      await sql`UPDATE diet_plans SET is_active = false;`;
    }

    await sql`
      INSERT INTO diet_plans (
        id, name, description, is_active, planned_water_ml, planned_sunlight_mins, created_at, updated_at
      ) VALUES (
        ${plan.id}, ${plan.name}, ${plan.description || ''}, ${plan.isActive || false},
        ${plan.plannedWaterMl || 2250}, ${plan.plannedSunlightMins || 20}, NOW(), NOW()
      );
    `;

    if (plan.items && plan.items.length > 0) {
      for (const item of plan.items) {
        const itemId = item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await sql`
          INSERT INTO diet_plan_items (
            id, plan_id, meal_slot, food_id, portion_name, weight_g, quantity
          ) VALUES (
            ${itemId}, ${plan.id}, ${item.mealSlot}, ${item.foodId},
            ${item.portionName}, ${item.weightG}, ${item.quantity || 1}
          );
        `;
      }
    }

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('Error inserting new diet plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const sql = getDb();
  const plan = (await request.json()) as DietPlan;

  if (!plan.id) {
    return NextResponse.json({ error: 'Missing plan id' }, { status: 400 });
  }

  if (!sql) {
    return NextResponse.json({ success: true, plan, source: 'offline_ack' });
  }

  try {
    if (plan.isActive) {
      await sql`UPDATE diet_plans SET is_active = false WHERE id != ${plan.id};`;
    }

    await sql`
      UPDATE diet_plans SET
        name = ${plan.name},
        description = ${plan.description || ''},
        is_active = ${plan.isActive || false},
        planned_water_ml = ${plan.plannedWaterMl || 2250},
        planned_sunlight_mins = ${plan.plannedSunlightMins || 20},
        updated_at = NOW()
      WHERE id = ${plan.id};
    `;

    // Replace items
    await sql`DELETE FROM diet_plan_items WHERE plan_id = ${plan.id};`;

    if (plan.items && plan.items.length > 0) {
      for (const item of plan.items) {
        const itemId = item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await sql`
          INSERT INTO diet_plan_items (
            id, plan_id, meal_slot, food_id, portion_name, weight_g, quantity
          ) VALUES (
            ${itemId}, ${plan.id}, ${item.mealSlot}, ${item.foodId},
            ${item.portionName}, ${item.weightG}, ${item.quantity || 1}
          );
        `;
      }
    }

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('Error updating diet plan:', error);
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
    await sql`DELETE FROM diet_plans WHERE id = ${id};`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting diet plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { INITIAL_LOGS } from '@/lib/seed-data';
import { DailyLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ logs: INITIAL_LOGS, source: 'fallback' });
  }

  try {
    const rows = await sql`SELECT * FROM daily_logs ORDER BY date DESC LIMIT 30;`;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ logs: INITIAL_LOGS, source: 'seed_fallback' });
    }

    const logs: DailyLog[] = rows.map((r: any) => ({
      id: r.id,
      date: r.date,
      waterIntakeMl: Number(r.water_intake_ml || 0),
      sunlightMins: Number(r.sunlight_mins || 0),
      bodyWeightKg: r.body_weight_kg ? Number(r.body_weight_kg) : undefined,
      bmi: r.bmi ? Number(r.bmi) : undefined,
      notes: r.notes || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ logs, source: 'db' });
  } catch (error: any) {
    console.error('Error querying daily logs:', error);
    return NextResponse.json({ logs: INITIAL_LOGS, source: 'fallback', error: error.message });
  }
}

export async function POST(request: Request) {
  const sql = getDb();
  const log = (await request.json()) as DailyLog;

  if (!log.date) {
    log.date = new Date().toISOString().split('T')[0];
  }
  if (!log.id) {
    log.id = 'log_' + log.date;
  }

  // Calculate BMI dynamically if weight is provided and height exists
  if (log.bodyWeightKg && !log.bmi) {
    if (sql) {
      try {
        const targetRes = await sql`SELECT height_cm FROM rda_targets LIMIT 1;`;
        const heightCm = Number(targetRes[0]?.height_cm);
        if (heightCm > 0) {
          const hM = heightCm / 100;
          log.bmi = Number((log.bodyWeightKg / (hM * hM)).toFixed(1));
        }
      } catch {
        // Leave bmi unset if targets query fails
      }
    }
  }

  if (!sql) {
    return NextResponse.json({ success: true, log, source: 'offline_ack' });
  }

  try {
    await sql`
      INSERT INTO daily_logs (
        id, date, water_intake_ml, sunlight_mins, body_weight_kg, bmi, notes, created_at, updated_at
      ) VALUES (
        ${log.id}, ${log.date}, ${log.waterIntakeMl || 0}, ${log.sunlightMins || 0},
        ${log.bodyWeightKg || null}, ${log.bmi || null}, ${log.notes || null}, NOW(), NOW()
      )
      ON CONFLICT (date) DO UPDATE SET
        water_intake_ml = EXCLUDED.water_intake_ml,
        sunlight_mins = EXCLUDED.sunlight_mins,
        body_weight_kg = COALESCE(EXCLUDED.body_weight_kg, daily_logs.body_weight_kg),
        bmi = COALESCE(EXCLUDED.bmi, daily_logs.bmi),
        notes = COALESCE(EXCLUDED.notes, daily_logs.notes),
        updated_at = NOW();
    `;

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error saving daily log:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  calculateNutrientTotals,
  evaluateClinicalRules,
  calculateMealSlotCalcium,
} from '@/lib/clinical-engine';
import {
  Printer,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export function AnalysisTab() {
  const { targets, foods, activePlan, dietPlans, todayLog } = useApp();

  // Active Plan Nutrients
  const totals = calculateNutrientTotals(activePlan.items, foods);
  const clinicalComments = evaluateClinicalRules(totals, activePlan.items, foods, targets);
  const mealSlotCalcium = calculateMealSlotCalcium(activePlan.items, foods);

  // 18 Nutrients Grid Definition
  const NUTRIENT_GRID = [
    { name: 'Energy', current: totals.calories, unit: 'kcal', min: targets.energyMin, max: targets.energyMax, type: 'range' },
    { name: 'Protein', current: totals.protein, unit: 'g', min: targets.proteinMin, max: targets.proteinMax, type: 'range' },
    { name: 'Calcium', current: totals.calcium, unit: 'mg', min: targets.calciumMin, max: targets.calciumMax, type: 'range' },
    { name: 'Iron', current: totals.iron, unit: 'mg', min: targets.iron, max: 40, type: 'min' },
    { name: 'Vitamin D3', current: totals.vitaminD, unit: 'mcg', min: targets.vitaminDMin, max: targets.vitaminDMax, type: 'range' },
    { name: 'Vitamin C', current: totals.vitaminC, unit: 'mg', min: targets.vitaminCMin, max: targets.vitaminCMax, type: 'range' },
    { name: 'Magnesium', current: totals.magnesium, unit: 'mg', min: targets.magnesiumMin, max: targets.magnesiumMax, type: 'range' },
    { name: 'Phosphorus', current: totals.phosphorus, unit: 'mg', min: targets.phosphorusMin, max: targets.phosphorusMax, type: 'range' },
    { name: 'Potassium', current: totals.potassium, unit: 'mg', min: targets.potassium, max: 4700, type: 'min' },
    { name: 'Dietary Fibre', current: totals.fibre, unit: 'g', min: targets.fibreMin, max: targets.fibreMax, type: 'range' },
    { name: 'Zinc', current: totals.zinc, unit: 'mg', min: targets.zincMin, max: targets.zincMax, type: 'range' },
    { name: 'Vitamin B12', current: totals.vitaminB12, unit: 'mcg', min: targets.vitaminB12, max: 10, type: 'min' },
    { name: 'Vitamin K', current: totals.vitaminK, unit: 'mcg', min: targets.vitaminKMin, max: targets.vitaminKMax, type: 'range' },
    { name: 'Sodium (Limit)', current: totals.sodium, unit: 'mg', min: 0, max: targets.sodiumMax, type: 'ceiling' },
    { name: 'Cholesterol (Limit)', current: totals.cholesterol, unit: 'mg', min: 0, max: targets.cholesterolMax, type: 'ceiling' },
    { name: 'Carbohydrates', current: totals.carbs, unit: 'g', min: 130, max: 230, type: 'range' },
    { name: 'Total Fat', current: totals.fat, unit: 'g', min: 30, max: 55, type: 'range' },
    { name: 'Saturated Fat', current: totals.saturatedFat, unit: 'g', min: 0, max: 18, type: 'ceiling' },
  ];

  // Multi-Plan Comparison calculation
  const planComparisons = dietPlans.map((plan) => {
    const t = calculateNutrientTotals(plan.items, foods);
    // Goals met count (Cal, Prot, Ca, Fe, Mag, Potas, Fib, Sod, Chol)
    let met = 0;
    if (t.calories >= targets.energyMin * 0.9) met++;
    if (t.protein >= targets.proteinMin) met++;
    if (t.calcium >= targets.calciumMin * 0.9) met++;
    if (t.iron >= targets.iron * 0.8) met++;
    if (t.magnesium >= targets.magnesiumMin * 0.85) met++;
    if (t.potassium >= targets.potassium * 0.7) met++;
    if (t.fibre >= targets.fibreMin * 0.8) met++;
    if (t.sodium <= targets.sodiumMax) met++;
    if (t.cholesterol <= targets.cholesterolMax) met++;
    const percentMet = Math.round((met / 9) * 100);

    return {
      id: plan.id,
      name: plan.name,
      isActive: plan.id === activePlan.id,
      totals: t,
      percentMet,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 animate-fade-in">
      {/* Header & Print Action */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F5E]" />
            <h2 className="text-lg font-bold text-[#181A1F]">Clinical Evaluation & Multi-Plan Matrix</h2>
          </div>
          <p className="text-xs text-[#646873]">
            Active Plan: <strong className="text-[#181A1F]">{activePlan.name}</strong> &bull; ICMR-NIN 2020 & IFCT 2017 compliant
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181A1F] hover:bg-black text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-[#8CE07A]" />
          <span>Print / Save PDF for Doctor</span>
        </button>
      </div>

      {/* 1. Dynamic Source-Cited Clinical Comments Engine */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wider px-1">
          Evidence-Based Clinical Comments & Alerts ({clinicalComments.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {clinicalComments.map((c) => {
            const isAlert = c.type === 'alert';
            const isWarning = c.type === 'warning';
            const isSuccess = c.type === 'success';

            const bgClass = isAlert
              ? 'bg-[#FFF1F2] border-[#E11D48]/20'
              : isWarning
              ? 'bg-[#FEF3C7]/40 border-[#F59E0B]/30'
              : isSuccess
              ? 'bg-[#E7F2EF] border-[#2E6F5E]/20'
              : 'bg-white border-[#181A1F]/10';

            const badgeClass = isAlert
              ? 'text-[#E11D48] bg-white border border-[#E11D48]/20'
              : isWarning
              ? 'text-[#D97706] bg-white border border-[#F59E0B]/30'
              : isSuccess
              ? 'text-[#2E6F5E] bg-white border border-[#2E6F5E]/20'
              : 'text-[#646873] bg-[#F8F8F6]';

            return (
              <div
                key={c.id}
                className={`p-4 sm:p-5 rounded-3xl border ${bgClass} shadow-soft flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${badgeClass}`}>
                      {c.type}
                    </span>
                    <span className="text-[10px] text-[#646873] font-medium text-right">
                      {c.source}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-[#181A1F] mb-1.5 leading-snug">{c.title}</h4>
                  <p className="text-xs text-[#646873] leading-relaxed mb-3">{c.message}</p>
                </div>

                {c.actionableRecommendation && (
                  <div className="p-2.5 rounded-2xl bg-white/80 border border-[#181A1F]/5 text-[11px] text-[#181A1F] font-medium">
                    <strong className="text-[#2E6F5E]">Clinical Action: </strong>
                    <span>{c.actionableRecommendation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Comprehensive 18-Nutrient Goal Progress Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#181A1F]/5">
          <div>
            <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide">
              Comprehensive 18-Nutrient Goal Progress Grid
            </h3>
            <span className="text-xs text-[#646873]">
              Sage (Target Met) &bull; Amber (Deficit &lt;80% / Approaching Limit) &bull; Rose (Exceeds Limit)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-[#2E6F5E]">
              <span className="w-2 h-2 rounded-full bg-[#8CE07A]" /> Optimal
            </span>
            <span className="flex items-center gap-1 text-[#D97706]">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Caution
            </span>
            <span className="flex items-center gap-1 text-[#E11D48]">
              <span className="w-2 h-2 rounded-full bg-[#E11D48]" /> Alert
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {NUTRIENT_GRID.map((item) => {
            let status: 'optimal' | 'caution' | 'alert' = 'optimal';
            let percent = 0;

            if (item.type === 'ceiling') {
              percent = Math.min(100, Math.round((item.current / item.max) * 100));
              if (item.current > item.max) {
                status = 'alert';
              } else if (item.current >= item.max * 0.9) {
                status = 'caution';
              } else {
                status = 'optimal';
              }
            } else {
              percent = Math.min(100, Math.round((item.current / item.min) * 100));
              if (item.current < item.min * 0.8) {
                status = 'caution';
              } else if (item.current > item.max && item.max > 0) {
                status = 'alert';
              } else {
                status = 'optimal';
              }
            }

            const barColor =
              status === 'optimal'
                ? 'bg-[#8CE07A]'
                : status === 'caution'
                ? 'bg-[#F59E0B]'
                : 'bg-[#E11D48]';

            const textColor =
              status === 'optimal'
                ? 'text-[#2E6F5E]'
                : status === 'caution'
                ? 'text-[#D97706]'
                : 'text-[#E11D48]';

            return (
              <div
                key={item.name}
                className="p-3.5 rounded-2xl bg-[#F8F8F6] border border-[#181A1F]/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#181A1F]">{item.name}</span>
                    <span className={`text-[11px] font-bold tabular-nums ${textColor}`}>
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full bg-[#EFECE6] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-[11px] text-[#646873] tabular-nums">
                  <span className="font-semibold text-[#181A1F]">
                    {item.current} {item.unit}
                  </span>
                  <span>
                    {item.type === 'ceiling'
                      ? `< ${item.max} ${item.unit}`
                      : `${item.min}–${item.max} ${item.unit}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Plan Side-by-Side Comparison Matrix */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#181A1F]/5">
          <div>
            <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide">
              Multi-Plan Comparison Matrix
            </h3>
            <span className="text-xs text-[#646873]">
              Benchmarking all saved templates against daily clinical goals
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E7F2EF] text-[#2E6F5E]">
            {dietPlans.length} Plans Saved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#646873] border-b border-[#181A1F]/5 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 font-bold">Template Name</th>
                <th className="py-2.5 font-bold tabular-nums">Goals Met</th>
                <th className="py-2.5 font-bold tabular-nums">kcal</th>
                <th className="py-2.5 font-bold tabular-nums">Prot (g)</th>
                <th className="py-2.5 font-bold tabular-nums text-[#2E6F5E]">Calc (mg)</th>
                <th className="py-2.5 font-bold tabular-nums">Iron (mg)</th>
                <th className="py-2.5 font-bold tabular-nums">Mag (mg)</th>
                <th className="py-2.5 font-bold tabular-nums">Potas (mg)</th>
                <th className="py-2.5 font-bold tabular-nums">Fibre (g)</th>
                <th className="py-2.5 font-bold tabular-nums text-[#E11D48]">Sod (mg)</th>
                <th className="py-2.5 font-bold tabular-nums">Chol (mg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181A1F]/5">
              {planComparisons.map((p) => (
                <tr
                  key={p.id}
                  className={`transition-colors ${
                    p.isActive ? 'bg-[#E7F2EF]/40 font-semibold' : 'hover:bg-[#F8F8F6]'
                  }`}
                >
                  <td className="py-3 pr-2 whitespace-nowrap">
                    <span className="font-bold text-[#181A1F]">{p.name}</span>
                    {p.isActive && (
                      <span className="ml-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-[#2E6F5E] text-white font-bold">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 tabular-nums">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#181A1F]/10 font-bold text-[#2E6F5E]">
                      {p.percentMet}%
                    </span>
                  </td>
                  <td className="py-3 tabular-nums font-semibold">{p.totals.calories}</td>
                  <td className="py-3 tabular-nums font-semibold">{p.totals.protein}</td>
                  <td className="py-3 tabular-nums font-bold text-[#2E6F5E]">{p.totals.calcium}</td>
                  <td className="py-3 tabular-nums">{p.totals.iron}</td>
                  <td className="py-3 tabular-nums">{p.totals.magnesium}</td>
                  <td className="py-3 tabular-nums">{p.totals.potassium}</td>
                  <td className="py-3 tabular-nums">{p.totals.fibre}</td>
                  <td className="py-3 tabular-nums text-[#646873]">{p.totals.sodium}</td>
                  <td className="py-3 tabular-nums text-[#646873]">{p.totals.cholesterol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Doctor-Ready Printable Report Section (hidden on screen except when printing, or nicely previewed) */}
      <div className="bg-[#FAF9F5] rounded-3xl p-6 sm:p-7 border border-[#181A1F]/10 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2E6F5E]" />
          <h3 className="font-bold text-sm text-[#181A1F]">Physician Clinical Summary & Discussion Notes</h3>
        </div>
        <p className="text-xs text-[#646873]">
          Prepared for Endocrinologist / Orthopedist review regarding Zoledronic acid follow-up, calcium split-dosing, and Vitamin D3 supplementation:
        </p>

        <div className="bg-white rounded-2xl p-4 text-xs space-y-2 border border-[#181A1F]/5">
          <p>
            <strong>Patient:</strong> 50y Female &bull; <strong>Height:</strong> {targets.heightCm} cm &bull;{' '}
            <strong>Weight:</strong> {todayLog.bodyWeightKg ?? targets.targetWeightKg} kg &bull;{' '}
            <strong>BMI:</strong>{' '}
            {((todayLog.bodyWeightKg ?? targets.targetWeightKg) / ((targets.heightCm / 100) * (targets.heightCm / 100))).toFixed(1)}
          </p>
          <p>
            <strong>Baseline Labs:</strong> Serum Calcium: 8.0 mg/dL (Low) &bull; 25(OH) Vitamin D: 18 ng/mL (Deficient)
          </p>
          <p>
            <strong>Active Plan Yield:</strong> Energy: {totals.calories} kcal &bull; Protein: {totals.protein} g &bull;
            Dietary Calcium: {totals.calcium} mg (Morning: {mealSlotCalcium.morning} mg, Afternoon: {mealSlotCalcium.afternoon} mg, Night: {mealSlotCalcium.night} mg) &bull;
            Dietary Vit D: {totals.vitaminD} mcg &bull; Magnesium: {totals.magnesium} mg &bull; Phosphorus: {totals.phosphorus} mg
          </p>
          <p className="text-[#646873] pt-1">
            <strong>Key Questions for Doctor:</strong> 1) Recommended oral Vitamin D3 loading vs maintenance dosage (e.g. 60,000 IU/week). 2) Bedtime elemental calcium gap prescription ({Math.max(0, targets.calciumMin - totals.calcium).toFixed(0)} mg). 3) 6-week repeat serum calcium, albumin, phosphorus & 25(OH)D monitoring schedule.
          </p>
        </div>
      </div>

      {/* Clinical Disclaimer Footer */}
      <footer className="text-center text-[11px] text-[#646873] px-4 pt-4 border-t border-[#181A1F]/5">
        <p>
          <strong>Medical Disclaimer:</strong> Nutritional figures reference ICMR-NIN 2020 Dietary Guidelines for Indians and IFCT 2017. All medical diagnoses, bisphosphonate management, and calcium/Vitamin D3 supplementation dosages must be confirmed and supervised by your treating physician.
        </p>
      </footer>
    </div>
  );
}

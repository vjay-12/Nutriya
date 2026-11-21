'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateNutrientTotals } from '@/lib/clinical-engine';
import { PlanSelector } from '@/components/PlanSelector';
import {
  AlertCircle,
  Droplets,
  Sun,
  Scale,
  ArrowRight,
  Plus,
  RotateCcw,
  Sparkles,
  Flame,
  Dna,
  Bone,
  Check,
} from 'lucide-react';

export function OverviewTab() {
  const {
    targets,
    foods,
    activePlan,
    todayLog,
    dailyLogs,
    setActiveTab,
    updateTodayWater,
    updateTodaySunlight,
    logWeight,
  } = useApp();

  const [weightInput, setWeightInput] = useState('');
  const [sunCustomMins, setSunCustomMins] = useState('');
  const [showWeightSuccess, setShowWeightSuccess] = useState(false);

  // Compute live nutrient totals for active plan
  const planTotals = calculateNutrientTotals(activePlan.items, foods);

  // 4 Core Ring Gauges: Calories, Protein, Calcium, Vitamin D
  const calPercent = Math.min(100, Math.round((planTotals.calories / targets.energyMin) * 100));
  const protPercent = Math.min(100, Math.round((planTotals.protein / targets.proteinMin) * 100));
  const calcPercent = Math.min(100, Math.round((planTotals.calcium / targets.calciumMin) * 100));
  const vitDPercent = Math.min(100, Math.round((planTotals.vitaminD / targets.vitaminDMin) * 100));

  // Hydration & Sunlight targets
  const waterTarget = activePlan.plannedWaterMl || targets.waterTargetMl;
  const waterPercent = Math.min(100, Math.round((todayLog.waterIntakeMl / waterTarget) * 100));
  const sunTarget = activePlan.plannedSunlightMins || targets.sunlightTargetMins;
  const sunPercent = Math.min(100, Math.round((todayLog.sunlightMins / sunTarget) * 100));

  // Current weight and BMI
  const currentWeight = todayLog.bodyWeightKg ?? targets.targetWeightKg;
  const currentBmi = (currentWeight / ((targets.heightCm / 100) * (targets.heightCm / 100))).toFixed(1);

  // Sparkline data for weight history (last 7 logs)
  const recentLogs = [...dailyLogs]
    .filter((l) => l.bodyWeightKg)
    .slice(0, 7)
    .reverse();

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 150) {
      logWeight(val);
      setWeightInput('');
      setShowWeightSuccess(true);
      setTimeout(() => setShowWeightSuccess(false), 2000);
    }
  };

  const handleCustomSunlight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(sunCustomMins, 10);
    if (!isNaN(val) && val > 0) {
      updateTodaySunlight(val);
      setSunCustomMins('');
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 animate-fade-in">
      {/* Active Diet Plan Hero Card (Botanical Sage #2E6F5E) */}
      <div className="bg-gradient-to-br from-[#2E6F5E] to-[#1B4338] text-white rounded-3xl p-6 sm:p-7 shadow-soft relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-36 h-36 rounded-full bg-[#8CE07A]/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/20 text-[#8CE07A] backdrop-blur-sm">
                  Active Diet Template
                </span>
                <span className="text-xs text-white/70">
                  {activePlan.items.length} Prepped Portions
                </span>
              </div>
              <PlanSelector theme="hero" className="mb-2" />
              <p className="text-xs text-white/80 max-w-xl">
                {activePlan.description || 'Optimized daily nutrient balance and meal plan distribution.'}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('builder')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#2E6F5E] hover:bg-[#F8F8F6] font-bold text-xs shadow-md transition-all self-start sm:self-auto flex-shrink-0"
            >
              <span>Edit Today&apos;s Meals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Key Nutrient Ring Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {/* Calories Gauge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-[#8CE07A] flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 text-[#8CE07A]" />
              </div>
              <span className="text-xs text-white/70 font-medium">Energy</span>
              <span className="text-lg font-bold tabular-nums">
                {planTotals.calories} <span className="text-xs font-normal">kcal</span>
              </span>
              <span className="text-[10px] text-white/60">
                Goal: {targets.energyMin} ({calPercent}%)
              </span>
            </div>

            {/* Protein Gauge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-[#8CE07A] flex items-center justify-center mb-2">
                <Dna className="w-5 h-5 text-[#8CE07A]" />
              </div>
              <span className="text-xs text-white/70 font-medium">Protein</span>
              <span className="text-lg font-bold tabular-nums">
                {planTotals.protein} <span className="text-xs font-normal">g</span>
              </span>
              <span className="text-[10px] text-white/60">
                Goal: {targets.proteinMin}g ({protPercent}%)
              </span>
            </div>

            {/* Calcium Gauge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-[#8CE07A] flex items-center justify-center mb-2">
                <Bone className="w-5 h-5 text-[#8CE07A]" />
              </div>
              <span className="text-xs text-white/70 font-medium">Calcium</span>
              <span className="text-lg font-bold tabular-nums">
                {planTotals.calcium} <span className="text-xs font-normal">mg</span>
              </span>
              <span className="text-[10px] text-white/60">
                Goal: {targets.calciumMin}mg ({calcPercent}%)
              </span>
            </div>

            {/* Vitamin D Gauge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-[#E5A93B] flex items-center justify-center mb-2">
                <Sun className="w-5 h-5 text-[#E5A93B]" />
              </div>
              <span className="text-xs text-white/70 font-medium">Dietary Vit D</span>
              <span className="text-lg font-bold tabular-nums">
                {planTotals.vitaminD} <span className="text-xs font-normal">mcg</span>
              </span>
              <span className="text-[10px] text-white/60">
                ({(planTotals.vitaminD * 40).toFixed(0)} IU &bull; Need Sun+Rx)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Daily Lifestyle Check-in Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Widget A: Water Intake Logger */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#181A1F]">Hydration Tracker</h4>
              </div>
              <span className="text-xs font-bold tabular-nums text-[#0284C7]">
                {waterPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EFECE6] h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-[#38BDF8] to-[#0284C7] h-full transition-all duration-300 rounded-full"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <span className="text-2xl font-bold text-[#181A1F] tabular-nums">
                {todayLog.waterIntakeMl}{' '}
                <span className="text-xs text-[#646873] font-normal">/ {waterTarget} ml</span>
              </span>
              <span className="text-xs text-[#646873]">
                {Math.max(0, waterTarget - todayLog.waterIntakeMl)} ml left
              </span>
            </div>
          </div>

          {/* Quick-tap pills */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateTodayWater(150)}
              className="py-2 px-2.5 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] text-xs font-semibold text-[#181A1F] border border-[#181A1F]/5 transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#0284C7]" />
              <span>150 ml Cup</span>
            </button>
            <button
              onClick={() => updateTodayWater(250)}
              className="py-2 px-2.5 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] text-xs font-semibold text-[#181A1F] border border-[#181A1F]/5 transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#0284C7]" />
              <span>250 ml Glass</span>
            </button>
            <button
              onClick={() => updateTodayWater(500)}
              className="py-2 px-2.5 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] text-xs font-semibold text-[#181A1F] border border-[#181A1F]/5 transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#0284C7]" />
              <span>500 ml Bottle</span>
            </button>
            <button
              onClick={() => updateTodayWater(-250)}
              disabled={todayLog.waterIntakeMl <= 0}
              className="py-2 px-2.5 rounded-xl bg-[#F8F8F6] hover:bg-[#FFF1F2] text-xs font-medium text-[#646873] hover:text-[#E11D48] border border-[#181A1F]/5 transition-colors flex items-center justify-center gap-1 disabled:opacity-30"
            >
              <RotateCcw className="w-3 h-3" />
              <span>-250 ml</span>
            </button>
          </div>
        </div>

        {/* Widget B: Sunlight Exposure Logger */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#181A1F]">Sunlight UV-B</h4>
              </div>
              <span className="text-xs font-bold tabular-nums text-[#D97706]">
                {sunPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EFECE6] h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-[#FBBF24] to-[#D97706] h-full transition-all duration-300 rounded-full"
                style={{ width: `${sunPercent}%` }}
              />
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold text-[#181A1F] tabular-nums">
                {todayLog.sunlightMins}{' '}
                <span className="text-xs text-[#646873] font-normal">/ {sunTarget} mins</span>
              </span>
              <span className="text-[11px] text-[#646873]">10 AM – 2 PM Window</span>
            </div>
            <p className="text-[11px] text-[#646873] mb-4">
              Direct exposure on arms/legs generates endogenous D3 synthesis.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                onClick={() => updateTodaySunlight(5)}
                className="py-1.5 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] text-xs font-semibold text-[#181A1F] border border-[#181A1F]/5 transition-colors"
              >
                +5 min
              </button>
              <button
                onClick={() => updateTodaySunlight(10)}
                className="py-1.5 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] text-xs font-semibold text-[#181A1F] border border-[#181A1F]/5 transition-colors"
              >
                +10 min
              </button>
              <button
                onClick={() => updateTodaySunlight(15)}
                className="py-1.5 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] text-xs font-semibold text-[#181A1F] border border-[#181A1F]/5 transition-colors"
              >
                +15 min
              </button>
            </div>

            <form onSubmit={handleCustomSunlight} className="flex gap-2">
              <input
                type="number"
                placeholder="Custom mins"
                value={sunCustomMins}
                onChange={(e) => setSunCustomMins(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-1 focus:ring-[#D97706]"
              />
              <button
                type="submit"
                disabled={!sunCustomMins}
                className="px-3 py-1.5 rounded-xl bg-[#181A1F] text-white text-xs font-medium disabled:opacity-30"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Widget C: Body Weight Tracker */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E7F2EF] text-[#2E6F5E] flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#181A1F]">Weight & BMI</h4>
              </div>
              <span className="text-xs font-semibold text-[#2E6F5E]">Target: {targets.targetWeightKg} kg</span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-[#181A1F] tabular-nums">
                {currentWeight} <span className="text-xs text-[#646873] font-normal">kg</span>
              </span>
              <span className="text-xs text-[#646873] font-mono">BMI {currentBmi}</span>
            </div>

            {/* Sparkline Visualization */}
            <div className="h-10 w-full mb-3 flex items-end gap-1.5 pt-2">
              {recentLogs.map((log, idx) => {
                const wt = log.bodyWeightKg ?? targets.targetWeightKg ?? 53.0;
                const baseTarget = targets.targetWeightKg || 53;
                const delta = wt - baseTarget;
                // Height between 25% and 95% based on deviation from target
                const hPercent = Math.min(95, Math.max(25, Math.round(55 + delta * 10)));
                return (
                  <div
                    key={log.id || idx}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        log.date === todayLog.date
                          ? 'bg-[#2E6F5E]'
                          : 'bg-[#EFECE6] group-hover:bg-[#8CE07A]'
                      }`}
                      style={{ height: `${hPercent}%` }}
                    />
                    <span className="text-[9px] text-[#646873] leading-none">
                      {log.date.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick weight input */}
          <form onSubmit={handleSaveWeight} className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 53.2"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-1 focus:ring-[#2E6F5E]"
            />
            <button
              type="submit"
              disabled={!weightInput}
              className="px-3 py-1.5 rounded-xl bg-[#2E6F5E] hover:bg-[#255c4e] text-white text-xs font-semibold disabled:opacity-30 transition-colors flex items-center gap-1"
            >
              {showWeightSuccess ? <Check className="w-3.5 h-3.5" /> : 'Log'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

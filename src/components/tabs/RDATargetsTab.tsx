'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { RDATargets } from '@/lib/types';
import {
  RotateCcw,
  Check,
  Info,
  Shield,
  Sliders,
  Sparkles,
} from 'lucide-react';

export function RDATargetsTab() {
  const { targets, updateTargets, setMenopausalStatus, restoreClinicalDefaults } = useApp();
  const [localTargets, setLocalTargets] = useState<RDATargets>(targets);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if targets change from outside
  React.useEffect(() => {
    setLocalTargets(targets);
  }, [targets]);

  const handleFieldChange = (key: keyof RDATargets, val: any) => {
    setLocalTargets((prev) => ({
      ...prev,
      [key]: Number(val) || 0,
    }));
  };

  const handleSaveAll = async () => {
    await updateTargets(localTargets);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRestore = async () => {
    if (confirm('Restore clinical defaults based on ICMR-NIN 2020 and Osteoporosis guidelines?')) {
      await restoreClinicalDefaults();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 animate-fade-in">
      {/* Top Controls: Menopausal Quick-Switch & Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F5E]" />
            <h2 className="text-lg font-bold text-[#181A1F]">RDA & Clinical Targets Configuration</h2>
          </div>
          <p className="text-xs text-[#646873]">
            Customize daily nutritional goals with ICMR-NIN 2020 & Endocrine Society references.
          </p>
        </div>

        {/* Menopausal Status Switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-[#F8F8F6] p-1 rounded-full border border-[#181A1F]/10 flex items-center">
            <button
              onClick={() => setMenopausalStatus('post')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                targets.menopausalStatus === 'post'
                  ? 'bg-[#2E6F5E] text-white shadow-sm'
                  : 'text-[#646873] hover:text-[#181A1F]'
              }`}
            >
              Post-Menopausal (11 mg Fe)
            </button>
            <button
              onClick={() => setMenopausalStatus('pre')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                targets.menopausalStatus === 'pre'
                  ? 'bg-[#2E6F5E] text-white shadow-sm'
                  : 'text-[#646873] hover:text-[#181A1F]'
              }`}
            >
              Pre-Menopausal (29 mg Fe)
            </button>
          </div>

          <button
            onClick={handleRestore}
            className="p-2.5 rounded-full bg-[#F8F8F6] hover:bg-[#EFECE6] text-[#646873] hover:text-[#181A1F] border border-[#181A1F]/10 transition-colors"
            title="Restore Clinical Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Groups */}

      {/* 1. Macronutrients & Safety Guardrails */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#181A1F]/5">
          <div>
            <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide">
              1. Macronutrients & Limits
            </h3>
            <span className="text-xs text-[#646873]">
              Caloric balance, muscle retention, and cardiovascular ceilings
            </span>
          </div>
          <span className="text-xs font-semibold text-[#2E6F5E] bg-[#E7F2EF] px-2.5 py-1 rounded-full">
            ICMR-NIN 2020
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#646873] border-b border-[#181A1F]/5">
                <th className="py-2.5 font-semibold">Nutrient</th>
                <th className="py-2.5 font-semibold">Your Target Value</th>
                <th className="py-2.5 font-semibold hidden sm:table-cell">ICMR 2020 Reference</th>
                <th className="py-2.5 font-semibold">Clinical Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181A1F]/5">
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Energy (kcal)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.energyMin}
                      onChange={(e) => handleFieldChange('energyMin', e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={localTargets.energyMax}
                      onChange={(e) => handleFieldChange('energyMax', e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">1,660 kcal (Sedentary)</td>
                <td className="py-3 text-[#646873]">Maintains 53 kg body weight without catabolic loss</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Protein (g)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.proteinMin}
                      onChange={(e) => handleFieldChange('proteinMin', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={localTargets.proteinMax}
                      onChange={(e) => handleFieldChange('proteinMax', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>g</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">46–53 g (0.8–1.0 g/kg)</td>
                <td className="py-3 text-[#646873]">Target 1.0–1.2 g/kg (53–64 g) to counter sarcopenia</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Dietary Fibre (g)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.fibreMin}
                      onChange={(e) => handleFieldChange('fibreMin', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={localTargets.fibreMax}
                      onChange={(e) => handleFieldChange('fibreMax', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>g</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">25–30 g/day</td>
                <td className="py-3 text-[#646873]">Gut microbiome & metabolic regularity</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Sodium Limit (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#646873]">&lt;</span>
                    <input
                      type="number"
                      value={localTargets.sodiumMax}
                      onChange={(e) => handleFieldChange('sodiumMax', e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/20 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">&lt; 2,000 mg (5 g salt)</td>
                <td className="py-3 text-[#E11D48]">Crucial: High sodium triggers urinary calcium wasting</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Cholesterol Limit (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#646873]">&lt;</span>
                    <input
                      type="number"
                      value={localTargets.cholesterolMax}
                      onChange={(e) => handleFieldChange('cholesterolMax', e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/20 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">&lt; 300 mg/day</td>
                <td className="py-3 text-[#646873]">Cardiovascular guardrail (egg yolk control)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Bone-Health Minerals */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#181A1F]/5">
          <div>
            <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide">
              2. Bone-Health Minerals
            </h3>
            <span className="text-xs text-[#646873]">
              Post-bisphosphonate remineralization & electrolyte guardrails
            </span>
          </div>
          <span className="text-xs font-semibold text-[#2E6F5E] bg-[#E7F2EF] px-2.5 py-1 rounded-full">
            Osteoporosis Guideline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#646873] border-b border-[#181A1F]/5">
                <th className="py-2.5 font-semibold">Mineral</th>
                <th className="py-2.5 font-semibold">Your Target Value</th>
                <th className="py-2.5 font-semibold hidden sm:table-cell">Guideline Reference</th>
                <th className="py-2.5 font-semibold">Clinical Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181A1F]/5">
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Calcium (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.calciumMin}
                      onChange={(e) => handleFieldChange('calciumMin', e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-[#E7F2EF] text-[#2E6F5E] border border-[#2E6F5E]/20 font-bold tabular-nums"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={localTargets.calciumMax}
                      onChange={(e) => handleFieldChange('calciumMax', e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">1,000–1,200 mg (Max 2,000)</td>
                <td className="py-3 text-[#2E6F5E] font-medium">Split doses &le;500mg/meal for best uptake</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Phosphorus (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.phosphorusMin}
                      onChange={(e) => handleFieldChange('phosphorusMin', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={localTargets.phosphorusMax}
                      onChange={(e) => handleFieldChange('phosphorusMax', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">700–1,000 mg</td>
                <td className="py-3 text-[#646873]">Maintains 1:1 to 1:1.5 Ca:P bone balance</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Magnesium (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.magnesiumMin}
                      onChange={(e) => handleFieldChange('magnesiumMin', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={localTargets.magnesiumMax}
                      onChange={(e) => handleFieldChange('magnesiumMax', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">350–400 mg</td>
                <td className="py-3 text-[#646873]">Prevents post-zoledronic acid hypocalcemic spasm</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Iron (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.iron}
                      onChange={(e) => handleFieldChange('iron', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">
                  {targets.menopausalStatus === 'post' ? '11 mg (Post)' : '29 mg (Pre)'}
                </td>
                <td className="py-3 text-[#646873]">Take supplements &ge;2h apart from calcium</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Potassium (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.potassium}
                      onChange={(e) => handleFieldChange('potassium', e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">3,500 mg</td>
                <td className="py-3 text-[#646873]">Alkaline load neutralizes bone acid resorption</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-[#181A1F]">Zinc (mg)</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={localTargets.zincMin}
                      onChange={(e) => handleFieldChange('zincMin', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>–</span>
                    <input
                      type="number"
                      value={localTargets.zincMax}
                      onChange={(e) => handleFieldChange('zincMax', e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#F8F8F6] border border-[#181A1F]/10 font-bold tabular-nums"
                    />
                    <span>mg</span>
                  </div>
                </td>
                <td className="py-3 text-[#646873] hidden sm:table-cell">10–13.2 mg</td>
                <td className="py-3 text-[#646873]">Osteoblastic collagen synthesis cofactor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Vitamins & Lifestyle Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vitamins */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
          <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide mb-1">
            3. Vitamins
          </h3>
          <p className="text-xs text-[#646873] mb-4">Bone matrix activation & antioxidant synergy</p>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#F8F8F6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#181A1F] block">Vitamin D3</span>
                <span className="text-[11px] text-[#646873]">Food: 20–25 mcg (800–1000 IU) + Rx</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={localTargets.vitaminDMin}
                  onChange={(e) => handleFieldChange('vitaminDMin', e.target.value)}
                  className="w-14 px-2 py-1 rounded bg-white border border-[#181A1F]/10 font-bold tabular-nums text-xs"
                />
                <span className="text-xs">mcg</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F8F6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#181A1F] block">Vitamin C</span>
                <span className="text-[11px] text-[#646873]">Target: 75–100 mg (Collagen & Fe synergy)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={localTargets.vitaminCMin}
                  onChange={(e) => handleFieldChange('vitaminCMin', e.target.value)}
                  className="w-14 px-2 py-1 rounded bg-white border border-[#181A1F]/10 font-bold tabular-nums text-xs"
                />
                <span className="text-xs">mg</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F8F6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#181A1F] block">Vitamin K</span>
                <span className="text-[11px] text-[#646873]">Target: 55–90 mcg (Osteocalcin carboxylation)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={localTargets.vitaminKMin}
                  onChange={(e) => handleFieldChange('vitaminKMin', e.target.value)}
                  className="w-14 px-2 py-1 rounded bg-white border border-[#181A1F]/10 font-bold tabular-nums text-xs"
                />
                <span className="text-xs">mcg</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F8F6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#181A1F] block">Vitamin B12</span>
                <span className="text-[11px] text-[#646873]">Target: 2.2 mcg (Homocysteine guardrail)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={localTargets.vitaminB12}
                  onChange={(e) => handleFieldChange('vitaminB12', e.target.value)}
                  className="w-14 px-2 py-1 rounded bg-white border border-[#181A1F]/10 font-bold tabular-nums text-xs"
                />
                <span className="text-xs">mcg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lifestyle Targets */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
          <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide mb-1">
            4. Lifestyle Targets
          </h3>
          <p className="text-xs text-[#646873] mb-4">Hydration, UV-B synthesis, and BMI calibration</p>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#F8F8F6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#181A1F] block">Daily Water Intake</span>
                <span className="text-[11px] text-[#646873]">Prevents renal micro-calculi with calcium</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={localTargets.waterTargetMl}
                  onChange={(e) => handleFieldChange('waterTargetMl', e.target.value)}
                  className="w-20 px-2 py-1 rounded bg-white border border-[#181A1F]/10 font-bold tabular-nums text-xs"
                />
                <span className="text-xs">ml</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F8F6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#181A1F] block">Daily Sunlight Exposure</span>
                <span className="text-[11px] text-[#646873]">Between 10 AM – 2 PM (UV-B synthesis)</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={localTargets.sunlightTargetMins}
                  onChange={(e) => handleFieldChange('sunlightTargetMins', e.target.value)}
                  className="w-16 px-2 py-1 rounded bg-white border border-[#181A1F]/10 font-bold tabular-nums text-xs"
                />
                <span className="text-xs">mins</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F8F6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#181A1F] block">Target Body Weight</span>
                <span className="text-[11px] text-[#646873]">BMI 21.8 for 156 cm height</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={localTargets.targetWeightKg}
                  onChange={(e) => handleFieldChange('targetWeightKg', e.target.value)}
                  className="w-16 px-2 py-1 rounded bg-white border border-[#181A1F]/10 font-bold tabular-nums text-xs"
                />
                <span className="text-xs">kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSaveAll}
          className="px-8 py-3 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-[#8CE07A]" />
              <span>Targets Saved & Synced!</span>
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4 text-[#8CE07A]" />
              <span>Save & Apply Customized Targets</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

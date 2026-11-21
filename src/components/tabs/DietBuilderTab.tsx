'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DietPlanItem, MealSlot } from '@/lib/types';
import { calculateNutrientTotals } from '@/lib/clinical-engine';
import {
  Copy,
  Plus,
  Trash2,
  Save,
  Check,
  Flame,
  Dna,
  Bone,
  CheckCircle2,
  X,
  Droplets,
  Sun,
  ShieldAlert,
} from 'lucide-react';

export function DietBuilderTab() {
  const {
    targets,
    foods,
    dietPlans,
    activePlanId,
    activePlan,
    preppedPortions,
    setActivePlan,
    updateActivePlanItems,
    saveCurrentPlan,
    createNewPlan,
    duplicatePlan,
    deletePlan,
  } = useApp();

  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute live nutrient totals for current active plan
  const planTotals = calculateNutrientTotals(activePlan.items, foods);

  // Helper to check if a specific food/portion is in current plan items for a slot
  const isSelectedInSlot = (slot: MealSlot, foodId: string) => {
    return activePlan.items.some((i) => i.mealSlot === slot && i.foodId === foodId);
  };

  // Single-pick handler (radio style)
  const handlePickSingle = (
    slot: MealSlot,
    foodId: string,
    portionName: string,
    weightG: number,
    quantity = 1
  ) => {
    // If already selected, clicking it can unselect or keep
    const filtered = activePlan.items.filter((i) => i.mealSlot !== slot);
    const existing = activePlan.items.find((i) => i.mealSlot === slot && i.foodId === foodId);

    if (existing) {
      // Toggle off
      updateActivePlanItems(filtered);
    } else {
      const newItem: DietPlanItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        planId: activePlan.id,
        mealSlot: slot,
        foodId,
        portionName,
        weightG,
        quantity,
      };
      updateActivePlanItems([...filtered, newItem]);
    }
  };

  // Multi-select toggle handler
  const handleToggleMulti = (
    slot: MealSlot,
    foodId: string,
    portionName: string,
    weightG: number,
    quantity = 1
  ) => {
    const isPresent = activePlan.items.some((i) => i.mealSlot === slot && i.foodId === foodId);
    if (isPresent) {
      const filtered = activePlan.items.filter((i) => !(i.mealSlot === slot && i.foodId === foodId));
      updateActivePlanItems(filtered);
    } else {
      const newItem: DietPlanItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        planId: activePlan.id,
        mealSlot: slot,
        foodId,
        portionName,
        weightG,
        quantity,
      };
      updateActivePlanItems([...activePlan.items, newItem]);
    }
  };

  const handleSave = async () => {
    await saveCurrentPlan();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    await createNewPlan(newPlanName.trim(), true);
    setNewPlanName('');
    setNewPlanModalOpen(false);
  };

  const handleDeletePlan = async (id: string) => {
    if (dietPlans.length <= 1) {
      alert('You must keep at least one diet plan template.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${activePlan.name}"?`)) {
      await deletePlan(id);
    }
  };

  return (
    <div className="space-y-6 pb-36 md:pb-28 animate-fade-in relative">
      {/* 1. Saved Diet Plan Switcher Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-[#181A1F]/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold text-[#181A1F]">Diet Builder & Plan Manager</h2>
            <p className="text-xs text-[#646873]">
              Switch templates or compose a customized meal day with live nutrient calculation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setNewPlanModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#8CE07A]" />
              <span>New Plan</span>
            </button>
            <button
              onClick={() => duplicatePlan(activePlan.id)}
              className="px-3 py-1.5 rounded-full bg-[#F8F8F6] hover:bg-[#EFECE6] text-[#181A1F] border border-[#181A1F]/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Duplicate current plan"
            >
              <Copy className="w-3.5 h-3.5 text-[#646873]" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-full bg-[#181A1F] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#8CE07A]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
            {dietPlans.length > 1 && (
              <button
                onClick={() => handleDeletePlan(activePlan.id)}
                className="p-2 rounded-full bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] transition-colors"
                title="Delete this plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal scrollable pills for all plans */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {dietPlans.map((plan) => {
            const isActive = plan.id === activePlanId;
            return (
              <button
                key={plan.id}
                onClick={() => setActivePlan(plan.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2E6F5E] text-white shadow-soft ring-2 ring-[#8CE07A]/40'
                    : 'bg-[#F8F8F6] text-[#646873] hover:text-[#181A1F] hover:bg-[#EFECE6] border border-[#181A1F]/5'
                }`}
              >
                {plan.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Structured Meal Category Slots */}
      <div className="space-y-5">
        {/* Slot: Morning Eggs */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Slot 1
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Eggs Preparation (Pick 1 or None)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">1 Whole + 1 White caps yolk cholesterol at 185mg</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                id: 'egg_combo',
                label: '1 Whole Egg + 1 Egg White (~85g)',
                foodId: 'egg_whole',
                weightG: 50,
                pairedFoodId: 'egg_white',
                pairedWeightG: 35,
              },
              { id: 'egg_two', label: '2 Boiled Eggs (100g)', foodId: 'egg_whole', weightG: 100 },
              { id: 'egg_none', label: 'None', foodId: 'none', weightG: 0 },
            ].map((opt) => {
              const isSelected =
                opt.foodId === 'none'
                  ? !activePlan.items.some((i) => i.mealSlot === 'morning_eggs')
                  : activePlan.items.some((i) => i.mealSlot === 'morning_eggs' && i.foodId === opt.foodId);

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const withoutEggs = activePlan.items.filter((i) => i.mealSlot !== 'morning_eggs');
                    if (opt.foodId === 'none') {
                      updateActivePlanItems(withoutEggs);
                    } else if (opt.pairedFoodId) {
                      // 1 Whole + 1 White combo
                      const item1: DietPlanItem = {
                        id: `item_${Date.now()}_1`,
                        planId: activePlan.id,
                        mealSlot: 'morning_eggs',
                        foodId: opt.foodId,
                        portionName: '1 Whole Egg (50g)',
                        weightG: opt.weightG,
                        quantity: 1,
                      };
                      const item2: DietPlanItem = {
                        id: `item_${Date.now()}_2`,
                        planId: activePlan.id,
                        mealSlot: 'morning_eggs',
                        foodId: opt.pairedFoodId,
                        portionName: '1 Egg White (35g)',
                        weightG: opt.pairedWeightG,
                        quantity: 1,
                      };
                      updateActivePlanItems([...withoutEggs, item1, item2]);
                    } else {
                      const item: DietPlanItem = {
                        id: `item_${Date.now()}`,
                        planId: activePlan.id,
                        mealSlot: 'morning_eggs',
                        foodId: opt.foodId,
                        portionName: opt.label,
                        weightG: opt.weightG,
                        quantity: 2,
                      };
                      updateActivePlanItems([...withoutEggs, item]);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Morning Daily Fruits (Multi-select) */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Slot 2
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Daily Fruits (Multi-select)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Daily staples for potassium & antioxidant polyphenols</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'pomegranate', label: 'Pomegranate (100g)', weightG: 100 },
              { id: 'banana_yelakki', label: 'Banana Yelakki (100g)', weightG: 100 },
            ].map((f) => {
              const isChecked = isSelectedInSlot('morning_fruit_daily', f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => handleToggleMulti('morning_fruit_daily', f.id, f.label, f.weightG)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border flex items-center gap-2 ${
                    isChecked
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                      isChecked
                        ? 'bg-[#2E6F5E] text-white border-[#2E6F5E]'
                        : 'border-[#181A1F]/20 bg-white'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Morning Rotating Fruit (Pick 1) */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Slot 3
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Rotating Fruit (Pick 1, 100g)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">High Vitamin C boosts non-heme iron absorption</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'papaya', label: 'Papaya (100g)' },
              { id: 'guava', label: 'Guava (100g — 228mg Vit C!)' },
              { id: 'sapota', label: 'Sapota (100g)' },
              { id: 'apple', label: 'Apple (100g)' },
              { id: 'orange', label: 'Orange (100g)' },
              { id: 'pineapple', label: 'Pineapple (100g)' },
            ].map((f) => {
              const isSelected = isSelectedInSlot('morning_fruit_rotating', f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => handlePickSingle('morning_fruit_rotating', f.id, f.label, 100)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Morning Breakfast (Pick 1) */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Slot 4
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Breakfast Dosa / Grain (Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Ragi provides 170mg calcium; Moong provides 12g protein</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ragi_dosa', label: 'Ragi Dosa ×2 (56g)', weightG: 56, qty: 2 },
              { id: 'moong_dosa', label: 'Moong Dosa ×2 (56g)', weightG: 56, qty: 2 },
              { id: 'muesli', label: 'Muesli (40g) + Toned Milk (150ml)', weightG: 190, qty: 1 },
            ].map((opt) => {
              const isSelected = isSelectedInSlot('morning_breakfast', opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handlePickSingle('morning_breakfast', opt.id, opt.label, opt.weightG, opt.qty)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Afternoon Staple Grain */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Slot 5
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Staple Cooked Rice Portion</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Controlled starch portion for glycemic index stability</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'rice_70', label: 'Rice Cooked 70 g (Default)', foodId: 'rice_cooked', weightG: 70 },
              { id: 'rice_100', label: 'Rice Cooked 100 g', foodId: 'rice_cooked', weightG: 100 },
              { id: 'rice_none', label: 'No Rice / Low Carb', foodId: 'none', weightG: 0 },
            ].map((opt) => {
              const isSelected =
                opt.foodId === 'none'
                  ? !activePlan.items.some((i) => i.mealSlot === 'afternoon_grain')
                  : activePlan.items.some(
                      (i) => i.mealSlot === 'afternoon_grain' && i.weightG === opt.weightG
                    );
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const filtered = activePlan.items.filter((i) => i.mealSlot !== 'afternoon_grain');
                    if (opt.foodId === 'none') {
                      updateActivePlanItems(filtered);
                    } else {
                      const item: DietPlanItem = {
                        id: `item_${Date.now()}`,
                        planId: activePlan.id,
                        mealSlot: 'afternoon_grain',
                        foodId: opt.foodId,
                        portionName: opt.label,
                        weightG: opt.weightG,
                        quantity: 1,
                      };
                      updateActivePlanItems([...filtered, item]);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Afternoon Gravy / Dal (~150 ml, Pick 1) */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Slot 6
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Gravy / Dal (~150 ml, Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Keerai Masiyal delivers 150mg natural calcium</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'keerai_masiyal', label: 'Keerai Masiyal (Green Leaves Curry)' },
              { id: 'sambar', label: 'Sambar (Dal + Veg)' },
              { id: 'moong_dal_curry', label: 'Moong Dal Curry' },
              { id: 'kootu', label: 'Kootu' },
              { id: 'rasam', label: 'Rasam' },
              { id: 'vatha_kuzhambu', label: 'Vatha / Kara Kuzhambu' },
              { id: 'mor_kuzhambu', label: 'Mor Kuzhambu' },
            ].map((f) => {
              const isSelected = isSelectedInSlot('afternoon_gravy', f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => handlePickSingle('afternoon_gravy', f.id, f.label, 150)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Afternoon Primary Protein (Pick 1) */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Slot 7
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Primary Protein (Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Soy Chunks 50g dry yields 26g protein + 135mg calcium</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'soy_chunks', label: 'Soy Chunks (50g dry)', weightG: 50 },
              { id: 'chicken_breast', label: 'Chicken Breast (100g cooked)', weightG: 100 },
              { id: 'paneer', label: 'Paneer (50g)', weightG: 50 },
            ].map((f) => {
              const isSelected = isSelectedInSlot('afternoon_protein', f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => handlePickSingle('afternoon_protein', f.id, f.label, f.weightG)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Afternoon Poriyal (Pick 1) */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Slot 8
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Vegetable Poriyal (100g, Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Greens / Keerai poriyal gives 160mg calcium</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'keerai_poriyal', label: 'Greens / Keerai Poriyal' },
              { id: 'french_beans', label: 'French Beans' },
              { id: 'carrot', label: 'Carrot' },
              { id: 'beetroot', label: 'Beetroot' },
              { id: 'drumstick_pods', label: 'Drumstick Pods' },
              { id: 'cabbage', label: 'Cabbage' },
              { id: 'ladies_finger', label: 'Ladies Finger' },
              { id: 'brinjal', label: 'Brinjal' },
              { id: 'pumpkin', label: 'Pumpkin' },
              { id: 'cluster_beans', label: 'Cluster Beans' },
              { id: 'bottle_gourd', label: 'Bottle Gourd' },
            ].map((f) => {
              const isSelected = isSelectedInSlot('afternoon_poriyal', f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => handlePickSingle('afternoon_poriyal', f.id, `${f.label} (100g)`, 100)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Afternoon Accompaniment */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Slot 9
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Curd Accompaniment</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Lactic probiotics & gentle calcium</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'curd_15', label: 'Curd 1 tbsp / 15 g', foodId: 'curd', weightG: 15 },
              { id: 'curd_50', label: 'Curd 50 g (1/2 cup)', foodId: 'curd', weightG: 50 },
              { id: 'curd_none', label: 'None', foodId: 'none', weightG: 0 },
            ].map((opt) => {
              const isSelected =
                opt.foodId === 'none'
                  ? !activePlan.items.some((i) => i.mealSlot === 'afternoon_accompaniment')
                  : activePlan.items.some(
                      (i) => i.mealSlot === 'afternoon_accompaniment' && i.weightG === opt.weightG
                    );
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const filtered = activePlan.items.filter((i) => i.mealSlot !== 'afternoon_accompaniment');
                    if (opt.foodId === 'none') {
                      updateActivePlanItems(filtered);
                    } else {
                      const item: DietPlanItem = {
                        id: `item_${Date.now()}`,
                        planId: activePlan.id,
                        mealSlot: 'afternoon_accompaniment',
                        foodId: opt.foodId,
                        portionName: opt.label,
                        weightG: opt.weightG,
                        quantity: 1,
                      };
                      updateActivePlanItems([...filtered, item]);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot: Night Meal & Extra Items (Multi-select) */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Night &bull; Slot 10
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Night Meal & Extra Items (Multi-select)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Crucial for nocturnal calcium homeostasis & satiety</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ragi_dosa', label: 'Ragi Dosa ×2 (56g)', weightG: 56, qty: 2 },
              { id: 'chapati', label: 'Chapati ×2 (70g)', weightG: 70, qty: 2 },
              { id: 'sambar', label: 'Sambar (150ml)', weightG: 150, qty: 1.5 },
              { id: 'moong_dal_curry', label: 'Moong Dal Curry (150ml)', weightG: 150, qty: 1.5 },
              { id: 'kootu', label: 'Kootu (150ml)', weightG: 150, qty: 1.5 },
              { id: 'muesli', label: 'Muesli (40g)', weightG: 40, qty: 0.4 },
              { id: 'milk_toned', label: 'Toned Milk (150ml warm)', weightG: 150, qty: 1.5 },
            ].map((opt) => {
              const isChecked = isSelectedInSlot('night_meal', opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handleToggleMulti('night_meal', opt.id, opt.label, opt.weightG, opt.qty)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border flex items-center gap-2 ${
                    isChecked
                      ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/30 shadow-sm'
                      : 'bg-[#F8F8F6] text-[#646873] border-transparent hover:bg-[#EFECE6]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                      isChecked
                        ? 'bg-[#2E6F5E] text-white border-[#2E6F5E]'
                        : 'border-[#181A1F]/20 bg-white'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Live Totalizer Strip */}
      <div className="fixed bottom-14 md:bottom-0 inset-x-0 z-30 p-2 sm:p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto bg-[#181A1F] text-white rounded-2xl sm:rounded-3xl p-3 sm:px-6 sm:py-3.5 shadow-floating border border-white/10 pointer-events-auto backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
            {/* Calories */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 text-[#8CE07A]" />
              <span className="text-white/60">Energy:</span>
              <span className="font-bold tabular-nums">{planTotals.calories} kcal</span>
            </div>

            {/* Protein */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Dna className="w-3.5 h-3.5 text-[#8CE07A]" />
              <span className="text-white/60">Prot:</span>
              <span className="font-bold tabular-nums">{planTotals.protein}g</span>
            </div>

            {/* Calcium */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Bone className="w-3.5 h-3.5 text-[#8CE07A]" />
              <span className="text-white/60">Calcium:</span>
              <span className="font-bold tabular-nums text-[#8CE07A]">{planTotals.calcium}mg</span>
            </div>

            {/* Iron */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-white/60">Iron:</span>
              <span className="font-bold tabular-nums">{planTotals.iron}mg</span>
            </div>

            {/* Sodium */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-white/60">Sodium:</span>
              <span
                className={`font-bold tabular-nums ${
                  planTotals.sodium > targets.sodiumMax ? 'text-[#E11D48]' : 'text-white'
                }`}
              >
                {planTotals.sodium}mg
              </span>
            </div>

            {/* Cholesterol */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-white/60">Chol:</span>
              <span
                className={`font-bold tabular-nums ${
                  planTotals.cholesterol > targets.cholesterolMax ? 'text-[#E11D48]' : 'text-white'
                }`}
              >
                {planTotals.cholesterol}mg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Save As New Plan */}
      {newPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#181A1F]/10 relative">
            <button
              onClick={() => setNewPlanModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#EFECE6] text-[#646873]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#181A1F] mb-1">Create New Diet Plan</h3>
            <p className="text-xs text-[#646873] mb-4">
              Give your new variation a descriptive name (e.g. &quot;Plan E: Weekend High-Energy&quot;).
            </p>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#181A1F] mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plan E: High-Calcium Weekend"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPlanModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#181A1F]/10 text-xs font-semibold text-[#646873]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#2E6F5E] text-white text-xs font-semibold shadow-soft"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

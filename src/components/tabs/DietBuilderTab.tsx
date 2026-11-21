'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DietPlanItem, FoodItem, MealSlot } from '@/lib/types';
import { calculateNutrientTotals } from '@/lib/clinical-engine';
import { PlanSelector } from '@/components/PlanSelector';
import { FoodDetailModal } from '@/components/FoodDetailModal';
import {
  isOptionSelected,
  getOptionDisplayWeight,
  applyOptionSelection,
  FoodOption,
} from '@/lib/selection-engine';
import {
  Copy,
  Plus,
  Pencil,
  Trash2,
  Save,
  Check,
  Flame,
  Dna,
  Bone,
  X,
  Info,
} from 'lucide-react';

export function DietBuilderTab() {
  const {
    targets,
    foods,
    dietPlans,
    activePlan,
    updateActivePlanItems,
    saveCurrentPlan,
    createNewPlan,
    duplicatePlan,
    renamePlan,
    deletePlan,
  } = useApp();

  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamePlanName, setRenamePlanName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Detail Modal State
  const [detailModalFood, setDetailModalFood] = useState<FoodItem | null>(null);
  const [detailModalSlot, setDetailModalSlot] = useState<MealSlot>('morning_fruit_daily');
  const [detailModalSlotLabel, setDetailModalSlotLabel] = useState<string>('');
  const [detailModalWeightG, setDetailModalWeightG] = useState<number>(100);
  const [detailModalQuantity, setDetailModalQuantity] = useState<number>(1);

  // Compute live nutrient totals for current active plan
  const planTotals = calculateNutrientTotals(activePlan.items, foods);

  // Helper to check if a specific food/portion is in current plan items for a slot
  const isSelectedInSlot = (slot: MealSlot, foodId: string) => {
    return activePlan.items.some((i) => i.mealSlot === slot && i.foodId === foodId);
  };

  // Open full-nutrient inspection sheet
  const handleOpenDetail = (
    foodId: string,
    slot: MealSlot,
    slotLabel: string,
    defaultWeightG = 100,
    defaultQuantity = 1
  ) => {
    const food = foods.find((f) => f.id === foodId);
    if (!food) return;

    const existing = activePlan.items.find((i) => i.mealSlot === slot && i.foodId === foodId);
    setDetailModalFood(food);
    setDetailModalSlot(slot);
    setDetailModalSlotLabel(slotLabel);
    setDetailModalWeightG(existing ? existing.weightG : defaultWeightG);
    setDetailModalQuantity(existing ? existing.quantity : defaultQuantity);
  };

  // Apply portion from modal
  const handleApplyPortionFromModal = (
    foodId: string,
    weightG: number,
    quantity: number,
    portionName: string,
    slot: MealSlot
  ) => {
    const isSingleSlot = [
      'morning_eggs',
      'morning_fruit_rotating',
      'morning_breakfast',
      'afternoon_grain',
      'afternoon_gravy',
      'afternoon_protein',
      'afternoon_poriyal',
      'afternoon_accompaniment',
    ].includes(slot);

    const filtered = isSingleSlot
      ? activePlan.items.filter((i) => i.mealSlot !== slot)
      : activePlan.items.filter((i) => !(i.mealSlot === slot && i.foodId === foodId));

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
  };

  const handleRemovePortionFromModal = (foodId: string, slot: MealSlot) => {
    const isSingleSlot = [
      'morning_eggs',
      'morning_fruit_rotating',
      'morning_breakfast',
      'afternoon_grain',
      'afternoon_gravy',
      'afternoon_protein',
      'afternoon_poriyal',
      'afternoon_accompaniment',
    ].includes(slot);

    const filtered = isSingleSlot
      ? activePlan.items.filter((i) => i.mealSlot !== slot)
      : activePlan.items.filter((i) => !(i.mealSlot === slot && i.foodId === foodId));

    updateActivePlanItems(filtered);
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

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamePlanName.trim()) return;
    await renamePlan(activePlan.id, renamePlanName.trim());
    setRenameModalOpen(false);
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

  // Helper renderer for a single food item chip with key metrics & inspect button
  const renderItemChip = (
    opt: FoodOption,
    slot: MealSlot,
    slotTitle: string,
    mode: 'single' | 'multi' = 'single'
  ) => {
    const isNone = opt.foodId === 'none';
    const isSelected = isOptionSelected(opt, slot, activePlan.items);
    const displayWeight = getOptionDisplayWeight(opt, slot, activePlan.items);

    return (
      <div
        key={opt.id}
        className={`group relative rounded-2xl border transition-all flex items-center justify-between gap-2 p-1.5 pl-3 ${
          isSelected
            ? 'bg-[#E7F2EF] border-[#2E6F5E]/30 text-[#181A1F] shadow-xs'
            : 'bg-[#F8F8F6] border-[#181A1F]/5 text-[#646873] hover:bg-[#EFECE6]'
        }`}
      >
        {/* Clickable Area to Toggle */}
        <button
          type="button"
          onClick={() => {
            const nextItems = applyOptionSelection(
              opt,
              slot,
              mode,
              activePlan.items,
              activePlan.id
            );
            updateActivePlanItems(nextItems);
          }}
          className="flex-1 flex flex-col text-left py-0.5 cursor-pointer focus:outline-none"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                isSelected
                  ? 'bg-[#2E6F5E] text-white border-[#2E6F5E]'
                  : 'bg-white border-[#181A1F]/20 text-transparent'
              }`}
            >
              ✓
            </span>
            <span className="font-bold text-xs text-[#181A1F] leading-tight">{opt.name}</span>
            {!isNone && displayWeight > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white border border-[#181A1F]/10 text-[#646873]">
                {displayWeight}
                {opt.unit || 'g'}
              </span>
            )}
          </div>

          {opt.metrics && (
            <span className="text-[10px] text-[#646873] ml-5 leading-normal mt-0.5 font-medium">
              {opt.metrics}
            </span>
          )}
        </button>

        {/* Inspect Sheet / Modal Trigger (Info icon) */}
        {!isNone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail(opt.foodId, slot, slotTitle, displayWeight, opt.qty || 1);
            }}
            title="Inspect 18 nutrients & scale portion"
            className="p-1.5 rounded-xl hover:bg-white text-[#646873] hover:text-[#2E6F5E] transition-colors border border-transparent hover:border-[#181A1F]/10 flex-shrink-0 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-36 md:pb-28 animate-fade-in relative">
      {/* 1. Saved Diet Plan Switcher Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-[#181A1F]/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#181A1F] mb-2">Diet Builder & Plan Manager</h2>
            {/* Plan Selector Dropdown + "Set as Default" */}
            <PlanSelector />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            <button
              onClick={() => setNewPlanModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#8CE07A]" />
              <span>New Plan</span>
            </button>
            <button
              onClick={() => duplicatePlan(activePlan.id)}
              className="px-3.5 py-2 rounded-full bg-[#F8F8F6] hover:bg-[#EFECE6] text-[#181A1F] border border-[#181A1F]/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Duplicate current plan"
            >
              <Copy className="w-3.5 h-3.5 text-[#646873]" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>
            <button
              onClick={() => {
                setRenamePlanName(activePlan.name);
                setRenameModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-full bg-[#F8F8F6] hover:bg-[#EFECE6] text-[#181A1F] border border-[#181A1F]/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Rename current plan"
            >
              <Pencil className="w-3.5 h-3.5 text-[#646873]" />
              <span className="hidden sm:inline">Rename</span>
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-2 rounded-full bg-[#181A1F] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
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
                className="p-2.5 rounded-full bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] transition-colors"
                title="Delete this plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Structured Meal Category Slots */}
      <div className="space-y-5">
        {/* Category 1: Eggs Preparation */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Category 1
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Eggs Preparation (Pick 1 or None)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">1 Whole + 1 White caps yolk cholesterol at 185mg</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'egg_combo',
                name: '1 Whole Egg + 1 Egg White',
                foodId: 'egg_whole',
                defaultWeightG: 85,
                pairedFoodId: 'egg_white',
                pairedWeightG: 35,
                metrics: '10g Prot • 185mg Chol • 27mg Ca',
              },
              {
                id: 'egg_two',
                name: '2 Boiled Eggs',
                foodId: 'egg_whole',
                defaultWeightG: 100,
                qty: 2,
                metrics: '12.6g Prot • 370mg Chol • 50mg Ca',
              },
              {
                id: 'egg_none',
                name: 'None (Egg-free)',
                foodId: 'none',
                defaultWeightG: 0,
                metrics: 'No eggs selected',
              },
            ].map((opt) => renderItemChip(opt, 'morning_eggs', 'Eggs Preparation', 'single'))}
          </div>
        </div>

        {/* Category 2: Daily Fruits */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Category 2
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Daily Fruits (Multi-select)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Daily staples for potassium & antioxidant polyphenols</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: 'pomegranate',
                name: 'Pomegranate',
                foodId: 'pomegranate',
                defaultWeightG: 100,
                metrics: '236mg Potassium • 4g Fibre • 10mg Vit C',
              },
              {
                id: 'banana_yelakki',
                name: 'Banana Yelakki',
                foodId: 'banana_yelakki',
                defaultWeightG: 100,
                metrics: '358mg Potassium • 27mg Mg • 2.6g Fibre',
              },
            ].map((opt) => renderItemChip(opt, 'morning_fruit_daily', 'Daily Fruits', 'multi'))}
          </div>
        </div>

        {/* Category 3: Rotating Fruit */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Category 3
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Rotating Fruit (Pick 1, 100g)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">High Vitamin C boosts non-heme iron absorption</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'guava',
                name: 'Guava',
                foodId: 'guava',
                defaultWeightG: 100,
                metrics: '228mg Vit C! • 18mg Ca • 417mg K',
              },
              {
                id: 'papaya',
                name: 'Papaya',
                foodId: 'papaya',
                defaultWeightG: 100,
                metrics: '61mg Vit C • 20mg Ca • 21mg Mg',
              },
              {
                id: 'orange',
                name: 'Orange',
                foodId: 'orange',
                defaultWeightG: 100,
                metrics: '53mg Vit C • 40mg Ca • 181mg K',
              },
              {
                id: 'pineapple',
                name: 'Pineapple',
                foodId: 'pineapple',
                defaultWeightG: 100,
                metrics: '48mg Vit C • 13mg Ca • 109mg K',
              },
              {
                id: 'sapota',
                name: 'Sapota (Chikoo)',
                foodId: 'sapota',
                defaultWeightG: 100,
                metrics: '5.3g Fibre • 21mg Ca • 15mg Vit C',
              },
              {
                id: 'apple',
                name: 'Apple',
                foodId: 'apple',
                defaultWeightG: 100,
                metrics: '2.4g Fibre • 107mg K • 52 kcal',
              },
            ].map((opt) => renderItemChip(opt, 'morning_fruit_rotating', 'Rotating Fruit', 'single'))}
          </div>
        </div>

        {/* Category 4: Breakfast Dosa / Grain */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Morning &bull; Category 4
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Breakfast Dosa / Grain (Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Ragi provides 170mg calcium; Moong provides 12g protein</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'ragi_dosa',
                name: 'Ragi Dosa ×2',
                foodId: 'ragi_dosa',
                defaultWeightG: 56,
                qty: 2,
                metrics: '170mg Calcium • 4g Prot • 5g Fibre',
              },
              {
                id: 'moong_dosa',
                name: 'Moong Dosa ×2',
                foodId: 'moong_dosa',
                defaultWeightG: 56,
                qty: 2,
                metrics: '12g Protein • 62mg Ca • 3.4mg Fe',
              },
              {
                id: 'muesli',
                name: 'Muesli (40g) + Milk (150ml)',
                foodId: 'muesli',
                defaultWeightG: 190,
                qty: 1,
                metrics: '8.2g Prot • 189mg Ca • 235 kcal',
              },
            ].map((opt) => renderItemChip(opt, 'morning_breakfast', 'Breakfast Dosa / Grain', 'single'))}
          </div>
        </div>

        {/* Category 5: Staple Grain */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Category 5
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Staple Cooked Rice Portion</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Controlled starch portion for glycemic index stability</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'rice_70',
                name: 'Rice Cooked 70 g',
                foodId: 'rice_cooked',
                defaultWeightG: 70,
                metrics: '91 kcal • 1.9g Prot • 19.6g Carbs',
              },
              {
                id: 'rice_100',
                name: 'Rice Cooked 100 g',
                foodId: 'rice_cooked',
                defaultWeightG: 100,
                metrics: '130 kcal • 2.7g Prot • 28g Carbs',
              },
              {
                id: 'rice_none',
                name: 'No Rice / Low Carb',
                foodId: 'none',
                defaultWeightG: 0,
                metrics: 'Zero starch portion',
              },
            ].map((opt) => renderItemChip(opt, 'afternoon_grain', 'Staple Cooked Rice', 'single'))}
          </div>
        </div>

        {/* Category 6: Gravy / Dal */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Category 6
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Gravy / Dal (~150 ml, Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Keerai Masiyal delivers 150mg natural calcium</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'keerai_masiyal',
                name: 'Keerai Masiyal',
                foodId: 'keerai_masiyal',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '150mg Calcium • 4g Prot • 120mcg Vit K',
              },
              {
                id: 'moong_dal_curry',
                name: 'Moong Dal Curry',
                foodId: 'moong_dal_curry',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '6.5g Protein • 26mg Ca • 1.3mg Fe',
              },
              {
                id: 'sambar',
                name: 'Sambar (Dal + Veg)',
                foodId: 'sambar',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '4.5g Protein • 45mg Ca • 300mg Na',
              },
              {
                id: 'kootu',
                name: 'Kootu (Dal + Veg)',
                foodId: 'kootu',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '5g Protein • 45mg Ca • 100 kcal',
              },
              {
                id: 'mor_kuzhambu',
                name: 'Mor Kuzhambu',
                foodId: 'mor_kuzhambu',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '100mg Ca • 3g Prot • 90 kcal',
              },
              {
                id: 'rasam',
                name: 'Rasam',
                foodId: 'rasam',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '35 kcal • 15mg Ca • 350mg Na',
              },
              {
                id: 'vatha_kuzhambu',
                name: 'Vatha / Kara Kuzhambu',
                foodId: 'vatha_kuzhambu',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '110 kcal • 40mg Ca • 380mg Na',
              },
            ].map((opt) => renderItemChip(opt, 'afternoon_gravy', 'Gravy / Dal', 'single'))}
          </div>
        </div>

        {/* Category 7: Primary Protein */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Category 7
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Primary Protein (Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Soy Chunks 50g dry yields 26g protein + 135mg calcium</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'soy_chunks',
                name: 'Soy Chunks (dry)',
                foodId: 'soy_chunks',
                defaultWeightG: 50,
                metrics: '26g Protein • 135mg Calcium • 4.6mg Iron',
              },
              {
                id: 'chicken_breast',
                name: 'Chicken Breast (cooked)',
                foodId: 'chicken_breast',
                defaultWeightG: 100,
                metrics: '31g Protein • 15mg Ca • 85mg Chol',
              },
              {
                id: 'paneer',
                name: 'Paneer (Cottage Cheese)',
                foodId: 'paneer',
                defaultWeightG: 50,
                metrics: '9g Protein • 125mg Calcium • 140 kcal',
              },
            ].map((opt) => renderItemChip(opt, 'afternoon_protein', 'Primary Protein', 'single'))}
          </div>
        </div>

        {/* Category 8: Vegetable Poriyal */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Category 8
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Vegetable Poriyal (100g, Pick 1)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Greens / Keerai poriyal gives 160mg calcium</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {[
              {
                id: 'keerai_poriyal',
                name: 'Greens / Keerai Poriyal',
                foodId: 'keerai_poriyal',
                defaultWeightG: 100,
                metrics: '160mg Ca • 140mcg Vit K • 3.2g Prot',
              },
              {
                id: 'cluster_beans',
                name: 'Cluster Beans',
                foodId: 'cluster_beans',
                defaultWeightG: 100,
                metrics: '130mg Calcium • 4.5g Fibre',
              },
              {
                id: 'ladies_finger',
                name: 'Ladies Finger (Okra)',
                foodId: 'ladies_finger',
                defaultWeightG: 100,
                metrics: '82mg Calcium • 3.2g Fibre',
              },
              {
                id: 'cabbage',
                name: 'Cabbage',
                foodId: 'cabbage',
                defaultWeightG: 100,
                metrics: '40mg Calcium • 36mg Vit C',
              },
              {
                id: 'french_beans',
                name: 'French Beans',
                foodId: 'french_beans',
                defaultWeightG: 100,
                metrics: '37mg Calcium • 3.4g Fibre',
              },
              {
                id: 'carrot',
                name: 'Carrot',
                foodId: 'carrot',
                defaultWeightG: 100,
                metrics: '33mg Calcium • 2.8g Fibre',
              },
              {
                id: 'drumstick_pods',
                name: 'Drumstick Pods',
                foodId: 'drumstick_pods',
                defaultWeightG: 100,
                metrics: '30mg Calcium • 141mg Vit C',
              },
              {
                id: 'bottle_gourd',
                name: 'Bottle Gourd',
                foodId: 'bottle_gourd',
                defaultWeightG: 100,
                metrics: '26mg Calcium • 14 kcal',
              },
              {
                id: 'pumpkin',
                name: 'Pumpkin',
                foodId: 'pumpkin',
                defaultWeightG: 100,
                metrics: '21mg Calcium • 340mg Potassium',
              },
              {
                id: 'beetroot',
                name: 'Beetroot',
                foodId: 'beetroot',
                defaultWeightG: 100,
                metrics: '16mg Calcium • 0.8mg Iron',
              },
              {
                id: 'brinjal',
                name: 'Brinjal',
                foodId: 'brinjal',
                defaultWeightG: 100,
                metrics: '9mg Calcium • 3g Fibre',
              },
            ].map((opt) => renderItemChip(opt, 'afternoon_poriyal', 'Vegetable Poriyal', 'single'))}
          </div>
        </div>

        {/* Category 9: Curd Accompaniment */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Afternoon &bull; Category 9
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Curd Accompaniment</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Lactic probiotics & gentle calcium</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'curd_15',
                name: 'Curd 1 tbsp (15g)',
                foodId: 'curd',
                defaultWeightG: 15,
                metrics: '18mg Calcium • 0.5g Prot • 9 kcal',
              },
              {
                id: 'curd_50',
                name: 'Curd 1/2 cup (50g)',
                foodId: 'curd',
                defaultWeightG: 50,
                metrics: '60mg Calcium • 1.5g Prot • 30 kcal',
              },
              {
                id: 'curd_none',
                name: 'None',
                foodId: 'none',
                defaultWeightG: 0,
                metrics: 'No dairy accompaniment',
              },
            ].map((opt) => renderItemChip(opt, 'afternoon_accompaniment', 'Curd Accompaniment', 'single'))}
          </div>
        </div>

        {/* Category 10: Night Meal & Extra Items */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6F5E]">
                Night &bull; Category 10
              </span>
              <h3 className="text-sm font-bold text-[#181A1F]">Night Meal & Extra Items (Multi-select)</h3>
            </div>
            <span className="text-[11px] text-[#646873]">Crucial for nocturnal calcium homeostasis & satiety</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'ragi_dosa_night',
                name: 'Ragi Dosa ×2',
                foodId: 'ragi_dosa',
                defaultWeightG: 56,
                qty: 2,
                metrics: '170mg Calcium • 4g Prot • 205 kcal',
              },
              {
                id: 'chapati_night',
                name: 'Chapati ×2',
                foodId: 'chapati',
                defaultWeightG: 70,
                qty: 2,
                metrics: '7g Protein • 5.6g Fibre • 24mg Ca',
              },
              {
                id: 'sambar_night',
                name: 'Sambar (150ml)',
                foodId: 'sambar',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '45mg Calcium • 4.5g Prot',
              },
              {
                id: 'moong_dal_curry_night',
                name: 'Moong Dal Curry (150ml)',
                foodId: 'moong_dal_curry',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '6.5g Prot • 26mg Ca',
              },
              {
                id: 'kootu_night',
                name: 'Kootu (150ml)',
                foodId: 'kootu',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '5g Prot • 45mg Ca',
              },
              {
                id: 'muesli_night',
                name: 'Muesli (40g)',
                foodId: 'muesli',
                defaultWeightG: 40,
                metrics: '148 kcal • 3.4g Prot • 3g Fibre',
              },
              {
                id: 'milk_toned_night',
                name: 'Toned Milk (150ml warm)',
                foodId: 'milk_toned',
                defaultWeightG: 150,
                unit: 'ml',
                metrics: '177mg Calcium • 4.8g Prot',
              },
            ].map((opt) => renderItemChip(opt, 'night_meal', 'Night Meal & Extra Items', 'multi'))}
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
                  disabled={!newPlanName.trim()}
                  className="px-5 py-2 rounded-full bg-[#2E6F5E] text-white text-xs font-semibold shadow-soft disabled:opacity-40"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rename Plan */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#181A1F]/10 relative">
            <button
              onClick={() => setRenameModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#EFECE6] text-[#646873]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#181A1F] mb-1">Rename Diet Plan</h3>
            <p className="text-xs text-[#646873] mb-4">
              Enter a new name for &quot;{activePlan.name}&quot;.
            </p>

            <form onSubmit={handleRename} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#181A1F] mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={renamePlanName}
                  onChange={(e) => setRenamePlanName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#181A1F]/10 text-xs font-semibold text-[#646873]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renamePlanName.trim()}
                  className="px-5 py-2 rounded-full bg-[#2E6F5E] text-white text-xs font-semibold shadow-soft disabled:opacity-40"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full-Nutrient & Quantity Detail Sheet */}
      {detailModalFood && (
        <FoodDetailModal
          food={detailModalFood}
          mealSlot={detailModalSlot}
          slotLabel={detailModalSlotLabel}
          initialWeightG={detailModalWeightG}
          initialQuantity={detailModalQuantity}
          isOpen={Boolean(detailModalFood)}
          onClose={() => setDetailModalFood(null)}
          onApplyPortion={handleApplyPortionFromModal}
          onRemovePortion={handleRemovePortionFromModal}
          isInPlan={isSelectedInSlot(detailModalSlot, detailModalFood.id)}
        />
      )}
    </div>
  );
}

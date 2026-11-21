'use client';

import React, { useState, useEffect } from 'react';
import { FoodItem, MealSlot } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import {
  X,
  Check,
  Scale,
  Sparkles,
  Flame,
  Dna,
  Bone,
  Plus,
  Minus,
  Trash2,
  Info,
} from 'lucide-react';

interface FoodDetailModalProps {
  food: FoodItem;
  mealSlot: MealSlot;
  slotLabel?: string;
  initialWeightG?: number;
  initialQuantity?: number;
  isOpen: boolean;
  onClose: () => void;
  onApplyPortion: (
    foodId: string,
    weightG: number,
    quantity: number,
    portionName: string,
    slot: MealSlot
  ) => void;
  onRemovePortion?: (foodId: string, slot: MealSlot) => void;
  isInPlan?: boolean;
}

export function FoodDetailModal({
  food,
  mealSlot,
  slotLabel,
  initialWeightG,
  initialQuantity = 1,
  isOpen,
  onClose,
  onApplyPortion,
  onRemovePortion,
  isInPlan = false,
}: FoodDetailModalProps) {
  const { targets } = useApp();

  const baseUnitWeight = food.baseWeightG > 0 ? food.baseWeightG : 100;
  const isLiquid = food.baseUnit.toLowerCase().includes('ml');
  const unitLabel = isLiquid ? 'ml' : 'g';

  const [weightG, setWeightG] = useState<number>(initialWeightG || baseUnitWeight);
  const [quantity, setQuantity] = useState<number>(initialQuantity || 1);
  const [appliedToast, setAppliedToast] = useState(false);

  // Sync state if initial props change
  useEffect(() => {
    if (isOpen) {
      setWeightG(initialWeightG || baseUnitWeight);
      setQuantity(initialQuantity || 1);
    }
  }, [isOpen, initialWeightG, initialQuantity, baseUnitWeight]);

  if (!isOpen) return null;

  // Calculation multiplier factor
  // formula: (weightG / baseWeightG) * quantity
  const factor =
    weightG > 0 && food.baseWeightG > 0
      ? (weightG / food.baseWeightG) * quantity
      : quantity;

  // Live scaled 18-Nutrient values
  const scaled = {
    calories: Number((food.calories * factor).toFixed(1)),
    protein: Number((food.protein * factor).toFixed(1)),
    carbs: Number((food.carbs * factor).toFixed(1)),
    fat: Number((food.fat * factor).toFixed(1)),
    saturatedFat: Number((food.saturatedFat * factor).toFixed(1)),
    fibre: Number((food.fibre * factor).toFixed(1)),
    calcium: Number((food.calcium * factor).toFixed(1)),
    phosphorus: Number((food.phosphorus * factor).toFixed(1)),
    iron: Number((food.iron * factor).toFixed(1)),
    potassium: Number((food.potassium * factor).toFixed(1)),
    magnesium: Number((food.magnesium * factor).toFixed(1)),
    zinc: Number((food.zinc * factor).toFixed(2)),
    sodium: Number((food.sodium * factor).toFixed(1)),
    cholesterol: Number((food.cholesterol * factor).toFixed(1)),
    vitaminD: Number((food.vitaminD * factor).toFixed(2)),
    vitaminC: Number((food.vitaminC * factor).toFixed(1)),
    vitaminK: Number((food.vitaminK * factor).toFixed(1)),
    vitaminB12: Number((food.vitaminB12 * factor).toFixed(2)),
  };

  // Preset multiplier buttons
  const applyMultiplier = (mult: number) => {
    setWeightG(Math.round(baseUnitWeight * mult));
  };

  const handleAdjustWeight = (delta: number) => {
    setWeightG((prev) => Math.max(5, prev + delta));
  };

  const handleApply = () => {
    const formattedName = `${food.name} (${weightG} ${unitLabel}${quantity > 1 ? ` × ${quantity}` : ''})`;
    onApplyPortion(food.id, weightG, quantity, formattedName, mealSlot);
    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 600);
  };

  const handleRemove = () => {
    if (onRemovePortion) {
      onRemovePortion(food.id, mealSlot);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#181A1F]/10 overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        {/* Header Strip */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#181A1F]/5 bg-[#FAF9F5] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E7F2EF] text-[#2E6F5E] border border-[#2E6F5E]/20">
                {food.category}
              </span>
              {slotLabel && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#646873] border border-[#181A1F]/10">
                  {slotLabel}
                </span>
              )}
              {isInPlan && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8CE07A]/20 text-[#1B4338] border border-[#8CE07A]/40 flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#2E6F5E]" />
                  In Active Plan
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-[#181A1F] leading-tight">{food.name}</h3>
            <p className="text-xs text-[#646873] mt-0.5">
              Verified dataset &bull; Base reference: {food.baseUnit} ({food.baseWeightG}g)
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-[#EFECE6] text-[#646873] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. Live Portion & Weight Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8F6] border border-[#181A1F]/5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181A1F] uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#2E6F5E]" />
                Adjust Portion & Serving
              </span>
              <span className="text-xs font-mono font-bold text-[#2E6F5E]">
                {weightG} {unitLabel} {quantity > 1 ? `(×${quantity})` : ''}
              </span>
            </div>

            {/* Quick Multiplier Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#646873] font-medium mr-1">Multiplier:</span>
              {[0.5, 1.0, 1.5, 2.0].map((m) => {
                const targetW = Math.round(baseUnitWeight * m);
                const isActive = weightG === targetW;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => applyMultiplier(m)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-[#2E6F5E] text-white border-[#2E6F5E] shadow-sm'
                        : 'bg-white text-[#646873] hover:text-[#181A1F] border-[#181A1F]/10 hover:bg-[#EFECE6]'
                    }`}
                  >
                    {m}x ({targetW}{unitLabel})
                  </button>
                );
              })}
            </div>

            {/* Live Weight Input & Increment Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Weight Adjustment */}
              <div>
                <label className="text-[11px] text-[#646873] font-semibold block mb-1">
                  Custom Weight ({unitLabel})
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(-10)}
                    className="p-2 rounded-xl bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-xs font-bold text-[#181A1F]"
                    title="Subtract 10g"
                  >
                    -10
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="5"
                    value={weightG}
                    onChange={(e) => setWeightG(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full text-center px-3 py-1.5 rounded-xl bg-white border border-[#181A1F]/15 font-bold text-sm tabular-nums text-[#181A1F] focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(10)}
                    className="p-2 rounded-xl bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-xs font-bold text-[#181A1F]"
                    title="Add 10g"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(25)}
                    className="p-2 rounded-xl bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-xs font-bold text-[#181A1F]"
                    title="Add 25g"
                  >
                    +25
                  </button>
                </div>
              </div>

              {/* Quantity (Servings) Multiplier */}
              <div>
                <label className="text-[11px] text-[#646873] font-semibold block mb-1">
                  Serving Count
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 rounded-xl bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-xs font-bold disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-full text-center py-1.5 px-3 rounded-xl bg-white border border-[#181A1F]/15 font-bold text-sm text-[#181A1F]">
                    {quantity} {quantity === 1 ? 'serving' : 'servings'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="p-2 rounded-xl bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Complete 18-Nutrient Breakdown Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#181A1F]/5">
              <h4 className="text-xs font-bold text-[#181A1F] uppercase tracking-wider">
                Complete 18-Nutrient Breakdown
              </h4>
              <span className="text-[11px] text-[#2E6F5E] font-medium">
                Live scaled for {weightG} {unitLabel} {quantity > 1 ? `× ${quantity}` : ''}
              </span>
            </div>

            {/* A. Macronutrients */}
            <div>
              <span className="text-[11px] font-bold text-[#646873] uppercase tracking-wider block mb-2">
                1. Macronutrients & Energy
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Energy</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.calories} <span className="text-[10px] font-normal">kcal</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#E7F2EF] border border-[#2E6F5E]/20">
                  <span className="text-[#2E6F5E] block text-[10px] font-semibold">Protein</span>
                  <span className="font-bold text-[#2E6F5E] tabular-nums text-sm">
                    {scaled.protein} <span className="text-[10px] font-normal">g</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Carbohydrates</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.carbs} <span className="text-[10px] font-normal">g</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Total Fat</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.fat} <span className="text-[10px] font-normal">g</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Saturated Fat</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.saturatedFat} <span className="text-[10px] font-normal">g</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Dietary Fibre</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.fibre} <span className="text-[10px] font-normal">g</span>
                  </span>
                </div>
              </div>
            </div>

            {/* B. Bone Minerals & Key Electrolytes */}
            <div>
              <span className="text-[11px] font-bold text-[#646873] uppercase tracking-wider block mb-2">
                2. Bone Minerals & Electrolytes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#E7F2EF] border border-[#2E6F5E]/20">
                  <span className="text-[#2E6F5E] block text-[10px] font-semibold">Calcium</span>
                  <span className="font-bold text-[#2E6F5E] tabular-nums text-sm">
                    {scaled.calcium} <span className="text-[10px] font-normal">mg</span>
                  </span>
                  <span className="text-[9px] text-[#2E6F5E]/80 block leading-tight mt-0.5">
                    {Math.round((scaled.calcium / (targets.calciumMin || 1200)) * 100)}% of RDA
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Phosphorus</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.phosphorus} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Magnesium</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.magnesium} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Potassium</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.potassium} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Iron</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.iron} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Zinc</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.zinc} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Sodium (Limit)</span>
                  <span
                    className={`font-bold tabular-nums text-sm ${
                      scaled.sodium > 300 ? 'text-[#E11D48]' : 'text-[#181A1F]'
                    }`}
                  >
                    {scaled.sodium} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Cholesterol (Limit)</span>
                  <span
                    className={`font-bold tabular-nums text-sm ${
                      scaled.cholesterol > 150 ? 'text-[#E11D48]' : 'text-[#181A1F]'
                    }`}
                  >
                    {scaled.cholesterol} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
              </div>
            </div>

            {/* C. Vitamins */}
            <div>
              <span className="text-[11px] font-bold text-[#646873] uppercase tracking-wider block mb-2">
                3. Micronutrient Vitamins
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B]/20">
                  <span className="text-[#92400E] block text-[10px] font-semibold">Vitamin D3</span>
                  <span className="font-bold text-[#92400E] tabular-nums text-sm">
                    {scaled.vitaminD} <span className="text-[10px] font-normal">mcg</span>
                  </span>
                  <span className="text-[9px] text-[#92400E]/70 block leading-tight mt-0.5">
                    ({(scaled.vitaminD * 40).toFixed(0)} IU)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Vitamin C</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.vitaminC} <span className="text-[10px] font-normal">mg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Vitamin K</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.vitaminK} <span className="text-[10px] font-normal">mcg</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#181A1F]/5">
                  <span className="text-[#646873] block text-[10px]">Vitamin B12</span>
                  <span className="font-bold text-[#181A1F] tabular-nums text-sm">
                    {scaled.vitaminB12} <span className="text-[10px] font-normal">mcg</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#181A1F]/10 bg-[#FAF9F5] flex items-center justify-between gap-3">
          {isInPlan && onRemovePortion ? (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#E11D48] hover:bg-[#FFF1F2] border border-[#E11D48]/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Plan</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-[#181A1F]/10 text-xs font-semibold text-[#646873] hover:text-[#181A1F] hover:bg-[#EFECE6] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white text-xs font-bold transition-all shadow-soft flex items-center gap-2"
            >
              {appliedToast ? (
                <>
                  <Check className="w-4 h-4 text-[#8CE07A]" />
                  <span>Applied to Plan!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#8CE07A]" />
                  <span>{isInPlan ? 'Update in Plan' : 'Add to Plan'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { FoodItem, FoodCategory } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { X, Plus, Sparkles } from 'lucide-react';

const CATEGORIES: FoodCategory[] = [
  'Eggs & Dairy',
  'Fruits',
  'Grains & Dosa',
  'Gravies & Dals',
  'Proteins',
  'Vegetables',
  'Custom',
];

export function CustomFoodModal({ onClose }: { onClose: () => void }) {
  const { addCustomFood } = useApp();

  const [form, setForm] = useState<Partial<FoodItem>>({
    name: '',
    category: 'Custom',
    baseUnit: '100 g',
    baseWeightG: 100,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    saturatedFat: 0,
    cholesterol: 0,
    fibre: 0,
    sodium: 0,
    calcium: 0,
    phosphorus: 0,
    iron: 0,
    potassium: 0,
    magnesium: 0,
    zinc: 0,
    vitaminB12: 0,
    vitaminC: 0,
    vitaminK: 0,
    vitaminD: 0,
  });

  const handleChange = (field: keyof FoodItem, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'name' || field === 'category' || field === 'baseUnit' ? value : Number(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    const newFood: FoodItem = {
      id: 'custom_' + Date.now(),
      name: form.name.trim(),
      category: form.category || 'Custom',
      baseUnit: form.baseUnit || '100 g',
      baseWeightG: form.baseWeightG || 100,
      calories: form.calories || 0,
      protein: form.protein || 0,
      carbs: form.carbs || 0,
      fat: form.fat || 0,
      saturatedFat: form.saturatedFat || 0,
      cholesterol: form.cholesterol || 0,
      fibre: form.fibre || 0,
      sodium: form.sodium || 0,
      calcium: form.calcium || 0,
      phosphorus: form.phosphorus || 0,
      iron: form.iron || 0,
      potassium: form.potassium || 0,
      magnesium: form.magnesium || 0,
      zinc: form.zinc || 0,
      vitaminB12: form.vitaminB12 || 0,
      vitaminC: form.vitaminC || 0,
      vitaminK: form.vitaminK || 0,
      vitaminD: form.vitaminD || 0,
      isCustom: true,
    };

    addCustomFood(newFood);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#181A1F]/10 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#EFECE6] text-[#646873] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#E7F2EF] text-[#2E6F5E] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-[#181A1F]">Add Custom Food Item</h3>
        </div>
        <p className="text-xs text-[#646873] mb-6">
          Enter nutrition values verified per 100g or standard portion size (IFCT / USDA).
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#181A1F] mb-1">Food Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Homemade Ragi Kanji"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#181A1F] mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#181A1F] mb-1">Base Unit Label</label>
              <input
                type="text"
                value={form.baseUnit}
                onChange={(e) => handleChange('baseUnit', e.target.value)}
                placeholder="100 g or 1 bowl"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#181A1F] mb-1">Base Weight (g or ml)</label>
              <input
                type="number"
                step="any"
                value={form.baseWeightG}
                onChange={(e) => handleChange('baseWeightG', e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
              />
            </div>
          </div>

          {/* Section: Macronutrients */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6F5E] mb-3">
              Macronutrients & Limits (Per Base Unit)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Energy (kcal)', key: 'calories' },
                { label: 'Protein (g)', key: 'protein' },
                { label: 'Carbs (g)', key: 'carbs' },
                { label: 'Total Fat (g)', key: 'fat' },
                { label: 'Sat Fat (g)', key: 'saturatedFat' },
                { label: 'Cholesterol (mg)', key: 'cholesterol' },
                { label: 'Dietary Fibre (g)', key: 'fibre' },
                { label: 'Sodium (mg)', key: 'sodium' },
              ].map(({ label, key }) => (
                <div key={key} className="p-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/5">
                  <label className="block text-[11px] text-[#646873] font-medium mb-1">{label}</label>
                  <input
                    type="number"
                    step="any"
                    value={(form as any)[key] ?? 0}
                    onChange={(e) => handleChange(key as keyof FoodItem, e.target.value)}
                    className="w-full text-sm font-semibold tabular-nums px-2 py-1 rounded bg-white border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Bone-Health Minerals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6F5E] mb-3">
              Bone-Health Minerals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Calcium (mg)', key: 'calcium' },
                { label: 'Phosphorus (mg)', key: 'phosphorus' },
                { label: 'Iron (mg)', key: 'iron' },
                { label: 'Potassium (mg)', key: 'potassium' },
                { label: 'Magnesium (mg)', key: 'magnesium' },
                { label: 'Zinc (mg)', key: 'zinc' },
              ].map(({ label, key }) => (
                <div key={key} className="p-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/5">
                  <label className="block text-[11px] text-[#646873] font-medium mb-1">{label}</label>
                  <input
                    type="number"
                    step="any"
                    value={(form as any)[key] ?? 0}
                    onChange={(e) => handleChange(key as keyof FoodItem, e.target.value)}
                    className="w-full text-sm font-semibold tabular-nums px-2 py-1 rounded bg-white border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Vitamins */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6F5E] mb-3">
              Vitamins
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Vitamin D (mcg)', key: 'vitaminD' },
                { label: 'Vitamin C (mg)', key: 'vitaminC' },
                { label: 'Vitamin K (mcg)', key: 'vitaminK' },
                { label: 'Vitamin B12 (mcg)', key: 'vitaminB12' },
              ].map(({ label, key }) => (
                <div key={key} className="p-2.5 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/5">
                  <label className="block text-[11px] text-[#646873] font-medium mb-1">{label}</label>
                  <input
                    type="number"
                    step="any"
                    value={(form as any)[key] ?? 0}
                    onChange={(e) => handleChange(key as keyof FoodItem, e.target.value)}
                    className="w-full text-sm font-semibold tabular-nums px-2 py-1 rounded bg-white border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#181A1F]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#181A1F]/10 text-xs font-semibold text-[#646873] hover:bg-[#EFECE6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Save to Food DB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

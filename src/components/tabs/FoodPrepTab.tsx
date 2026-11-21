'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FoodItem, MealSlot, PreppedPortion } from '@/lib/types';
import { CustomFoodModal } from '../CustomFoodModal';
import {
  Search,
  Plus,
  Trash2,
  Sparkles,
  Filter,
  CheckCircle2,
  Scale,
  UtensilsCrossed,
  Layers,
} from 'lucide-react';

const MEAL_SLOT_LABELS: { id: MealSlot; label: string }[] = [
  { id: 'morning_eggs', label: 'Morning — Eggs' },
  { id: 'morning_fruit_daily', label: 'Morning — Daily Fruits' },
  { id: 'morning_fruit_rotating', label: 'Morning — Rotating Fruit' },
  { id: 'morning_breakfast', label: 'Morning — Breakfast Dosa/Grain' },
  { id: 'afternoon_grain', label: 'Afternoon — Staple Grain' },
  { id: 'afternoon_gravy', label: 'Afternoon — Gravy / Dal' },
  { id: 'afternoon_protein', label: 'Afternoon — Primary Protein' },
  { id: 'afternoon_poriyal', label: 'Afternoon — Vegetable Poriyal' },
  { id: 'afternoon_accompaniment', label: 'Afternoon — Curd / Accompaniment' },
  { id: 'night_meal', label: 'Night — Dinner & Extra Items' },
  { id: 'general', label: 'General Ready Pool' },
];

export function FoodPrepTab() {
  const { foods, preppedPortions, addPreppedPortion, deletePreppedPortion } = useApp();
  const [subView, setSubView] = useState<'food_db' | 'portion_prep'>('food_db');

  // Search & Category filter for Sub-View A
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Sub-View B: Portion Prep Form
  const [selectedFoodId, setSelectedFoodId] = useState<string>(foods[0]?.id || 'egg_whole');
  const [portionWeightG, setPortionWeightG] = useState<number>(100);
  const [portionQuantity, setPortionQuantity] = useState<number>(1);
  const [portionName, setPortionName] = useState<string>('');
  const [portionMealSlot, setPortionMealSlot] = useState<MealSlot>('morning_fruit_daily');
  const [portionSuccess, setPortionSuccess] = useState(false);

  // Filter foods for DB view
  const categories = ['All', ...Array.from(new Set(foods.map((f) => f.category)))];
  const filteredFoods = foods.filter((f) => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedFoodItem = foods.find((f) => f.id === selectedFoodId) || foods[0];

  const handleCreatePortion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoodItem) return;

    const name =
      portionName.trim() ||
      `${selectedFoodItem.name} (${portionWeightG} ${selectedFoodItem.baseUnit.includes('ml') ? 'ml' : 'g'})`;

    const newPortion: PreppedPortion = {
      id: 'prep_' + Date.now(),
      foodId: selectedFoodItem.id,
      name,
      mealSlot: portionMealSlot,
      weightG: Number(portionWeightG),
      quantityMultiplier: Number(portionQuantity) || 1,
    };

    addPreppedPortion(newPortion);
    setPortionName('');
    setPortionSuccess(true);
    setTimeout(() => setPortionSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 animate-fade-in">
      {/* Top Segmented Toggle */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-[#181A1F]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#181A1F]">Food Database & Portion Prep</h2>
          <p className="text-xs text-[#646873]">
            Verified 18-nutrient IFCT 2017 & USDA dataset + custom portion sizing
          </p>
        </div>

        {/* Segmented View Switcher */}
        <div className="bg-[#F8F8F6] p-1 rounded-full border border-[#181A1F]/10 flex items-center">
          <button
            onClick={() => setSubView('food_db')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              subView === 'food_db'
                ? 'bg-[#2E6F5E] text-white shadow-sm'
                : 'text-[#646873] hover:text-[#181A1F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Food DB ({foods.length})</span>
          </button>
          <button
            onClick={() => setSubView('portion_prep')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              subView === 'portion_prep'
                ? 'bg-[#2E6F5E] text-white shadow-sm'
                : 'text-[#646873] hover:text-[#181A1F]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Portion & Menu Prep ({preppedPortions.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW A: MASTER FOOD DATABASE */}
      {subView === 'food_db' && (
        <div className="space-y-4">
          {/* Search, Filter & Add Custom Food Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#646873] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food items (e.g. Ragi, Keerai, Soy, Papaya)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full text-xs bg-white border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E] shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowCustomModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white text-xs font-semibold shadow-soft transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#8CE07A]" />
              <span>Add Custom Food</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#181A1F] text-white'
                    : 'bg-white text-[#646873] hover:bg-[#EFECE6] border border-[#181A1F]/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Items Grid / Table */}
          <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#181A1F]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#646873] border-b border-[#181A1F]/5 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 font-bold">Food Item</th>
                    <th className="py-2.5 font-bold">Base Unit</th>
                    <th className="py-2.5 font-bold tabular-nums">kcal</th>
                    <th className="py-2.5 font-bold tabular-nums">Prot (g)</th>
                    <th className="py-2.5 font-bold tabular-nums text-[#2E6F5E]">Calc (mg)</th>
                    <th className="py-2.5 font-bold tabular-nums">Iron (mg)</th>
                    <th className="py-2.5 font-bold tabular-nums">Mag (mg)</th>
                    <th className="py-2.5 font-bold tabular-nums">Phos (mg)</th>
                    <th className="py-2.5 font-bold tabular-nums text-[#D97706]">Vit D (mcg)</th>
                    <th className="py-2.5 font-bold tabular-nums">Vit C (mg)</th>
                    <th className="py-2.5 font-bold tabular-nums">Fibre (g)</th>
                    <th className="py-2.5 font-bold tabular-nums text-[#E11D48]">Sod (mg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181A1F]/5">
                  {filteredFoods.map((f) => (
                    <tr key={f.id} className="hover:bg-[#F8F8F6]/80 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="font-bold text-[#181A1F] flex items-center gap-1.5">
                          <span>{f.name}</span>
                          {f.isCustom && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#E7F2EF] text-[#2E6F5E] font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#646873]">{f.category}</span>
                      </td>
                      <td className="py-3 text-[#646873] whitespace-nowrap">{f.baseUnit}</td>
                      <td className="py-3 font-semibold tabular-nums text-[#181A1F]">{f.calories}</td>
                      <td className="py-3 font-semibold tabular-nums text-[#181A1F]">{f.protein}</td>
                      <td className="py-3 font-bold tabular-nums text-[#2E6F5E] bg-[#E7F2EF]/40 px-2 rounded">
                        {f.calcium}
                      </td>
                      <td className="py-3 font-medium tabular-nums text-[#181A1F]">{f.iron}</td>
                      <td className="py-3 font-medium tabular-nums text-[#646873]">{f.magnesium}</td>
                      <td className="py-3 font-medium tabular-nums text-[#646873]">{f.phosphorus}</td>
                      <td className="py-3 font-semibold tabular-nums text-[#D97706]">{f.vitaminD}</td>
                      <td className="py-3 font-medium tabular-nums text-[#181A1F]">{f.vitaminC}</td>
                      <td className="py-3 font-medium tabular-nums text-[#646873]">{f.fibre}</td>
                      <td className="py-3 font-medium tabular-nums text-[#646873]">{f.sodium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW B: PORTION & MENU PREP */}
      {subView === 'portion_prep' && (
        <div className="space-y-6">
          {/* Creator Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
            <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide mb-1">
              Configure New Meal Portion
            </h3>
            <p className="text-xs text-[#646873] mb-5">
              Select any item from the database, adjust weight or multiplier, and save to the ready menu pool.
            </p>

            <form onSubmit={handleCreatePortion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Pick Food */}
                <div>
                  <label className="block text-xs font-semibold text-[#181A1F] mb-1">
                    Select Master Food
                  </label>
                  <select
                    value={selectedFoodId}
                    onChange={(e) => {
                      setSelectedFoodId(e.target.value);
                      const f = foods.find((item) => item.id === e.target.value);
                      if (f) setPortionWeightG(f.baseWeightG || 100);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  >
                    {foods.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.baseUnit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Weight / Qty */}
                <div>
                  <label className="block text-xs font-semibold text-[#181A1F] mb-1">
                    Portion Weight (g or ml)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={portionWeightG}
                    onChange={(e) => setPortionWeightG(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold tabular-nums px-3 py-2 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  />
                </div>

                {/* 3. Assign Slot */}
                <div>
                  <label className="block text-xs font-semibold text-[#181A1F] mb-1">
                    Assign Meal Slot
                  </label>
                  <select
                    value={portionMealSlot}
                    onChange={(e) => setPortionMealSlot(e.target.value as MealSlot)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  >
                    {MEAL_SLOT_LABELS.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Custom Label (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-[#181A1F] mb-1">
                    Display Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${selectedFoodItem?.name} 150g`}
                    value={portionName}
                    onChange={(e) => setPortionName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#F8F8F6] border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E]"
                  />
                </div>
              </div>

              {/* Dynamic Nutrition Preview of this Portion */}
              {selectedFoodItem && (
                <div className="p-3.5 rounded-2xl bg-[#E7F2EF]/60 border border-[#2E6F5E]/15 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-[#2E6F5E]">
                    <span className="font-bold">Calculated Portion Yield: </span>
                    <span className="tabular-nums font-semibold">
                      {((selectedFoodItem.calories * portionWeightG) / selectedFoodItem.baseWeightG).toFixed(1)} kcal &bull;{' '}
                      {((selectedFoodItem.protein * portionWeightG) / selectedFoodItem.baseWeightG).toFixed(1)}g Protein &bull;{' '}
                      {((selectedFoodItem.calcium * portionWeightG) / selectedFoodItem.baseWeightG).toFixed(1)}mg Calcium &bull;{' '}
                      {((selectedFoodItem.iron * portionWeightG) / selectedFoodItem.baseWeightG).toFixed(1)}mg Iron
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {portionSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8CE07A]" />
                        <span>Added to Pool!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Portion to Ready Pool</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Prepped Portions Pool List grouped by Slot */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#181A1F]/5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#181A1F]/5">
              <div>
                <h3 className="font-bold text-sm text-[#181A1F] uppercase tracking-wide">
                  Ready Menu Portions Pool
                </h3>
                <span className="text-xs text-[#646873]">
                  Items immediately available for one-tap selection in the Diet Builder
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F6F4EF] text-[#646873]">
                {preppedPortions.length} Portions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {preppedPortions.map((p) => {
                const food = foods.find((f) => f.id === p.foodId);
                const factor = food && food.baseWeightG > 0 ? p.weightG / food.baseWeightG : 1;
                const cal = food ? Math.round(food.calories * factor) : 0;
                const calc = food ? Math.round(food.calcium * factor) : 0;
                const prot = food ? (food.protein * factor).toFixed(1) : '0';

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-[#F8F8F6] border border-[#181A1F]/5 flex flex-col justify-between hover:border-[#2E6F5E]/30 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-[#181A1F] leading-snug">{p.name}</span>
                        <button
                          onClick={() => deletePreppedPortion(p.id)}
                          className="text-[#646873] hover:text-[#E11D48] transition-colors p-1"
                          title="Delete portion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-[#646873] block mb-2">
                        {MEAL_SLOT_LABELS.find((s) => s.id === p.mealSlot)?.label || p.mealSlot}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#181A1F]/5 flex items-center justify-between text-[11px] font-semibold text-[#181A1F] tabular-nums">
                      <span>{cal} kcal</span>
                      <span className="text-[#646873]">{prot}g Prot</span>
                      <span className="text-[#2E6F5E] font-bold">{calc}mg Ca</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showCustomModal && <CustomFoodModal onClose={() => setShowCustomModal(false)} />}
    </div>
  );
}

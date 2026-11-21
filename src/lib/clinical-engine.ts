import {
  DietPlanItem,
  FoodItem,
  NutrientTotals,
  RDATargets,
  ClinicalComment,
  MealSlot,
} from './types';

export function calculateNutrientTotals(
  items: DietPlanItem[],
  foods: FoodItem[]
): NutrientTotals {
  const foodMap = new Map<string, FoodItem>();
  foods.forEach((f) => foodMap.set(f.id, f));

  const initialTotals: NutrientTotals = {
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
  };

  return items.reduce((acc, item) => {
    const food = foodMap.get(item.foodId);
    if (!food) return acc;

    const factor =
      item.weightG > 0 && food.baseWeightG > 0
        ? item.weightG / food.baseWeightG
        : item.quantity || 1;

    return {
      calories: Number((acc.calories + food.calories * factor).toFixed(1)),
      protein: Number((acc.protein + food.protein * factor).toFixed(1)),
      carbs: Number((acc.carbs + food.carbs * factor).toFixed(1)),
      fat: Number((acc.fat + food.fat * factor).toFixed(1)),
      saturatedFat: Number((acc.saturatedFat + food.saturatedFat * factor).toFixed(1)),
      cholesterol: Number((acc.cholesterol + food.cholesterol * factor).toFixed(1)),
      fibre: Number((acc.fibre + food.fibre * factor).toFixed(1)),
      sodium: Number((acc.sodium + food.sodium * factor).toFixed(1)),
      calcium: Number((acc.calcium + food.calcium * factor).toFixed(1)),
      phosphorus: Number((acc.phosphorus + food.phosphorus * factor).toFixed(1)),
      iron: Number((acc.iron + food.iron * factor).toFixed(1)),
      potassium: Number((acc.potassium + food.potassium * factor).toFixed(1)),
      magnesium: Number((acc.magnesium + food.magnesium * factor).toFixed(1)),
      zinc: Number((acc.zinc + food.zinc * factor).toFixed(1)),
      vitaminB12: Number((acc.vitaminB12 + food.vitaminB12 * factor).toFixed(2)),
      vitaminC: Number((acc.vitaminC + food.vitaminC * factor).toFixed(1)),
      vitaminK: Number((acc.vitaminK + food.vitaminK * factor).toFixed(1)),
      vitaminD: Number((acc.vitaminD + food.vitaminD * factor).toFixed(2)),
    };
  }, initialTotals);
}

export function calculateMealSlotCalcium(
  items: DietPlanItem[],
  foods: FoodItem[]
): Record<'morning' | 'afternoon' | 'night', number> {
  const foodMap = new Map<string, FoodItem>();
  foods.forEach((f) => foodMap.set(f.id, f));

  const mealTotals = {
    morning: 0,
    afternoon: 0,
    night: 0,
  };

  items.forEach((item) => {
    const food = foodMap.get(item.foodId);
    if (!food) return;
    const factor =
      item.weightG > 0 && food.baseWeightG > 0
        ? item.weightG / food.baseWeightG
        : item.quantity || 1;
    const itemCalcium = food.calcium * factor;

    if (item.mealSlot.startsWith('morning')) {
      mealTotals.morning += itemCalcium;
    } else if (item.mealSlot.startsWith('afternoon')) {
      mealTotals.afternoon += itemCalcium;
    } else if (item.mealSlot.startsWith('night')) {
      mealTotals.night += itemCalcium;
    }
  });

  return {
    morning: Number(mealTotals.morning.toFixed(1)),
    afternoon: Number(mealTotals.afternoon.toFixed(1)),
    night: Number(mealTotals.night.toFixed(1)),
  };
}

export function evaluateClinicalRules(
  totals: NutrientTotals,
  items: DietPlanItem[],
  foods: FoodItem[],
  targets: RDATargets
): ClinicalComment[] {
  const comments: ClinicalComment[] = [];
  const slotCalcium = calculateMealSlotCalcium(items, foods);

  // 1. Calcium Split-Dose & Target Saturation Rule
  const calciumDeficit = targets.calciumMin - totals.calcium;
  const anyMealExceeds500 =
    slotCalcium.morning > 500 || slotCalcium.afternoon > 500 || slotCalcium.night > 500;

  if (anyMealExceeds500) {
    comments.push({
      id: 'calcium_split_saturate',
      title: 'Optimal Calcium Distribution (>500 mg in single meal)',
      type: 'warning',
      source: 'ICMR-NIN 2020 & Endocrine Society Guidelines',
      message: `One or more meals deliver over 500 mg calcium (Morning: ${slotCalcium.morning} mg, Afternoon: ${slotCalcium.afternoon} mg, Night: ${slotCalcium.night} mg). The active intestinal calcium transport system absorbs calcium most efficiently in doses of ≤500 mg at a time.`,
      actionableRecommendation:
        'Distribute high-calcium foods (ragi, greens, dairy, soy) evenly between morning, afternoon, and night meals for maximal bioavailability.',
    });
  } else if (totals.calcium >= targets.calciumMin && totals.calcium <= targets.calciumMax) {
    comments.push({
      id: 'calcium_optimal',
      title: 'Daily Dietary Calcium Goal Achieved',
      type: 'success',
      source: 'ICMR-NIN 2020 Recommendations',
      message: `Diet delivers ${totals.calcium} mg calcium, comfortably meeting your daily target (${targets.calciumMin} mg) within the safe upper limit (${targets.calciumMax} mg).`,
    });
  } else if (calciumDeficit > 0) {
    comments.push({
      id: 'calcium_gap',
      title: `Dietary Calcium Gap: ${calciumDeficit.toFixed(0)} mg Needed`,
      type: 'alert',
      source: 'ICMR-NIN 2020 & Bone Health Guidelines',
      message: `Current daily meals provide ${totals.calcium} mg calcium against your ${targets.calciumMin} mg daily goal. A shortfall of ${calciumDeficit.toFixed(0)} mg remains.`,
      actionableRecommendation: `Consider incorporating an additional serving of ragi dosa, keerai masiyal, toned curd, or soy chunks to naturally meet your daily calcium target.`,
    });
  }

  // 2. Vitamin D Nutrition & Sunlight Synergy
  if (totals.vitaminD < 3.0) {
    comments.push({
      id: 'vit_d_deficiency',
      title: 'Low Dietary Vitamin D (<3 mcg / 120 IU)',
      type: 'info',
      source: 'Endocrine Society & ICMR Guidelines',
      message: `Natural food sources provide limited Vitamin D (${totals.vitaminD} mcg / ${(totals.vitaminD * 40).toFixed(0)} IU). The primary natural pathway for Vitamin D synthesis is sunlight exposure.`,
      actionableRecommendation:
        'Aim for 15–30 minutes of outdoor sunlight exposure between 10 AM – 2 PM to support natural Vitamin D3 synthesis, or consult your healthcare provider regarding supplementation.',
    });
  } else {
    comments.push({
      id: 'vit_d_adequate',
      title: 'Dietary Vitamin D Intake on Track',
      type: 'success',
      source: 'Endocrine Society Guidelines',
      message: `Diet delivers ${totals.vitaminD} mcg (${(totals.vitaminD * 40).toFixed(0)} IU) of dietary Vitamin D.`,
    });
  }

  // 3. Iron vs. Calcium Interaction & Vitamin C Synergism
  const hasGoodVitC = totals.vitaminC >= targets.vitaminCMin;
  comments.push({
    id: 'iron_calcium_interaction',
    title: 'Iron vs. Calcium Timing & Vitamin C Synergism',
    type: 'info',
    source: 'IFCT 2017 & ICMR Iron Bioavailability Research',
    message: `Calcium and iron share intestinal absorption pathways. If taking iron supplements, spacing them at least 2 hours away from high-calcium meals (dairy, ragi) optimizes absorption.`,
    actionableRecommendation: hasGoodVitC
      ? `Excellent! Your Vitamin C intake (${totals.vitaminC} mg) significantly enhances non-heme iron absorption from moong dal, soy chunks, and greens.`
      : `Pair plant-based iron foods (moong dal, soy, greens) with ascorbic acid sources (guava, papaya, citrus, drumstick) to maximize iron uptake.`,
  });

  // 4. Electrolytes & Mineral Balance (Magnesium & Phosphorus)
  const magNormal =
    totals.magnesium >= targets.magnesiumMin * 0.85 &&
    totals.magnesium <= targets.magnesiumMax + 100;
  const phosNormal =
    totals.phosphorus >= targets.phosphorusMin * 0.85 &&
    totals.phosphorus <= targets.phosphorusMax + 200;

  if (magNormal && phosNormal) {
    comments.push({
      id: 'electrolytes_optimal',
      title: 'Mineral & Electrolyte Balance Optimal',
      type: 'success',
      source: 'ICMR-NIN 2020 Dietary Guidelines',
      message: `Magnesium (${totals.magnesium} mg) and Phosphorus (${totals.phosphorus} mg) are in healthy balance to support bone density, cellular energy (ATP), and muscle function.`,
    });
  } else {
    comments.push({
      id: 'electrolytes_watch',
      title: 'Magnesium & Phosphorus Balance',
      type: 'warning',
      source: 'ICMR-NIN 2020 Guidelines',
      message: `Current meals deliver ${totals.magnesium} mg Magnesium (Target: ${targets.magnesiumMin}–${targets.magnesiumMax} mg) and ${totals.phosphorus} mg Phosphorus (Target: ${targets.phosphorusMin}–${targets.phosphorusMax} mg).`,
      actionableRecommendation:
        'Include wholesome grains, greens (keerai), seeds, and legumes to sustain optimal intracellular magnesium and phosphorus levels.',
    });
  }

  // 5. Lipid & Sodium Guardrails
  if (totals.cholesterol >= targets.cholesterolMax) {
    comments.push({
      id: 'cholesterol_guardrail',
      title: `Dietary Cholesterol Exceeds Daily Target (${totals.cholesterol} mg / ${targets.cholesterolMax} mg)`,
      type: 'warning',
      source: 'Cardiovascular & ICMR-NIN Upper Tolerable Guardrails',
      message: `Dietary cholesterol is currently ${totals.cholesterol} mg. Whole eggs contribute ~185 mg cholesterol per yolk.`,
      actionableRecommendation:
        'Consider opting for "1 Whole Egg + 1 Egg White" to retain high-quality protein while moderating yolk cholesterol intake.',
    });
  }

  if (totals.sodium >= targets.sodiumMax) {
    comments.push({
      id: 'sodium_hypercalciuria',
      title: `Elevated Sodium Intake (${totals.sodium} mg / ${targets.sodiumMax} mg)`,
      type: 'alert',
      source: 'Clinical Nutrition & Bone Health Protocols',
      message: `High sodium intake (${totals.sodium} mg) can increase urinary calcium excretion and elevate blood pressure.`,
      actionableRecommendation:
        'Moderately curtail extra salt in sambar, gravies, and poriyal preparations to promote calcium retention.',
    });
  }

  // 6. Night Meal Gap & Caloric Sufficiency
  const nightItems = items.filter((i) => i.mealSlot.startsWith('night'));
  if (nightItems.length === 0 || totals.calories < targets.energyMin * 0.75) {
    comments.push({
      id: 'night_meal_gap',
      title: 'Evening Nourishment & Energy Check',
      type: 'warning',
      source: 'Daily Energy & Protein Metabolism Guidelines',
      message: `Total planned energy is ${totals.calories} kcal (Target: ${targets.energyMin}–${targets.energyMax} kcal)${
        nightItems.length === 0 ? ' with an unpopulated night meal slot' : ''
      }. Ensuring adequate evening nourishment supports overnight muscle recovery and cellular repair.`,
      actionableRecommendation:
        'Consider adding a balanced night meal (such as Ragi Dosa ×2 with Sambar, or Whole Wheat Chapati ×2 with Dal) to complete your daily goals.',
    });
  }

  return comments;
}

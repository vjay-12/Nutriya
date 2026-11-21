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

    // Standard multiplier based on base weight (or quantity multiplier if unit-based)
    // Formula: (food_nutrient * weightG) / baseWeightG
    const factor = item.weightG > 0 && food.baseWeightG > 0
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
    const factor = item.weightG > 0 && food.baseWeightG > 0
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
      title: 'Intestinal Calcium Saturation Detected (>500 mg / Meal)',
      type: 'warning',
      source: 'ICMR-NIN 2020 & Endocrine Society Bone Guidelines',
      message: `One or more meals deliver over 500 mg calcium (Morning: ${slotCalcium.morning} mg, Afternoon: ${slotCalcium.afternoon} mg, Night: ${slotCalcium.night} mg). The active intestinal calcium transport system saturates at ~500 mg per dose; excess is unabsorbed.`,
      actionableRecommendation:
        'Distribute high-calcium foods (ragi, keerai, dairy) evenly between morning, afternoon, and night meals for maximal fractional bioavailability.',
    });
  } else if (totals.calcium >= targets.calciumMin && totals.calcium <= targets.calciumMax) {
    comments.push({
      id: 'calcium_optimal',
      title: 'Dietary Calcium Target Achieved',
      type: 'success',
      source: 'ICMR-NIN 2020 (1,000–1,200 mg/day)',
      message: `Diet delivers ${totals.calcium} mg calcium, safely meeting the 50-year-old post-menopausal bone remineralization goal (${targets.calciumMin} mg) without exceeding the 2,000 mg upper safety limit.`,
    });
  } else if (calciumDeficit > 0) {
    comments.push({
      id: 'calcium_gap',
      title: `Dietary Calcium Gap: ${calciumDeficit.toFixed(0)} mg Needed`,
      type: 'alert',
      source: 'Indian Menopause Society Osteoporosis Guidelines',
      message: `Current daily food provides ${totals.calcium} mg calcium against your ${targets.calciumMin} mg daily goal. A residual shortfall of ${calciumDeficit.toFixed(0)} mg exists.`,
      actionableRecommendation: `Discuss with your endocrinologist / physician whether a ${Math.min(500, Math.ceil(calciumDeficit / 100) * 100)} mg elemental calcium supplement is recommended at bedtime or with dinner.`,
    });
  }

  // 2. Vitamin D Deficit Alert
  if (totals.vitaminD < 3.0) {
    comments.push({
      id: 'vit_d_deficiency',
      title: 'Severe Vitamin D Gap in Food (<3 mcg / 120 IU)',
      type: 'alert',
      source: 'Endocrine Society Clinical Practice Guidelines (Deficiency <20 ng/mL)',
      message: `Food alone provides only ${totals.vitaminD} mcg (${(totals.vitaminD * 40).toFixed(0)} IU) of Vitamin D against baseline serum 25(OH)D level of 18 ng/mL (clinical deficiency threshold < 20 ng/mL).`,
      actionableRecommendation:
        'Food cannot resolve this deficiency alone. Doctor-prescribed high-dose Vitamin D3 (e.g. 60,000 IU weekly or daily equivalent) plus 15–30 minutes of midday sunlight exposure (UV-B 10 AM – 2 PM) are imperative for bone matrix calcification.',
    });
  }

  // 3. Iron vs. Calcium Interaction & Vitamin C Synergism
  const hasHighCalcium = totals.calcium > 600;
  const hasGoodVitC = totals.vitaminC >= targets.vitaminCMin;
  comments.push({
    id: 'iron_calcium_interaction',
    title: 'Iron vs. Calcium Timing & Vitamin C Synergism',
    type: 'info',
    source: 'IFCT 2017 & ICMR Iron Bioavailability Research',
    message: `Calcium inhibits non-heme iron absorption competitively in the enterocyte. If taking prescribed oral iron, maintain at least a 2-hour window away from high-calcium meals (ragi, milk, curd, paneer).`,
    actionableRecommendation: hasGoodVitC
      ? `Great job! Your current Vitamin C intake (${totals.vitaminC} mg) substantially elevates non-heme iron absorption from moong dal, soy chunks, and greens.`
      : `Pair non-heme iron meals (moong dosa, soy, greens) with ascorbic acid sources (guava, papaya, lemon, drumstick) to maximize iron uptake.`,
  });

  // 4. Post-Zoledronic Acid Electrolyte Check (Magnesium & Phosphorus)
  const magNormal = totals.magnesium >= targets.magnesiumMin && totals.magnesium <= targets.magnesiumMax + 100;
  const phosNormal = totals.phosphorus >= targets.phosphorusMin && totals.phosphorus <= targets.phosphorusMax;
  if (!magNormal || !phosNormal) {
    comments.push({
      id: 'zoledronic_electrolytes',
      title: 'Post-Zoledronic Acid Electrolyte Vigilance',
      type: 'warning',
      source: 'Endocrine Protocol for Bisphosphonate Therapy',
      message: `Zoledronic acid rapidly drives serum calcium, phosphorus, and magnesium into the skeletal matrix. Your diet delivers ${totals.magnesium} mg Magnesium (Target: ${targets.magnesiumMin}–${targets.magnesiumMax} mg) and ${totals.phosphorus} mg Phosphorus (Target: ${targets.phosphorusMin}–${targets.phosphorusMax} mg).`,
      actionableRecommendation:
        'Sustained magnesium intake prevents post-infusion hypocalcemia and parathyroid spasm. Maintain adequate whole seeds, grains, and keerai poriyal.',
    });
  } else {
    comments.push({
      id: 'zoledronic_electrolytes_ok',
      title: 'Post-Infusion Mineral Balance Optimal',
      type: 'success',
      source: 'Endocrine Protocol for Bisphosphonate Therapy',
      message: `Magnesium (${totals.magnesium} mg) and Phosphorus (${totals.phosphorus} mg) are in ideal therapeutic range to support safe remineralization after zoledronic acid infusion.`,
    });
  }

  // 5. Lipid & Sodium Guardrails
  if (totals.cholesterol >= targets.cholesterolMax) {
    comments.push({
      id: 'cholesterol_guardrail',
      title: `Dietary Cholesterol Exceeds Daily Limit (${totals.cholesterol} mg / 300 mg)`,
      type: 'warning',
      source: 'Cardiovascular & ICMR-NIN Upper Tolerable Guardrails',
      message: `Dietary cholesterol is currently ${totals.cholesterol} mg, surpassing the < 300 mg ceiling. Whole eggs contribute ~185 mg cholesterol per yolk.`,
      actionableRecommendation:
        'Stick with the specified "1 Whole Egg + 1 Egg White" preparation to preserve high-biological-value protein while cutting yolk cholesterol by 50%.',
    });
  }

  if (totals.sodium >= targets.sodiumMax) {
    comments.push({
      id: 'sodium_hypercalciuria',
      title: `Elevated Sodium Intake (${totals.sodium} mg / 2000 mg)`,
      type: 'alert',
      source: 'Clinical Bone Mineral Density Preservation Protocols',
      message: `Excess dietary sodium (${totals.sodium} mg) induces obligatory renal calciuria: each 2,300 mg of sodium excreted carries away 20–40 mg of calcium in urine.`,
      actionableRecommendation:
        'Moderately curtail extra salt in sambar, kuzhambu, rasam, and poriyal preparations to prevent calcium wasting.',
    });
  }

  // 6. Night Meal Gap & Sarcopenia Risk Check
  const nightItems = items.filter((i) => i.mealSlot.startsWith('night'));
  if (nightItems.length === 0 || totals.calories < 1400) {
    comments.push({
      id: 'night_meal_gap',
      title: 'Night Meal Under-nutrition & Sarcopenia Warning',
      type: 'alert',
      source: 'Geriatric Bone Health & Muscle Catabolism Guidelines',
      message: `Total energy is ${totals.calories} kcal (Target: ${targets.energyMin}–${targets.energyMax} kcal)${nightItems.length === 0 ? ' and the night meal slot is currently unpopulated' : ''}. Severe caloric restriction induces lean muscle loss (sarcopenia) and increases fall risk for a 53 kg osteoporotic patient.`,
      actionableRecommendation:
        'Include a nourishing night meal (such as Ragi Dosa ×2 with Sambar, or Whole Wheat Chapati ×2 with Moong Dal Curry) to sustain nocturnal calcium homeostasis and protein synthesis.',
    });
  }

  return comments;
}

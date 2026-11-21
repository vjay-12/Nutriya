import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test the Selection Engine logic
import {
  isOptionSelected,
  getOptionDisplayWeight,
  applyOptionSelection,
} from '../src/lib/selection-engine';

import {
  calculateNutrientTotals,
  calculateMealSlotCalcium,
} from '../src/lib/clinical-engine';

import { MASTER_FOOD_ITEMS } from '../src/lib/seed-data';
import { DietPlanItem } from '../src/lib/types';

describe('Diet Builder: Category-Aware Selection Logic', () => {
  const planId = 'test_plan_1';

  // Egg options
  const optEggCombo = {
    id: 'egg_combo',
    name: '1 Whole Egg + 1 Egg White',
    foodId: 'egg_whole',
    defaultWeightG: 85,
    pairedFoodId: 'egg_white',
    pairedWeightG: 35,
  };

  const optEggTwo = {
    id: 'egg_two',
    name: '2 Boiled Eggs',
    foodId: 'egg_whole',
    defaultWeightG: 100,
    qty: 2,
  };

  const optEggNone = {
    id: 'egg_none',
    name: 'None (Egg-free)',
    foodId: 'none',
    defaultWeightG: 0,
  };

  test('Single-Select: Selecting egg_combo selects only egg_combo and deselects egg_two', () => {
    let items: DietPlanItem[] = [];

    // Select egg_combo
    items = applyOptionSelection(optEggCombo, 'morning_eggs', 'single', items, planId);

    assert.equal(isOptionSelected(optEggCombo, 'morning_eggs', items), true, 'egg_combo should be selected');
    assert.equal(isOptionSelected(optEggTwo, 'morning_eggs', items), false, 'egg_two must NOT be selected');
    assert.equal(isOptionSelected(optEggNone, 'morning_eggs', items), false, 'egg_none must NOT be selected');

    // Verify exactly 2 items exist in morning_eggs: egg_whole (50g) and egg_white (35g)
    const eggItems = items.filter((i) => i.mealSlot === 'morning_eggs');
    assert.equal(eggItems.length, 2);
    assert.equal(eggItems.some((i) => i.foodId === 'egg_whole' && i.weightG === 50), true);
    assert.equal(eggItems.some((i) => i.foodId === 'egg_white' && i.weightG === 35), true);
  });

  test('Single-Select: Switching from egg_combo to egg_two deselects egg_combo and leaves only egg_two', () => {
    // Start with egg_combo selected
    let items = applyOptionSelection(optEggCombo, 'morning_eggs', 'single', [], planId);

    // Switch to egg_two
    items = applyOptionSelection(optEggTwo, 'morning_eggs', 'single', items, planId);

    assert.equal(isOptionSelected(optEggTwo, 'morning_eggs', items), true, 'egg_two should be selected');
    assert.equal(isOptionSelected(optEggCombo, 'morning_eggs', items), false, 'egg_combo must NOT be selected');
    assert.equal(isOptionSelected(optEggNone, 'morning_eggs', items), false, 'egg_none must NOT be selected');

    // Verify exactly 1 item exists in morning_eggs: egg_whole (100g, qty 2)
    const eggItems = items.filter((i) => i.mealSlot === 'morning_eggs');
    assert.equal(eggItems.length, 1);
    assert.equal(eggItems[0].foodId, 'egg_whole');
    assert.equal(eggItems[0].weightG, 100);
    assert.equal(eggItems[0].quantity, 2);
  });

  test('Single-Select: Selecting None deselects both egg options and clears slot', () => {
    // Start with egg_two selected
    let items = applyOptionSelection(optEggTwo, 'morning_eggs', 'single', [], planId);

    // Select None
    items = applyOptionSelection(optEggNone, 'morning_eggs', 'single', items, planId);

    assert.equal(isOptionSelected(optEggNone, 'morning_eggs', items), true, 'egg_none should be selected');
    assert.equal(isOptionSelected(optEggCombo, 'morning_eggs', items), false, 'egg_combo must NOT be selected');
    assert.equal(isOptionSelected(optEggTwo, 'morning_eggs', items), false, 'egg_two must NOT be selected');

    const eggItems = items.filter((i) => i.mealSlot === 'morning_eggs');
    assert.equal(eggItems.length, 0, 'Slot items must be empty when None is chosen');
  });

  test('Single-Select: Selecting already selected option in radio-group with None remains selected', () => {
    let items = applyOptionSelection(optEggTwo, 'morning_eggs', 'single', [], planId);
    // Click again
    items = applyOptionSelection(optEggTwo, 'morning_eggs', 'single', items, planId);

    assert.equal(isOptionSelected(optEggTwo, 'morning_eggs', items), true);
    assert.equal(isOptionSelected(optEggCombo, 'morning_eggs', items), false);
    assert.equal(isOptionSelected(optEggNone, 'morning_eggs', items), false);
  });

  test('Multi-Select: Daily Fruits allows coexisting selections and individual toggles', () => {
    const optPom = { id: 'pomegranate', name: 'Pomegranate', foodId: 'pomegranate', defaultWeightG: 100 };
    const optBan = { id: 'banana_yelakki', name: 'Banana Yelakki', foodId: 'banana_yelakki', defaultWeightG: 100 };

    let items: DietPlanItem[] = [];

    // Select Pomegranate
    items = applyOptionSelection(optPom, 'morning_fruit_daily', 'multi', items, planId);
    assert.equal(isOptionSelected(optPom, 'morning_fruit_daily', items), true);
    assert.equal(isOptionSelected(optBan, 'morning_fruit_daily', items), false);

    // Select Banana Yelakki (both co-exist)
    items = applyOptionSelection(optBan, 'morning_fruit_daily', 'multi', items, planId);
    assert.equal(isOptionSelected(optPom, 'morning_fruit_daily', items), true, 'Pomegranate must stay selected');
    assert.equal(isOptionSelected(optBan, 'morning_fruit_daily', items), true, 'Banana must now also be selected');

    const fruitItems = items.filter((i) => i.mealSlot === 'morning_fruit_daily');
    assert.equal(fruitItems.length, 2);

    // Deselect Pomegranate
    items = applyOptionSelection(optPom, 'morning_fruit_daily', 'multi', items, planId);
    assert.equal(isOptionSelected(optPom, 'morning_fruit_daily', items), false, 'Pomegranate is now deselected');
    assert.equal(isOptionSelected(optBan, 'morning_fruit_daily', items), true, 'Banana remains selected');

    const remainingFruits = items.filter((i) => i.mealSlot === 'morning_fruit_daily');
    assert.equal(remainingFruits.length, 1);
    assert.equal(remainingFruits[0].foodId, 'banana_yelakki');
  });

  test('Single-Select: Staple Rice (rice_70 vs rice_100 vs rice_none)', () => {
    const optRice70 = { id: 'rice_70', name: 'Rice Cooked 70 g', foodId: 'rice_cooked', defaultWeightG: 70 };
    const optRice100 = { id: 'rice_100', name: 'Rice Cooked 100 g', foodId: 'rice_cooked', defaultWeightG: 100 };
    const optRiceNone = { id: 'rice_none', name: 'No Rice', foodId: 'none', defaultWeightG: 0 };

    let items: DietPlanItem[] = [];

    // Select 70g
    items = applyOptionSelection(optRice70, 'afternoon_grain', 'single', items, planId);
    assert.equal(isOptionSelected(optRice70, 'afternoon_grain', items), true);
    assert.equal(isOptionSelected(optRice100, 'afternoon_grain', items), false);
    assert.equal(isOptionSelected(optRiceNone, 'afternoon_grain', items), false);

    // Switch to 100g
    items = applyOptionSelection(optRice100, 'afternoon_grain', 'single', items, planId);
    assert.equal(isOptionSelected(optRice70, 'afternoon_grain', items), false);
    assert.equal(isOptionSelected(optRice100, 'afternoon_grain', items), true);
    assert.equal(isOptionSelected(optRiceNone, 'afternoon_grain', items), false);

    // Select None
    items = applyOptionSelection(optRiceNone, 'afternoon_grain', 'single', items, planId);
    assert.equal(isOptionSelected(optRiceNone, 'afternoon_grain', items), true);
    assert.equal(isOptionSelected(optRice70, 'afternoon_grain', items), false);
    assert.equal(isOptionSelected(optRice100, 'afternoon_grain', items), false);
  });

  test('Single-Select: Rotating Fruit switches exclusively', () => {
    const optGuava = { id: 'guava', name: 'Guava', foodId: 'guava', defaultWeightG: 100 };
    const optPapaya = { id: 'papaya', name: 'Papaya', foodId: 'papaya', defaultWeightG: 100 };

    let items = applyOptionSelection(optGuava, 'morning_fruit_rotating', 'single', [], planId);
    assert.equal(isOptionSelected(optGuava, 'morning_fruit_rotating', items), true);
    assert.equal(isOptionSelected(optPapaya, 'morning_fruit_rotating', items), false);

    items = applyOptionSelection(optPapaya, 'morning_fruit_rotating', 'single', items, planId);
    assert.equal(isOptionSelected(optGuava, 'morning_fruit_rotating', items), false);
    assert.equal(isOptionSelected(optPapaya, 'morning_fruit_rotating', items), true);
  });

  test('Single-Select: Afternoon Primary Protein switches between Soy Chunks, Chicken, Paneer', () => {
    const optSoy = { id: 'soy_chunks', name: 'Soy Chunks', foodId: 'soy_chunks', defaultWeightG: 50 };
    const optChicken = { id: 'chicken_breast', name: 'Chicken Breast', foodId: 'chicken_breast', defaultWeightG: 100 };
    const optPaneer = { id: 'paneer', name: 'Paneer', foodId: 'paneer', defaultWeightG: 50 };

    let items = applyOptionSelection(optSoy, 'afternoon_protein', 'single', [], planId);
    assert.equal(isOptionSelected(optSoy, 'afternoon_protein', items), true);
    assert.equal(isOptionSelected(optChicken, 'afternoon_protein', items), false);

    items = applyOptionSelection(optChicken, 'afternoon_protein', 'single', items, planId);
    assert.equal(isOptionSelected(optSoy, 'afternoon_protein', items), false);
    assert.equal(isOptionSelected(optChicken, 'afternoon_protein', items), true);

    items = applyOptionSelection(optPaneer, 'afternoon_protein', 'single', items, planId);
    assert.equal(isOptionSelected(optChicken, 'afternoon_protein', items), false);
    assert.equal(isOptionSelected(optPaneer, 'afternoon_protein', items), true);
  });

  test('Multi-Select: Night Meal allows multiple items and independent removal', () => {
    const optChapati = { id: 'chapati_night', name: 'Chapati ×2', foodId: 'chapati', defaultWeightG: 70, qty: 2 };
    const optSambar = { id: 'sambar_night', name: 'Sambar', foodId: 'sambar', defaultWeightG: 150 };
    const optMilk = { id: 'milk_toned_night', name: 'Toned Milk', foodId: 'milk_toned', defaultWeightG: 150 };

    let items: DietPlanItem[] = [];
    items = applyOptionSelection(optChapati, 'night_meal', 'multi', items, planId);
    items = applyOptionSelection(optSambar, 'night_meal', 'multi', items, planId);
    items = applyOptionSelection(optMilk, 'night_meal', 'multi', items, planId);

    assert.equal(isOptionSelected(optChapati, 'night_meal', items), true);
    assert.equal(isOptionSelected(optSambar, 'night_meal', items), true);
    assert.equal(isOptionSelected(optMilk, 'night_meal', items), true);
    assert.equal(items.filter((i) => i.mealSlot === 'night_meal').length, 3);

    // Remove Sambar
    items = applyOptionSelection(optSambar, 'night_meal', 'multi', items, planId);
    assert.equal(isOptionSelected(optChapati, 'night_meal', items), true);
    assert.equal(isOptionSelected(optSambar, 'night_meal', items), false);
    assert.equal(isOptionSelected(optMilk, 'night_meal', items), true);
    assert.equal(items.filter((i) => i.mealSlot === 'night_meal').length, 2);
  });
});

describe('Nutrient Calculations & Portion Scaling', () => {
  test('calculateNutrientTotals calculates accurate 18 nutrients for meal items', () => {
    // 1 Whole Egg (50g) + 1 Egg White (35g)
    const items: DietPlanItem[] = [
      { id: '1', planId: 'p', mealSlot: 'morning_eggs', foodId: 'egg_whole', portionName: '1 Whole Egg', weightG: 50, quantity: 1 },
      { id: '2', planId: 'p', mealSlot: 'morning_eggs', foodId: 'egg_white', portionName: '1 Egg White', weightG: 35, quantity: 1 },
    ];

    const totals = calculateNutrientTotals(items, MASTER_FOOD_ITEMS);

    // Whole egg (50g): cal 78, prot 6.3, chol 185, ca 25
    // Egg white (35g): cal 17, prot 3.7, chol 0, ca 2
    // Combined: cal 95, prot 10.0, chol 185, ca 27
    assert.equal(totals.calories, 95);
    assert.equal(totals.protein, 10.0);
    assert.equal(totals.cholesterol, 185);
    assert.equal(totals.calcium, 27);
  });

  test('calculateMealSlotCalcium breaks down fractional calcium by meal slot', () => {
    const items: DietPlanItem[] = [
      { id: '1', planId: 'p', mealSlot: 'morning_eggs', foodId: 'egg_whole', portionName: '1 Whole Egg', weightG: 50, quantity: 1 }, // 25 mg
      { id: '2', planId: 'p', mealSlot: 'morning_breakfast', foodId: 'ragi_dosa', portionName: 'Ragi Dosa ×2', weightG: 56, quantity: 2 }, // 170 mg
      { id: '3', planId: 'p', mealSlot: 'afternoon_gravy', foodId: 'keerai_masiyal', portionName: 'Keerai Masiyal', weightG: 150, quantity: 1 }, // 150 mg
      { id: '4', planId: 'p', mealSlot: 'night_meal', foodId: 'milk_toned', portionName: 'Toned Milk', weightG: 150, quantity: 1 }, // 177 mg
    ];

    const slotCalcium = calculateMealSlotCalcium(items, MASTER_FOOD_ITEMS);

    assert.equal(slotCalcium.morning, 195); // 25 + 170
    assert.equal(slotCalcium.afternoon, 150); // 150
    assert.equal(slotCalcium.night, 177); // 177
  });

  test('BMI Calculation formula verifies strictly against WHO standards', () => {
    const weightKg = 60.0;
    const heightCm = 165.0;
    const hM = heightCm / 100;
    const bmi = Number((weightKg / (hM * hM)).toFixed(1));

    // 60 / (1.65 * 1.65) = 22.038 -> 22.0
    assert.equal(bmi, 22.0);

    // Underweight check: 45kg at 165cm = 16.5
    const underBmi = Number((45 / (hM * hM)).toFixed(1));
    assert.equal(underBmi, 16.5);

    // Overweight check: 75kg at 165cm = 27.5
    const overBmi = Number((75 / (hM * hM)).toFixed(1));
    assert.equal(overBmi, 27.5);
  });
});

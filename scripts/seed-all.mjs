import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local
const envPath = path.resolve('.env.local');
let dbUrl = process.env.DATABASE_URL;
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.substring('DATABASE_URL='.length).trim();
    }
  }
}

const sql = neon(dbUrl);

// 38 exact food items
const MASTER_FOOD_ITEMS = [
  { id: 'egg_whole', name: 'Whole Egg, boiled', category: 'Eggs & Dairy', baseUnit: '1 egg (50g)', baseWeightG: 50, calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, saturatedFat: 1.6, cholesterol: 185, fibre: 0, sodium: 62, calcium: 25, phosphorus: 86, iron: 0.6, potassium: 63, magnesium: 5, zinc: 0.55, vitaminB12: 0.55, vitaminC: 0, vitaminK: 0.15, vitaminD: 1.0 },
  { id: 'egg_white', name: 'Egg White, boiled', category: 'Eggs & Dairy', baseUnit: '1 white (35g)', baseWeightG: 35, calories: 17, protein: 3.7, carbs: 0.2, fat: 0.05, saturatedFat: 0, cholesterol: 0, fibre: 0, sodium: 56, calcium: 2, phosphorus: 6, iron: 0.03, potassium: 55, magnesium: 4, zinc: 0.01, vitaminB12: 0.03, vitaminC: 0, vitaminK: 0, vitaminD: 0 },
  { id: 'curd', name: 'Curd (Dahi), toned', category: 'Eggs & Dairy', baseUnit: '100 g', baseWeightG: 100, calories: 60, protein: 3.1, carbs: 4.0, fat: 3.0, saturatedFat: 2.0, cholesterol: 10, fibre: 0, sodium: 40, calcium: 120, phosphorus: 93, iron: 0.1, potassium: 150, magnesium: 12, zinc: 0.5, vitaminB12: 0.4, vitaminC: 0, vitaminK: 0.2, vitaminD: 0 },
  { id: 'milk_toned', name: 'Toned Milk (3% fat)', category: 'Eggs & Dairy', baseUnit: '100 ml', baseWeightG: 100, calories: 58, protein: 3.2, carbs: 4.8, fat: 3.0, saturatedFat: 1.9, cholesterol: 10, fibre: 0, sodium: 44, calcium: 118, phosphorus: 92, iron: 0.1, potassium: 145, magnesium: 11, zinc: 0.4, vitaminB12: 0.4, vitaminC: 0.5, vitaminK: 0.2, vitaminD: 0.05 },
  { id: 'pomegranate', name: 'Pomegranate', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 83, protein: 1.7, carbs: 19.0, fat: 1.2, saturatedFat: 0.1, cholesterol: 0, fibre: 4.0, sodium: 3, calcium: 10, phosphorus: 36, iron: 0.3, potassium: 236, magnesium: 12, zinc: 0.4, vitaminB12: 0, vitaminC: 10, vitaminK: 16.0, vitaminD: 0 },
  { id: 'banana_yelakki', name: 'Banana (Yelakki, ~2-3 small)', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, saturatedFat: 0.1, cholesterol: 0, fibre: 2.6, sodium: 1, calcium: 5, phosphorus: 22, iron: 0.3, potassium: 358, magnesium: 27, zinc: 0.2, vitaminB12: 0, vitaminC: 9, vitaminK: 0.5, vitaminD: 0 },
  { id: 'papaya', name: 'Papaya, ripe', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 43, protein: 0.5, carbs: 11.0, fat: 0.3, saturatedFat: 0.1, cholesterol: 0, fibre: 1.7, sodium: 8, calcium: 20, phosphorus: 10, iron: 0.3, potassium: 182, magnesium: 21, zinc: 0.1, vitaminB12: 0, vitaminC: 61, vitaminK: 2.6, vitaminD: 0 },
  { id: 'sapota', name: 'Sapota (Chikoo)', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 83, protein: 0.4, carbs: 20.0, fat: 1.1, saturatedFat: 0.2, cholesterol: 0, fibre: 5.3, sodium: 12, calcium: 21, phosphorus: 12, iron: 0.8, potassium: 193, magnesium: 12, zinc: 0.1, vitaminB12: 0, vitaminC: 15, vitaminK: 0, vitaminD: 0 },
  { id: 'guava', name: 'Guava', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 68, protein: 2.6, carbs: 14.0, fat: 1.0, saturatedFat: 0.3, cholesterol: 0, fibre: 5.4, sodium: 2, calcium: 18, phosphorus: 40, iron: 0.3, potassium: 417, magnesium: 22, zinc: 0.2, vitaminB12: 0, vitaminC: 228, vitaminK: 2.6, vitaminD: 0 },
  { id: 'apple', name: 'Apple', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, saturatedFat: 0, cholesterol: 0, fibre: 2.4, sodium: 1, calcium: 6, phosphorus: 11, iron: 0.1, potassium: 107, magnesium: 5, zinc: 0.04, vitaminB12: 0, vitaminC: 5, vitaminK: 2.2, vitaminD: 0 },
  { id: 'orange', name: 'Orange', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 47, protein: 0.9, carbs: 12.0, fat: 0.1, saturatedFat: 0, cholesterol: 0, fibre: 2.4, sodium: 0, calcium: 40, phosphorus: 14, iron: 0.1, potassium: 181, magnesium: 10, zinc: 0.1, vitaminB12: 0, vitaminC: 53, vitaminK: 0, vitaminD: 0 },
  { id: 'pineapple', name: 'Pineapple', category: 'Fruits', baseUnit: '100 g', baseWeightG: 100, calories: 50, protein: 0.5, carbs: 13.0, fat: 0.1, saturatedFat: 0, cholesterol: 0, fibre: 1.4, sodium: 1, calcium: 13, phosphorus: 8, iron: 0.3, potassium: 109, magnesium: 12, zinc: 0.1, vitaminB12: 0, vitaminC: 48, vitaminK: 0.7, vitaminD: 0 },
  { id: 'ragi_dosa', name: 'Ragi Dosa (25g flour + 0.5 tsp oil)', category: 'Grains & Dosa', baseUnit: '1 dosa', baseWeightG: 28, calories: 102.5, protein: 2.0, carbs: 18.5, fat: 2.0, saturatedFat: 0.35, cholesterol: 0, fibre: 2.5, sodium: 5, calcium: 85, phosphorus: 75, iron: 0.95, potassium: 100, magnesium: 30, zinc: 0.35, vitaminB12: 0, vitaminC: 0, vitaminK: 0.25, vitaminD: 0 },
  { id: 'moong_dosa', name: 'Moong Dosa (25g dal + 0.5 tsp oil)', category: 'Grains & Dosa', baseUnit: '1 dosa', baseWeightG: 28, calories: 107.5, protein: 6.0, carbs: 15.5, fat: 2.3, saturatedFat: 0.4, cholesterol: 0, fibre: 4.0, sodium: 5, calcium: 31, phosphorus: 95, iron: 1.7, potassium: 310, magnesium: 47.5, zinc: 0.7, vitaminB12: 0, vitaminC: 1, vitaminK: 2.25, vitaminD: 0 },
  { id: 'muesli', name: 'Muesli, multigrain', category: 'Grains & Dosa', baseUnit: '100 g', baseWeightG: 100, calories: 370, protein: 8.5, carbs: 72.0, fat: 6.2, saturatedFat: 0.5, cholesterol: 0, fibre: 7.5, sodium: 60, calcium: 32, phosphorus: 205, iron: 4.1, potassium: 280, magnesium: 70, zinc: 1.2, vitaminB12: 0, vitaminC: 0, vitaminK: 0, vitaminD: 0 },
  { id: 'rice_cooked', name: 'Rice, white cooked', category: 'Grains & Dosa', baseUnit: '100 g', baseWeightG: 100, calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, saturatedFat: 0.1, cholesterol: 0, fibre: 0.4, sodium: 1, calcium: 10, phosphorus: 43, iron: 0.2, potassium: 35, magnesium: 12, zinc: 0.5, vitaminB12: 0, vitaminC: 0, vitaminK: 0, vitaminD: 0 },
  { id: 'chapati', name: 'Chapati / Phulka (whole wheat)', category: 'Grains & Dosa', baseUnit: '1 pc (35g)', baseWeightG: 35, calories: 105, protein: 3.5, carbs: 20.0, fat: 1.2, saturatedFat: 0.2, cholesterol: 0, fibre: 2.8, sodium: 90, calcium: 12, phosphorus: 85, iron: 1.2, potassium: 110, magnesium: 35, zinc: 0.7, vitaminB12: 0, vitaminC: 0, vitaminK: 0.5, vitaminD: 0 },
  { id: 'sambar', name: 'Sambar (dal + veg)', category: 'Gravies & Dals', baseUnit: '100 ml', baseWeightG: 100, calories: 60, protein: 3.0, carbs: 8.0, fat: 2.0, saturatedFat: 0.4, cholesterol: 0, fibre: 2.0, sodium: 200, calcium: 30, phosphorus: 60, iron: 1.0, potassium: 233, magnesium: 23, zinc: 0.47, vitaminB12: 0, vitaminC: 4, vitaminK: 5.3, vitaminD: 0 },
  { id: 'keerai_masiyal', name: 'Green Leaves Curry (Keerai Masiyal)', category: 'Gravies & Dals', baseUnit: '100 ml', baseWeightG: 100, calories: 47, protein: 2.7, carbs: 4.7, fat: 2.0, saturatedFat: 0.47, cholesterol: 0, fibre: 2.0, sodium: 167, calcium: 100, phosphorus: 40, iron: 1.33, potassium: 267, magnesium: 33, zinc: 0.4, vitaminB12: 0, vitaminC: 10, vitaminK: 80.0, vitaminD: 0 },
  { id: 'moong_dal_curry', name: 'Moong Dal Curry', category: 'Gravies & Dals', baseUnit: '100 ml', baseWeightG: 100, calories: 70, protein: 4.3, carbs: 9.3, fat: 1.7, saturatedFat: 0.33, cholesterol: 0, fibre: 2.3, sodium: 167, calcium: 17, phosphorus: 63, iron: 0.87, potassium: 207, magnesium: 25, zinc: 0.53, vitaminB12: 0, vitaminC: 1.3, vitaminK: 2.0, vitaminD: 0 },
  { id: 'rasam', name: 'Rasam', category: 'Gravies & Dals', baseUnit: '100 ml', baseWeightG: 100, calories: 23, protein: 0.8, carbs: 3.3, fat: 0.8, saturatedFat: 0.2, cholesterol: 0, fibre: 0.5, sodium: 233, calcium: 10, phosphorus: 17, iron: 0.4, potassium: 100, magnesium: 8, zinc: 0.13, vitaminB12: 0, vitaminC: 3.3, vitaminK: 1.3, vitaminD: 0 },
  { id: 'vatha_kuzhambu', name: 'Vatha / Kara Kuzhambu', category: 'Gravies & Dals', baseUnit: '100 ml', baseWeightG: 100, calories: 73, protein: 1.3, carbs: 8.7, fat: 4.0, saturatedFat: 0.67, cholesterol: 0, fibre: 1.3, sodium: 253, calcium: 27, phosphorus: 27, iron: 1.0, potassium: 167, magnesium: 17, zinc: 0.27, vitaminB12: 0, vitaminC: 2.7, vitaminK: 2.0, vitaminD: 0 },
  { id: 'mor_kuzhambu', name: 'Mor Kuzhambu', category: 'Gravies & Dals', baseUnit: '100 ml', baseWeightG: 100, calories: 60, protein: 2.0, carbs: 4.0, fat: 4.0, saturatedFat: 2.33, cholesterol: 6.7, fibre: 0.67, sodium: 200, calcium: 67, phosphorus: 53, iron: 0.27, potassium: 100, magnesium: 10, zinc: 0.27, vitaminB12: 0.2, vitaminC: 1.3, vitaminK: 1.3, vitaminD: 0 },
  { id: 'kootu', name: 'Kootu (Dal + Vegetable)', category: 'Gravies & Dals', baseUnit: '100 ml', baseWeightG: 100, calories: 67, protein: 3.3, carbs: 7.3, fat: 2.7, saturatedFat: 1.2, cholesterol: 0, fibre: 2.3, sodium: 200, calcium: 30, phosphorus: 60, iron: 1.0, potassium: 220, magnesium: 23, zinc: 0.47, vitaminB12: 0, vitaminC: 4, vitaminK: 4.0, vitaminD: 0 },
  { id: 'chicken_breast', name: 'Chicken Breast, cooked', category: 'Proteins', baseUnit: '100 g', baseWeightG: 100, calories: 165, protein: 31.0, carbs: 0, fat: 3.6, saturatedFat: 1.0, cholesterol: 85, fibre: 0, sodium: 74, calcium: 15, phosphorus: 228, iron: 1.0, potassium: 256, magnesium: 29, zinc: 1.0, vitaminB12: 0.3, vitaminC: 0, vitaminK: 0.3, vitaminD: 0.1 },
  { id: 'soy_chunks', name: 'Soy Chunks (dry weight)', category: 'Proteins', baseUnit: '100 g', baseWeightG: 100, calories: 346, protein: 52.0, carbs: 33.0, fat: 0.6, saturatedFat: 0.1, cholesterol: 0, fibre: 13.0, sodium: 20, calcium: 270, phosphorus: 660, iron: 9.2, potassium: 2000, magnesium: 260, zinc: 5.0, vitaminB12: 0, vitaminC: 0, vitaminK: 2.0, vitaminD: 0 },
  { id: 'paneer', name: 'Paneer (cottage cheese)', category: 'Proteins', baseUnit: '100 g', baseWeightG: 100, calories: 280, protein: 18.0, carbs: 2.0, fat: 21.0, saturatedFat: 13.0, cholesterol: 70, fibre: 0, sodium: 40, calcium: 250, phosphorus: 260, iron: 0.2, potassium: 80, magnesium: 16, zinc: 2.0, vitaminB12: 0.8, vitaminC: 0, vitaminK: 2.0, vitaminD: 0.2 },
  { id: 'french_beans', name: 'French Beans', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 31, protein: 1.8, carbs: 7.0, fat: 0.2, saturatedFat: 0.1, cholesterol: 0, fibre: 3.4, sodium: 6, calcium: 37, phosphorus: 38, iron: 1.0, potassium: 211, magnesium: 25, zinc: 0.2, vitaminB12: 0, vitaminC: 16, vitaminK: 14.0, vitaminD: 0 },
  { id: 'carrot', name: 'Carrot', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 41, protein: 0.9, carbs: 10.0, fat: 0.2, saturatedFat: 0, cholesterol: 0, fibre: 2.8, sodium: 69, calcium: 33, phosphorus: 35, iron: 0.3, potassium: 320, magnesium: 12, zinc: 0.2, vitaminB12: 0, vitaminC: 6, vitaminK: 13.0, vitaminD: 0 },
  { id: 'keerai_poriyal', name: 'Greens (Keerai Poriyal, cooked)', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 65, protein: 3.2, carbs: 5.0, fat: 3.5, saturatedFat: 1.5, cholesterol: 0, fibre: 3.5, sodium: 120, calcium: 160, phosphorus: 55, iron: 2.2, potassium: 380, magnesium: 55, zinc: 0.6, vitaminB12: 0, vitaminC: 12, vitaminK: 140.0, vitaminD: 0 },
  { id: 'beetroot', name: 'Beetroot', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 43, protein: 1.6, carbs: 10.0, fat: 0.2, saturatedFat: 0, cholesterol: 0, fibre: 2.8, sodium: 78, calcium: 16, phosphorus: 40, iron: 0.8, potassium: 325, magnesium: 23, zinc: 0.4, vitaminB12: 0, vitaminC: 5, vitaminK: 0.2, vitaminD: 0 },
  { id: 'drumstick_pods', name: 'Drumstick Pods', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 37, protein: 2.1, carbs: 8.5, fat: 0.2, saturatedFat: 0.1, cholesterol: 0, fibre: 3.2, sodium: 42, calcium: 30, phosphorus: 50, iron: 0.4, potassium: 461, magnesium: 45, zinc: 0.5, vitaminB12: 0, vitaminC: 141, vitaminK: 0, vitaminD: 0 },
  { id: 'cabbage', name: 'Cabbage', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 25, protein: 1.3, carbs: 6.0, fat: 0.1, saturatedFat: 0, cholesterol: 0, fibre: 2.5, sodium: 18, calcium: 40, phosphorus: 26, iron: 0.5, potassium: 170, magnesium: 12, zinc: 0.2, vitaminB12: 0, vitaminC: 36, vitaminK: 76.0, vitaminD: 0 },
  { id: 'ladies_finger', name: 'Ladies Finger (Okra)', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, saturatedFat: 0, cholesterol: 0, fibre: 3.2, sodium: 7, calcium: 82, phosphorus: 61, iron: 0.6, potassium: 299, magnesium: 57, zinc: 0.6, vitaminB12: 0, vitaminC: 23, vitaminK: 31.0, vitaminD: 0 },
  { id: 'brinjal', name: 'Brinjal', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 25, protein: 1.0, carbs: 6.0, fat: 0.2, saturatedFat: 0, cholesterol: 0, fibre: 3.0, sodium: 2, calcium: 9, phosphorus: 24, iron: 0.2, potassium: 229, magnesium: 14, zinc: 0.2, vitaminB12: 0, vitaminC: 2, vitaminK: 3.5, vitaminD: 0 },
  { id: 'pumpkin', name: 'Pumpkin', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 26, protein: 1.0, carbs: 6.5, fat: 0.1, saturatedFat: 0, cholesterol: 0, fibre: 0.5, sodium: 1, calcium: 21, phosphorus: 44, iron: 0.8, potassium: 340, magnesium: 12, zinc: 0.3, vitaminB12: 0, vitaminC: 9, vitaminK: 1.1, vitaminD: 0 },
  { id: 'cluster_beans', name: 'Cluster Beans', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 44, protein: 3.2, carbs: 10.0, fat: 0.4, saturatedFat: 0.1, cholesterol: 0, fibre: 4.5, sodium: 15, calcium: 130, phosphorus: 57, iron: 1.1, potassium: 200, magnesium: 50, zinc: 0.5, vitaminB12: 0, vitaminC: 49, vitaminK: 15.0, vitaminD: 0 },
  { id: 'bottle_gourd', name: 'Bottle Gourd', category: 'Vegetables', baseUnit: '100 g', baseWeightG: 100, calories: 14, protein: 0.6, carbs: 3.4, fat: 0, saturatedFat: 0, cholesterol: 0, fibre: 0.5, sodium: 2, calcium: 26, phosphorus: 10, iron: 0.2, potassium: 150, magnesium: 11, zinc: 0.7, vitaminB12: 0, vitaminC: 10, vitaminK: 3.0, vitaminD: 0 },
];

async function seedAll() {
  console.log('Seeding 38 IFCT/USDA foods into Neon DB...');
  for (const item of MASTER_FOOD_ITEMS) {
    await sql`
      INSERT INTO food_items (
        id, name, category, base_unit, base_weight_g, calories, protein, carbs,
        fat, saturated_fat, cholesterol, fibre, sodium, calcium, phosphorus,
        iron, potassium, magnesium, zinc, vitamin_b12, vitamin_c, vitamin_k, vitamin_d, is_custom
      ) VALUES (
        ${item.id}, ${item.name}, ${item.category}, ${item.baseUnit}, ${item.baseWeightG},
        ${item.calories}, ${item.protein}, ${item.carbs}, ${item.fat}, ${item.saturatedFat},
        ${item.cholesterol}, ${item.fibre}, ${item.sodium}, ${item.calcium}, ${item.phosphorus},
        ${item.iron}, ${item.potassium}, ${item.magnesium}, ${item.zinc}, ${item.vitaminB12},
        ${item.vitaminC}, ${item.vitaminK}, ${item.vitaminD}, false
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        calories = EXCLUDED.calories,
        calcium = EXCLUDED.calcium,
        protein = EXCLUDED.protein;
    `;
  }
  console.log('38 foods seeded.');

  // Prepped portions
  console.log('Seeding prepped portions...');
  const portions = [
    { id: 'prep_egg_1w_1wh', foodId: 'egg_whole', name: '1 Whole Egg + 1 Egg White (~85 g)', mealSlot: 'morning_eggs', weightG: 85, quantityMultiplier: 1 },
    { id: 'prep_egg_2_boiled', foodId: 'egg_whole', name: '2 Boiled Eggs (100 g)', mealSlot: 'morning_eggs', weightG: 100, quantityMultiplier: 2 },
    { id: 'prep_pom_100', foodId: 'pomegranate', name: 'Pomegranate (100 g)', mealSlot: 'morning_fruit_daily', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_ban_100', foodId: 'banana_yelakki', name: 'Banana Yelakki (100 g)', mealSlot: 'morning_fruit_daily', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_papaya_100', foodId: 'papaya', name: 'Papaya (100 g)', mealSlot: 'morning_fruit_rotating', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_sapota_100', foodId: 'sapota', name: 'Sapota (100 g)', mealSlot: 'morning_fruit_rotating', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_guava_100', foodId: 'guava', name: 'Guava (100 g)', mealSlot: 'morning_fruit_rotating', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_apple_100', foodId: 'apple', name: 'Apple (100 g)', mealSlot: 'morning_fruit_rotating', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_orange_100', foodId: 'orange', name: 'Orange (100 g)', mealSlot: 'morning_fruit_rotating', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_pineapple_100', foodId: 'pineapple', name: 'Pineapple (100 g)', mealSlot: 'morning_fruit_rotating', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_ragi_dosa_2', foodId: 'ragi_dosa', name: 'Ragi Dosa ×2', mealSlot: 'morning_breakfast', weightG: 56, quantityMultiplier: 2 },
    { id: 'prep_moong_dosa_2', foodId: 'moong_dosa', name: 'Moong Dosa ×2', mealSlot: 'morning_breakfast', weightG: 56, quantityMultiplier: 2 },
    { id: 'prep_muesli_milk', foodId: 'muesli', name: 'Muesli (40 g) + Toned Milk (150 ml)', mealSlot: 'morning_breakfast', weightG: 190, quantityMultiplier: 1 },
    { id: 'prep_rice_70', foodId: 'rice_cooked', name: 'Rice Cooked (70 g)', mealSlot: 'afternoon_grain', weightG: 70, quantityMultiplier: 0.7 },
    { id: 'prep_rice_100', foodId: 'rice_cooked', name: 'Rice Cooked (100 g)', mealSlot: 'afternoon_grain', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_sambar_150', foodId: 'sambar', name: 'Sambar (150 ml)', mealSlot: 'afternoon_gravy', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_keerai_mas_150', foodId: 'keerai_masiyal', name: 'Keerai Masiyal (150 ml)', mealSlot: 'afternoon_gravy', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_moong_dal_150', foodId: 'moong_dal_curry', name: 'Moong Dal Curry (150 ml)', mealSlot: 'afternoon_gravy', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_rasam_150', foodId: 'rasam', name: 'Rasam (150 ml)', mealSlot: 'afternoon_gravy', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_vatha_150', foodId: 'vatha_kuzhambu', name: 'Vatha Kuzhambu (150 ml)', mealSlot: 'afternoon_gravy', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_mor_150', foodId: 'mor_kuzhambu', name: 'Mor Kuzhambu (150 ml)', mealSlot: 'afternoon_gravy', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_kootu_150', foodId: 'kootu', name: 'Kootu (150 ml)', mealSlot: 'afternoon_gravy', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_chicken_100', foodId: 'chicken_breast', name: 'Chicken Breast (100 g)', mealSlot: 'afternoon_protein', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_soy_50', foodId: 'soy_chunks', name: 'Soy Chunks (50 g dry)', mealSlot: 'afternoon_protein', weightG: 50, quantityMultiplier: 0.5 },
    { id: 'prep_paneer_50', foodId: 'paneer', name: 'Paneer (50 g)', mealSlot: 'afternoon_protein', weightG: 50, quantityMultiplier: 0.5 },
    { id: 'prep_beans_100', foodId: 'french_beans', name: 'French Beans (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_carrot_100', foodId: 'carrot', name: 'Carrot (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_keerai_por_100', foodId: 'keerai_poriyal', name: 'Keerai Poriyal (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_beetroot_100', foodId: 'beetroot', name: 'Beetroot (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_drumstick_100', foodId: 'drumstick_pods', name: 'Drumstick Pods (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_cabbage_100', foodId: 'cabbage', name: 'Cabbage (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_okra_100', foodId: 'ladies_finger', name: 'Ladies Finger (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_brinjal_100', foodId: 'brinjal', name: 'Brinjal (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_pumpkin_100', foodId: 'pumpkin', name: 'Pumpkin (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_cluster_100', foodId: 'cluster_beans', name: 'Cluster Beans (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_bottle_gourd_100', foodId: 'bottle_gourd', name: 'Bottle Gourd (100 g)', mealSlot: 'afternoon_poriyal', weightG: 100, quantityMultiplier: 1 },
    { id: 'prep_curd_15', foodId: 'curd', name: 'Curd (1 tbsp / 15 g)', mealSlot: 'afternoon_accompaniment', weightG: 15, quantityMultiplier: 0.15 },
    { id: 'prep_night_ragi_2', foodId: 'ragi_dosa', name: 'Ragi Dosa ×2', mealSlot: 'night_meal', weightG: 56, quantityMultiplier: 2 },
    { id: 'prep_night_chapati_2', foodId: 'chapati', name: 'Chapati ×2 (70 g)', mealSlot: 'night_meal', weightG: 70, quantityMultiplier: 2 },
    { id: 'prep_night_sambar_150', foodId: 'sambar', name: 'Sambar (150 ml)', mealSlot: 'night_meal', weightG: 150, quantityMultiplier: 1.5 },
    { id: 'prep_night_moong_dal_150', foodId: 'moong_dal_curry', name: 'Moong Dal Curry (150 ml)', mealSlot: 'night_meal', weightG: 150, quantityMultiplier: 1.5 },
  ];

  for (const p of portions) {
    await sql`
      INSERT INTO prepped_portions (
        id, food_id, name, meal_slot, weight_g, quantity_multiplier, is_default
      ) VALUES (
        ${p.id}, ${p.foodId}, ${p.name}, ${p.mealSlot}, ${p.weightG}, ${p.quantityMultiplier}, true
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log('Portions seeded.');

  // Starter Diet Plans
  console.log('Seeding 4 starter templates...');
  const plans = [
    {
      id: 'plan_a',
      name: 'Plan A: High-Calcium Bone Focus',
      description: 'Ragi Dosa + Soy Chunks + Keerai Masiyal & Poriyal for optimal natural calcium',
      isActive: true,
      water: 2250,
      sunlight: 20,
      items: [
        { slot: 'morning_eggs', foodId: 'egg_whole', name: '1 Whole Egg (50 g)', weight: 50, qty: 1 },
        { slot: 'morning_eggs', foodId: 'egg_white', name: '1 Egg White (35 g)', weight: 35, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'pomegranate', name: 'Pomegranate (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'banana_yelakki', name: 'Banana Yelakki (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_rotating', foodId: 'papaya', name: 'Papaya (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_breakfast', foodId: 'ragi_dosa', name: 'Ragi Dosa ×2', weight: 56, qty: 2 },
        { slot: 'afternoon_grain', foodId: 'rice_cooked', name: 'Rice Cooked (70 g)', weight: 70, qty: 0.7 },
        { slot: 'afternoon_gravy', foodId: 'keerai_masiyal', name: 'Keerai Masiyal (150 ml)', weight: 150, qty: 1.5 },
        { slot: 'afternoon_protein', foodId: 'soy_chunks', name: 'Soy Chunks (50 g dry)', weight: 50, qty: 0.5 },
        { slot: 'afternoon_poriyal', foodId: 'keerai_poriyal', name: 'Keerai Poriyal (100 g)', weight: 100, qty: 1 },
        { slot: 'afternoon_accompaniment', foodId: 'curd', name: 'Curd (15 g)', weight: 15, qty: 0.15 },
        { slot: 'night_meal', foodId: 'ragi_dosa', name: 'Ragi Dosa ×2', weight: 56, qty: 2 },
        { slot: 'night_meal', foodId: 'sambar', name: 'Sambar (150 ml)', weight: 150, qty: 1.5 },
      ],
    },
    {
      id: 'plan_b',
      name: 'Plan B: High-Protein Lean Day',
      description: 'Moong Dosa + Chicken Breast + French Beans for lean tissue preservation',
      isActive: false,
      water: 2250,
      sunlight: 20,
      items: [
        { slot: 'morning_eggs', foodId: 'egg_whole', name: '1 Whole Egg (50 g)', weight: 50, qty: 1 },
        { slot: 'morning_eggs', foodId: 'egg_white', name: '1 Egg White (35 g)', weight: 35, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'pomegranate', name: 'Pomegranate (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'banana_yelakki', name: 'Banana Yelakki (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_rotating', foodId: 'guava', name: 'Guava (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_breakfast', foodId: 'moong_dosa', name: 'Moong Dosa ×2', weight: 56, qty: 2 },
        { slot: 'afternoon_grain', foodId: 'rice_cooked', name: 'Rice Cooked (70 g)', weight: 70, qty: 0.7 },
        { slot: 'afternoon_gravy', foodId: 'sambar', name: 'Sambar (150 ml)', weight: 150, qty: 1.5 },
        { slot: 'afternoon_protein', foodId: 'chicken_breast', name: 'Chicken Breast (100 g)', weight: 100, qty: 1 },
        { slot: 'afternoon_poriyal', foodId: 'french_beans', name: 'French Beans (100 g)', weight: 100, qty: 1 },
        { slot: 'afternoon_accompaniment', foodId: 'curd', name: 'Curd (15 g)', weight: 15, qty: 0.15 },
        { slot: 'night_meal', foodId: 'chapati', name: 'Chapati ×2 (70 g)', weight: 70, qty: 2 },
        { slot: 'night_meal', foodId: 'moong_dal_curry', name: 'Moong Dal Curry (150 ml)', weight: 150, qty: 1.5 },
      ],
    },
    {
      id: 'plan_c',
      name: 'Plan C: Vegetarian Paneer & Dal',
      description: 'Ragi Dosa + Paneer + Moong Dal + Carrot for wholesome lacto-vegetarian support',
      isActive: false,
      water: 2000,
      sunlight: 15,
      items: [
        { slot: 'morning_eggs', foodId: 'egg_whole', name: '1 Whole Egg (50 g)', weight: 50, qty: 1 },
        { slot: 'morning_eggs', foodId: 'egg_white', name: '1 Egg White (35 g)', weight: 35, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'pomegranate', name: 'Pomegranate (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'banana_yelakki', name: 'Banana Yelakki (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_rotating', foodId: 'sapota', name: 'Sapota (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_breakfast', foodId: 'ragi_dosa', name: 'Ragi Dosa ×2', weight: 56, qty: 2 },
        { slot: 'afternoon_grain', foodId: 'rice_cooked', name: 'Rice Cooked (70 g)', weight: 70, qty: 0.7 },
        { slot: 'afternoon_gravy', foodId: 'moong_dal_curry', name: 'Moong Dal Curry (150 ml)', weight: 150, qty: 1.5 },
        { slot: 'afternoon_protein', foodId: 'paneer', name: 'Paneer (50 g)', weight: 50, qty: 0.5 },
        { slot: 'afternoon_poriyal', foodId: 'carrot', name: 'Carrot (100 g)', weight: 100, qty: 1 },
        { slot: 'afternoon_accompaniment', foodId: 'curd', name: 'Curd (15 g)', weight: 15, qty: 0.15 },
        { slot: 'night_meal', foodId: 'muesli', name: 'Muesli (40 g)', weight: 40, qty: 0.4 },
        { slot: 'night_meal', foodId: 'milk_toned', name: 'Toned Milk (150 ml)', weight: 150, qty: 1.5 },
      ],
    },
    {
      id: 'plan_d',
      name: 'Plan D: Light Iron & Antioxidant Boost',
      description: 'Moong Dosa + Soy Chunks + Keerai Masiyal + Beetroot with high Vit C pairing',
      isActive: false,
      water: 2500,
      sunlight: 25,
      items: [
        { slot: 'morning_eggs', foodId: 'egg_whole', name: '1 Whole Egg (50 g)', weight: 50, qty: 1 },
        { slot: 'morning_eggs', foodId: 'egg_white', name: '1 Egg White (35 g)', weight: 35, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'pomegranate', name: 'Pomegranate (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_daily', foodId: 'banana_yelakki', name: 'Banana Yelakki (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_fruit_rotating', foodId: 'guava', name: 'Guava (100 g)', weight: 100, qty: 1 },
        { slot: 'morning_breakfast', foodId: 'moong_dosa', name: 'Moong Dosa ×2', weight: 56, qty: 2 },
        { slot: 'afternoon_grain', foodId: 'rice_cooked', name: 'Rice Cooked (70 g)', weight: 70, qty: 0.7 },
        { slot: 'afternoon_gravy', foodId: 'keerai_masiyal', name: 'Keerai Masiyal (150 ml)', weight: 150, qty: 1.5 },
        { slot: 'afternoon_protein', foodId: 'soy_chunks', name: 'Soy Chunks (50 g dry)', weight: 50, qty: 0.5 },
        { slot: 'afternoon_poriyal', foodId: 'beetroot', name: 'Beetroot (100 g)', weight: 100, qty: 1 },
        { slot: 'afternoon_accompaniment', foodId: 'curd', name: 'Curd (15 g)', weight: 15, qty: 0.15 },
        { slot: 'night_meal', foodId: 'chapati', name: 'Chapati ×2 (70 g)', weight: 70, qty: 2 },
        { slot: 'night_meal', foodId: 'kootu', name: 'Kootu (150 ml)', weight: 150, qty: 1.5 },
      ],
    },
  ];

  for (const plan of plans) {
    await sql`
      INSERT INTO diet_plans (
        id, name, description, is_active, planned_water_ml, planned_sunlight_mins
      ) VALUES (
        ${plan.id}, ${plan.name}, ${plan.description}, ${plan.isActive}, ${plan.water}, ${plan.sunlight}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active;
    `;

    for (let i = 0; i < plan.items.length; i++) {
      const it = plan.items[i];
      const itemId = `${plan.id}_item_${i + 1}`;
      await sql`
        INSERT INTO diet_plan_items (
          id, plan_id, meal_slot, food_id, portion_name, weight_g, quantity
        ) VALUES (
          ${itemId}, ${plan.id}, ${it.slot}, ${it.foodId}, ${it.name}, ${it.weight}, ${it.qty}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }
  console.log('Diet plans seeded.');

  // Daily logs
  console.log('Seeding initial daily logs...');
  const logs = [
    { id: 'log_today', date: new Date().toISOString().split('T')[0], water: 1750, sun: 20, wt: 60.0, bmi: 22.0, notes: 'Feeling energetic. Sunlight 20m completed.' },
    { id: 'log_prev_1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], water: 2250, sun: 25, wt: 60.2, bmi: 22.1 },
    { id: 'log_prev_2', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], water: 2000, sun: 20, wt: 59.9, bmi: 22.0 },
  ];

  for (const log of logs) {
    await sql`
      INSERT INTO daily_logs (
        id, date, water_intake_ml, sunlight_mins, body_weight_kg, bmi, notes
      ) VALUES (
        ${log.id}, ${log.date}, ${log.water}, ${log.sun}, ${log.wt}, ${log.bmi}, ${log.notes || null}
      )
      ON CONFLICT (date) DO NOTHING;
    `;
  }
  console.log('Daily logs seeded.');
}

seedAll()
  .then(() => console.log('All tables fully seeded in Neon!'))
  .catch((e) => console.error('Seed error:', e));

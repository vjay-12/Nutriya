export type MenopausalStatus = 'post' | 'pre';

export interface RDATargets {
  id?: string;
  userId: string;
  menopausalStatus: MenopausalStatus;
  age: number;
  heightCm: number;
  targetWeightKg: number;
  energyMin: number;
  energyMax: number;
  proteinMin: number;
  proteinMax: number;
  fibreMin: number;
  fibreMax: number;
  sodiumMax: number;
  cholesterolMax: number;
  calciumMin: number;
  calciumMax: number;
  phosphorusMin: number;
  phosphorusMax: number;
  magnesiumMin: number;
  magnesiumMax: number;
  iron: number;
  zincMin: number;
  zincMax: number;
  potassium: number;
  vitaminDMin: number;
  vitaminDMax: number;
  vitaminCMin: number;
  vitaminCMax: number;
  vitaminKMin: number;
  vitaminKMax: number;
  vitaminB12: number;
  waterTargetMl: number;
  sunlightTargetMins: number;
  updatedAt?: string;
}

export type FoodCategory =
  | 'Eggs & Dairy'
  | 'Fruits'
  | 'Grains & Dosa'
  | 'Gravies & Dals'
  | 'Proteins'
  | 'Vegetables'
  | 'Custom';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory | string;
  baseUnit: string;
  baseWeightG: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat: number;
  cholesterol: number;
  fibre: number;
  sodium: number;
  calcium: number;
  phosphorus: number;
  iron: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  vitaminB12: number;
  vitaminC: number;
  vitaminK: number;
  vitaminD: number;
  isCustom?: boolean;
}

export type MealSlot =
  | 'morning_eggs'
  | 'morning_fruit_daily'
  | 'morning_fruit_rotating'
  | 'morning_breakfast'
  | 'afternoon_grain'
  | 'afternoon_gravy'
  | 'afternoon_protein'
  | 'afternoon_poriyal'
  | 'afternoon_accompaniment'
  | 'night_meal'
  | 'general';

export interface PreppedPortion {
  id: string;
  foodId: string;
  name: string;
  mealSlot: MealSlot;
  weightG: number;
  quantityMultiplier: number;
  notes?: string;
  isDefault?: boolean;
}

export interface DietPlanItem {
  id: string;
  planId: string;
  mealSlot: MealSlot;
  foodId: string;
  portionName: string;
  weightG: number;
  quantity: number;
}

export interface DietPlan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  plannedWaterMl: number;
  plannedSunlightMins: number;
  items: DietPlanItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  waterIntakeMl: number;
  sunlightMins: number;
  bodyWeightKg?: number;
  bmi?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat: number;
  cholesterol: number;
  fibre: number;
  sodium: number;
  calcium: number;
  phosphorus: number;
  iron: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  vitaminB12: number;
  vitaminC: number;
  vitaminK: number;
  vitaminD: number;
}

export interface ClinicalComment {
  id: string;
  title: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  source: string;
  message: string;
  actionableRecommendation?: string;
}

export interface AppState {
  targets: RDATargets;
  foods: FoodItem[];
  preppedPortions: PreppedPortion[];
  dietPlans: DietPlan[];
  activePlanId: string;
  defaultPlanId?: string;
  dailyLogs: DailyLog[];
  todayLog: DailyLog;
  lastSyncedAt?: string;
  isOffline: boolean;
}

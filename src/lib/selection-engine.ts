import { DietPlanItem, MealSlot } from './types';

export interface FoodOption {
  id: string;
  name: string;
  foodId: string;
  defaultWeightG: number;
  qty?: number;
  unit?: string;
  metrics?: string;
  pairedFoodId?: string;
  pairedWeightG?: number;
}

/**
 * Accurately determines if a specific food option is selected in a given slot,
 * strictly enforcing exclusive radio semantics and combo-matching rules.
 */
export function isOptionSelected(
  opt: FoodOption,
  slot: MealSlot,
  items: DietPlanItem[]
): boolean {
  const slotItems = items.filter((i) => i.mealSlot === slot);

  // 1. None option: Selected if and only if the slot contains zero items
  if (opt.foodId === 'none') {
    return slotItems.length === 0;
  }

  // If slot is empty, no food option can be selected
  if (slotItems.length === 0) {
    return false;
  }

  // 2. Eggs Preparation (morning_eggs)
  if (slot === 'morning_eggs') {
    const hasWhole = slotItems.some((i) => i.foodId === 'egg_whole');
    const hasWhite = slotItems.some((i) => i.foodId === 'egg_white');

    if (opt.id === 'egg_combo') {
      // 1 Whole Egg + 1 Egg White combo requires whole egg AND egg white
      return hasWhole && hasWhite;
    }
    if (opt.id === 'egg_two') {
      // 2 Boiled Eggs requires whole egg but explicitly NO egg white
      return hasWhole && !hasWhite;
    }
    return false;
  }

  // 3. Staple Cooked Rice (afternoon_grain)
  if (slot === 'afternoon_grain') {
    const rice = slotItems.find((i) => i.foodId === 'rice_cooked');
    if (!rice) return false;

    if (opt.id === 'rice_70') {
      return rice.weightG <= 80;
    }
    if (opt.id === 'rice_100') {
      return rice.weightG > 80;
    }
    return false;
  }

  // 4. Curd Accompaniment (afternoon_accompaniment)
  if (slot === 'afternoon_accompaniment') {
    const curd = slotItems.find((i) => i.foodId === 'curd');
    if (!curd) return false;

    if (opt.id === 'curd_15') {
      return curd.weightG <= 30;
    }
    if (opt.id === 'curd_50') {
      return curd.weightG > 30;
    }
    return false;
  }

  // 5. General matching by foodId for all other categories
  return slotItems.some((i) => i.foodId === opt.foodId);
}

/**
 * Returns the live display weight of an option:
 * if selected in plan, reflects the configured weight; otherwise returns the option's default.
 */
export function getOptionDisplayWeight(
  opt: FoodOption,
  slot: MealSlot,
  items: DietPlanItem[]
): number {
  if (opt.foodId === 'none') return 0;
  const isSelected = isOptionSelected(opt, slot, items);
  if (!isSelected) return opt.defaultWeightG;

  const slotItems = items.filter((i) => i.mealSlot === slot);
  if (slot === 'morning_eggs') {
    if (opt.id === 'egg_combo') {
      const whole = slotItems.find((i) => i.foodId === 'egg_whole');
      const white = slotItems.find((i) => i.foodId === 'egg_white');
      return (whole?.weightG || 50) + (white?.weightG || 35);
    }
    const whole = slotItems.find((i) => i.foodId === 'egg_whole');
    return whole?.weightG || opt.defaultWeightG;
  }

  const match = slotItems.find((i) => i.foodId === opt.foodId);
  return match?.weightG || opt.defaultWeightG;
}

/**
 * Applies a category-aware option click/toggle immutably to a list of DietPlanItems.
 */
export function applyOptionSelection(
  opt: FoodOption,
  slot: MealSlot,
  mode: 'single' | 'multi',
  currentItems: DietPlanItem[],
  planId: string
): DietPlanItem[] {
  const isSelected = isOptionSelected(opt, slot, currentItems);

  // 1. None Option
  if (opt.foodId === 'none') {
    return currentItems.filter((i) => i.mealSlot !== slot);
  }

  // 2. Single-Select Slot
  if (mode === 'single') {
    const hasExplicitNone = [
      'morning_eggs',
      'afternoon_grain',
      'afternoon_accompaniment',
    ].includes(slot);

    // If already selected:
    // If the category has a dedicated "None" button, clicking the active option keeps it selected.
    // If the category has no None button, clicking the active option toggles it off.
    if (isSelected) {
      if (!hasExplicitNone) {
        return currentItems.filter((i) => i.mealSlot !== slot);
      }
      return currentItems;
    }

    // Replace all items in this slot
    const withoutSlot = currentItems.filter((i) => i.mealSlot !== slot);

    // Special Combo handling
    if (slot === 'morning_eggs' && opt.id === 'egg_combo') {
      const item1: DietPlanItem = {
        id: `item_${Date.now()}_whole`,
        planId,
        mealSlot: slot,
        foodId: 'egg_whole',
        portionName: '1 Whole Egg (50 g)',
        weightG: 50,
        quantity: 1,
      };
      const item2: DietPlanItem = {
        id: `item_${Date.now()}_white`,
        planId,
        mealSlot: slot,
        foodId: 'egg_white',
        portionName: '1 Egg White (35 g)',
        weightG: 35,
        quantity: 1,
      };
      return [...withoutSlot, item1, item2];
    }

    if (slot === 'morning_eggs' && opt.id === 'egg_two') {
      const item: DietPlanItem = {
        id: `item_${Date.now()}_2boiled`,
        planId,
        mealSlot: slot,
        foodId: 'egg_whole',
        portionName: '2 Boiled Eggs (100 g)',
        weightG: 100,
        quantity: 2,
      };
      return [...withoutSlot, item];
    }

    // Standard single option
    const newItem: DietPlanItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      planId,
      mealSlot: slot,
      foodId: opt.foodId,
      portionName: `${opt.name} (${opt.defaultWeightG}${opt.unit || 'g'})`,
      weightG: opt.defaultWeightG,
      quantity: opt.qty || 1,
    };
    return [...withoutSlot, newItem];
  }

  // 3. Multi-Select Slot (morning_fruit_daily, night_meal)
  if (isSelected) {
    // Deselect this item
    return currentItems.filter(
      (i) => !(i.mealSlot === slot && i.foodId === opt.foodId)
    );
  } else {
    // Add this item
    const newItem: DietPlanItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      planId,
      mealSlot: slot,
      foodId: opt.foodId,
      portionName: `${opt.name} (${opt.defaultWeightG}${opt.unit || 'g'})`,
      weightG: opt.defaultWeightG,
      quantity: opt.qty || 1,
    };
    return [...currentItems, newItem];
  }
}

import { AppState, DailyLog, DietPlan, FoodItem, PreppedPortion, RDATargets } from './types';
import {
  DEFAULT_POST_MENOPAUSAL_TARGETS,
  MASTER_FOOD_ITEMS,
  DEFAULT_PREPPED_PORTIONS,
  STARTER_DIET_PLANS,
  INITIAL_LOGS,
} from './seed-data';

const STORAGE_KEY = 'batch_care_state_v1';

export function getInitialState(): AppState {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = INITIAL_LOGS.find((l) => l.date === todayStr) || {
    id: 'log_' + todayStr,
    date: todayStr,
    waterIntakeMl: 1250,
    sunlightMins: 15,
    bodyWeightKg: 53.0,
    bmi: 21.8,
  };

  return {
    targets: DEFAULT_POST_MENOPAUSAL_TARGETS,
    foods: MASTER_FOOD_ITEMS,
    preppedPortions: DEFAULT_PREPPED_PORTIONS,
    dietPlans: STARTER_DIET_PLANS,
    activePlanId: 'plan_a',
    defaultPlanId: 'plan_a',
    dailyLogs: INITIAL_LOGS,
    todayLog,
    isOffline: false,
  };
}

export function loadLocalState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveLocalState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...getInitialState(),
      ...parsed,
    };
  } catch (e) {
    console.error('Failed to parse localStorage state:', e);
    return getInitialState();
  }
}

export function saveLocalState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadLocalState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function exportBackupJson(state: AppState) {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nutriya_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importBackupJson(jsonString: string): { success: boolean; state?: AppState; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.targets || !parsed.foods || !parsed.dietPlans) {
      return { success: false, error: 'Invalid backup format: missing core nutrition data' };
    }
    saveLocalState(parsed);
    return { success: true, state: parsed };
  } catch (err: any) {
    return { success: false, error: err.message || 'JSON parse error' };
  }
}

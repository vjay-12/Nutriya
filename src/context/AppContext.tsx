'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppState,
  DailyLog,
  DietPlan,
  DietPlanItem,
  FoodItem,
  PreppedPortion,
  RDATargets,
  MenopausalStatus,
} from '@/lib/types';
import {
  DEFAULT_ADULT_TARGETS,
  DEFAULT_POST_MENOPAUSAL_TARGETS,
  DEFAULT_PRE_MENOPAUSAL_TARGETS,
  MASTER_FOOD_ITEMS,
  DEFAULT_PREPPED_PORTIONS,
  STARTER_DIET_PLANS,
  INITIAL_LOGS,
} from '@/lib/seed-data';
import {
  loadLocalState,
  saveLocalState,
  exportBackupJson,
  importBackupJson,
} from '@/lib/storage';

export type TabType = 'overview' | 'rda' | 'fooddb' | 'builder' | 'analysis';

interface AppContextType {
  targets: RDATargets;
  foods: FoodItem[];
  preppedPortions: PreppedPortion[];
  dietPlans: DietPlan[];
  activePlanId: string;
  defaultPlanId: string;
  activePlan: DietPlan;
  dailyLogs: DailyLog[];
  todayLog: DailyLog;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOnline: boolean;
  isSyncing: boolean;
  syncStatus: 'synced' | 'local_only' | 'error' | 'syncing';
  lastSyncedAt: string | null;

  // Actions
  updateTargets: (newTargets: Partial<RDATargets>) => Promise<void>;
  setMenopausalStatus: (status: MenopausalStatus) => Promise<void>;
  restoreClinicalDefaults: () => Promise<void>;
  updateTodayWater: (deltaOrAbs: number, isAbsolute?: boolean) => Promise<void>;
  updateTodaySunlight: (minsOrDelta: number, isAbsolute?: boolean) => Promise<void>;
  logWeight: (weightKg: number) => Promise<void>;
  addCustomFood: (food: FoodItem) => Promise<void>;
  addPreppedPortion: (portion: PreppedPortion) => Promise<void>;
  deletePreppedPortion: (id: string) => Promise<void>;
  setActivePlan: (id: string) => Promise<void>;
  setDefaultPlan: (id: string) => Promise<void>;
  updateActivePlanItems: (items: DietPlanItem[]) => Promise<void>;
  saveCurrentPlan: () => Promise<void>;
  createNewPlan: (name: string, copyFromActive?: boolean) => Promise<string>;
  duplicatePlan: (id: string) => Promise<string>;
  renamePlan: (id: string, newName: string) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  exportBackup: () => void;
  importBackup: (json: string) => boolean;
  syncAllWithServer: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [targets, setTargets] = useState<RDATargets>(DEFAULT_ADULT_TARGETS);
  const [foods, setFoods] = useState<FoodItem[]>(MASTER_FOOD_ITEMS);
  const [preppedPortions, setPreppedPortions] = useState<PreppedPortion[]>(DEFAULT_PREPPED_PORTIONS);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(STARTER_DIET_PLANS);
  const [activePlanId, setActivePlanId] = useState<string>('plan_a');
  const [defaultPlanId, setDefaultPlanId] = useState<string>('plan_a');
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(INITIAL_LOGS);

  const todayStr = new Date().toISOString().split('T')[0];
  const [todayLog, setTodayLog] = useState<DailyLog>({
    id: 'log_' + todayStr,
    date: todayStr,
    waterIntakeMl: 1750,
    sunlightMins: 20,
    bodyWeightKg: 60.0,
    bmi: 22.0,
  });

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local_only' | 'error' | 'syncing'>('local_only');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // Load local state on client mount
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const saved = loadLocalState();
    if (saved) {
      setTargets(saved.targets || DEFAULT_POST_MENOPAUSAL_TARGETS);
      setFoods(saved.foods?.length ? saved.foods : MASTER_FOOD_ITEMS);
      setPreppedPortions(saved.preppedPortions?.length ? saved.preppedPortions : DEFAULT_PREPPED_PORTIONS);
      setDietPlans(saved.dietPlans?.length ? saved.dietPlans : STARTER_DIET_PLANS);
      const foundDefault =
        saved.defaultPlanId ||
        saved.dietPlans?.find((p: DietPlan) => p.isActive)?.id ||
        'plan_a';
      setDefaultPlanId(foundDefault);
      setActivePlanId(saved.activePlanId || foundDefault);
      if (saved.dailyLogs?.length) {
        setDailyLogs(saved.dailyLogs);
        const match = saved.dailyLogs.find((l) => l.date === todayStr);
        if (match) setTodayLog(match);
      }
    }
    setHasHydrated(true);

    // Attempt remote sync with Neon DB in background
    syncAllWithServer();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!hasHydrated) return;
    saveLocalState({
      targets,
      foods,
      preppedPortions,
      dietPlans,
      activePlanId,
      defaultPlanId,
      dailyLogs,
      todayLog,
    });
  }, [hasHydrated, targets, foods, preppedPortions, dietPlans, activePlanId, defaultPlanId, dailyLogs, todayLog]);

  const activePlan =
    dietPlans.find((p) => p.id === activePlanId) ||
    dietPlans[0] ||
    STARTER_DIET_PLANS[0];

  // Remote Synchronization
  const syncAllWithServer = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncStatus('local_only');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // 1. Trigger Seed check
      await fetch('/api/seed', { method: 'POST' }).catch(() => {});

      // 2. Fetch targets
      const rdaRes = await fetch('/api/rda');
      if (rdaRes.ok) {
        const data = await rdaRes.json();
        if (data.targets) setTargets(data.targets);
      }

      // 3. Fetch foods
      const foodsRes = await fetch('/api/foods');
      if (foodsRes.ok) {
        const data = await foodsRes.json();
        if (data.foods?.length) setFoods(data.foods);
      }

      // 4. Fetch prepped portions
      const portionsRes = await fetch('/api/prepped-portions');
      if (portionsRes.ok) {
        const data = await portionsRes.json();
        if (data.portions?.length) setPreppedPortions(data.portions);
      }

      // 5. Fetch diet plans
      const plansRes = await fetch('/api/diet-plans');
      if (plansRes.ok) {
        const data = await plansRes.json();
        if (data.plans?.length) {
          setDietPlans(data.plans);
          const active = data.plans.find((p: DietPlan) => p.isActive);
          if (active) {
            setDefaultPlanId(active.id);
            setActivePlanId((prev) => {
              return data.plans.some((p: DietPlan) => p.id === prev) ? prev : active.id;
            });
          }
        }
      }

      // 6. Fetch daily logs
      const logsRes = await fetch('/api/daily-logs');
      if (logsRes.ok) {
        const data = await logsRes.json();
        if (data.logs?.length) {
          setDailyLogs(data.logs);
          const match = data.logs.find((l: DailyLog) => l.date === todayStr);
          if (match) setTodayLog(match);
        }
      }

      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Neon DB sync error, keeping local cached state:', err);
      setSyncStatus('local_only');
    } finally {
      setIsSyncing(false);
    }
  }, [todayStr]);

  // Target Actions
  const updateTargets = async (newTargets: Partial<RDATargets>) => {
    const updated = { ...targets, ...newTargets, updatedAt: new Date().toISOString() };
    setTargets(updated);

    if (navigator.onLine) {
      fetch('/api/rda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('RDA sync failed, cached locally:', e));
    }
  };

  const setMenopausalStatus = async (status: MenopausalStatus) => {
    const base = status === 'post' ? DEFAULT_POST_MENOPAUSAL_TARGETS : DEFAULT_PRE_MENOPAUSAL_TARGETS;
    const updated: RDATargets = {
      ...targets,
      menopausalStatus: status,
      iron: base.iron,
      calciumMin: base.calciumMin,
      updatedAt: new Date().toISOString(),
    };
    await updateTargets(updated);
  };

  const restoreClinicalDefaults = async () => {
    const status = targets.menopausalStatus || 'post';
    const defaults = status === 'post' ? DEFAULT_POST_MENOPAUSAL_TARGETS : DEFAULT_PRE_MENOPAUSAL_TARGETS;
    await updateTargets(defaults);
  };

  // Lifestyle Log Actions
  const updateTodayWater = async (deltaOrAbs: number, isAbsolute = false) => {
    const newIntake = isAbsolute ? Math.max(0, deltaOrAbs) : Math.max(0, todayLog.waterIntakeMl + deltaOrAbs);
    const updated: DailyLog = {
      ...todayLog,
      waterIntakeMl: newIntake,
      updatedAt: new Date().toISOString(),
    };
    setTodayLog(updated);
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === todayStr);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    if (navigator.onLine) {
      fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('Water log sync failed:', e));
    }
  };

  const updateTodaySunlight = async (minsOrDelta: number, isAbsolute = false) => {
    const newMins = isAbsolute ? Math.max(0, minsOrDelta) : Math.max(0, todayLog.sunlightMins + minsOrDelta);
    const updated: DailyLog = {
      ...todayLog,
      sunlightMins: newMins,
      updatedAt: new Date().toISOString(),
    };
    setTodayLog(updated);
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === todayStr);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    if (navigator.onLine) {
      fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('Sunlight log sync failed:', e));
    }
  };

  const logWeight = async (weightKg: number) => {
    const hM = targets.heightCm && targets.heightCm > 0 ? targets.heightCm / 100 : 0;
    const bmi = hM > 0 ? Number((weightKg / (hM * hM)).toFixed(1)) : undefined;
    const updated: DailyLog = {
      ...todayLog,
      bodyWeightKg: weightKg,
      bmi,
      updatedAt: new Date().toISOString(),
    };
    setTodayLog(updated);
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === todayStr);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    if (navigator.onLine) {
      fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('Weight log sync failed:', e));
    }
  };

  // Food & Portion Actions
  const addCustomFood = async (food: FoodItem) => {
    setFoods((prev) => [food, ...prev]);
    if (navigator.onLine) {
      fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food),
      }).catch((e) => console.warn('Food sync failed:', e));
    }
  };

  const addPreppedPortion = async (portion: PreppedPortion) => {
    setPreppedPortions((prev) => [portion, ...prev]);
    if (navigator.onLine) {
      fetch('/api/prepped-portions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portion),
      }).catch((e) => console.warn('Portion sync failed:', e));
    }
  };

  const deletePreppedPortion = async (id: string) => {
    setPreppedPortions((prev) => prev.filter((p) => p.id !== id));
    if (navigator.onLine) {
      fetch(`/api/prepped-portions?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch((e) =>
        console.warn('Delete portion sync failed:', e)
      );
    }
  };

  // Diet Plan Actions
  const setActivePlan = async (id: string) => {
    setActivePlanId(id);
  };

  const setDefaultPlan = async (id: string) => {
    setDefaultPlanId(id);
    setActivePlanId(id);
    const updatedPlans = dietPlans.map((p) => ({
      ...p,
      isActive: p.id === id,
    }));
    setDietPlans(updatedPlans);

    const chosen = updatedPlans.find((p) => p.id === id);
    if (chosen && navigator.onLine) {
      fetch('/api/diet-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chosen),
      }).catch((e) => console.warn('Default plan sync failed:', e));
    }
  };

  const updateActivePlanItems = async (items: DietPlanItem[]) => {
    const updatedPlans = dietPlans.map((p) => {
      if (p.id === activePlanId) {
        return { ...p, items, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    setDietPlans(updatedPlans);

    const current = updatedPlans.find((p) => p.id === activePlanId);
    if (current && navigator.onLine) {
      try {
        await fetch('/api/diet-plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current),
        });
      } catch (e) {
        console.warn('Plan items sync failed:', e);
      }
    }
  };

  const saveCurrentPlan = async () => {
    if (navigator.onLine && activePlan) {
      try {
        await fetch('/api/diet-plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activePlan),
        });
      } catch (e) {
        console.warn('Plan save failed:', e);
      }
    }
  };

  const createNewPlan = async (name: string, copyFromActive = true): Promise<string> => {
    const newId = 'plan_' + Date.now();
    const newPlan: DietPlan = {
      id: newId,
      name,
      description: 'Custom tailored plan',
      isActive: true,
      plannedWaterMl: activePlan?.plannedWaterMl || 2250,
      plannedSunlightMins: activePlan?.plannedSunlightMins || 20,
      items: copyFromActive && activePlan ? activePlan.items.map((i) => ({ ...i, planId: newId, id: 'item_' + Date.now() + Math.random().toString(36).substring(2, 6) })) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPlans = dietPlans.map((p) => ({ ...p, isActive: false })).concat(newPlan);
    setDietPlans(updatedPlans);
    setActivePlanId(newId);
    setDefaultPlanId(newId);

    if (navigator.onLine) {
      try {
        await fetch('/api/diet-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPlan),
        });
      } catch (e) {
        console.warn('New plan sync failed:', e);
      }
    }

    return newId;
  };

  const duplicatePlan = async (id: string): Promise<string> => {
    const target = dietPlans.find((p) => p.id === id) || activePlan;
    return createNewPlan(`${target.name} (Copy)`, true);
  };

  const renamePlan = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updatedPlans = dietPlans.map((p) => {
      if (p.id === id) {
        return { ...p, name: trimmed, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    setDietPlans(updatedPlans);

    const updated = updatedPlans.find((p) => p.id === id);
    if (updated && navigator.onLine) {
      fetch('/api/diet-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((e) => console.warn('Rename plan sync failed:', e));
    }
  };

  const deletePlan = async (id: string) => {
    if (dietPlans.length <= 1) return; // Must have at least 1 plan
    const remaining = dietPlans.filter((p) => p.id !== id);
    setDietPlans(remaining);
    if (activePlanId === id) {
      setActivePlanId(remaining[0].id);
    }

    if (navigator.onLine) {
      fetch(`/api/diet-plans?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch((e) =>
        console.warn('Delete plan sync failed:', e)
      );
    }
  };

  // Backup Actions
  const exportBackup = () => {
    exportBackupJson({
      targets,
      foods,
      preppedPortions,
      dietPlans,
      activePlanId,
      dailyLogs,
      todayLog,
      isOffline: !isOnline,
    });
  };

  const importBackup = (jsonString: string): boolean => {
    const result = importBackupJson(jsonString);
    if (result.success && result.state) {
      setTargets(result.state.targets);
      setFoods(result.state.foods);
      setPreppedPortions(result.state.preppedPortions);
      setDietPlans(result.state.dietPlans);
      if (result.state.activePlanId) setActivePlanId(result.state.activePlanId);
      if (result.state.dailyLogs?.length) setDailyLogs(result.state.dailyLogs);
      if (result.state.todayLog) setTodayLog(result.state.todayLog);
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        targets,
        foods,
        preppedPortions,
        dietPlans,
        activePlanId,
        defaultPlanId,
        activePlan,
        dailyLogs,
        todayLog,
        activeTab,
        setActiveTab,
        isOnline,
        isSyncing,
        syncStatus,
        lastSyncedAt,
        updateTargets,
        setMenopausalStatus,
        restoreClinicalDefaults,
        updateTodayWater,
        updateTodaySunlight,
        logWeight,
        addCustomFood,
        addPreppedPortion,
        deletePreppedPortion,
        setActivePlan,
        setDefaultPlan,
        updateActivePlanItems,
        saveCurrentPlan,
        createNewPlan,
        duplicatePlan,
        renamePlan,
        deletePlan,
        exportBackup,
        importBackup,
        syncAllWithServer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

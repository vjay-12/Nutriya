'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Star, Check, ChevronDown } from 'lucide-react';

interface PlanSelectorProps {
  className?: string;
  theme?: 'light' | 'hero';
}

export function PlanSelector({ className = '', theme = 'light' }: PlanSelectorProps) {
  const { dietPlans, activePlanId, activePlan, setActivePlan, defaultPlanId, setDefaultPlan } = useApp();
  const [justSetDefault, setJustSetDefault] = useState(false);

  const isCurrentDefault = activePlan.id === defaultPlanId;

  const handleSetDefault = async () => {
    await setDefaultPlan(activePlan.id);
    setJustSetDefault(true);
    setTimeout(() => setJustSetDefault(false), 2000);
  };

  const isHero = theme === 'hero';

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Dropdown Select Wrapper */}
      <div className="relative inline-flex items-center">
        <select
          value={activePlanId}
          onChange={(e) => setActivePlan(e.target.value)}
          aria-label="Select Active Diet Plan"
          className={`appearance-none font-bold text-xs sm:text-sm pl-3.5 pr-8 py-2 rounded-2xl border transition-all cursor-pointer focus:outline-none focus:ring-2 ${
            isHero
              ? 'bg-white/15 hover:bg-white/20 text-white border-white/20 focus:ring-white/40 shadow-inner'
              : 'bg-white hover:bg-[#F8F8F6] text-[#181A1F] border-[#181A1F]/10 focus:ring-[#2E6F5E] shadow-sm'
          }`}
        >
          {dietPlans.map((plan) => {
            const isDef = plan.id === defaultPlanId;
            return (
              <option
                key={plan.id}
                value={plan.id}
                className="text-[#181A1F] bg-white py-1 font-semibold"
              >
                {plan.name} {isDef ? '★ (Default)' : ''}
              </option>
            );
          })}
        </select>
        <ChevronDown
          className={`w-4 h-4 pointer-events-none absolute right-2.5 transition-transform ${
            isHero ? 'text-white/80' : 'text-[#646873]'
          }`}
        />
      </div>

      {/* Set as Default Button / Default Badge */}
      {isCurrentDefault ? (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isHero
              ? 'bg-white/20 text-[#8CE07A] border border-white/20 backdrop-blur-sm'
              : 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30'
          }`}
          title="This plan automatically loads first whenever Nutriya opens"
        >
          <Star className="w-3.5 h-3.5 fill-[#E5A93B] text-[#E5A93B]" />
          <span>Default Plan</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleSetDefault}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-xs ${
            isHero
              ? 'bg-white/10 hover:bg-white/25 text-white border-white/20'
              : 'bg-white hover:bg-[#EFECE6] text-[#646873] hover:text-[#181A1F] border-[#181A1F]/10'
          }`}
          title="Make this plan load automatically when Nutriya starts"
        >
          {justSetDefault ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#2E6F5E]" />
              <span className="text-[#2E6F5E]">Saved as Default!</span>
            </>
          ) : (
            <>
              <Star className="w-3.5 h-3.5 text-[#646873]" />
              <span>Set as Default</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

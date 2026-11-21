'use client';

import React from 'react';
import { useApp, TabType } from '@/context/AppContext';
import {
  LayoutDashboard,
  SlidersHorizontal,
  Utensils,
  ChefHat,
  Activity,
} from 'lucide-react';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'rda', label: 'RDA Targets', icon: SlidersHorizontal },
  { id: 'fooddb', label: 'Food & Prep', icon: Utensils },
  { id: 'builder', label: 'Diet Builder', icon: ChefHat },
  { id: 'analysis', label: 'Analysis', icon: Activity },
];

export function Navigation() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <>
      {/* Desktop Navigation Header Bar */}
      <div className="hidden md:block w-full border-b border-[#181A1F]/5 bg-white/70 backdrop-blur-md sticky top-[61px] z-30">
        <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2E6F5E] text-white shadow-soft'
                      : 'text-[#646873] hover:text-[#181A1F] hover:bg-[#EFECE6]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8CE07A]' : 'text-current'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Fixed Floating Bottom Dock */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none p-3 pb-safe">
        <nav className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-lg border border-[#181A1F]/10 rounded-full shadow-floating px-2 py-2 flex items-center justify-between">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 px-1 rounded-full transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-[#646873] hover:text-[#181A1F]'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-[#2E6F5E] rounded-full -z-10 shadow-sm" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#8CE07A]' : 'text-current'}`} />
                <span className="text-[10px] font-medium tracking-tight mt-0.5 leading-none">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

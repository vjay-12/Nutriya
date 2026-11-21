'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { RDATargetsTab } from '@/components/tabs/RDATargetsTab';
import { FoodPrepTab } from '@/components/tabs/FoodPrepTab';
import { DietBuilderTab } from '@/components/tabs/DietBuilderTab';
import { AnalysisTab } from '@/components/tabs/AnalysisTab';

export default function Home() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#181A1F] flex flex-col justify-between selection:bg-[#E7F2EF] selection:text-[#2E6F5E]">
      <div>
        {/* Sticky Glassmorphic Header */}
        <Header />

        {/* Desktop Navigation */}
        <Navigation />

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'rda' && <RDATargetsTab />}
          {activeTab === 'fooddb' && <FoodPrepTab />}
          {activeTab === 'builder' && <DietBuilderTab />}
          {activeTab === 'analysis' && <AnalysisTab />}
        </main>
      </div>

      {/* Global Medical Disclaimer Footer */}
      <footer className="w-full border-t border-[#181A1F]/5 bg-white/40 py-4 px-6 text-center text-[11px] text-[#646873] hidden md:block">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#181A1F]">batch.care</span>
            <span>&bull;</span>
            <span>Osteoporosis Nutrition & Hydration PWA</span>
          </div>
          <p>
            ICMR-NIN 2020 & IFCT 2017 compliant &bull; Deployed on Vercel with Neon Serverless DB
          </p>
        </div>
      </footer>
    </div>
  );
}

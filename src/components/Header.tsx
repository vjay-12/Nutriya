'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BackupModal } from './BackupModal';
import { RefreshCw, HardDriveDownload, Cloud, CloudOff, Check } from 'lucide-react';

export function Header() {
  const { isOnline, isSyncing, syncStatus, lastSyncedAt, syncAllWithServer } = useApp();
  const [showBackup, setShowBackup] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F8F8F6]/90 border-b border-[#181A1F]/5 px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E6F5E] to-[#1B4338] flex items-center justify-center shadow-soft text-white font-bold text-lg">
              <span className="text-[#8CE07A]">N</span>
              <span className="text-[#E5A93B]">.</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#181A1F]">Nutriya</span>
              </div>
              <p className="text-xs text-[#646873] hidden sm:block">
                Daily Nutrition & Meal Planner
              </p>
            </div>
          </div>

          {/* Sync & Backup Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Minimal Clean Sync Indicator */}
            <button
              onClick={() => syncAllWithServer()}
              disabled={isSyncing}
              title={
                !isOnline
                  ? 'Offline — changes saved locally'
                  : isSyncing
                  ? 'Syncing changes...'
                  : syncStatus === 'synced'
                  ? `Synced ${lastSyncedAt ? `at ${lastSyncedAt}` : ''}`
                  : 'Click to sync changes'
              }
              aria-label="Cloud sync status"
              className="px-2.5 py-1.5 rounded-full bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-xs font-medium text-[#181A1F] flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-75"
            >
              {!isOnline ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span className="text-[11px] text-[#E11D48]">Offline</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#2E6F5E] animate-spin" />
                  <span className="text-[11px] text-[#2E6F5E]">Syncing...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-[#2E6F5E]" />
                  <span className="text-[11px] text-[#2E6F5E]">Synced</span>
                  <Check className="w-3 h-3 text-[#2E6F5E] -ml-0.5" />
                </>
              )}
            </button>

            {/* Backup Button */}
            <button
              onClick={() => setShowBackup(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-xs font-medium text-[#181A1F] flex items-center gap-1.5 transition-colors shadow-sm"
              title="Backup & Restore Data"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-[#2E6F5E]" />
              <span className="hidden sm:inline">Backup</span>
            </button>
          </div>
        </div>
      </header>

      {showBackup && <BackupModal onClose={() => setShowBackup(false)} />}
    </>
  );
}

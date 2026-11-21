'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BackupModal } from './BackupModal';
import { RefreshCw, Database, Wifi, WifiOff, HardDriveDownload } from 'lucide-react';

export function Header() {
  const { isOnline, isSyncing, syncStatus, lastSyncedAt, syncAllWithServer } = useApp();
  const [showBackup, setShowBackup] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F8F8F6]/90 border-b border-[#181A1F]/5 px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Clinical Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E6F5E] to-[#1B4338] flex items-center justify-center shadow-soft text-white font-bold text-lg">
              <span className="text-[#8CE07A]">b</span>
              <span className="text-[#E5A93B]">.</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#181A1F]">batch.care</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E7F2EF] text-[#2E6F5E] border border-[#2E6F5E]/10">
                  Osteoporosis PWA
                </span>
              </div>
              <p className="text-xs text-[#646873] hidden sm:block">
                Precision Bone Nutrition &bull; 50y Female (53 kg, 156 cm)
              </p>
            </div>
          </div>

          {/* Sync & Backup Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Neon DB Status Badge */}
            <button
              onClick={() => syncAllWithServer()}
              disabled={isSyncing}
              title={
                syncStatus === 'synced'
                  ? `Synced with Neon DB at ${lastSyncedAt || 'recently'}`
                  : 'Sync with Neon DB'
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors bg-white hover:bg-[#EFECE6] text-[#646873] border-[#181A1F]/10"
            >
              <Database
                className={`w-3.5 h-3.5 ${
                  syncStatus === 'synced'
                    ? 'text-[#2E6F5E]'
                    : syncStatus === 'syncing'
                    ? 'text-[#E5A93B] animate-spin'
                    : 'text-[#646873]'
                }`}
              />
              <span className="hidden md:inline">
                {isSyncing ? 'Syncing...' : syncStatus === 'synced' ? 'Neon DB' : 'Local Cache'}
              </span>
              <RefreshCw className={`w-3 h-3 ml-0.5 opacity-60 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Online / Offline Pill */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-[#E7F2EF] text-[#2E6F5E] border-[#2E6F5E]/20'
                  : 'bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#2E6F5E]" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Offline</span>
                </>
              )}
            </div>

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

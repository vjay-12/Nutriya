'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Download, Upload, X, CheckCircle2, AlertTriangle } from 'lucide-react';

export function BackupModal({ onClose }: { onClose: () => void }) {
  const { exportBackup, importBackup } = useApp();
  const [importJson, setImportJson] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExport = () => {
    exportBackup();
    setStatus({ type: 'success', message: 'Backup JSON downloaded successfully.' });
  };

  const handleImportText = () => {
    if (!importJson.trim()) {
      setStatus({ type: 'error', message: 'Please paste valid backup JSON.' });
      return;
    }
    const success = importBackup(importJson);
    if (success) {
      setStatus({ type: 'success', message: 'Backup restored successfully! All state updated.' });
      setImportJson('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatus({ type: 'error', message: 'Failed to restore backup: invalid format.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackup(text);
      if (success) {
        setStatus({ type: 'success', message: 'Backup restored from file successfully!' });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatus({ type: 'error', message: 'Invalid JSON file structure.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#181A1F]/10 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#EFECE6] text-[#646873] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#181A1F] mb-1">Backup & Offline Recovery</h3>
        <p className="text-xs text-[#646873] mb-6">
          Safeguard your customized targets, custom foods, diet plans, and daily logs.
        </p>

        {status && (
          <div
            className={`mb-5 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-medium ${
              status.type === 'success'
                ? 'bg-[#E7F2EF] text-[#2E6F5E] border border-[#2E6F5E]/20'
                : 'bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/20'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E6F5E] flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#E11D48] flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Export Box */}
          <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-[#181A1F]/5">
            <h4 className="font-semibold text-sm text-[#181A1F] mb-1">Export JSON Backup</h4>
            <p className="text-xs text-[#646873] mb-3">
              Download your entire dataset as an offline JSON snapshot.
            </p>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2E6F5E] hover:bg-[#255c4e] text-white font-semibold text-xs transition-colors shadow-soft"
            >
              <Download className="w-4 h-4 text-[#8CE07A]" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-[#181A1F]/5">
            <h4 className="font-semibold text-sm text-[#181A1F] mb-1">Import JSON Backup</h4>
            <p className="text-xs text-[#646873] mb-3">
              Upload a previously exported `.json` file or paste JSON contents below.
            </p>

            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#EFECE6] border border-[#181A1F]/10 text-[#181A1F] font-semibold text-xs cursor-pointer transition-colors mb-3">
              <Upload className="w-4 h-4 text-[#2E6F5E]" />
              <span>Choose Backup File (.json)</span>
              <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
            </label>

            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Or paste backup JSON text here..."
              rows={3}
              className="w-full text-xs font-mono p-3 rounded-xl bg-white border border-[#181A1F]/10 focus:outline-none focus:ring-2 focus:ring-[#2E6F5E] resize-none mb-3"
            />

            <button
              onClick={handleImportText}
              disabled={!importJson.trim()}
              className="w-full px-4 py-2.5 rounded-full bg-[#181A1F] hover:bg-black text-white font-semibold text-xs transition-colors disabled:opacity-40"
            >
              Restore from Pasted JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

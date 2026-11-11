import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, Info, AlertCircle, UserCheck } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { useModalStore } from '../../store/useModalStore';
import {
  checkBackendHealth,
  resetSampleDesignsInDb,
  BackendHealth,
} from '../../utils/storageApi';

export const SettingsView: React.FC = () => {
  const { designsList, loadDesigns, user, signOut } = useStudioStore();
  const { showConfirm } = useModalStore();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const refreshHealth = async () => {
    setIsChecking(true);
    const result = await checkBackendHealth();
    setHealth(result);
    setIsChecking(false);
  };

  useEffect(() => {
    void refreshHealth();
  }, []);

  const handleResetSampleData = () => {
    showConfirm({
      title: 'Restore sample templates?',
      message:
        'Ensure default reference sample designs exist in your projects. Any newly created designs will be preserved.',
      confirmLabel: 'Restore',
      cancelLabel: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        await resetSampleDesignsInDb();
        await loadDesigns();
        setStatusMessage('Sample data restored successfully!');
        setTimeout(() => setStatusMessage(null), 3500);
      },
    });
  };

  return (
    <div className="min-h-full bg-[#F4F6FB] px-4 py-5 sm:px-6 md:px-8 md:py-7 space-y-5 sm:space-y-6 max-w-5xl mx-auto w-full select-none">
      {/* Top Header Bar */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#0F172A] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage your account, MongoDB connection, and template specifications.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Signed-in Account Section */}
      {user && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 md:p-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500">Mobile: {user.mobileNumber}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Storage & Data Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">MongoDB + Node.js Database</h3>
              <p className="text-xs text-slate-500">
                Single source of truth synced across any browser when signed in
              </p>
            </div>
          </div>

          <button
            onClick={() => void refreshHealth()}
            disabled={isChecking}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Connection</span>
          </button>
        </div>

        {/* Live Connection Banner */}
        {health && (
          <div
            className={`rounded-2xl p-4 border text-xs flex items-start space-x-3 ${
              health.dbConnected
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            {health.dbConnected ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            )}
            <div className="space-y-1">
              <p className="font-bold">
                {health.dbConnected ? 'Connected to MongoDB database' : 'MongoDB not connected'}
              </p>
              {!health.dbConnected && (
                <p className="text-[11px] opacity-90">
                  Ensure the Node.js server (`npm run dev`) is running and database configuration is valid.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-sm flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-semibold text-slate-800">Saved Posters</p>
            <p className="text-xs text-slate-500 mt-0.5">{designsList.length} total designs stored for your account</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetSampleData}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Sample Templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reference Specifications */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Reference Template Fidelity</h3>
            <p className="text-xs text-slate-500">Official assets and dimensions</p>
          </div>
        </div>

        <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            Testimonial Studio recreates the 3 mandatory reference templates faithfully:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Template 1 (Luxury Gold):</strong> Hari Janardhana Fin Corp & Dome Castle logos, dual ribbon banner, star recommendation panel, signature, and banquet photo cutout.
            </li>
            <li>
              <strong>Template 2 (Elegant Minimal):</strong> Dome Castle & OSPP logos, cursive script typography, giant quotation marks, and curved maroon wave.
            </li>
            <li>
              <strong>Template 3 (Corporate Classic):</strong> Dome Castle & New Star Security Services logos, gold-bordered quotation box, corner geometric accents, and faded watermark shield.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { 
  Radar, 
  RefreshCw, 
  Plus, 
  Settings as SettingsIcon, 
  Send, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

export default function Navbar({ 
  onRefresh, 
  isRefreshing, 
  onOpenManual, 
  onOpenSettings, 
  onOpenOutbox,
  onOpenAntiScam,
  outboxCount,
  totalJobs = 58 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Radar Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Radar className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white flex items-center">
                  AUTOHUNTER<span className="text-cyan-400">.AI</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  STUDENT TO PRO
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Radar Live
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Discord, LinkedIn, RemoteOK, WWR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Sync Feeds */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 transition-all cursor-pointer disabled:opacity-50"
            title="Scan & ingest fresh gigs worldwide"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Scanning Feeds...' : 'Sync Feeds'}</span>
          </button>

          {/* Paste Gig */}
          <button
            onClick={onOpenManual}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/40 transition-all cursor-pointer"
            title="Paste any raw job posting from Discord/LinkedIn to analyze"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Paste Gig</span>
          </button>

          {/* Anti-Scam Shield Bot */}
          <button
            onClick={onOpenAntiScam}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
            title="Scan incoming client emails & generate safe non-scam replies"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Anti-Scam Bot</span>
          </button>

          {/* Outbox Tracker */}
          <button
            onClick={onOpenOutbox}
            className="relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-indigo-500/40 transition-all cursor-pointer"
            title="View dispatched cold outreach history"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Outbox</span>
            {outboxCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-indigo-500 text-white shadow-sm shadow-indigo-500/50">
                {outboxCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Business Gmail & AI Settings"
          >
            <SettingsIcon className="w-4 h-4 text-slate-300 hover:text-cyan-400 transition-colors" />
          </button>

        </div>

      </div>
    </header>
  );
}

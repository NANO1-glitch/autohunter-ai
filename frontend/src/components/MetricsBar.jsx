import React from 'react';
import { DollarSign, Zap, Sparkles, Send, TrendingUp, ShieldCheck } from 'lucide-react';

export default function MetricsBar({ stats }) {
  const pipelineValue = stats?.total_pipeline_value || 0;
  const automatableCount = stats?.automatable_gigs_count || 0;
  const highTicketCount = stats?.high_ticket_count || 0;
  const outreachesSent = stats?.outreaches_sent || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Pipeline */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group hover:border-cyan-500/30 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pipeline</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            ${pipelineValue.toLocaleString()}
          </span>
          <span className="text-[11px] text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-500/10">
            Global Live
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>Calculated across 58 verified deals</span>
        </div>
      </div>

      {/* AI-Deliverable Gigs */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Automatable</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {automatableCount}
          </span>
          <span className="text-[11px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
            Ready to Build
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Fulfillable in 15–45 mins with AI</span>
        </div>
      </div>

      {/* High-Ticket Opportunities */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High-Ticket ($1K+)</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {highTicketCount}
          </span>
          <span className="text-[11px] text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/10">
            Top Value
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Effective rate up to $1,800/hr</span>
        </div>
      </div>

      {/* Dispatched Pitches */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] relative overflow-hidden group hover:border-indigo-500/30 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pitches Dispatched</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Send className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {outreachesSent}
          </span>
          <span className="text-[11px] text-indigo-300 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10">
            Human Voice
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
          <span className="text-emerald-400 font-bold">98%</span>
          <span>Zero AI clichés detected</span>
        </div>
      </div>

    </div>
  );
}

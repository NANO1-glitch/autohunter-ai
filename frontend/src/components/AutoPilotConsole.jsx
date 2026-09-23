import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Square, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function AutoPilotConsole({ onAutoPilotToggled }) {
  const [status, setStatus] = useState({
    is_running: false,
    interval_seconds: 300,
    total_actions: 0,
    simulation_mode: true,
    logs: [],
    escalations: []
  });
  const [isToggling, setIsToggling] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/autopilot/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load autopilot status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000); // Polling status every 4s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setIsToggling(true);
    const endpoint = status.is_running ? '/api/autopilot/stop' : '/api/autopilot/start';
    try {
      await fetch(endpoint, { method: 'POST' });
      await fetchStatus();
      if (onAutoPilotToggled) onAutoPilotToggled(!status.is_running);
    } catch (err) {
      console.error(err);
    }
    setIsToggling(false);
  };

  const handleTriggerPass = async () => {
    setIsTriggering(true);
    try {
      await fetch('/api/autopilot/trigger', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error(err);
    }
    setIsTriggering(false);
  };

  const handleResolveEscalation = async (escId) => {
    try {
      await fetch(`/api/escalations/${escId}/resolve`, { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-5 mb-8 relative overflow-hidden">
      
      {/* Top Banner: Master Switch & Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            status.is_running 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-emerald' 
              : 'bg-slate-900 text-slate-400 border border-slate-700'
          }`}>
            <Bot className={`w-6 h-6 ${status.is_running ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white m-0 tracking-tight">
                100% Autonomous Auto-Pilot Command Center
              </h2>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                status.is_running 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {status.is_running ? '🟢 RUNNING AUTONOMOUSLY' : '⚪ IDLE / CO-PILOT'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              AI automatically finds high-ticket deals, builds code, sanitizes deliverables & dispatches pitches. You only observe.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleTriggerPass}
            disabled={isTriggering}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            title="Execute 1 full discovery & dispatch cycle right now"
          >
            <Zap className={`w-3.5 h-3.5 text-cyan-400 ${isTriggering ? 'animate-spin' : ''}`} />
            <span>{isTriggering ? 'Executing Pass...' : 'Run Immediate Cycle'}</span>
          </button>

          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
              status.is_running
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-600/30 glow-emerald'
            }`}
          >
            {status.is_running ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pause Auto-Pilot</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start 100% Autonomous Mode</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Grid: Live Terminal & Human Escalation Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4 text-xs">
        
        {/* Terminal Logs (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-white">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Autonomous Event Log (Observer Stream)</span>
            </span>
            <span className="text-slate-400">{status.total_actions} Total Actions Handled</span>
          </div>

          <div className="h-44 overflow-y-auto rounded-xl bg-slate-950 p-3 border border-white/[0.04] font-mono text-[11px] space-y-1.5 select-text">
            {status.logs.length === 0 ? (
              <div className="text-slate-400 py-6 text-center">
                Auto-Pilot is ready. Click "Start 100% Autonomous Mode" to let AI begin scanning and dispatching.
              </div>
            ) : (
              status.logs.map((log) => {
                const isAction = log.level === 'action';
                const isSuccess = log.level === 'success';
                const isWarn = log.level === 'warning';
                return (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={`break-words ${
                      isAction ? 'text-cyan-300 font-bold' :
                      isSuccess ? 'text-emerald-300' :
                      isWarn ? 'text-amber-300' :
                      'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Human Escalation Queue (1 col) - ONLY DO THINGS YOU ARE UNABLE TO DO */}
        <div className="space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Human Escalations Desk</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                {status.escalations?.length || 0} Need You
              </span>
            </div>

            <div className="h-44 overflow-y-auto space-y-2">
              {(!status.escalations || status.escalations.length === 0) ? (
                <div className="h-full rounded-xl bg-slate-950/60 p-4 border border-white/[0.04] flex flex-col items-center justify-center text-center text-slate-400 gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-white font-bold text-xs">All Systems 100% Automated</span>
                  <span className="text-[10px] text-slate-400">Zero human intervention needed right now. Relax and observe!</span>
                </div>
              ) : (
                status.escalations.map((esc) => (
                  <div key={esc.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
                    <div className="font-bold text-xs text-white">{esc.title}</div>
                    <div className="text-[11px] text-slate-300 leading-snug">{esc.description}</div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-amber-300 font-semibold">{esc.action_required}</span>
                      <button
                        onClick={() => handleResolveEscalation(esc.id)}
                        className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Search, 
  Trash2, 
  DollarSign, 
  Building, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ChevronDown,
  Lock,
  Unlock
} from 'lucide-react';

export default function GmailOutreachHub({ onBackToRadar, onOpenAntiScam }) {
  const [outreaches, setOutreaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'sent', 'pending', 'approved', 'denied'
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'regular', 'safe'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutreach, setSelectedOutreach] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingReplies, setIsCheckingReplies] = useState(false);
  const [inboxCheckNotice, setInboxCheckNotice] = useState(null);

  const handleCheckReplies = async () => {
    setIsCheckingReplies(true);
    setInboxCheckNotice(null);
    try {
      const res = await fetch('/api/inbox/check-replies', { method: 'POST' });
      const data = await res.json();
      setIsCheckingReplies(false);
      if (data.success) {
        setInboxCheckNotice(data.message);
        fetchOutreaches();
      } else {
        setInboxCheckNotice(data.error || 'Failed to check inbox');
      }
      setTimeout(() => setInboxCheckNotice(null), 6000);
    } catch (err) {
      setIsCheckingReplies(false);
      setInboxCheckNotice(err.message);
      setTimeout(() => setInboxCheckNotice(null), 5000);
    }
  };

  const handleSimulateReply = async (status) => {
    try {
      const res = await fetch('/api/inbox/simulate-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setInboxCheckNotice(data.message);
        fetchOutreaches();
        setTimeout(() => setInboxCheckNotice(null), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOutreaches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/outreaches');
      const data = await res.json();
      setOutreaches(data.reverse()); // newest first
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch outreaches", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreaches();
  }, []);

  const handleUpdateStatus = async (outreachId, newStatus) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/outreach/${outreachId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOutreaches(prev => prev.map(item => 
          item.id === outreachId ? { ...item, outreach_status: newStatus } : item
        ));
        if (selectedOutreach && selectedOutreach.id === outreachId) {
          setSelectedOutreach(prev => ({ ...prev, outreach_status: newStatus }));
        }
      }
      setIsUpdating(false);
    } catch (err) {
      console.error("Failed to update status", err);
      setIsUpdating(false);
    }
  };

  const handleDelete = async (outreachId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Remove this outreach entry from tracker?")) return;
    try {
      const res = await fetch(`/api/outreach/${outreachId}`, { method: 'DELETE' });
      if (res.ok) {
        setOutreaches(prev => prev.filter(o => o.id !== outreachId));
        if (selectedOutreach?.id === outreachId) {
          setSelectedOutreach(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete outreach", err);
    }
  };

  const handleOpenInGmail = (outreach, e) => {
    if (e) e.stopPropagation();
    const to = encodeURIComponent(outreach.to_email || '');
    const su = encodeURIComponent(`Re: ${outreach.subject || 'Freelance Solution'}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}`;
    window.open(gmailUrl, '_blank');
  };

  const handleCopy = (text, id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper: check if email was dispatched in Safe Simulation Mode
  const isSafeMode = (item) => {
    if (!item) return false;
    const m = (item.mode || '').toLowerCase();
    const s = (item.status || '').toLowerCase();
    return m.includes('simulat') || s.includes('simulat') || s.includes('safe');
  };

  // Counts
  const totalCount = outreaches.length;
  const regularCount = outreaches.filter(o => !isSafeMode(o)).length;
  const safeCount = outreaches.filter(o => isSafeMode(o)).length;

  const sentCount = outreaches.filter(o => (o.outreach_status || 'sent') === 'sent').length;
  const pendingCount = outreaches.filter(o => o.outreach_status === 'pending').length;
  const approvedCount = outreaches.filter(o => o.outreach_status === 'approved').length;
  const deniedCount = outreaches.filter(o => o.outreach_status === 'denied').length;

  const wonRevenue = outreaches
    .filter(o => o.outreach_status === 'approved')
    .reduce((acc, o) => acc + (parseFloat(o.budget) || 0), 0);

  // Filter & Search
  const filtered = outreaches.filter(o => {
    const status = o.outreach_status || 'sent';
    if (filterStatus !== 'all' && status !== filterStatus) {
      return false;
    }
    const safe = isSafeMode(o);
    if (filterMode === 'regular' && safe) return false;
    if (filterMode === 'safe' && !safe) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = o.to_email?.toLowerCase().includes(q);
      const matchSubject = o.subject?.toLowerCase().includes(q);
      const matchCompany = o.company?.toLowerCase().includes(q);
      const matchTitle = o.job_title?.toLowerCase().includes(q);
      if (!matchEmail && !matchSubject && !matchCompany && !matchTitle) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Approved / Won
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            Pending Reply
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            Denied / Passed
          </span>
        );
      default: // sent
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Send className="w-3 h-3 text-sky-400" />
            Sent
          </span>
        );
    }
  };

  const getModeBadge = (item) => {
    if (isSafeMode(item)) {
      return (
        <span 
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
          title="Safe Simulation Mode: Safely logged locally without emailing real client"
        >
          <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Safe Mode (Simulated)</span>
        </span>
      );
    }
    if ((item.mode || '').toLowerCase().includes('smtp')) {
      return (
        <span 
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm"
          title="Regular Dispatch: Sent live to real client via SMTP"
        >
          <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Regular (Live SMTP)</span>
        </span>
      );
    }
    // Gmail 1-Click Web
    return (
      <span 
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm"
        title="Regular Dispatch: Sent live via personal Gmail Composer"
      >
        <Mail className="w-3 h-3 text-red-400 shrink-0" />
        <span>Regular (Gmail 1-Click)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner / CRM Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold mb-2.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gmail Outreach CRM & Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Gmail Outreach Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Live tracking for client pitches dispatched from <strong className="text-cyan-400">cursuv1@gmail.com</strong>. View which emails were sent <strong>Regularly</strong> vs in <strong>Safe Simulation Mode</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* Auto-Detect Client Replies */}
            <button
              onClick={handleCheckReplies}
              disabled={isCheckingReplies}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="Automatically scan Gmail inbox via IMAP to detect client approvals and rejections"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isCheckingReplies ? 'animate-spin' : ''}`} />
              <span>{isCheckingReplies ? 'Checking Inbox...' : 'Check Gmail Replies (Auto-Detect)'}</span>
            </button>

            {/* Test Simulation Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
              <span className="text-slate-400 px-1 font-semibold">Test:</span>
              <button
                onClick={() => handleSimulateReply('approved')}
                className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30 cursor-pointer"
                title="Test how AutoHunter automatically marks deal Approved/Won when client says yes"
              >
                Simulate Yes (Approved)
              </button>
              <button
                onClick={() => handleSimulateReply('denied')}
                className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold border border-rose-500/30 cursor-pointer"
                title="Test how AutoHunter automatically marks deal Denied when position is closed"
              >
                Simulate No (Denied)
              </button>
            </div>

            <button
              onClick={() => window.open('https://mail.google.com/mail/u/0/#inbox', '_blank')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white transition-all cursor-pointer shadow-md"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Gmail</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            <button
              onClick={fetchOutreaches}
              className="p-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Refresh Outreach Log"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Inbox Check Alert Notification */}
        {inboxCheckNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{inboxCheckNotice}</span>
            </div>
            <button
              onClick={() => setInboxCheckNotice(null)}
              className="text-cyan-400 hover:text-white text-[11px] font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Educational Explainer: What is Trial Proof & Release Code */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-2">
                <span>Anti-Scam Protection: What is "Trial Proof" and "Release Code"?</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  Student Safety
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed max-w-3xl">
                • <strong className="text-amber-300">🧪 Trial Proof</strong>: When work is finished, send 5-10 sample rows or a test output preview. It proves your code works 100% without giving away the raw code.<br />
                • <strong className="text-emerald-300">💰 Release Code</strong>: Once the client sends payment to your PayPal / UPI / Bank, click Release Code to deliver the complete unlocked code package with execution scripts and a 30-day warranty.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAntiScam && onOpenAntiScam({ initialTab: 'stage1' })}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs shrink-0 cursor-pointer transition-all"
          >
            Open Escrow Shield
          </button>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-white/[0.08]">
          
          {/* Total Dispatched */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
              <span>Total Pitches</span>
              <Mail className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{totalCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">All logged</div>
          </div>

          {/* Regular / Real Gmails */}
          <div 
            onClick={() => setFilterMode(filterMode === 'regular' ? 'all' : 'regular')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterMode === 'regular' 
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10' 
                : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850'
            }`}
          >
            <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-between mb-1">
              <span>Regular / Real</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">{regularCount}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5 font-semibold">Live client inboxes</div>
          </div>

          {/* Safe Mode Tests */}
          <div 
            onClick={() => setFilterMode(filterMode === 'safe' ? 'all' : 'safe')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterMode === 'safe' 
                ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10' 
                : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850'
            }`}
          >
            <div className="text-[11px] font-medium text-amber-400 flex items-center justify-between mb-1">
              <span>Safe Mode Tests</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">{safeCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5 font-semibold">Simulated locally</div>
          </div>

          {/* Pending Replies */}
          <div 
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'pending' 
                ? 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-500/10' 
                : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850'
            }`}
          >
            <div className="text-[11px] font-medium text-sky-400 flex items-center justify-between mb-1">
              <span>Pending Replies</span>
              <Clock className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-300">{pendingCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting reply</div>
          </div>

          {/* Approved / Won */}
          <div 
            onClick={() => setFilterStatus(filterStatus === 'approved' ? 'all' : 'approved')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              filterStatus === 'approved' 
                ? 'bg-teal-500/10 border-teal-500/50 shadow-md shadow-teal-500/10' 
                : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850'
            }`}
          >
            <div className="text-[11px] font-medium text-teal-400 flex items-center justify-between mb-1">
              <span>Approved Deals</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300">{approvedCount}</div>
            <div className="text-[10px] text-teal-400/90 font-bold mt-0.5">
              {wonRevenue > 0 ? `+$${wonRevenue.toLocaleString()} won` : 'Ready to close'}
            </div>
          </div>

        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl glass-panel border border-white/[0.08]">
        
        {/* Row 1: Pipeline Status Tabs & Mode Switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Status:
            </span>
            {[
              { id: 'all', label: 'All', count: totalCount },
              { id: 'sent', label: 'Sent', count: sentCount, color: 'text-sky-400' },
              { id: 'pending', label: 'Pending', count: pendingCount, color: 'text-amber-400' },
              { id: 'approved', label: 'Approved', count: approvedCount, color: 'text-emerald-400' },
              { id: 'denied', label: 'Denied', count: deniedCount, color: 'text-rose-400' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? 'bg-cyan-500/20 text-white border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 ${tab.color || 'text-slate-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Delivery Mode Filter: All vs Regular vs Safe Mode */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Send Mode:
            </span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Modes ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode('regular')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                filterMode === 'regular'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Regular / Real ({regularCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('safe')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                filterMode === 'safe'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Safe Mode ({safeCount})</span>
            </button>
          </div>

        </div>

        {/* Row 2: Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client email, company, gig title, or subject..."
            className="w-full pl-10 pr-8 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Main Outreach List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-semibold">Loading Gmail outreach records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl p-8 border border-white/[0.06] space-y-4">
          <Mail className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              No Matching Pitches Found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {filterMode === 'regular'
                ? 'No regular / real client emails found. Try opening a job pitch with "Open in Gmail (1-Click)" to dispatch a real email.'
                : filterMode === 'safe'
                ? 'No safe mode simulation records found.'
                : 'Try resetting your status or mode filters.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setFilterStatus('all'); setFilterMode('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onBackToRadar}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Browse Radar Jobs & Pitch
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const currentStatus = item.outreach_status || 'sent';
            const safe = isSafeMode(item);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedOutreach(item)}
                className={`p-4 sm:p-5 rounded-2xl glass-panel border transition-all shadow-lg cursor-pointer group ${
                  safe 
                    ? 'border-amber-500/20 bg-slate-900/70 hover:border-amber-500/40 hover:bg-slate-900/90' 
                    : 'border-emerald-500/20 bg-slate-900/70 hover:border-emerald-500/40 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  
                  {/* Left Column: Email, Mode Badge, Company, Subject */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        {item.to_email}
                      </span>

                      {/* Prominent Mode Badge: Regular vs Safe Mode */}
                      {getModeBadge(item)}

                      {item.company && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-300 font-medium border border-slate-700">
                          <Building className="w-3 h-3 text-slate-400" />
                          {item.company}
                        </span>
                      )}

                      {item.budget > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          <DollarSign className="w-3 h-3 text-teal-400" />
                          ${item.budget} USD
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp ? new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-cyan-300 truncate">
                      {item.subject || '(No Subject)'}
                    </div>

                    {item.job_title && (
                      <div className="text-[11px] text-slate-400 truncate">
                        Gig: {item.job_title}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status Switcher & Quick Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    
                    {/* Status Dropdown Pill */}
                    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className={`text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-all ${
                          currentStatus === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : currentStatus === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : currentStatus === 'denied'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        }`}
                      >
                        <option value="sent" className="bg-slate-900 text-sky-300 font-bold">Sent</option>
                        <option value="pending" className="bg-slate-900 text-amber-300 font-bold">Pending Reply</option>
                        <option value="approved" className="bg-slate-900 text-emerald-300 font-bold">Approved / Won</option>
                        <option value="denied" className="bg-slate-900 text-rose-300 font-bold">Denied / Passed</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                    </div>

                    {/* Follow up in Gmail */}
                    <button
                      onClick={(e) => handleOpenInGmail(item, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      title="Open in Gmail to send follow-up"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                      <span>Gmail</span>
                    </button>

                    {/* Stage 1: Send Trial Proof */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenAntiScam) {
                          onOpenAntiScam({
                            initialData: {
                              id: item.id,
                              outreach_id: item.id,
                              job_id: item.job_id,
                              client_email: item.to_email,
                              job_title: item.job_title || item.subject,
                              company: item.company || 'Client',
                              budget: item.budget || 0
                            },
                            initialTab: 'stage1'
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      title="Send Stage 1: Trial Demo Proof (Withholds full code until payment)"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Trial Proof</span>
                    </button>

                    {/* Stage 2: Release Code (Paid) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenAntiScam) {
                          onOpenAntiScam({
                            initialData: {
                              id: item.id,
                              outreach_id: item.id,
                              job_id: item.job_id,
                              client_email: item.to_email,
                              job_title: item.job_title || item.subject,
                              company: item.company || 'Client',
                              budget: item.budget || 0
                            },
                            initialTab: 'stage2'
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      title="Stage 2: Payment Received -> Release Full Production Access"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Release Code</span>
                    </button>

                    {/* View Details / Pitch */}
                    <button
                      onClick={() => setSelectedOutreach(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                    >
                      View Pitch
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: View Full Pitch & Client Details */}
      {selectedOutreach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Outreach Details & Pitch</h3>
                  <p className="text-xs text-slate-400">
                    Dispatched from cursuv1@gmail.com
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOutreach(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Highlight Banner: Safe Mode vs Regular Send */}
              {isSafeMode(selectedOutreach) ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Sent in Safe Simulation Mode</span>
                    <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                      This pitch was logged safely as a simulation for testing. No real email was sent to the client. To send real emails, use <strong>Open in Gmail (1-Click)</strong> or disable Safe Mode in Settings.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
                  <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300">Regular / Real Email Sent</span>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                      This pitch was dispatched live to the client's actual email address (<strong className="text-white">{selectedOutreach.to_email}</strong>) from your email account.
                    </p>
                  </div>
                </div>
              )}

              {/* Meta Grid */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-bold text-white text-xs">{selectedOutreach.to_email}</span>
                </div>
                {selectedOutreach.company && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="text-slate-200 font-semibold">{selectedOutreach.company}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Dispatch Type:</span>
                  <div>{getModeBadge(selectedOutreach)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-bold text-cyan-300">{selectedOutreach.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Outreach Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedOutreach.outreach_status || 'sent')}
                    <select
                      value={selectedOutreach.outreach_status || 'sent'}
                      onChange={(e) => handleUpdateStatus(selectedOutreach.id, e.target.value)}
                      className="bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] font-bold"
                    >
                      <option value="sent">Sent</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Date Logged:</span>
                  <span className="text-slate-400">
                    {selectedOutreach.timestamp ? new Date(selectedOutreach.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Pitch Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-300">Email Pitch Message:</span>
                  <button
                    onClick={(e) => handleCopy(selectedOutreach.body, selectedOutreach.id, e)}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    {copiedId === selectedOutreach.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === selectedOutreach.id ? 'Copied!' : 'Copy Pitch'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {selectedOutreach.body}
                </pre>
              </div>

            </div>

            {/* Footer / Escrow Handover Actions */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Stage 1 Trial Proof */}
                <button
                  onClick={() => {
                    const o = selectedOutreach;
                    setSelectedOutreach(null);
                    if (onOpenAntiScam) {
                      onOpenAntiScam({
                        initialData: {
                          id: o.id,
                          outreach_id: o.id,
                          job_id: o.job_id,
                          client_email: o.to_email,
                          job_title: o.job_title || o.subject,
                          company: o.company || 'Client',
                          budget: o.budget || 0
                        },
                        initialTab: 'stage1'
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  title="Generate Trial Proof Email (Withhold Full Code)"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Send Trial Proof</span>
                </button>

                {/* Stage 2 Release Code */}
                <button
                  onClick={() => {
                    const o = selectedOutreach;
                    setSelectedOutreach(null);
                    if (onOpenAntiScam) {
                      onOpenAntiScam({
                        initialData: {
                          id: o.id,
                          outreach_id: o.id,
                          job_id: o.job_id,
                          client_email: o.to_email,
                          job_title: o.job_title || o.subject,
                          company: o.company || 'Client',
                          budget: o.budget || 0
                        },
                        initialTab: 'stage2'
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                  title="Payment Received: Handover Unlocked Source Code"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Payment Received (Release Code)</span>
                </button>

                {/* Scan Client Message */}
                <button
                  onClick={() => {
                    const o = selectedOutreach;
                    setSelectedOutreach(null);
                    if (onOpenAntiScam) {
                      onOpenAntiScam({
                        initialData: {
                          id: o.id,
                          outreach_id: o.id,
                          job_id: o.job_id,
                          client_email: o.to_email,
                          job_title: o.job_title || o.subject,
                          company: o.company || 'Client',
                          budget: o.budget || 0
                        },
                        initialTab: 'scan'
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer px-2 py-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Scan Reply</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleOpenInGmail(selectedOutreach, e)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Gmail</span>
                </button>
                <button
                  onClick={() => setSelectedOutreach(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

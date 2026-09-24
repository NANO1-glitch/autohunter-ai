import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsBar from './components/MetricsBar';
import FilterBar from './components/FilterBar';
import JobCard from './components/JobCard';
import PlaybookModal from './components/PlaybookModal';
import OutreachModal from './components/OutreachModal';
import ManualJobModal from './components/ManualJobModal';
import SettingsModal from './components/SettingsModal';
import OutboxModal from './components/OutboxModal';
import DeliverableModal from './components/DeliverableModal';
import AutoPilotConsole from './components/AutoPilotConsole';
import AntiScamModal from './components/AntiScamModal';
import GmailOutreachHub from './components/GmailOutreachHub';
import JobDetailsModal from './components/JobDetailsModal';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2, Flame, Bot, Palette, FileSpreadsheet, Code2 } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);

  // Active view tab: 'radar' (Job Feed) or 'outreach' (Gmail Outreach CRM)
  const [activeTab, setActiveTab] = useState('radar');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [minBudget, setMinBudget] = useState(0);
  const [noResumeOnly, setNoResumeOnly] = useState(false);
  const [hideDone, setHideDone] = useState(true);

  // Active Modals
  const [activeDetailsJob, setActiveDetailsJob] = useState(null);
  const [activePlaybookJob, setActivePlaybookJob] = useState(null);
  const [activeOutreachJob, setActiveOutreachJob] = useState(null);
  const [activeDeliverableJob, setActiveDeliverableJob] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isOutboxModalOpen, setIsOutboxModalOpen] = useState(false);
  const [isAntiScamOpen, setIsAntiScamOpen] = useState(false);
  const [antiScamConfig, setAntiScamConfig] = useState(null);

  const handleOpenAntiScam = (config = null) => {
    setAntiScamConfig(config);
    setIsAntiScamOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [jobsRes, statsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/stats')
      ]);
      const jobsData = await jobsRes.json();
      const statsData = await statsRes.json();
      setJobs(jobsData);
      setStats(statsData);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 2-Hour Auto-Refresh polling and countdown timer
    const fetchScheduler = async () => {
      try {
        const res = await fetch('/api/scheduler/status');
        const data = await res.json();
        setSchedulerStatus(data);
      } catch (e) {
        console.error("Scheduler fetch error", e);
      }
    };

    fetchScheduler();
    const serverSyncInterval = setInterval(fetchScheduler, 15000);

    // Local 1-second countdown ticker for smooth UI
    const ticker = setInterval(() => {
      setSchedulerStatus(prev => {
        if (!prev || typeof prev.seconds_remaining !== 'number') return prev;
        const newSecs = Math.max(0, prev.seconds_remaining - 1);
        const hours = Math.floor(newSecs / 3600);
        const minutes = Math.floor((newSecs % 3600) / 60);
        const secs = newSecs % 60;
        const formatted = hours > 0 
          ? `${hours}h ${minutes.toString().padStart(2, '0')}m` 
          : `${minutes}m ${secs.toString().padStart(2, '0')}s`;
        
        // When timer hits 0, trigger refresh
        if (newSecs === 0 && prev.seconds_remaining > 0) {
          fetchData();
          showToast("2-Hour Auto-Refresh: Discovering fresh gigs worldwide...");
        }

        return {
          ...prev,
          seconds_remaining: newSecs,
          formatted_remaining: formatted
        };
      });
    }, 1000);

    return () => {
      clearInterval(serverSyncInterval);
      clearInterval(ticker);
    };
  }, []);

  // Trigger sync from online feeds
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/jobs/sync', { method: 'POST' });
      const data = await res.json();
      await fetchData();
      if (data.scheduler) {
        setSchedulerStatus(data.scheduler);
      }
      showToast(`Global feeds scanned! ${data.added_or_updated} opportunities synced. Timer reset to 2 hours.`);
    } catch (err) {
      console.error("Sync error", err);
    }
    setIsRefreshing(false);
  };

  const closedStatuses = ['contacted', 'won', 'done', 'completed', 'closed', 'rejected', 'passed'];
  const doneCount = jobs.filter(j => closedStatuses.includes(j.status)).length;

  const handleDismissJob = async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        showToast("Gig permanently removed.");
      }
    } catch (err) {
      console.error("Failed to dismiss job", err);
    }
  };

  const handlePurgeClosed = async () => {
    if (!window.confirm("Permanently remove all completed, contacted, and closed gigs from the database?")) return;
    try {
      const res = await fetch('/api/jobs/purge-closed', { method: 'POST' });
      const data = await res.json();
      await fetchData();
      showToast(`Purged ${data.removed_count} completed/closed gigs from database!`);
    } catch (err) {
      console.error("Failed to purge closed jobs", err);
    }
  };

  // Filter jobs locally or via API
  const filteredJobs = jobs.filter(job => {
    // Hide completed, contacted, or closed gigs if hideDone is enabled
    if (hideDone && closedStatuses.includes(job.status)) {
      return false;
    }
    if (selectedCategory !== 'All' && job.category !== selectedCategory) {
      return false;
    }
    if (selectedSource !== 'All' && !job.source?.toLowerCase().includes(selectedSource.toLowerCase())) {
      return false;
    }
    if (selectedDifficulty !== 'All' && job.difficulty !== selectedDifficulty) {
      return false;
    }
    if (minBudget > 0 && (job.budget || 0) < minBudget) {
      return false;
    }
    if (noResumeOnly && job.requires_resume === true) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchDesc = job.description?.toLowerCase().includes(q);
      const matchCompany = job.company?.toLowerCase().includes(q);
      const matchSkills = job.skills?.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCompany && !matchSkills) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative bg-grid-pattern selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 ambient-glow-1 pointer-events-none" />
      <div className="absolute inset-0 ambient-glow-2 pointer-events-none" />
      <div className="absolute inset-0 ambient-glow-3 pointer-events-none" />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        schedulerStatus={schedulerStatus}
        onOpenManual={() => setIsManualModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenOutbox={() => setActiveTab('outreach')}
        onOpenAntiScam={() => handleOpenAntiScam()}
        outboxCount={stats?.outreaches_sent || 0}
        totalJobs={jobs.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="p-3.5 px-4 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-xs font-semibold text-white shadow-2xl flex items-center gap-2.5 glow-cyan">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {activeTab === 'outreach' ? (
          <GmailOutreachHub
            onBackToRadar={() => setActiveTab('radar')}
            onOpenAntiScam={handleOpenAntiScam}
          />
        ) : (
          <>
            {/* Hero Section */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI-Powered Autonomous Deal Aggregation & Outreach</span>
              </div>
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold shadow-sm"
                title="Continuous 2-hour feed polling active"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Auto-Refresh: Every 2 Hours • Next: {schedulerStatus?.formatted_remaining || '2h 00m'}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight m-0 mb-3">
              Sell High-Ticket Freelance Deals <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                100% Automated & Delivered with AI
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
              Live gigs curated worldwide from Discord channels, LinkedIn, and remote boards. Every opportunity is pre-scored for <strong>turnaround time, difficulty rating, and profit margins</strong>. Use the <strong>Student Guide</strong> for step-by-step fulfillment and 1-Click Cold Pitch to send humanized proposals that pass AI detectors.
            </p>

            {/* Quick Category Jump Buttons */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => { setSelectedCategory('Web Scraping & Data Extraction'); setMinBudget(0); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/[0.06] hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Web Scraping</span>
              </button>

              <button
                onClick={() => { setSelectedCategory('Automation & Python Scripts'); setMinBudget(0); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/[0.06] hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Python Automations</span>
              </button>

              <button
                onClick={() => { setSelectedCategory('Data Entry & Excel Automations'); setMinBudget(0); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/[0.06] hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                <span>Excel & Data Entry</span>
              </button>

              <button
                onClick={() => { setSelectedCategory('Logo & Brand Design'); setMinBudget(0); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/[0.06] hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Logo & Branding</span>
              </button>

              <button
                onClick={() => { setMinBudget(1000); setSelectedCategory('All'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all cursor-pointer font-bold"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>High-Ticket Only ($1K+)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Executive KPI Stats */}
        <MetricsBar stats={stats} />

        {/* 100% Autonomous Auto-Pilot Observer Console */}
        <AutoPilotConsole
          onAutoPilotToggled={(running) => {
            showToast(running ? "100% Autonomous Mode Activated!" : "Auto-Pilot Paused.");
            fetchData();
          }}
        />

        {/* Filter Controls */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          minBudget={minBudget}
          setMinBudget={setMinBudget}
          noResumeOnly={noResumeOnly}
          setNoResumeOnly={setNoResumeOnly}
          hideDone={hideDone}
          setHideDone={setHideDone}
          onPurgeClosed={handlePurgeClosed}
          doneCount={doneCount}
          totalMatching={filteredJobs.length}
        />

        {/* Jobs Feed Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm font-semibold">Scanning global channels and scoring feasibility...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl p-8 border border-white/[0.06]">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No matching opportunities found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              {hideDone && doneCount > 0 
                ? `You have hidden ${doneCount} gigs that were completed, pitched, or closed. Toggle "Showing All" or reset filters to see them.`
                : 'Try adjusting your category filter, lowering the minimum budget, or click "Sync Feeds" to fetch fresh listings.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSource('All');
                setSelectedDifficulty('All');
                setMinBudget(0);
                setSearch('');
                setHideDone(false);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onOpenDetails={(j) => setActiveDetailsJob(j)}
                onOpenPlaybook={(j) => setActivePlaybookJob(j)}
                onOpenOutreach={(j) => setActiveOutreachJob(j)}
                onOpenDeliverable={(j) => setActiveDeliverableJob(j)}
                onDismissJob={handleDismissJob}
              />
            ))}
          </div>
        )}
          </>
        )}

      </main>

      {/* Modals & Drawers */}
      {activeDetailsJob && (
        <JobDetailsModal
          job={activeDetailsJob}
          onClose={() => setActiveDetailsJob(null)}
          onOpenOutreach={(j) => setActiveOutreachJob(j)}
          onOpenPlaybook={(j) => setActivePlaybookJob(j)}
          onOpenDeliverable={(j) => setActiveDeliverableJob(j)}
        />
      )}

      {activeDeliverableJob && (
        <DeliverableModal
          job={activeDeliverableJob}
          onClose={() => setActiveDeliverableJob(null)}
        />
      )}

      {activePlaybookJob && (
        <PlaybookModal
          job={activePlaybookJob}
          onClose={() => setActivePlaybookJob(null)}
          onLaunchPitch={(j) => setActiveOutreachJob(j)}
        />
      )}

      {activeOutreachJob && (
        <OutreachModal
          job={activeOutreachJob}
          onClose={() => setActiveOutreachJob(null)}
          onSentSuccess={() => {
            fetchData();
            showToast("Cold pitch approved and queued for dispatch!");
          }}
        />
      )}

      {isManualModalOpen && (
        <ManualJobModal
          onClose={() => setIsManualModalOpen(false)}
          onJobAdded={() => {
            fetchData();
            showToast("New opportunity analyzed and added to live feed!");
          }}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onSettingsUpdated={() => {
            fetchData();
            showToast("Settings and credentials successfully saved!");
          }}
        />
      )}

      {isOutboxModalOpen && (
        <OutboxModal
          onClose={() => setIsOutboxModalOpen(false)}
        />
      )}

      {isAntiScamOpen && (
        <AntiScamModal
          initialData={antiScamConfig?.initialData || null}
          initialTab={antiScamConfig?.initialTab || 'scan'}
          onDealApproved={() => {
            fetchData();
            showToast("Deal recorded as Won & Approved! Full access email ready.");
          }}
          onClose={() => {
            setIsAntiScamOpen(false);
            setAntiScamConfig(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-400 relative z-10 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">AutoHunter.AI</span>
            <span className="text-slate-600">•</span>
            <span>High-Ticket Autonomous Freelancing Platform</span>
          </div>
          <div>Built for Students & Freelance Automation Founders</div>
        </div>
      </footer>

    </div>
  );
}

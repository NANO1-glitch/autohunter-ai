import React from 'react';
import { Search, Filter, Layers, Globe, ShieldAlert, DollarSign, Trash2 } from 'lucide-react';

const CATEGORIES = [
  "All",
  "Video Captions & Subtitles",
  "Language Translation & Localization",
  "Automation & Python Scripts",
  "Web Scraping & Data Extraction",
  "AI Chatbots & Workflows",
  "Logo & Brand Design",
  "Data Entry & Excel Automations",
  "Web & Landing Page Dev",
  "Copywriting & Translation"
];

const SOURCES = [
  "All",
  "Discord #freelance-jobs",
  "Discord #design-bounties",
  "Discord #gigs",
  "LinkedIn Jobs",
  "RemoteOK",
  "HackerNews Freelance",
  "WeWorkRemotely"
];

const DIFFICULTIES = ["All", "Very Easy", "Easy", "Moderate"];

export default function FilterBar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedSource,
  setSelectedSource,
  selectedDifficulty,
  setSelectedDifficulty,
  minBudget,
  setMinBudget,
  noResumeOnly,
  setNoResumeOnly,
  hideDone,
  setHideDone,
  onPurgeClosed,
  doneCount = 0,
  totalMatching
}) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800/80 mb-6 space-y-3">
      
      {/* Top Search & Source row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, company, tools (e.g. Playwright, Excel, Logo, WhatsApp, Stripe)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Filters Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* No Resume / Direct Deal Toggle */}
          <button
            type="button"
            onClick={() => setNoResumeOnly(!noResumeOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              noResumeOnly
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald'
                : 'bg-slate-900 text-slate-400 border border-slate-700/80 hover:text-white'
            }`}
            title="Filter only direct client emails with zero resume requirements or bidding wars"
          >
            <span>⚡ No Resume / Direct Pitch</span>
          </button>

          {/* Hide Done / Contacted Gigs Toggle */}
          <button
            type="button"
            onClick={() => setHideDone(!hideDone)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              hideDone
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-700/80 hover:text-white'
            }`}
            title="Hide gigs you've already pitched/completed or that are closed"
          >
            <span>{hideDone ? '🔒 Hiding Done/Pitched' : '👁️ Showing All'}</span>
          </button>

          {/* Purge Closed Gigs Button */}
          {doneCount > 0 && (
            <button
              type="button"
              onClick={onPurgeClosed}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Permanently remove all completed, contacted, and closed gigs from the database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Purge Done ({doneCount})</span>
            </button>
          )}

          {/* Source Dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Sources</option>
            <option value="Discord">Discord Channels</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="RemoteOK">RemoteOK</option>
            <option value="HackerNews">HackerNews</option>
            <option value="Remotive">Remotive</option>
            <option value="Jobicy">Jobicy</option>
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Very Easy">🟢 Very Easy (&lt;30m AI)</option>
            <option value="Easy">🟡 Easy (30-60m AI)</option>
            <option value="Moderate">🟠 Moderate (1-2h AI)</option>
          </select>

          {/* Min Budget Filter */}
          <select
            value={minBudget}
            onChange={(e) => setMinBudget(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="0">Any Budget</option>
            <option value="400">Min $400</option>
            <option value="800">Min $800 (High-Ticket)</option>
            <option value="1200">Min $1,200 (Premium)</option>
            <option value="2000">Min $2,000 (Enterprise)</option>
          </select>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-400" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs text-slate-400">
        <span>Showing <strong className="text-white font-semibold">{totalMatching}</strong> qualified freelancing & automation gigs</span>
        <span className="text-emerald-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          All jobs 100% fulfillable with AI
        </span>
      </div>

    </div>
  );
}

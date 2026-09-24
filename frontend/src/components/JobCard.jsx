import React from 'react';
import { 
  DollarSign, 
  Clock, 
  Zap, 
  ExternalLink, 
  Send, 
  BookOpen, 
  Sparkles,
  Layers,
  ArrowUpRight,
  PackageCheck,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';

export default function JobCard({ job, onOpenPlaybook, onOpenOutreach, onOpenDeliverable, onDismissJob, onOpenDetails }) {
  const isHighTicket = job.budget >= 1000;

  // Source badge styling
  const getSourceBadge = (source = "") => {
    const s = source.toLowerCase();
    if (s.includes("discord")) {
      return { 
        bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30", 
        dot: "bg-indigo-400",
        label: source 
      };
    }
    if (s.includes("linkedin")) {
      return { 
        bg: "bg-sky-500/10 text-sky-300 border-sky-500/30", 
        dot: "bg-sky-400",
        label: source 
      };
    }
    if (s.includes("hackernews")) {
      return { 
        bg: "bg-amber-500/10 text-amber-300 border-amber-500/30", 
        dot: "bg-amber-400",
        label: "HackerNews" 
      };
    }
    if (s.includes("remoteok")) {
      return { 
        bg: "bg-rose-500/10 text-rose-300 border-rose-500/30", 
        dot: "bg-rose-400",
        label: "RemoteOK" 
      };
    }
    return { 
      bg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30", 
      dot: "bg-cyan-400",
      label: source || "Remote" 
    };
  };

  const sourceBadge = getSourceBadge(job.source);

  // Difficulty badge
  const getDifficultyBadge = (diff = "") => {
    const d = diff.toLowerCase();
    if (d.includes("very easy")) {
      return { 
        badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", 
        dot: "bg-emerald-400" 
      };
    }
    if (d.includes("easy")) {
      return { 
        badge: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30", 
        dot: "bg-cyan-400" 
      };
    }
    return { 
      badge: "text-amber-300 bg-amber-500/10 border-amber-500/30", 
      dot: "bg-amber-400" 
    };
  };

  const diffBadge = getDifficultyBadge(job.difficulty);

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/[0.07] flex flex-col justify-between relative group">
      
      {/* Top Bar: Source & Budget */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${sourceBadge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sourceBadge.dot}`}></span>
              {sourceBadge.label}
            </span>
            {job.country_badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {job.country_badge}
              </span>
            )}
            {isHighTicket && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                High Ticket
              </span>
            )}
          </div>

          {/* Budget & Dismiss Button */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xl font-black text-emerald-400 flex items-center justify-end tracking-tight">
                ${Number(job.budget).toLocaleString()}
              </div>
              {job.effective_hourly_rate && (
                <div className="text-[10px] text-slate-400 font-semibold">
                  ~${job.effective_hourly_rate}/hr
                </div>
              )}
            </div>

            {/* Remove / Closed Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDismissJob) onDismissJob(job.id);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer opacity-40 group-hover:opacity-100"
              title="Remove gig (Completed by you or closed by client)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category, Status & Application Type Tag */}
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md inline-block">
            {job.category}
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md inline-block">
            {job.application_type || "⚡ Direct Deal (No Resume)"}
          </span>
          {job.has_direct_email ? (
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              ✉️ Direct Email
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              🌐 Official Portal
            </span>
          )}
          {job.status === 'contacted' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-sky-400" />
              Pitched / In Progress
            </span>
          )}
          {job.status === 'won' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              Won Deal
            </span>
          )}
        </div>

        {/* Job Title */}
        <h3 
          onClick={() => onOpenDetails && onOpenDetails(job)}
          className="font-extrabold text-[15px] leading-snug text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1.5 cursor-pointer hover:underline"
          title="Click to view full job requirements and details"
        >
          {job.title}
        </h3>

        {/* Company & Location */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3.5">
          <span className="font-semibold text-slate-300">{job.company || "Client"}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{job.location || "Remote (Worldwide)"}</span>
        </div>

        {/* Description snippet */}
        <div 
          onClick={() => onOpenDetails && onOpenDetails(job)}
          className="text-xs text-slate-300 mb-4 leading-relaxed bg-slate-950/70 hover:bg-slate-950 p-3 rounded-xl border border-white/[0.04] hover:border-cyan-500/30 transition-all cursor-pointer group/desc relative"
          title="Click to read full client requirements"
        >
          <p className="line-clamp-3">
            {job.description ? job.description.replace(/<[^>]*>?/gm, '') : ""}
          </p>
          <div className="text-[10px] text-cyan-400 font-bold mt-1.5 flex items-center gap-1 opacity-80 group-hover/desc:opacity-100">
            <span>Read full requirements</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Student Stats Metric Box */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          
          {/* Difficulty & Dev Time */}
          <div className={`p-2.5 rounded-xl border ${diffBadge.badge} flex flex-col justify-center`}>
            <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 opacity-80">
              <span className={`w-1.5 h-1.5 rounded-full ${diffBadge.dot}`}></span>
              Difficulty
            </div>
            <div className="font-bold text-xs mt-0.5 text-white">
              {job.difficulty || "Easy"}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              AI Dev: {job.ai_dev_time || "30 mins"}
            </div>
          </div>

          {/* Turnaround & Delivery */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              Deadline
            </div>
            <div className="font-bold text-xs mt-0.5 text-white">
              {job.turnaround_time || "2-3 days"}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
              {job.feasibility_score}% AI Feasible
            </div>
          </div>

        </div>

        {/* Skills Tag row */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-white/[0.05] font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/[0.07] flex items-center gap-2">
        
        {/* Playbook Button */}
        <button
          onClick={() => onOpenPlaybook(job)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
          title="See step-by-step how to fulfill and sell this"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Student Guide</span>
        </button>

        {/* 1-Click Cold Approach, Bidding Proposal, or Official Portal */}
        {job.has_direct_email ? (
          <button
            onClick={() => onOpenOutreach(job)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-md shadow-cyan-600/25 transition-all cursor-pointer hover:shadow-cyan-500/40"
            title="Approve & Send Humanized Cold Pitch via Gmail"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Cold Pitch</span>
          </button>
        ) : (job.is_bidding_gig || job.marketplace_category === 'bidding_and_resumes') ? (
          <button
            onClick={() => onOpenOutreach(job)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-extrabold shadow-md shadow-purple-600/25 transition-all cursor-pointer hover:shadow-purple-500/40"
            title="Generate custom bid proposal & open freelance portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Submit Bid</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenOutreach(job)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/25 transition-all cursor-pointer hover:shadow-indigo-500/40"
            title="Open tailored cover letter & 1-click portal link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Apply Portal</span>
          </button>
        )}

        {/* AI Build & Package Deliverable */}
        <button
          onClick={() => onOpenDeliverable(job)}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/40 transition-all cursor-pointer"
          title="AI Build & Package Safe Client Solution (Zero Personal Leaks)"
        >
          <PackageCheck className="w-4 h-4" />
        </button>

        {/* External Link */}
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] hover:border-slate-600 transition-colors"
            title="Open original listing"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}

      </div>

    </div>
  );
}

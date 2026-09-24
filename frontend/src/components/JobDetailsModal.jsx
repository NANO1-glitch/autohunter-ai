import React from 'react';
import { 
  X, 
  DollarSign, 
  Clock, 
  Zap, 
  Send, 
  ExternalLink, 
  BookOpen, 
  PackageCheck, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  Building, 
  MapPin, 
  Tag, 
  FileText,
  Copy,
  TrendingUp
} from 'lucide-react';


export default function JobDetailsModal({ job, onClose, onOpenOutreach, onOpenPlaybook, onOpenDeliverable }) {
  if (!job) return null;

  const isHighTicket = job.budget >= 1000;
  const isDirectEmail = Boolean(job.has_direct_email && job.contact_email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {job.source || "Direct Lead"}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {job.category || "Automation"}
            </span>
            {job.country_badge && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {job.country_badge}
              </span>
            )}
            {isHighTicket && (
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                High Ticket
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          
          {/* Title & Budget Bar */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1.5 flex-1">
              <h2 className="text-xl font-black text-white leading-tight">
                {job.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  {job.company || "Client"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {job.location || "Remote (Worldwide)"}
                </span>
                {isDirectEmail ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <Mail className="w-3 h-3" />
                    Direct Contact: {job.contact_email}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/30">
                    <ExternalLink className="w-3 h-3" />
                    Official Portal Application
                  </span>
                )}
              </div>
            </div>

            {/* Price Badge */}
            <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0 text-right">
              <div className="text-2xl font-black text-emerald-400">
                ${Number(job.budget || 0).toLocaleString()}
              </div>
              {job.effective_hourly_rate && (
                <div className="text-xs text-slate-400 font-semibold">
                  ~${job.effective_hourly_rate}/hr estimated
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Difficulty</div>
              <div className="text-sm font-bold text-white mt-0.5">{job.difficulty || "Easy"}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">AI Dev Time</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{job.ai_dev_time || "30 mins"}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Delivery Deadline</div>
              <div className="text-sm font-bold text-white mt-0.5">{job.turnaround_time || "2-3 days"}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Feasibility</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{job.feasibility_score || 90}% Score</div>
            </div>
          </div>

          {/* Probability of Being Accepted Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Probability of Being Accepted</div>
                  <div className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 text-lg font-black">{job.acceptance_probability || 85}%</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {job.acceptance_tier || "High Win Chance"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                <span>Calculated via channel advantage, pilot strategy & AI feasibility</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mb-3.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700"
                style={{ width: `${job.acceptance_probability || 85}%` }}
              />
            </div>

            {/* Acceptance Factors Breakdown */}
            {job.acceptance_factors && job.acceptance_factors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {job.acceptance_factors.map((factor, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-200 flex items-center justify-between">
                        <span>{factor.name}</span>
                        <span className="text-emerald-400 font-extrabold text-[11px]">{factor.impact}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {factor.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Job Description & Requirements Section */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Client Listing & Requirements</span>
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(job.description || "");
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy entire description"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Requirements</span>
              </button>
            </div>
            
            {/* Untruncated full description container */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-72 overflow-y-auto selection:bg-cyan-500/30">
              {job.description ? job.description.replace(/<[^>]*>?/gm, '') : "No detailed requirements provided by client."}
            </div>
          </div>

          {/* Required Skills & Tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Required Skills & Tech Stack</span>
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverable Expected */}
          {job.deliverable && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300">Expected Client Deliverable: </span>
                  <span className="text-slate-300">{job.deliverable}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Guide */}
            <button
              onClick={() => {
                onClose();
                if (onOpenPlaybook) onOpenPlaybook(job);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Guide</span>
            </button>

            {/* AI Deliverable Package */}
            <button
              onClick={() => {
                onClose();
                if (onOpenDeliverable) onOpenDeliverable(job);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Build Package</span>
            </button>

            {/* External URL if present */}
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
              >
                <span>Original Post</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            {/* Approach Button */}
            <button
              onClick={() => {
                onClose();
                if (onOpenOutreach) onOpenOutreach(job);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-lg transition-all cursor-pointer ${
                isDirectEmail 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
              }`}
            >
              {isDirectEmail ? <Send className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
              <span>{isDirectEmail ? 'Cold Pitch via Gmail' : 'Apply on Official Portal'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

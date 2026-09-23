import React, { useState } from 'react';
import { 
  X, 
  PackageCheck, 
  ShieldCheck, 
  Download, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  FileCode, 
  Lock 
} from 'lucide-react';

export default function DeliverableModal({ job, onClose }) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [deliverable, setDeliverable] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [error, setError] = useState('');

  const handleBuild = async () => {
    if (!job) return;
    setIsBuilding(true);
    setError('');

    try {
      const res = await fetch(`/api/jobs/${job.id}/build-deliverable`, {
        method: 'POST'
      });
      const data = await res.json();
      setDeliverable(data);
      setIsBuilding(false);
    } catch (err) {
      setError(err.message || 'Failed to generate package');
      setIsBuilding(false);
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Work & Safe Deliverable Packager</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Privacy Shield Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI builds the working code and strips all personal names, paths & files before delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Privacy Guarantee Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/25 space-y-2">
            <div className="font-bold text-white flex items-center gap-2 text-xs">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>100% Student Privacy & Anonymity Guarantee:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Zero personal Windows paths</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Zero real name or user info</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Sanitized relative file paths</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Generic agency consultant branding</span>
              </div>
            </div>
          </div>

          {/* Target Job Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Job To Build</span>
              <div className="text-white font-bold text-sm truncate max-w-[380px]">{job.title}</div>
              <div className="text-slate-400 text-[11px]">{job.category} • Client: {job.company}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Budget</span>
              <div className="text-emerald-400 font-extrabold text-base">${job.budget}</div>
            </div>
          </div>

          {!deliverable ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-slate-300 max-w-md mx-auto">
                Ready to deliver? Click below. The AI will write the full production code, create 1-click execution scripts, write the client guide, and package a safe ZIP for you.
              </p>
              <button
                onClick={handleBuild}
                disabled={isBuilding}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Wrench className={`w-4 h-4 ${isBuilding ? 'animate-spin' : ''}`} />
                <span>{isBuilding ? 'AI Writing Code & Sanitizing Package...' : '⚡ AI Build & Package Solution Now'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Ready ZIP Package Alert */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{deliverable.zip_name}</div>
                    <div className="text-[11px] text-emerald-400">Clean client package ready for delivery</div>
                  </div>
                </div>

                <a
                  href={`/api/deliverables/download/${deliverable.zip_name}`}
                  download
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </a>
              </div>

              {/* Files in the package */}
              <div>
                <span className="font-semibold text-slate-400 mb-1.5 block">Files Packaged Inside:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {deliverable.files_included.map((f, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ready to send client handover message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Client Handover Email (Copy & Send):</span>
                  <button
                    onClick={() => copyMessage(deliverable.delivery_message)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedMessage ? 'Copied to Clipboard!' : 'Copy Handover Email'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {deliverable.delivery_message}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            The coding work is 100% handled by the AI. You only send the clean ZIP.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

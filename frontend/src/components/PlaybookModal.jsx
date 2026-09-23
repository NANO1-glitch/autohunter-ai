import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Copy, 
  HelpCircle, 
  Wrench, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export default function PlaybookModal({ job, onClose, onLaunchPitch }) {
  const [playbook, setPlaybook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    if (!job) return;
    setIsLoading(true);
    fetch(`/api/jobs/${job.id}/playbook`)
      .then(res => res.json())
      .then(data => {
        setPlaybook(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load playbook", err);
        setIsLoading(false);
      });
  }, [job]);

  if (!job) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Student Sales Coach & Fulfillment Blueprint</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step guidance on how to build, price, and sell this exact project
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
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-sm">
          
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
              <span>Analyzing requirements & building student game plan...</span>
            </div>
          ) : playbook ? (
            <>
              {/* Executive Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Why You Can Win This</span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {playbook.why_you_can_win}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase">Payout</span>
                    <div className="text-base font-black text-emerald-400">${playbook.budget}</div>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase">Dev Time</span>
                    <div className="text-base font-black text-cyan-400">{playbook.ai_dev_time}</div>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase">Client Deadline</span>
                    <div className="text-base font-black text-indigo-400">{playbook.client_turnaround}</div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Fulfillment with AI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span>How to Build & Fulfill with AI (Zero Headaches)</span>
                </div>
                <div className="space-y-2">
                  {playbook.fulfillment_steps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Tool Stack */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400">Recommended Tools:</span>
                {playbook.tools_recommended.map((tool, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                    {tool}
                  </span>
                ))}
              </div>

              {/* Closing Script When Client Replies */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>When the Client Replies: The Closing Script</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(playbook.closing_script)}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-emerald-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {playbook.closing_script}
                </pre>
              </div>

              {/* Anti-Scam & Payment Protection Protocol */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Anti-Scam & Non-Payment Protection (How to Never Get Cheated)</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-black">1.</span>
                    <span><strong>The 50% Deposit Rule:</strong> Never hand over the full source code for $0 upfront. Say: <em>"To kick off, we do a 50% milestone invoice or PayPal/Stripe link, and 50% after you review the demo."</em></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-black">2.</span>
                    <span><strong>The Watermarked Demo Proof:</strong> Record a 60-second video Loom of the script running on your screen, or send just 20 sample rows as a PDF/CSV preview. This proves the code works 100% without letting them steal it!</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-black">3.</span>
                    <span><strong>Use Escrow for Big Deals ($1,000+):</strong> If the deal is high-ticket, offer Upwork Direct Contract or Escrow.com where the client deposits the money into a locked vault before you deliver.</span>
                  </div>
                </div>
              </div>

              {/* Common Beginner Doubts & Answers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Student FAQs & Objection Handling</span>
                </div>
                <div className="space-y-2.5">
                  {playbook.objection_qa.map((faq, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="font-semibold text-xs text-amber-300 mb-1">
                        Q: {faq.question}
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <div className="text-center py-8 text-slate-400">Failed to load playbook details.</div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Ready to reach out? The cold email has already been drafted.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onLaunchPitch(job);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <span>Open Cold Pitch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

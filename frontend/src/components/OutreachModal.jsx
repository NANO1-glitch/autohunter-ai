import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  FileText 
} from 'lucide-react';

export default function OutreachModal({ job, onClose, onSentSuccess }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  const fetchPitch = () => {
    if (!job) return;
    setIsLoading(true);
    fetch('/api/outreach/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: job.id })
    })
      .then(res => res.json())
      .then(data => {
        setSubject(data.subject || '');
        setBody(data.body || '');
        setRecipientEmail(job.contact_email || 'client@company.com');
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to generate pitch", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPitch();
  }, [job]);

  if (!job) return null;

  const handleApproveAndSend = async () => {
    if (!recipientEmail || !body) return;
    setIsSending(true);
    setDispatchResult(null);

    try {
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          to_email: recipientEmail,
          subject: subject,
          body: body
        })
      });
      const data = await res.json();
      setDispatchResult(data);
      setIsSending(false);
      if (data.success && onSentSuccess) {
        onSentSuccess(job.id);
      }
    } catch (err) {
      setDispatchResult({
        success: false,
        message: `Network error: ${err.message}`
      });
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">1-Click Cold Email Approval</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Anti-AI Detector Tuned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calibrated to sound 100% human, casual-professional, and achieve 3x reply rates
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
        <div className="p-6 overflow-y-auto space-y-4 text-slate-200 text-sm">
          
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
              <span>Tailoring humanized cold pitch to client's exact problem...</span>
            </div>
          ) : (
            <>
              {/* Quality & Detection Badge */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300 font-medium">Bypasses AI Detectors:</span>
                  <span className="text-emerald-400 font-bold">98% Human Cadence</span>
                </div>
                <button
                  onClick={fetchPitch}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 text-xs font-semibold cursor-pointer"
                  title="Generate alternative human variation"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Angle</span>
                </button>
              </div>

              {/* Recipient Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recipient Client Email</span>
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
                  placeholder="client@company.com"
                />
              </div>

              {/* Subject Line Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Subject Line (Peer-to-Peer, Lowercase Hook)</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white font-medium focus:outline-none"
                />
              </div>

              {/* Email Body */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">
                  Email Body (Editable)
                </label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-slate-200 leading-relaxed font-sans focus:outline-none resize-none"
                />
              </div>

              {/* Live Dispatch Feedback Alert */}
              {dispatchResult && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  dispatchResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {dispatchResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{dispatchResult.message}</div>
                    {dispatchResult.record?.info && (
                      <div className="text-[11px] text-slate-300 mt-1">
                        {dispatchResult.record.info}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleApproveAndSend}
            disabled={isSending || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
            <span>{isSending ? 'Dispatching...' : '1-Click Approve & Send'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

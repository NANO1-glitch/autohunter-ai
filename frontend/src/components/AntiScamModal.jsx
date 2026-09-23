import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  Copy, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Mail, 
  Lock,
  Play
} from 'lucide-react';

export default function AntiScamModal({ onClose }) {
  const [clientMessage, setClientMessage] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [replyStatus, setReplyStatus] = useState(null);

  const handleScan = async (msgToScan = null) => {
    const text = msgToScan || clientMessage;
    if (!text.trim()) return;

    setIsScanning(true);
    setAnalysis(null);
    setReplyStatus(null);

    try {
      const res = await fetch('/api/inbox/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          client_email: clientEmail || 'client@company.com'
        })
      });
      const data = await res.json();
      setAnalysis(data);
      setIsScanning(false);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const handleSimulate = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/inbox/simulate-reply', { method: 'POST' });
      const data = await res.json();
      setClientMessage("Hey! We are interested in your web scraping script. Can you send us the full code and source files first? Our finance department pays invoices at the end of next month.");
      setClientEmail("inquiries@clientcompany.com");
      setAnalysis(data);
      setIsScanning(false);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const handleSendSafeReply = async () => {
    if (!analysis) return;
    try {
      const res = await fetch('/api/inbox/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: "inbox-reply",
          to_email: clientEmail || analysis.client_email,
          subject: analysis.reply_subject,
          body: analysis.reply_body
        })
      });
      const data = await res.json();
      setReplyStatus(data);
    } catch (err) {
      setReplyStatus({ success: false, message: err.message });
    }
  };

  const copyReply = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Anti-Scam Shield & Automated Reply Bot</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Student Protection
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paste any client message to scan for non-payment risks and generate a safe milestone response
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
          
          {/* Quick Simulate Button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="text-slate-400">Want to see how it catches scam tactics?</span>
            <button
              onClick={handleSimulate}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate Suspicious Client Test</span>
            </button>
          </div>

          {/* Paste Input Area */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Paste Client's Message / Email Reply:
            </label>
            <textarea
              rows={4}
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
              placeholder="e.g. Can you send the full code first? Or message me on Telegram @..."
              className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Client's email (optional)"
              className="w-64 px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
            />

            <button
              onClick={() => handleScan()}
              disabled={isScanning || !clientMessage.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-rose-600/30 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isScanning ? 'Scanning Tactics...' : 'Scan For Scams & Draft Reply'}</span>
            </button>
          </div>

          {/* Analysis & Output Card */}
          {analysis && (
            <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
              
              {/* Risk Alert Badge */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                analysis.is_scam_risk 
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-200' 
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              }`}>
                {analysis.is_scam_risk ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-xs">
                    {analysis.is_scam_risk ? '🚨 HIGH SCAM / NON-PAYMENT RISK DETECTED!' : '✅ Legitimate Client Inquiry'}
                  </div>
                  {analysis.scam_flags.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-300">
                      {analysis.scam_flags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  )}
                  <div className="text-[11px] text-slate-300">
                    Recommended Action: <strong>{analysis.action_recommendation}</strong>
                  </div>
                </div>
              </div>

              {/* Protected Reply Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Protected Anti-Scam Response:</span>
                  </span>
                  <button
                    onClick={() => copyReply(analysis.reply_body)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Reply'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                  {analysis.reply_body}
                </pre>
              </div>

              {/* Dispatch Action */}
              <div className="flex items-center justify-between pt-2">
                {replyStatus && (
                  <span className={`text-[11px] font-semibold ${replyStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {replyStatus.message}
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleSendSafeReply}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-cyan-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Protected Reply via Gmail</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex justify-end">
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

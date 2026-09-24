import React, { useState, useEffect } from 'react';
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
  Unlock,
  Play,
  DollarSign,
  FileCheck,
  ExternalLink,
  Check,
  Layers,
  ArrowRight,
  Video,
  Camera,
  Package,
  RefreshCw
} from 'lucide-react';

export default function AntiScamModal({ 
  onClose, 
  initialData = null, 
  initialTab = 'scan',
  onDealApproved = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'scan', 'stage1', 'stage2'
  
  // Scan tab state
  const [clientMessage, setClientMessage] = useState(initialData?.client_message || '');
  const [clientEmail, setClientEmail] = useState(initialData?.client_email || '');
  const [jobTitle, setJobTitle] = useState(initialData?.job_title || 'Automation Solution');
  const [company, setCompany] = useState(initialData?.company || 'Client');
  const [budget, setBudget] = useState(initialData?.budget || 150);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  // Stage 1 (Trial) state
  const [trialEmailData, setTrialEmailData] = useState(null);
  const [isGeneratingTrial, setIsGeneratingTrial] = useState(false);
  const [isAutoTrialRunning, setIsAutoTrialRunning] = useState(false);
  
  // Stage 2 (Full Access) state
  const [fullAccessData, setFullAccessData] = useState(null);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [amountPaid, setAmountPaid] = useState(initialData?.budget || 150);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isAutoReleasing, setIsAutoReleasing] = useState(false);
  
  // Generic states
  const [copied, setCopied] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState(null);

  const handleRunAutomatedTrial = async () => {
    setIsAutoTrialRunning(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/inbox/auto-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: initialData?.job_id || initialData?.id || 'demo_job',
          client_email: clientEmail || 'client@company.com'
        })
      });
      const data = await res.json();
      setIsAutoTrialRunning(false);
      if (data.success) {
        setDispatchStatus({
          success: true,
          message: "🎬 Background test complete! Verification screenshot + animated GIF video demo attached and emailed to client!"
        });
      } else {
        setDispatchStatus({ success: false, message: data.error || 'Failed to dispatch auto-trial' });
      }
    } catch (err) {
      setIsAutoTrialRunning(false);
      setDispatchStatus({ success: false, message: err.message });
    }
  };

  const handleAutoReleaseFullApp = async () => {
    setIsAutoReleasing(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/inbox/auto-release-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: initialData?.job_id || initialData?.id || 'demo_job',
          client_email: clientEmail || 'client@company.com',
          amount_paid: parseFloat(amountPaid) || 0
        })
      });
      const data = await res.json();
      setIsAutoReleasing(false);
      if (data.success) {
        setDispatchStatus({
          success: true,
          message: `🎉 Full Application package (${data.zip_delivered}) emailed to client! Deal Won ($${amountPaid}).`
        });
        if (onDealApproved) onDealApproved();
      } else {
        setDispatchStatus({ success: false, message: data.error || 'Failed to release app' });
      }
    } catch (err) {
      setIsAutoReleasing(false);
      setDispatchStatus({ success: false, message: err.message });
    }
  };

  // Initialize or generate on mount if needed
  useEffect(() => {
    if (initialData) {
      if (initialData.client_email) setClientEmail(initialData.client_email);
      if (initialData.job_title) setJobTitle(initialData.job_title);
      if (initialData.company) setCompany(initialData.company);
      if (initialData.budget) {
        setBudget(initialData.budget);
        setAmountPaid(initialData.budget);
      }
      if (initialTab === 'stage1') {
        generateTrialPreview(initialData.client_email, initialData.job_title, initialData.company, initialData.budget);
      } else if (initialTab === 'stage2') {
        generateFullAccessPreview(initialData.client_email, initialData.job_title, initialData.company, initialData.budget);
      }
    }
  }, [initialData, initialTab]);

  // Scan client message
  const handleScan = async (msgToScan = null) => {
    const text = msgToScan || clientMessage;
    if (!text.trim()) return;

    setIsScanning(true);
    setScanResult(null);
    setDispatchStatus(null);

    try {
      const res = await fetch('/api/inbox/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          client_email: clientEmail || 'client@company.com',
          job_title: jobTitle
        })
      });
      const data = await res.json();
      setScanResult(data);
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
      setScanResult(data);
      setIsScanning(false);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  // Generate Stage 1: Trial Proof
  const generateTrialPreview = async (email = clientEmail, title = jobTitle, comp = company, bud = budget) => {
    setIsGeneratingTrial(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/inbox/generate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_email: email || 'client@company.com',
          job_title: title || 'Automation Solution',
          company: comp || 'Client',
          budget: parseFloat(bud) || 0
        })
      });
      const data = await res.json();
      setTrialEmailData(data);
      setIsGeneratingTrial(false);
    } catch (err) {
      console.error(err);
      setIsGeneratingTrial(false);
    }
  };

  // Generate Stage 2: Full Access Handover
  const generateFullAccessPreview = async (email = clientEmail, title = jobTitle, comp = company, paid = amountPaid) => {
    setIsGeneratingFull(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/inbox/generate-full-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_email: email || 'client@company.com',
          job_title: title || 'Automation Solution',
          company: comp || 'Client',
          amount_paid: parseFloat(paid) || 0
        })
      });
      const data = await res.json();
      setFullAccessData(data);
      setIsGeneratingFull(false);
    } catch (err) {
      console.error(err);
      setIsGeneratingFull(false);
    }
  };

  // 1-Click Mark Paid & Release Full Access
  const handleMarkPaidAndRelease = async (sendSmtp = false) => {
    setIsMarkingPaid(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/inbox/mark-paid-and-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outreach_id: initialData?.id || initialData?.outreach_id || null,
          job_id: initialData?.job_id || null,
          client_email: clientEmail || 'client@company.com',
          job_title: jobTitle,
          company: company,
          amount_paid: parseFloat(amountPaid) || 0,
          send_via_smtp: sendSmtp
        })
      });
      const data = await res.json();
      setFullAccessData(data.handover);
      setDispatchStatus({
        success: true,
        message: data.message + (sendSmtp ? ' Dispatched via SMTP to client!' : '')
      });
      setIsMarkingPaid(false);
      if (onDealApproved) onDealApproved();
    } catch (err) {
      console.error(err);
      setDispatchStatus({ success: false, message: err.message });
      setIsMarkingPaid(false);
    }
  };

  // Dispatch via SMTP
  const handleSendViaSMTP = async (subject, body, email) => {
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/inbox/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: initialData?.id || "inbox-action",
          to_email: email || clientEmail,
          subject: subject,
          body: body
        })
      });
      const data = await res.json();
      setDispatchStatus(data);
    } catch (err) {
      setDispatchStatus({ success: false, message: err.message });
    }
  };

  // Open in Gmail
  const handleOpenInGmail = (subject, body, email) => {
    const to = encodeURIComponent(email || clientEmail);
    const su = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${b}`;
    window.open(gmailUrl, '_blank');
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Escrow & Anti-Scam Protection Shield</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  2-Stage Anti-Theft Flow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Never send full source code upfront. Share verified Trial Demos first, release full access upon payment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1. Scan Client Message (Anti-Scam AI)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('stage1');
              if (!trialEmailData) generateTrialPreview();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stage1'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Stage 1: Send Trial Proof (Withhold Code)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('stage2');
              if (!fullAccessData) generateFullAccessPreview();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stage2'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>3. Stage 2: Payment Received → Release Code</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">

          {/* TAB 1: SCAN CLIENT MESSAGE */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              
              {/* Quick Simulate Button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400">Want to test how the AI catches non-payment scam tactics?</span>
                <button
                  onClick={handleSimulate}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Simulate "Code First" Scam Pitch</span>
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
                  placeholder="e.g. Can you send the full code first? Or message me on Telegram @... Or we will pay after 30 days."
                  className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Client's email (optional)"
                  className="w-full sm:w-64 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
                />

                <button
                  onClick={() => handleScan()}
                  disabled={isScanning || !clientMessage.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-rose-600/30 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isScanning ? 'Analyzing Intent...' : 'Analyze Message & Recommend Reply'}</span>
                </button>
              </div>

              {/* Scan Results Card */}
              {scanResult && (
                <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                  
                  {/* Risk Badge */}
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    scanResult.is_scam_risk 
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-200' 
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  }`}>
                    {scanResult.is_scam_risk ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold text-xs">
                        {scanResult.is_scam_risk ? '🚨 HIGH SCAM / NON-PAYMENT RISK DETECTED!' : '✅ Client Reply Analyzed'}
                      </div>
                      {scanResult.scam_flags && scanResult.scam_flags.length > 0 && (
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-300">
                          {scanResult.scam_flags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      )}
                      <div className="text-[11px] text-slate-300">
                        Recommended Next Step: <strong className="text-white">{scanResult.action_recommendation}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Reply Draft */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Protected AI Response ({scanResult.mode}):</span>
                      </span>
                      <button
                        onClick={() => copyText(scanResult.reply_body)}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer text-xs"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy Reply'}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {scanResult.reply_body}
                    </pre>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    {dispatchStatus && (
                      <span className={`text-[11px] font-semibold ${dispatchStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dispatchStatus.message}
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleOpenInGmail(scanResult.reply_subject, scanResult.reply_body, clientEmail)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-red-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Gmail (1-Click)</span>
                      </button>

                      <button
                        onClick={() => handleSendViaSMTP(scanResult.reply_subject, scanResult.reply_body, clientEmail)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-cyan-600/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send via SMTP</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: STAGE 1 (TRIAL DEMO PROOF) */}
          {activeTab === 'stage1' && (
            <div className="space-y-4">
              
              {/* Guidance Banner */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300 text-xs">
                    Stage 1 Rule: Send Proof of Working Solution — WITHHOLD Full Code & Access
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    When work is finished, do <strong>NOT</strong> attach the full source code ZIP or repo link. Instead, send this Trial Demo proof showing verified output rows or screenshots, and ask them to settle the milestone invoice first.
                  </p>
                </div>
              </div>

              {/* Automated Background Run & Video Demo Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <span>Automated Test Run & Video Demo Generator</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                        AI Automation
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed max-w-xl">
                      Runs the solution in the background, generates a high-res verification screenshot (PNG) and an animated terminal video recording (GIF), and automatically emails them to the client with your PayPal payment link!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRunAutomatedTrial}
                  disabled={isAutoTrialRunning}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 shrink-0"
                >
                  <Camera className={`w-4 h-4 ${isAutoTrialRunning ? 'animate-spin' : ''}`} />
                  <span>{isAutoTrialRunning ? 'Executing & Recording...' : 'Run in BG & Send Video Demo'}</span>
                </button>
              </div>

              {/* Form to tweak fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Job / Gig Title:</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Company / Client Name:</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Milestone Budget ($ USD):</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => generateTrialPreview()}
                  disabled={isGeneratingTrial}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                >
                  {isGeneratingTrial ? 'Generating...' : 'Refresh Trial Email Template'}
                </button>
              </div>

              {/* Trial Email Preview */}
              {trialEmailData && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Subject: {trialEmailData.reply_subject}</span>
                    </span>
                    <button
                      onClick={() => copyText(trialEmailData.reply_body)}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer text-xs"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Trial Pitch'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {trialEmailData.reply_body}
                  </pre>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    {dispatchStatus && (
                      <span className={`text-[11px] font-semibold ${dispatchStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dispatchStatus.message}
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleOpenInGmail(trialEmailData.reply_subject, trialEmailData.reply_body, clientEmail)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-red-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Gmail (1-Click)</span>
                      </button>

                      <button
                        onClick={() => handleSendViaSMTP(trialEmailData.reply_subject, trialEmailData.reply_body, clientEmail)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-amber-600/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Trial Proof via SMTP</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: STAGE 2 (PAYMENT RECEIVED -> FULL ACCESS) */}
          {activeTab === 'stage2' && (
            <div className="space-y-4">
              
              {/* Guidance Banner */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <Unlock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-emerald-300 text-xs">
                    Stage 2: Payment Confirmed — Release Full Production Package & Scripts
                  </div>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    Once you receive the money in your PayPal, Stripe, bank, or Escrow milestone is funded, click below to mark the deal <strong>Approved & Won</strong> and deliver the complete unlocked code package with 30-day warranty.
                  </p>
                </div>
              </div>

              {/* Automated Full App Release Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <span>Automated Full App Delivery (Unlocked ZIP)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                        Payment Confirmed
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed max-w-xl">
                      Attaches the complete un-watermarked source code ZIP with 1-click execution script (`run.bat`), README, and 30-day warranty, and delivers it directly to the client's Gmail!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoReleaseFullApp}
                  disabled={isAutoReleasing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 shrink-0"
                >
                  <Unlock className={`w-4 h-4 ${isAutoReleasing ? 'animate-spin' : ''}`} />
                  <span>{isAutoReleasing ? 'Packaging & Delivering...' : 'Deliver Full App (ZIP)'}</span>
                </button>
              </div>

              {/* Amount Paid confirmation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white text-xs">Payment Received Amount:</span>
                    <p className="text-[11px] text-slate-400">Total earnings logged to your dashboard</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-black text-sm">$</span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                  />
                  <span className="text-slate-400 text-xs">USD</span>
                </div>
              </div>

              {/* Full Access Package Handover Email */}
              {fullAccessData && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Subject: {fullAccessData.reply_subject}</span>
                    </span>
                    <button
                      onClick={() => copyText(fullAccessData.reply_body)}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer text-xs"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Handover Email'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {fullAccessData.reply_body}
                  </pre>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    {dispatchStatus && (
                      <span className={`text-[11px] font-semibold ${dispatchStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dispatchStatus.message}
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                      <button
                        onClick={() => handleMarkPaidAndRelease(false)}
                        disabled={isMarkingPaid}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isMarkingPaid ? 'Recording...' : 'Mark Won in CRM (Manual Handover)'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenInGmail(fullAccessData.reply_subject, fullAccessData.reply_body, clientEmail)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-red-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Gmail (1-Click)</span>
                      </button>

                      <button
                        onClick={() => handleMarkPaidAndRelease(true)}
                        disabled={isMarkingPaid}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-600/30"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Mark Paid & Send Full Access via SMTP</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>CurSuv Zero-Scam Protocol: Work is delivered in milestones.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Close Shield
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sliders, 
  Send 
} from 'lucide-react';

export default function SettingsModal({ onClose, onSettingsUpdated }) {
  const [settings, setSettings] = useState({
    smtp_server: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_email: '',
    smtp_password: '',
    sender_name: 'Automation Specialist',
    simulation_mode: true,
    min_budget: 300,
    auto_pilot: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load settings", err);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      setSettings(data);
      setIsSaving(false);
      setSaveSuccess(true);
      if (onSettingsUpdated) onSettingsUpdated(data);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleTestSMTP = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_email: settings.smtp_email,
          smtp_password: settings.smtp_password,
          smtp_server: settings.smtp_server,
          smtp_port: parseInt(settings.smtp_port)
        })
      });
      const data = await res.json();
      setTestResult(data);
      setIsTesting(false);
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection error: ${err.message}`
      });
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cold Outreach & Business Gmail Setup</h2>
              <p className="text-xs text-slate-400">
                Configure your Business Gmail or custom domain mailer
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
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Safe Mode Switch */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Safe Simulation Mode</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.simulation_mode 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {settings.simulation_mode ? 'Active (Safe)' : 'Live SMTP Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                When enabled, cold pitches are logged safely without dispatching real emails.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.simulation_mode}
                onChange={(e) => setSettings({ ...settings, simulation_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Business Gmail Credentials */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gmail Credentials</span>
            </h3>

            <div>
              <label className="font-semibold text-slate-400 mb-1 block">Sender Display Name</label>
              <input
                type="text"
                value={settings.sender_name}
                onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                placeholder="e.g. Sharesth | Automation & Tech Consultant"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400 mb-1 block">Business Gmail / Email Address</label>
              <input
                type="email"
                value={settings.smtp_email}
                onChange={(e) => setSettings({ ...settings, smtp_email: e.target.value })}
                placeholder="yourname@gmail.com or you@yourbusiness.com"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-400">Gmail 16-Digit App Password</label>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Generate Google App Password ↗
                </a>
              </div>
              <input
                type="password"
                value={settings.smtp_password}
                onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                placeholder="abcd efgh ijkl mnop"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white font-mono focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Use a Google App Password from your Google Security settings rather than your main account password.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-400 mb-1 block">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtp_server}
                  onChange={(e) => setSettings({ ...settings, smtp_server: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-400 mb-1 block">Port</label>
                <input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestSMTP}
                disabled={isTesting || !settings.smtp_email || !settings.smtp_password}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3 h-3 text-cyan-400" />
                <span>{isTesting ? 'Testing Login...' : 'Test Gmail Connection'}</span>
              </button>

              {testResult && (
                <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

          </div>

          {/* Preferences */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deal Thresholds</span>
            </h3>

            <div>
              <label className="font-semibold text-slate-400 mb-1 block">Default Minimum Budget ($ USD)</label>
              <input
                type="number"
                value={settings.min_budget}
                onChange={(e) => setSettings({ ...settings, min_budget: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Save Row */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings Saved!
              </span>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

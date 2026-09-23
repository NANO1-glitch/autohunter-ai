import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, AlertCircle } from 'lucide-react';

export default function ManualJobModal({ onClose, onJobAdded }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [source, setSource] = useState('Discord #freelance-jobs');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please provide at least a Title and Description.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/jobs/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company: company || 'Client',
          contact_email: contactEmail || 'contact@client.com',
          source,
          budget: budget ? parseFloat(budget) : 0,
          description
        })
      });
      const data = await res.json();
      setIsSubmitting(false);
      if (onJobAdded) {
        onJobAdded(data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit job.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Paste Raw Job / Discord Message</h2>
              <p className="text-xs text-slate-400">
                AI will immediately score feasibility, estimate difficulty, and prepare a cold pitch
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-400 mb-1 block">Job Title / Problem Summary *</label>
            <input
              type="text"
              required
              placeholder="e.g. Scrape Real Estate Listings from Zillow or Redfin"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-400 mb-1 block">Client / Company Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Media or Discord User"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-400 mb-1 block">Client Contact Email</label>
              <input
                type="email"
                placeholder="e.g. client@domain.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-400 mb-1 block">Source Tag</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
              >
                <option value="Discord #freelance-jobs">Discord #freelance-jobs</option>
                <option value="LinkedIn Jobs">LinkedIn Jobs</option>
                <option value="Reddit r/forhire">Reddit r/forhire</option>
                <option value="Upwork Lead">Upwork Lead</option>
                <option value="Telegram Freelance">Telegram Freelance</option>
                <option value="Direct Referral">Direct Referral</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-400 mb-1 block">Budget ($ USD, optional)</label>
              <input
                type="number"
                placeholder="Leave blank for AI estimate"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-400 mb-1 block">Raw Job Description / Message *</label>
            <textarea
              required
              rows={6}
              placeholder="Paste the message, discord chat, or requirements here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Analyzing & Scoring...' : 'Analyze & Add to Feed'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

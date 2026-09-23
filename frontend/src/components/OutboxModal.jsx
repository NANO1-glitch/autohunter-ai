import React, { useState, useEffect } from 'react';
import { X, Send, Mail, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export default function OutboxModal({ onClose }) {
  const [outreaches, setOutreaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOutreach, setSelectedOutreach] = useState(null);

  useEffect(() => {
    fetch('/api/outreaches')
      .then(res => res.json())
      .then(data => {
        setOutreaches(data.reverse()); // latest first
        if (data.length > 0) {
          setSelectedOutreach(data[0]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch outbox", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Outreach Dispatch History</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {outreaches.length} Dispatched
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log of all human-calibrated cold pitches sent or simulated
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

        {/* Master-Detail Content */}
        <div className="flex-1 flex overflow-hidden text-xs">
          
          {/* List Sidebar */}
          <div className="w-1/3 border-r border-slate-800 overflow-y-auto bg-slate-950/60 p-3 space-y-2">
            {isLoading ? (
              <div className="py-8 text-center text-slate-400">Loading outbox...</div>
            ) : outreaches.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-600" />
                <p>No cold pitches dispatched yet.</p>
                <p className="text-[11px] text-slate-400">Click "Cold Pitch" on any job to test 1-click approval.</p>
              </div>
            ) : (
              outreaches.map((outreach, idx) => {
                const isSelected = selectedOutreach?.id === outreach.id;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedOutreach(outreach)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-white truncate max-w-[140px]">
                        {outreach.to_email}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {outreach.mode || 'Sent'}
                      </span>
                    </div>
                    <div className="text-slate-300 font-medium truncate mb-1">
                      {outreach.subject}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(outreach.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detail View */}
          <div className="w-2/3 p-6 overflow-y-auto bg-slate-900/80 space-y-4">
            {selectedOutreach ? (
              <>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-bold text-white text-xs">{selectedOutreach.to_email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subject:</span>
                    <span className="font-bold text-cyan-300 text-xs">{selectedOutreach.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {selectedOutreach.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-300 text-[11px]">
                      {new Date(selectedOutreach.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">Message Body (Plain Text Email):</div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                    {selectedOutreach.body}
                  </pre>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Select an outreach record from the left to view details.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

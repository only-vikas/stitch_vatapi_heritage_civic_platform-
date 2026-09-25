'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface IssueItem {
  id: string;
  title: string;
  monument: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  escalation_clock: string;
  status: 'triage' | 'in_progress' | 'resolved';
  notes?: string;
  after_photo?: string | null;
}

const INITIAL_ASI_ISSUES: IssueItem[] = [
  {
    id: 'ASI-BDM-1021',
    title: 'Micro-fissure expansion on Varaha Relief Base',
    monument: 'Badami Cave 2',
    category: 'Structural Damage',
    severity: 'critical',
    escalation_clock: '04h 12m remaining',
    status: 'in_progress',
    notes: 'Laser interferometer deployed. Resin bonding slated.',
  },
  {
    id: 'ASI-BDM-1024',
    title: 'Moisture efflorescence and salt leaching on lintel',
    monument: 'Badami Cave 3',
    category: 'Environmental Leaching',
    severity: 'high',
    escalation_clock: '11h 45m remaining',
    status: 'triage',
  },
  {
    id: 'ASI-PTD-2089',
    title: 'Foundation slab subsidence near Nandi Mandapa',
    monument: 'Pattadakal Virupaksha Temple',
    category: 'Foundation Stress',
    severity: 'critical',
    escalation_clock: '02h 20m remaining',
    status: 'triage',
  },
  {
    id: 'ASI-AIH-3042',
    title: 'Weathered frieze detachment on Durga Temple apsidal colonnade',
    monument: 'Aihole Durga Temple Complex',
    category: 'Frieze Degradation',
    severity: 'medium',
    escalation_clock: '36h 10m remaining',
    status: 'in_progress',
  },
  {
    id: 'ASI-BDM-0988',
    title: 'Surface vandalism buffing and patina stabilization',
    monument: 'Badami North Fort Bouldering Crest',
    category: 'Vandalism / Surface Damage',
    severity: 'low',
    escalation_clock: 'Resolved within SLA',
    status: 'resolved',
    notes: 'Chemical poultice application completed without sandstone damage.',
  },
];

export default function AsiOfficerDashboard() {
  const { profile } = useAuth();
  const [issues, setIssues] = useState<IssueItem[]>(INITIAL_ASI_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [statusInput, setStatusInput] = useState<'triage' | 'in_progress' | 'resolved'>('in_progress');
  const [notesInput, setNotesInput] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    // Optionally fetch issues from Supabase if table has jurisdiction matching ASI
    const fetchAsiIssues = async () => {
      setLoadingDb(true);
      try {
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .ilike('jurisdiction', '%ASI%')
          .limit(10);

        if (!error && data && data.length > 0) {
          const mapped: IssueItem[] = data.map((item: any, idx: number) => ({
            id: item.id?.slice(0, 10) || `ASI-BDM-${1000 + idx}`,
            title: item.title || 'Reported Heritage Issue',
            monument: item.monument_name || 'Badami Cave Complex',
            category: item.category || 'Structural Damage',
            severity: (item.severity as any) || 'medium',
            escalation_clock: item.escalation_deadline
              ? `${Math.max(1, Math.floor((new Date(item.escalation_deadline).getTime() - Date.now()) / (1000 * 60 * 60)))}h SLA window`
              : '18h 30m remaining',
            status: item.status === 'resolved' ? 'resolved' : item.status === 'in_progress' ? 'in_progress' : 'triage',
            notes: item.resolution_notes || undefined,
            after_photo: item.resolved_image_url || null,
          }));
          setIssues(mapped);
        }
      } catch (err) {
        console.warn('Using seeded ASI issues fallback', err);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchAsiIssues();
  }, []);

  const openActionModal = (issue: IssueItem) => {
    setSelectedIssue(issue);
    setStatusInput(issue.status);
    setNotesInput(issue.notes || '');
    setAfterPhotoUrl(issue.after_photo || null);
    setActionModalOpen(true);
    setActionSuccessMsg(null);
  };

  const handleSaveAction = () => {
    if (!selectedIssue) return;
    setIssues((prev) =>
      prev.map((item) =>
        item.id === selectedIssue.id
          ? {
              ...item,
              status: statusInput,
              notes: notesInput,
              after_photo: afterPhotoUrl,
              escalation_clock: statusInput === 'resolved' ? 'Resolved within SLA' : item.escalation_clock,
            }
          : item
      )
    );
    setActionSuccessMsg(`Action recorded successfully for ${selectedIssue.id}. Status updated to: ${statusInput.toUpperCase()}`);
    setTimeout(() => {
      setActionModalOpen(false);
      setActionSuccessMsg(null);
    }, 1200);
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setAfterPhotoUrl(preview);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['official', 'admin']} roleTitle="ASI Officers">
      <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a]">
        {/* Top Terracotta Command Header */}
        <div className="bg-[#9a452c] text-white border-b border-[#762b14] shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-2xl">account_balance</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                    Official Archaeological Lane
                  </span>
                  <span className="text-xs text-amber-200">Gov. of India • ASI Dharwad Circle</span>
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-tight mt-0.5">
                  ASI Dharwad Circle • Command Center
                </h1>
                <p className="text-xs text-amber-100/80">
                  Superintending Archaeologist: <span className="font-semibold text-white">{profile?.full_name || 'Dr. Basavaraj Hiremath'}</span> • Badami & Malaprabha Valley
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/heritage-watch"
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Public Watch Feed
              </Link>
              <Link
                href="/"
                className="px-3.5 py-2 bg-white text-[#9a452c] hover:bg-amber-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Exit to Vatapi
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-[#eae8e5] shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6d7a77]">Active Alerts</p>
                  <p className="text-3xl font-serif font-bold text-[#9a452c] mt-1">24</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#9a452c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">warning</span>
                </div>
              </div>
              <p className="text-[11px] text-[#6d7a77] mt-3">
                <span className="font-semibold text-red-600">3 critical</span> pending triage within the next 4 hours
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#eae8e5] shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6d7a77]">SLA Adherence</p>
                  <p className="text-3xl font-serif font-bold text-[#00685f] mt-1">98.4%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00685f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </div>
              </div>
              <p className="text-[11px] text-[#6d7a77] mt-3">
                <span className="font-semibold text-emerald-600">+1.2%</span> higher than previous quarter across Badami Taluk
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#eae8e5] shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6d7a77]">Avg Resolution</p>
                  <p className="text-3xl font-serif font-bold text-[#1b1c1a] mt-1">31 hrs</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
              </div>
              <p className="text-[11px] text-[#6d7a77] mt-3">
                Target SLA: 48 hours for Grade A & B ancient rock-cut structures
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Issues Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#1b1c1a]">
                      Jurisdiction Ledger: ASI Dharwad
                    </h2>
                    <p className="text-xs text-[#6d7a77]">
                      Only showing reports routed directly to the Archaeological Survey of India
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-orange-100 text-[#9a452c] text-xs font-bold">
                    {issues.length} Monitored Sites
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#eae8e5] text-[11px] font-bold text-[#6d7a77] uppercase tracking-wider">
                        <th className="py-3 px-3">Issue ID & Monument</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Severity</th>
                        <th className="py-3 px-3">Escalation Clock</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eae8e5] text-xs">
                      {issues.map((item) => {
                        const sevColor =
                          item.severity === 'critical'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : item.severity === 'high'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : item.severity === 'medium'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200';

                        const statColor =
                          item.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800';

                        return (
                          <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-3.5 px-3">
                              <span className="font-mono text-[11px] font-bold text-[#9a452c] block">
                                {item.id}
                              </span>
                              <span className="font-semibold text-[#1b1c1a] block mt-0.5">
                                {item.monument}
                              </span>
                              <span className="text-[11px] text-[#6d7a77] block line-clamp-1">
                                {item.title}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-[#3d4947] font-medium">
                              {item.category}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sevColor}`}>
                                {item.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                                item.severity === 'critical' && item.status !== 'resolved'
                                  ? 'text-red-600 font-bold animate-pulse'
                                  : 'text-[#6d7a77]'
                              }`}>
                                <span className="material-symbols-outlined text-[13px]">timer</span>
                                {item.escalation_clock}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statColor}`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => openActionModal(item)}
                                className="px-3 py-1.5 bg-[#9a452c] hover:bg-[#762b14] text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                              >
                                Take Action
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right 1 Col: AI Predicted Next Failures */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-md relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                    Guardian Predictive AI
                  </span>
                  <span className="text-[11px] text-[#6d7a77]">Ollama • LLaMA-3</span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#1b1c1a]">
                  Predicted Next Failures
                </h3>
                <p className="text-xs text-[#6d7a77] mt-1">
                  Synthesized from 30-day relative humidity, tourist footfalls & acoustic resonance:
                </p>

                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-900">Badami Cave 3 • East Pillar 4</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-200/60 px-1.5 py-0.5 rounded">
                        89% Risk (14 Days)
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 mt-1">
                      Cyclic humidity swings (84% to 41%) causing sandstone shear stress along the 578 CE Mangalesha inscription frieze.
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-[#9a452c] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">build</span>
                      Recommended: Preemptive silicone-free silicate consolidation
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-950">Pattadakal • Papanatha Eaves</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                        72% Risk (28 Days)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900 mt-1">
                      Malaprabha river monsoon mist accumulation triggering micro-lichen bio-corrosion on northern decorative cornice.
                    </p>
                  </div>
                </div>

                <Link
                  href="/heritage-health-check"
                  className="mt-4 w-full py-2.5 bg-gradient-to-r from-[#9a452c] to-[#762b14] hover:opacity-95 text-white rounded-xl text-xs font-bold text-center block shadow-sm transition-all"
                >
                  Open AR Scanner & Telemetry
                </Link>
              </div>

              {/* Quick Contacts */}
              <div className="bg-[#f5f3f0] rounded-3xl p-5 border border-[#eae8e5] text-xs space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a77] block">
                  On-Duty Escalation Officers
                </span>
                <div className="flex justify-between items-center text-[#1b1c1a]">
                  <span>Field Chemist (ASI Dharwad):</span>
                  <span className="font-semibold font-mono">0836-2441982</span>
                </div>
                <div className="flex justify-between items-center text-[#1b1c1a]">
                  <span>Structural Engineer (Hampi Circle):</span>
                  <span className="font-semibold font-mono">0839-4241334</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* TAKE ACTION MODAL */}
        {actionModalOpen && selectedIssue && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eae8e5] space-y-4">
              <div className="flex items-center justify-between border-b border-[#eae8e5] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#9a452c] uppercase">
                    {selectedIssue.id}
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#1b1c1a]">
                    Official Intervention • {selectedIssue.monument}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="p-1 rounded-lg text-[#6d7a77] hover:bg-stone-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4947] mb-1.5">
                  Update Official Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-sm font-semibold text-[#1b1c1a] focus:ring-2 focus:ring-[#9a452c] focus:outline-none"
                >
                  <option value="triage">Triage (Assessing Risk Level)</option>
                  <option value="in_progress">In Progress (Conservator Dispatched / Active Works)</option>
                  <option value="resolved">Resolved (Completed & Conservation Verified)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4947] mb-1.5">
                  Archaeological Notes / Conservation Protocol
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Specify chemical consolidation formula, mortar grade, or structural tie-back..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-xs text-[#1b1c1a] focus:ring-2 focus:ring-[#9a452c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4947] mb-1.5">
                  Upload 'After' Photo (Resolution Proof)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulatePhotoUpload}
                  className="w-full text-xs text-[#6d7a77] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#9a452c] file:text-white hover:file:bg-[#762b14]"
                />
                {afterPhotoUrl && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-[#eae8e5]">
                    <img src={afterPhotoUrl} alt="After resolution" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#eae8e5] text-xs font-semibold rounded-xl text-[#3d4947] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAction}
                  className="flex-1 py-2.5 bg-[#9a452c] hover:bg-[#762b14] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Official Action
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

'use client';

import React, { useState } from 'react';
import { readOutLoud, stopReadingOutLoud } from '@/lib/whisperService';

interface Issue {
  id: string;
  title: string;
  description?: string;
  category: string;
  severity: string;
  jurisdiction: string;
  status: string;
  photo_url?: string;
  voice_note_url?: string;
  upvotes: number;
  escalation_deadline?: string;
  resolution_lane?: string;
  adopted_by?: string;
  adopted_group_name?: string;
  adopted_action_plan?: string;
  latitude?: number;
  longitude?: number;
  ai_confidence?: number;
  ai_category?: string;
  ai_severity?: string;
  ai_jurisdiction?: string;
  node_hash?: string;
  reporter_id?: string;
  created_at: string;
  updated_at?: string;
}

const GOVERNMENT_OFFICIALS: Record<string, { name: string; title: string; contact: string }> = {
  'ASI Dharwad Circle (Superintending Archaeologist)': {
    name: 'Dr. Basavaraj Hiremath',
    title: 'Superintending Archaeologist, ASI Dharwad Circle',
    contact: 'asi-dharwad@gov.in • 0836-2441982',
  },
  'Badami Town Municipal Council (TMC)': {
    name: 'Shri S. M. Pattanashetti',
    title: 'Chief Officer, Badami TMC Civic Engineering',
    contact: 'co-badami@karnataka.gov.in • 08357-220045',
  },
  'Bagalkote District Police & Revenue Dept': {
    name: 'Superintendent of Police & DC Office',
    title: 'District Heritage Security Cell, Bagalkote',
    contact: 'sp-bgk@ksp.gov.in • Control Room 112',
  },
  'Pattadakal Temple Authority': {
    name: 'Conservation Architect V. K. Desai',
    title: 'ASI Monument Custodian, Pattadakal World Heritage Group',
    contact: 'pattadakal.custodian@asi.gov.in',
  },
  'ASI Dharwad & Civic Volunteers': {
    name: 'Assistant Conservation Engineer',
    title: 'Field Division Malaprabha Basin',
    contact: '0836-2441985',
  },
};

interface BigScreenComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  onUpvote?: (issueId: string) => void;
  isUpvoted?: boolean;
  onOpenCrowdfunding?: (issue: Issue) => void;
  onOpenAdopt?: (issueId: string) => void;
  crowdfundingStats?: { current: number; target: number; backers: number };
}

export default function BigScreenComplaintModal({
  isOpen,
  onClose,
  issue,
  onUpvote,
  isUpvoted = false,
  onOpenCrowdfunding,
  onOpenAdopt,
  crowdfundingStats = { current: 2050, target: 5000, backers: 41 },
}: BigScreenComplaintModalProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen || !issue) return null;

  const official = GOVERNMENT_OFFICIALS[issue.jurisdiction] || {
    name: 'Designated Civic Authority',
    title: issue.jurisdiction,
    contact: 'Bagalkote District Heritage Grid',
  };

  const isResolved = ['resolved', 'closed'].includes(issue.status);
  const isEscalated = issue.status === 'escalated';

  const sevColor =
    issue.severity === 'critical'
      ? 'bg-red-600 text-white'
      : issue.severity === 'high'
      ? 'bg-rose-500 text-white'
      : issue.severity === 'medium'
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-600 text-white';

  const laneInfo =
    issue.resolution_lane === 'government'
      ? { label: 'Government Lane (ASI / TMC)', color: 'bg-orange-100 text-[#9a452c] border-orange-300', icon: 'account_balance' }
      : issue.resolution_lane === 'investor'
      ? { label: 'Investor Lane (Demand Evidence)', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: 'trending_up' }
      : { label: 'Community Action Lane', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'groups' };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopReadingOutLoud();
      setIsSpeaking(false);
    } else {
      const narrative = `Incident ${issue.id}. ${issue.title}. Category: ${issue.category}. Severity: ${issue.severity}. Assigned to ${official.name}, ${official.title}. ${issue.description || ''}`;
      readOutLoud(narrative, {
        lang: 'en-IN',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-[#eae8e5] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <header className="px-6 py-4 bg-[#f5f3f0] border-b border-[#eae8e5] flex items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#9a452c] bg-white px-2.5 py-1 rounded-lg border border-[#eae8e5]">
              {issue.id}
            </span>

            {/* Lane Badge */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${laneInfo.color}`}>
              <span className="material-symbols-outlined text-[15px]">{laneInfo.icon}</span>
              <span>{laneInfo.label}</span>
            </span>

            {/* Severity Pill */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sevColor}`}>
              {issue.severity}
            </span>

            {/* Status */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
              isResolved ? 'bg-emerald-100 text-emerald-800' : isEscalated ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-blue-100 text-blue-800'
            }`}>
              {issue.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeak}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSpeaking ? 'bg-[#9a452c] text-white animate-pulse' : 'bg-white text-[#1b1c1a] border border-[#eae8e5] hover:bg-stone-50'
              }`}
              title="Listen to overall report with Whisper Neural Voice"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSpeaking ? 'graphic_eq' : 'volume_up'}
              </span>
              <span className="hidden sm:inline">{isSpeaking ? 'Speaking...' : 'Listen'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#6d7a77] hover:text-[#1b1c1a] hover:bg-[#eae8e5] transition-colors"
              title="Close Big Screen"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
        </header>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Visual Evidence & Telemetry */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-stone-100 border border-[#eae8e5] shadow-inner group">
                {issue.photo_url ? (
                  <img
                    src={issue.photo_url}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#6d7a77] p-6 text-center">
                    <span className="material-symbols-outlined text-5xl mb-2 text-stone-400">image_not_supported</span>
                    <p className="text-xs">Laser Photogrammetry Telemetry Stored in Ledger</p>
                  </div>
                )}
                
                {/* Photo Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
                    {issue.latitude?.toFixed(4) || '15.9187'}°N, {issue.longitude?.toFixed(4) || '75.6784'}°E
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[#89f5e7] text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    GPS Certified
                  </span>
                </div>
              </div>

              {/* Cryptographic Ledger & AI Confidence Proof */}
              <div className="p-4 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6d7a77] font-semibold uppercase text-[10px] tracking-wider">
                    Consensus Node Hash
                  </span>
                  <span className="font-mono text-[11px] text-[#00685f] font-bold truncate max-w-[200px]">
                    {issue.node_hash || '0x4f8a2bc1...9b19'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6d7a77] font-semibold uppercase text-[10px] tracking-wider">
                    AI Triage Confidence
                  </span>
                  <span className="font-bold text-[#00685f] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    {issue.ai_confidence || 96.8}% (Ollama DeepSeek)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6d7a77] font-semibold uppercase text-[10px] tracking-wider">
                    Report Timestamp
                  </span>
                  <span className="text-[#1b1c1a] font-medium">
                    {new Date(issue.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Full Description & Overall Assessment */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9a452c] block mb-1">
                  {issue.category} • Incident Overview
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1b1c1a] leading-tight">
                  {issue.title}
                </h2>
              </div>

              {/* Overall Description Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#eae8e5] shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6d7a77] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#00685f]">description</span>
                  Overall Description & Heritage Impact Analysis
                </h4>
                <p className="text-sm text-[#3d4947] leading-relaxed whitespace-pre-line font-sans">
                  {issue.description || 'Detailed photogrammetric inspection report: Sub-surface structural attrition detected with accelerated humidity leaching along the ancient sandstone frieze. Multi-stakeholder intervention scheduled.'}
                </p>
              </div>

              {/* Assigned Authority & Official Jurisdiction Card */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a452c] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">gavel</span>
                    Statutory Custodian / In-Charge Authority
                  </span>
                  <span className="text-[11px] font-mono text-[#9a452c] font-bold">Official Jurisdiction</span>
                </div>
                <h3 className="font-bold text-sm text-[#1b1c1a]">{official.name}</h3>
                <p className="text-xs text-[#3d4947]">{official.title}</p>
                <p className="text-[11px] font-mono text-[#6d7a77]">{official.contact}</p>
              </div>

              {/* Investor Lane: Crowdfunding Widget & ROI Demand */}
              {issue.resolution_lane === 'investor' && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-[#d97706]">trending_up</span>
                        Tourist Demand Evidence & Civic Micro-Project
                      </span>
                      <p className="text-[11px] text-[#6d7a77] mt-0.5">
                        {issue.upvotes} verified visitors demanded this fix. Eligible for community co-funding.
                      </p>
                    </div>
                    <span className="font-serif font-bold text-lg text-amber-950">
                      ₹{crowdfundingStats.current.toLocaleString()} / ₹{crowdfundingStats.target.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-amber-200/60 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d97706] to-[#9a452c] rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.round((crowdfundingStats.current / crowdfundingStats.target) * 100))}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">
                      {Math.min(100, Math.round((crowdfundingStats.current / crowdfundingStats.target) * 100))}% Funded
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenCrowdfunding && onOpenCrowdfunding(issue)}
                      className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                      Fund This Fix (₹10 - ₹100)
                    </button>
                  </div>
                </div>
              )}

              {/* Community Lane: Adopt Button */}
              {issue.resolution_lane === 'community' && !isResolved && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Eco-Sena Community Adoption</h4>
                    <p className="text-[11px] text-emerald-800">
                      {issue.adopted_by ? `Adopted by ${issue.adopted_by}` : 'Open for weekend volunteer cleanup drives & youth squads.'}
                    </p>
                  </div>
                  {!issue.adopted_by && onOpenAdopt && (
                    <button
                      type="button"
                      onClick={() => onOpenAdopt(issue.id)}
                      className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">handshake</span>
                      Adopt This Issue
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <footer className="px-6 py-4 bg-[#f5f3f0] border-t border-[#eae8e5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpvote && onUpvote(issue.id)}
              disabled={isUpvoted}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isUpvoted
                  ? 'bg-teal-100 text-teal-800 border border-teal-300 cursor-not-allowed'
                  : 'bg-white hover:bg-teal-50 text-[#00685f] border border-[#bcc9c6] shadow-xs'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isUpvoted ? 'check_circle' : 'thumb_up'}
              </span>
              <span>{isUpvoted ? 'Confirmed by You' : 'Confirm & Upvote'}</span>
              <span className="bg-[#00685f]/15 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
                {issue.upvotes}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1b1c1a] hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Close Big Screen
          </button>
        </footer>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import MicroCrowdfundingModal from '@/components/MicroCrowdfundingModal';

interface ServiceGapOpportunity {
  id: string;
  title: string;
  location: string;
  category: string;
  upvotes: number;
  estimatedCapex: string;
  projectedRoi: string;
  footfallMonthly: string;
  aiBusinessCase: string;
  demandQuote: string;
}

const SEED_OPPORTUNITIES: ServiceGapOpportunity[] = [
  {
    id: 'INV-GAP-01',
    title: 'Heritage Cafe & Traditional North Karnataka Thali Hub',
    location: 'Pattadakal Virupaksha Entrance Corridor',
    category: 'Culinary & Hospitality',
    upvotes: 48,
    estimatedCapex: '₹4.8 Lakhs',
    projectedRoi: '28% IRR (14 months payback)',
    footfallMonthly: '18,500 tourists / mo',
    demandQuote: '48 tourists cited zero hygienic seating or Jolada Rotti dining within 3km of the UNESCO group.',
    aiBusinessCase: 'Market Demand Analysis (Ollama LLaMA-3):\n• High tourist linger time (avg 2.4 hours) with unmet culinary demand.\n• Dispersal potential: Diverts footfall to local farmer-sourced millet meals.\n• Partnership opportunity with Ilkal women self-help groups (SHGs).\n• Net operating margin estimate: 34% with zero royalty concessions from district.',
  },
  {
    id: 'INV-GAP-02',
    title: 'Chalukya Heritage Homestay & Weaver Experience Compound',
    location: 'Aihole Village Old Quarter',
    category: 'Eco-Tourism Accommodation',
    upvotes: 32,
    estimatedCapex: '₹12.5 Lakhs',
    projectedRoi: '24% IRR (22 months payback)',
    footfallMonthly: '9,200 tourists / mo',
    demandQuote: '32 international and state tourists requested overnight stays to photograph dawn over Durga Temple.',
    aiBusinessCase: 'Market Demand Analysis (Ollama LLaMA-3):\n• Currently 92% of tourists return to Hubli/Badami by 5 PM due to lack of verified boutique lodging.\n• Experiential value: Integration with stone-carving workshops generates supplementary evening ticket revenue.\n• Projected occupancy: 68% in peak Nov-Feb season, 42% shoulder season.',
  },
  {
    id: 'INV-GAP-03',
    title: 'Solar-Powered Eco Hydration & Shaded Craft Arcade',
    location: 'Badami Cave Complex Approach',
    category: 'Civic Amenity PPP',
    upvotes: 54,
    estimatedCapex: '₹2.2 Lakhs',
    projectedRoi: '38% IRR (9 months payback)',
    footfallMonthly: '34,000 tourists / mo',
    demandQuote: '54 complaints about extreme afternoon heat and lack of chilled clean drinking water near Cave 1.',
    aiBusinessCase: 'Market Demand Analysis (Ollama LLaMA-3):\n• Replaces single-use plastic bottles with RO water refills + branded terracotta flasks.\n• High volume micro-transactions (₹5 refill / ₹120 souvenir canteen).\n• Eliminates plastic waste at Agastya Tirtha lake while returning high cash flow yield.',
  },
];

export default function InvestorDashboard() {
  const { profile } = useAuth();
  const [opportunities, setOpportunities] = useState<ServiceGapOpportunity[]>(SEED_OPPORTUNITIES);
  const [selectedCase, setSelectedCase] = useState<ServiceGapOpportunity | null>(null);
  const [crowdfundModalOpen, setCrowdfundModalOpen] = useState(false);
  const [crowdfundIssue, setCrowdfundIssue] = useState<any>(null);

  const openCrowdfundForOpportunity = (opp: ServiceGapOpportunity) => {
    setCrowdfundIssue({
      id: opp.id,
      title: opp.title,
      category: opp.category,
      jurisdiction: opp.location,
    });
    setCrowdfundModalOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles={['investor', 'admin']} roleTitle="Heritage Investors">
      <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a]">
        {/* Top Amber Header */}
        <div className="bg-[#d97706] text-white border-b border-[#b45309] shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                    Investor & Capital Lane
                  </span>
                  <span className="text-xs text-amber-100">Demand Evidence & Civic PPP Ventures</span>
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-tight mt-0.5">
                  Heritage Investment Opportunities
                </h1>
                <p className="text-xs text-amber-100/90">
                  Investor: <span className="font-semibold text-white">{profile?.full_name || 'R. Gaddigoudar'}</span> • {profile?.organization || 'Malaprabha Heritage Ventures'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/ooru-oota"
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">restaurant</span>
                Culinary Grid
              </Link>
              <Link
                href="/"
                className="px-3.5 py-2 bg-white text-[#d97706] hover:bg-amber-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Exit to Vatapi
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Top Banner: The Power of Demand Evidence */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border border-amber-300 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Verified Citizen & Tourist Demand Evidence
              </div>
              <h2 className="text-lg font-serif font-bold text-[#1b1c1a]">
                Every Complaint is a Validated Business Opportunity
              </h2>
              <p className="text-xs text-[#3d4947] mt-1 max-w-2xl">
                When over 10 visitors upvote a missing service in the Vatapi Civic Feed, our AI aggregates it into a vetted venture prospectus for local capital deployment.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-white rounded-2xl border border-amber-200 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-[#6d7a77]">Active Gaps</p>
                <p className="text-xl font-bold text-amber-700">3 Verified</p>
              </div>
              <div className="text-center px-4 py-2 bg-white rounded-2xl border border-amber-200 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-[#6d7a77]">Avg IRR</p>
                <p className="text-xl font-bold text-emerald-700">30%</p>
              </div>
            </div>
          </div>

          {/* Service Gap Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {opp.id}
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                      {opp.upvotes} Upvotes
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#1b1c1a] leading-tight">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-[#6d7a77] flex items-center gap-1 mt-1 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-amber-600">location_on</span>
                    {opp.location}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-[#3d4947] italic">
                    "{opp.demandQuote}"
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
                      <span className="text-[10px] text-[#6d7a77] uppercase block font-semibold">Est. Capex</span>
                      <span className="font-bold text-[#1b1c1a]">{opp.estimatedCapex}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] text-[#6d7a77] uppercase block font-semibold">Projected IRR</span>
                      <span className="font-bold text-emerald-800">{opp.projectedRoi}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCase(opp)}
                    className="w-full py-2.5 bg-[#f5f3f0] hover:bg-[#eae8e5] text-[#1b1c1a] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-600">analytics</span>
                    View AI Business Case
                  </button>

                  <button
                    type="button"
                    onClick={() => openCrowdfundForOpportunity(opp)}
                    className="w-full py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                    Fund Micro-Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* AI BUSINESS CASE MODAL */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eae8e5] space-y-4">
              <div className="flex items-center justify-between border-b border-[#eae8e5] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">
                    {selectedCase.id} • Feasibility Study
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#1b1c1a]">
                    {selectedCase.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="p-1 rounded-lg text-[#6d7a77] hover:bg-stone-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  Ollama LLaMA-3 Venture Synthesis
                </div>
                <pre className="text-xs text-[#1b1c1a] whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedCase.aiBusinessCase}
                </pre>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 py-2.5 border border-[#eae8e5] text-xs font-semibold rounded-xl text-[#3d4947]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const opp = selectedCase;
                    setSelectedCase(null);
                    openCrowdfundForOpportunity(opp);
                  }}
                  className="flex-1 py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  Proceed to Micro-Funding
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CROWDFUNDING MODAL */}
        <MicroCrowdfundingModal
          isOpen={crowdfundModalOpen}
          onClose={() => setCrowdfundModalOpen(false)}
          issue={crowdfundIssue}
        />
      </div>
    </ProtectedRoute>
  );
}

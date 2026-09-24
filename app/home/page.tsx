'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import OllamaChatModal from '@/components/OllamaChatModal';
import ReportIssueModal from '@/components/ReportIssueModal';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface IssueItem {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction: string;
  status: 'reported' | 'in_review' | 'in_progress' | 'resolved' | 'closed';
  title?: string;
  description?: string;
  photo_url?: string;
  created_at: string;
}

interface FoodKitchen {
  id: string;
  name: string;
  location: string;
  distance: string;
  dietary_tags: string[];
  verified: boolean;
  specialty_dish?: string;
  rating?: number;
}

interface Weaver {
  id: string;
  name: string;
  specialty: string;
  gi_verified: boolean;
  location?: string;
  experience_years?: number;
  loom_type?: string;
}

export default function Home() {
  const { user } = useAuth();

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatPromptPreload, setChatPromptPreload] = useState('');

  // Local Ollama interactive state for on-page widget (Step 4)
  const [quickPrompt, setQuickPrompt] = useState('');
  const [quickResponse, setQuickResponse] = useState('');
  const [quickThinking, setQuickThinking] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  // Data states
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [kitchens, setKitchens] = useState<FoodKitchen[]>([]);
  const [weavers, setWeavers] = useState<Weaver[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fallback demo data
  const fallbackIssues: IssueItem[] = [
    {
      id: '1',
      category: 'Structural Erosion',
      severity: 'high',
      jurisdiction: 'ASI Dharwad • Badami Cave 3',
      status: 'in_progress',
      title: 'Sandstone Delamination on Mahavishnu Relief Column',
      description: 'Micro-fissure displaying mineral runoff during unseasonal rains. Triage dispatch scheduled with conservation team.',
      photo_url: '/images/badami_caves.png',
      created_at: '2026-09-24T10:30:00Z',
    },
    {
      id: '2',
      category: 'Civic Waste & Cleanliness',
      severity: 'medium',
      jurisdiction: 'Badami Town Municipal Council',
      status: 'reported',
      title: 'Disposal Bin Overflow on North Fort Access Trail',
      description: 'Surge in weekend pilgrims has exceeded waste clearance capacity along the trail stairway.',
      created_at: '2026-09-24T14:15:00Z',
    },
    {
      id: '3',
      category: 'Signage & Accessibility',
      severity: 'low',
      jurisdiction: 'Pattadakal Temple Authority',
      status: 'resolved',
      title: 'Damaged Kannada Inscription Plaque at Virupaksha',
      description: 'High-contrast Braille and bilingual ASI interpretive plaque restored at the eastern mantapa entrance.',
      created_at: '2026-09-23T09:00:00Z',
    },
  ];

  const fallbackKitchens: FoodKitchen[] = [
    {
      id: '1',
      name: 'Mallikarjuna Jolada Rotti Mane',
      location: 'Badami Cave Temple Road',
      distance: '0.4 km',
      dietary_tags: ['North Karnataka Thali', 'Pure Vegetarian', 'Sattvic'],
      verified: true,
      specialty_dish: 'Crisp Jolada Rotti with Stuffed Yennegai Brinjal & Shenga Chutney',
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Basaveshwara Khanavali',
      location: 'Agastya Lake Ghat, Badami',
      distance: '0.8 km',
      dietary_tags: ['Gluten-Free Jowar', 'Vegetarian'],
      verified: true,
      specialty_dish: 'Piping Hot Jowar Bhakri with Spiced Kaalu Palya & Fresh Butter',
      rating: 4.8,
    },
    {
      id: '3',
      name: 'Banashankari Mahila Mandali',
      location: 'Cholachagudda / Banashankari',
      distance: '5.2 km',
      dietary_tags: ['Community Kitchen', 'Vegetarian'],
      verified: true,
      specialty_dish: 'Authentic Shenga Holige (Jaggery Peanut Flatbread) & Kadabu',
      rating: 4.9,
    },
  ];

  const fallbackWeavers: Weaver[] = [
    {
      id: '1',
      name: 'Veeresh Handloom Guild',
      specialty: 'Guledgudda Khana Choli Fabrics (GI Tagged)',
      gi_verified: true,
      location: 'Guledgudda, Ward 4',
      experience_years: 28,
      loom_type: 'Traditional Pit Loom',
    },
    {
      id: '2',
      name: 'Kaveri Artisan Collective',
      specialty: 'Ilkal Silk Saree with Chikki Paras Border & Tope Teni Pallu',
      gi_verified: true,
      location: 'Ilkal Weaving Cluster',
      experience_years: 22,
      loom_type: 'Fly Shuttle Loom',
    },
    {
      id: '3',
      name: 'Badami Heritage Weaving Society',
      specialty: 'Chalukya Motifs Handwoven Kasuti Scarves & Dhotis',
      gi_verified: true,
      location: 'Badami Old Town',
      experience_years: 18,
      loom_type: 'Heritage Pit Loom',
    },
  ];

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Issues
      const { data: issuesData, error: issuesErr } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!issuesErr && issuesData && issuesData.length > 0) {
        setIssues(issuesData);
      } else {
        setIssues(fallbackIssues);
      }

      // 2. Fetch Food Kitchens
      const { data: kitchensData, error: kitchenErr } = await supabase
        .from('food_kitchens')
        .select('*')
        .limit(6);

      if (!kitchenErr && kitchensData && kitchensData.length > 0) {
        setKitchens(kitchensData);
      } else {
        setKitchens(fallbackKitchens);
      }

      // 3. Fetch Weavers
      const { data: weaversData, error: weaversErr } = await supabase
        .from('weavers')
        .select('*')
        .limit(6);

      if (!weaversErr && weaversData && weaversData.length > 0) {
        setWeavers(weaversData);
      } else {
        setWeavers(fallbackWeavers);
      }
    } catch (err) {
      console.warn('Using fallback seed data while Supabase connects:', err);
      setIssues(fallbackIssues);
      setKitchens(fallbackKitchens);
      setWeavers(fallbackWeavers);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Chat submit handler (Step 4 component)
  const handleQuickChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim() || quickLoading) return;

    setQuickLoading(true);
    setQuickResponse('');
    setQuickThinking('');
    setShowThinking(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: quickPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to communicate with DeepSeek');
      
      setQuickResponse(data.text || 'No response generated.');
      if (data.thinking) {
        setQuickThinking(data.thinking);
        setShowThinking(true);
      }
    } catch (err: any) {
      setQuickResponse(`Error: ${err.message || 'Unable to connect to Ollama deepseek-r1:1.5b'}`);
    } finally {
      setQuickLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-[#ba1a1a]/15 text-[#ba1a1a] border-[#ba1a1a]/30';
      case 'high':
        return 'bg-[#ff9475]/30 text-[#762b14] border-[#ff9475]';
      case 'medium':
        return 'bg-[#ffdbd1] text-[#9a452c] border-[#ffb5a0]';
      default:
        return 'bg-[#eae8e5] text-[#3d4947] border-[#bcc9c6]';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-[#e6f4ea] text-[#137333]';
      case 'in_progress':
        return 'bg-[#00685f]/15 text-[#00685f]';
      default:
        return 'bg-[#f5f3f0] text-[#6d7a77]';
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col font-sans selection:bg-[#89f5e7] selection:text-[#00201d]">
      {/* Navbar */}
      <Navbar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenChatModal={() => {
          setChatPromptPreload('');
          setIsChatModalOpen(true);
        }}
      />

      <main className="flex-1 pt-20">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Under shell header bleed) */}
        {/* ========================================================================= */}
        <section id="home" className="relative w-full overflow-hidden bg-[#1b1c1a] text-white">
          {/* Hero Background Image — static, no animation */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-35"
            style={{ backgroundImage: "url('/images/badami_caves.png')" }}
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a100c]/90 via-[#24140e]/60 to-[#1b1c1a]/95 pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-20 flex flex-col justify-between min-h-[85vh]">
            {/* Top Badges & Meta */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#89f5e7] animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#f5f3f0]">
                  AI-Powered Civic Infrastructure & Heritage Tourism • Bagalkote
                </span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9a452c]/40 backdrop-blur-md text-[#ffdbd1] text-xs font-semibold">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>ASI Dharwad • Taluk Civic Grid</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="max-w-4xl py-12 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 bg-[#ff9475]"></div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#ffdbd1] font-bold">
                  The Cradle of Chalukyan Architecture
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight drop-shadow-md">
                Redesigning Heritage Tourism with AI
              </h1>

              <p className="text-base sm:text-lg text-[#efeeeb] max-w-2xl leading-relaxed">
                One platform, one ledger. Preserving Badami, Aihole, and Pattadakal through real-time AI triage,
                supporting authentic Ooru Oota food kitchens, and empowering Guledgudda handloom weavers.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#heritage-watch"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white font-medium text-sm transition-all shadow-lg hover:shadow-xl group"
                >
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-45">
                    bolt
                  </span>
                  <span>Explore Heritage Watch</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsChatModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-medium text-sm transition-all shadow-sm border border-white/20"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#89f5e7]">neurology</span>
                  <span>Consult DeepSeek-R1 (Local AI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9a452c] hover:bg-[#762b14] text-white font-medium text-sm transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Report Civic Issue</span>
                </button>
              </div>
            </div>

            {/* Hero Metrics Ribbon */}
            <div className="w-full bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#f5f3f0]">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#89f5e7] text-[18px]">account_balance</span>
                  <span className="font-semibold text-white">4 UNESCO Contender Sites</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#ff9475]"></div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#89f5e7] text-[18px]">database</span>
                  <span>Supabase PostgreSQL + Storage</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#ff9475]"></div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#89f5e7] text-[18px]">memory</span>
                  <span>DeepSeek R1 Running on Ollama</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#ffb5a0] bg-[#9a452c]/50 px-3 py-1.5 rounded-xl">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>Bagalkote District Civic Grid Ready</span>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. STEP 4 DEEPSEEK OLLAMA INTERACTIVE TESTING PANEL */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl border border-[#eae8e5] p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#eae8e5]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00685f]/10 text-[#00685f] text-xs font-semibold mb-2">
                  <span className="material-symbols-outlined text-[15px]">neurology</span>
                  Next.js App Router + Ollama Route Handler
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#1b1c1a]">
                  Next.js + DeepSeek (via Local Ollama)
                </h2>
                <p className="text-xs text-[#6d7a77] mt-1">
                  Communicating with <code className="bg-[#efeeeb] px-1.5 py-0.5 rounded text-[#00685f] font-mono text-[11px]">http://127.0.0.1:11434</code> via <code className="bg-[#efeeeb] px-1.5 py-0.5 rounded text-[#9a452c] font-mono text-[11px]">/api/chat</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e6f4ea] text-[#137333] text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#137333] animate-ping"></span>
                  Ollama Connected: deepseek-r1:1.5b
                </span>
                <button
                  type="button"
                  onClick={() => setIsChatModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#00685f] text-[#00685f] hover:bg-[#00685f]/5 text-xs font-semibold transition-colors"
                >
                  Full Modal View
                </button>
              </div>
            </div>

            {/* Quick interactive form */}
            <form onSubmit={handleQuickChat} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ask DeepSeek anything about Badami heritage, structural wear, or local weavers..."
                disabled={quickLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-[#bcc9c6] text-sm text-[#1b1c1a] bg-[#fbf9f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00685f] transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={quickLoading || !quickPrompt.trim()}
                className="px-6 py-3 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 shrink-0"
              >
                {quickLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Send to DeepSeek</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </form>

            {/* Response Area */}
            {(quickResponse || quickLoading) && (
              <div className="mt-6 space-y-3">
                {/* Thinking Process Accordion */}
                {quickThinking && (
                  <div className="rounded-xl border border-[#bcc9c6]/50 bg-[#efeeeb]/60 text-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowThinking(!showThinking)}
                      className="w-full px-4 py-2.5 flex items-center justify-between font-mono text-[11px] text-[#3d4947] hover:bg-[#eae8e5] transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-[15px] text-[#00685f]">psychology</span>
                        DeepSeek-R1 Chain of Thought ({quickThinking.length} chars)
                      </span>
                      <span className="material-symbols-outlined text-[16px]">
                        {showThinking ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {showThinking && (
                      <div className="p-4 font-mono text-[11px] text-[#3d4947] border-t border-[#bcc9c6]/30 bg-white/70 whitespace-pre-wrap leading-relaxed">
                        {quickThinking}
                      </div>
                    )}
                  </div>
                )}

                {/* Final Answer */}
                <div className="p-5 bg-[#f5f3f0] rounded-xl border border-[#eae8e5] text-sm text-[#1b1c1a] leading-relaxed whitespace-pre-wrap">
                  {quickResponse}
                </div>
              </div>
            )}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. HERITAGE WATCH (Civic & Preservation Issues) */}
        {/* ========================================================================= */}
        <section id="heritage-watch" className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a452c] mb-2">
                <span className="w-8 h-0.5 bg-[#9a452c]"></span>
                Supabase &apos;issues&apos; Table
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#1b1c1a]">
                Heritage Watch & Civic Triage
              </h2>
              <p className="text-sm text-[#6d7a77] mt-1 max-w-xl">
                Civic issues, structural weathering, and site preservation reports logged by citizens and monitored by ASI Dharwad.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchData}
                className="p-2.5 rounded-xl border border-[#eae8e5] bg-white hover:bg-[#f5f3f0] text-[#6d7a77] text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Refresh from Supabase"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span className="hidden sm:inline">Sync DB</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Report New Issue</span>
              </button>
            </div>
          </div>

          {/* Grid of Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-2xl border border-[#eae8e5] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                        issue.severity
                      )}`}
                    >
                      {issue.severity} Severity
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadge(
                        issue.status
                      )}`}
                    >
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="text-[11px] font-semibold text-[#00685f] uppercase tracking-wide mb-1">
                    {issue.category}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1b1c1a] leading-snug mb-2">
                    {issue.title || `${issue.category} Incident`}
                  </h3>
                  <p className="text-xs text-[#6d7a77] leading-relaxed line-clamp-3 mb-4">
                    {issue.description || 'No additional narrative provided.'}
                  </p>

                  {/* Photo if present */}
                  {issue.photo_url && (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-[#efeeeb] mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={issue.photo_url}
                        alt="Evidence"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="pt-4 border-t border-[#eae8e5] text-[11px] text-[#6d7a77] flex items-center justify-between">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <span className="material-symbols-outlined text-[15px] text-[#9a452c]">account_balance</span>
                    <span className="truncate">{issue.jurisdiction}</span>
                  </div>
                  <span>
                    {new Date(issue.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. OORU OOTA (Authentic North Karnataka Food Kitchens) */}
        {/* ========================================================================= */}
        <section id="ooru-oota" className="bg-[#efeeeb]/50 py-20 border-y border-[#eae8e5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00685f] mb-2">
                  <span className="w-8 h-0.5 bg-[#00685f]"></span>
                  Supabase &apos;food_kitchens&apos; Table
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1b1c1a]">
                  Ooru Oota • Authentic Village Meals
                </h2>
                <p className="text-sm text-[#6d7a77] mt-1 max-w-xl">
                  North Karnataka gastronomic heritage: Jolada Rotti, Yennegai stuffed brinjals, Kaalu Palya, and wood-fired khanavalis.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setChatPromptPreload('Where can I find the best authentic Jolada Rotti in Badami near the cave temples?');
                  setIsChatModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-xs font-semibold text-[#1b1c1a] hover:bg-[#eae8e5] transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-[#9a452c]">restaurant</span>
                <span>Ask DeepSeek for Food Recommendations</span>
              </button>
            </div>

            {/* Kitchens Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kitchens.map((kitchen) => (
                <div
                  key={kitchen.id}
                  className="bg-white rounded-2xl border border-[#eae8e5] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-[#00685f] text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Verified Kitchen</span>
                      </div>
                      {kitchen.rating && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fff9c4] text-[#8d6e63] font-bold text-xs">
                          <span className="material-symbols-outlined text-[13px] text-[#f57f17]">star</span>
                          <span>{kitchen.rating}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#1b1c1a] mb-1">
                      {kitchen.name}
                    </h3>
                    <p className="text-xs text-[#9a452c] font-medium flex items-center gap-1 mb-3">
                      <span className="material-symbols-outlined text-[15px]">location_on</span>
                      <span>{kitchen.location} • {kitchen.distance}</span>
                    </p>

                    <p className="text-xs text-[#3d4947] leading-relaxed mb-4">
                      {kitchen.specialty_dish || 'Authentic North Karnataka traditional thali.'}
                    </p>

                    {/* Dietary Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {kitchen.dietary_tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#f5f3f0] text-[#6d7a77] text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setChatPromptPreload(`Tell me about the specialty dishes at ${kitchen.name} in Badami.`);
                      setIsChatModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-[#00685f]/30 hover:bg-[#00685f]/10 text-[#00685f] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Heritage Menu</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. WEAVERS (Guledgudda Khana & Ilkal Handlooms) */}
        {/* ========================================================================= */}
        <section id="weavers" className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a452c] mb-2">
                <span className="w-8 h-0.5 bg-[#9a452c]"></span>
                Supabase &apos;weavers&apos; Table
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#1b1c1a]">
                Artisan-to-Traveller Weavers
              </h2>
              <p className="text-sm text-[#6d7a77] mt-1 max-w-xl">
                Geographical Indication (GI) certified handloom weavers producing centuries-old Guledgudda Khana and Ilkal silk textiles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setChatPromptPreload('What makes Guledgudda Khana unique and how is its GI tag verified?');
                setIsChatModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-xs font-semibold text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-[#00685f]">texture</span>
              <span>Ask DeepSeek about GI Handlooms</span>
            </button>
          </div>

          {/* Grid of Weavers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weavers.map((weaver) => (
              <div
                key={weaver.id}
                className="bg-white rounded-2xl border border-[#eae8e5] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdbd1] text-[#762b14] text-[10px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      GI Verified Artisan
                    </span>
                    <span className="text-[11px] text-[#6d7a77] font-medium">
                      {weaver.experience_years ? `${weaver.experience_years} Yrs Exp` : 'Master Weaver'}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#1b1c1a] mb-1">
                    {weaver.name}
                  </h3>
                  <p className="text-xs text-[#6d7a77] flex items-center gap-1 mb-3">
                    <span className="material-symbols-outlined text-[15px] text-[#9a452c]">pin_drop</span>
                    <span>{weaver.location || 'Bagalkote District'}</span>
                  </p>

                  <div className="p-3 bg-[#fbf9f6] rounded-xl border border-[#eae8e5] text-xs text-[#3d4947] mb-4 space-y-1">
                    <div>
                      <span className="font-semibold text-[#1b1c1a]">Specialty:</span> {weaver.specialty}
                    </div>
                    {weaver.loom_type && (
                      <div className="text-[11px] text-[#6d7a77]">
                        <span className="font-medium text-[#3d4947]">Loom:</span> {weaver.loom_type}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setChatPromptPreload(`How can I visit ${weaver.name} in ${weaver.location || 'Bagalkote'} and purchase authentic GI Khana fabrics?`);
                    setIsChatModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#9a452c]/10 hover:bg-[#9a452c]/20 text-[#9a452c] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  <span>Connect with Artisan</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1b1c1a] text-[#efeeeb] border-t border-[#30312f] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00685f] flex items-center justify-center text-white font-bold font-serif text-base">
              V
            </div>
            <div>
              <span className="font-serif text-base font-bold text-white tracking-tight">Vatapi Platform</span>
              <p className="text-[11px] text-[#bcc9c6]">Civic Triage & Chalukya Heritage Tourism Grid</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#bcc9c6]">
            <a href="#heritage-watch" className="hover:text-white transition-colors">Heritage Watch</a>
            <span>•</span>
            <a href="#ooru-oota" className="hover:text-white transition-colors">Ooru Oota</a>
            <span>•</span>
            <a href="#weavers" className="hover:text-white transition-colors">Artisan Guild</a>
            <span>•</span>
            <Link href="/login" className="hover:text-white transition-colors">Supabase Auth</Link>
          </div>

          <div className="text-[11px] text-[#6d7a77]">
            Built with Next.js App Router • Supabase Auth & DB • Local DeepSeek-R1 via Ollama
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onIssueReported={fetchData}
      />

      <OllamaChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        defaultPrompt={chatPromptPreload}
      />
    </div>
  );
}

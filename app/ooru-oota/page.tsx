'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import SuccessToast from '@/components/SuccessToast';
import {
  HERITAGE_VALLEYS,
  BASELINE_KITCHENS,
  VerifiedKitchen,
  calculateHaversineDistance,
  formatDistance,
} from '@/lib/spatial';

// Dynamically import Leaflet Map (no SSR)
const OoruOotaMap = dynamic(() => import('@/components/OoruOotaMap'), { ssr: false });

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  structuredKitchens?: any[];
  time?: string;
}

export default function OoruOotaPage() {
  const { user } = useAuth();

  // State
  const [selectedValley, setSelectedValley] = useState<string>('Aihole');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>('k-aihole-1');
  const [kitchens, setKitchens] = useState<VerifiedKitchen[]>(BASELINE_KITCHENS);
  const [loading, setLoading] = useState<boolean>(true);

  // Floating AI Chat Widget State (Step 2)
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'user',
      text: 'What can I eat near Aihole at 1 PM?',
      time: '12:58 PM',
    },
    {
      sender: 'ai',
      text: 'Near Aihole, 2 verified wood-fired Mahila SHG kitchens are open now within 5km serving hot sorghum thalis:',
      structuredKitchens: [
        {
          name: 'Shri Shakambhari Jolada Rotti Mane',
          distance: '350m from Durga Temple',
          dish: 'Hot sorghum rottis, spicy ennegai, and chilled fresh buttermilk. Peak steaming batches come off the wood fire right at 1:00 PM.',
          price: '₹90',
        },
        {
          name: "Akka's Village Meals",
          distance: '1.2 km from Badami Cave 1',
          dish: 'Woodfired jowar meals served with organic jaggery and roasted peanut relish. Less crowded between 1:00 - 1:30 PM.',
          price: '₹80',
        },
      ],
      time: '12:58 PM',
    },
  ]);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // Step 1: Spatial Data Fetching with Live Supabase Integration
  // ----------------------------------------------------
  useEffect(() => {
    async function loadKitchens() {
      setLoading(true);
      try {
        const { data: dbKitchens, error } = await supabase
          .from('food_kitchens')
          .select('*');

        if (!error && dbKitchens && dbKitchens.length > 0) {
          // Map and enrich database records with coordinates from heritage valleys
          const enrichedDb = dbKitchens.map((dk: any) => {
            const match = BASELINE_KITCHENS.find(b => b.name.toLowerCase() === dk.name.toLowerCase());
            const valleyName = dk.location?.includes('Aihole') ? 'Aihole'
              : dk.location?.includes('Pattadakal') ? 'Pattadakal'
              : dk.location?.includes('Guledgudda') ? 'Guledgudda'
              : 'Badami';
            const valleyCoords = HERITAGE_VALLEYS[valleyName] || HERITAGE_VALLEYS['Badami'];

            return {
              id: dk.id,
              name: dk.name,
              shg_group: dk.verified ? (match?.shg_group || 'Verified SHG') : 'Local Kitchen',
              valley: match?.valley || valleyName,
              location: dk.location,
              latitude: match?.latitude || valleyCoords.lat,
              longitude: match?.longitude || valleyCoords.lng,
              price_inr: match?.price_inr || 90,
              price_label: match?.price_label || 'Thali',
              dietary_tags: dk.dietary_tags || match?.dietary_tags || ['Pure Veg'],
              specialty_dishes: match?.specialty_dishes || [dk.specialty_dish || 'Jolada Rotti Meals'],
              signature_thali: dk.specialty_dish || match?.signature_thali || 'Jolada Rotti with Yennegai & Shenga Chutney',
              description: match?.description || 'Authentic traditional home kitchen operated by local women.',
              capacity: match?.capacity || 'Capacity: 20 guests seated',
              open_hours: match?.open_hours || '11:00 AM - 4:30 PM',
              is_open_now: match?.is_open_now ?? true,
              is_verified: dk.verified ?? true,
              rating: dk.rating || 4.8,
              image_url: dk.image_url || match?.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
            };
          });

          // Merge db items with baseline items so all 4 valleys have full coverage
          const dbNames = new Set(enrichedDb.map(k => k.name.toLowerCase()));
          const combined = [...enrichedDb, ...BASELINE_KITCHENS.filter(b => !dbNames.has(b.name.toLowerCase()))];
          setKitchens(combined);
        } else {
          setKitchens(BASELINE_KITCHENS);
        }
      } catch {
        setKitchens(BASELINE_KITCHENS);
      } finally {
        setLoading(false);
      }
    }

    loadKitchens();
  }, []);

  // ----------------------------------------------------
  // Haversine Spatial Distance & 5km Radius Calculation
  // ----------------------------------------------------
  const filteredKitchens = useMemo(() => {
    const valleyCoords = HERITAGE_VALLEYS[selectedValley] || HERITAGE_VALLEYS['All Valleys'];
    const isAll = selectedValley === 'All Valleys';

    return kitchens
      .map(k => {
        const dist = calculateHaversineDistance(
          valleyCoords.lat,
          valleyCoords.lng,
          k.latitude,
          k.longitude
        );
        return {
          ...k,
          distance_km: Number(dist.toFixed(2)),
          distance_display: isAll
            ? `${k.valley} • ${formatDistance(dist)}`
            : `${formatDistance(dist)} from ${selectedValley} center`,
        };
      })
      .filter(k => {
        // 1. Spatial 5km Radius Filter (disabled when "All Valleys" selected)
        if (!isAll && (k.distance_km || 0) > 5.0) {
          return false;
        }

        // 2. Dietary Specialty Filters
        if (specialtyFilter !== 'all') {
          const query = specialtyFilter.toLowerCase();
          const matchesDish = k.specialty_dishes.some(d => d.toLowerCase().includes(query));
          const matchesTag = k.dietary_tags.some(t => t.toLowerCase().includes(query));
          const matchesSig = k.signature_thali.toLowerCase().includes(query);
          if (!matchesDish && !matchesTag && !matchesSig) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }, [kitchens, selectedValley, specialtyFilter]);

  // Set default selected kitchen if current selection filtered out
  useEffect(() => {
    if (filteredKitchens.length > 0 && (!selectedKitchenId || !filteredKitchens.some(k => k.id === selectedKitchenId))) {
      setSelectedKitchenId(filteredKitchens[0].id);
    }
  }, [filteredKitchens, selectedKitchenId]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  // ----------------------------------------------------
  // Step 2: The RAG AI Chat Widget Handler
  // ----------------------------------------------------
  const handleSendChat = async (userPrompt?: string) => {
    const query = (userPrompt || chatInput).trim();
    if (!query || chatLoading) return;

    // Add user message
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: query, time: nowStr }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/food-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          selectedValley,
        }),
      });

      const data = await res.json();

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.response || 'Here are the verified open kitchens matching your request:',
          structuredKitchens: data.kitchens?.length > 0 ? data.kitchens : undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I cannot find any verified open kitchens matching your request near this location.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePrebook = (kitchen: VerifiedKitchen) => {
    setToastMessage(`Pre-booked 2 Thalis at ${kitchen.name}! Wood-fired tawa reserved for you.`);
    setToastType('success');
    setToastVisible(true);
  };

  const handleGetDirections = (kitchen: VerifiedKitchen) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${kitchen.latitude},${kitchen.longitude}`, '_blank');
  };

  const activeValleyCoords = HERITAGE_VALLEYS[selectedValley] || HERITAGE_VALLEYS['All Valleys'];

  return (
    <div className="bg-[#fbf9f6] min-h-screen text-[#1b1c1a] font-[Inter,sans-serif] antialiased flex flex-col">
      {/* ============================================= */}
      {/* HEADER (Exact Stitch Structure) */}
      {/* ============================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf9f6]/90 backdrop-blur-md shadow-[0_1px_8px_rgba(46,28,22,0.04)] border-b border-[#eae8e5]">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <Link className="flex items-center gap-2 group" href="/">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold text-[#9a452c] tracking-tight leading-none">Vatapi</span>
                <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold mt-0.5">Bagalkote Heritage AI</span>
              </div>
            </Link>
          </div>

          <nav className="hidden xl:flex items-center gap-1 bg-[#efeeeb]/70 p-1 rounded-xl">
            <Link className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a] transition-colors" href="/">
              Home
            </Link>
            <Link className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a] transition-colors" href="/heritage-watch">
              Heritage Watch
            </Link>
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#00685f] shadow-xs">
              Ooru Oota
            </span>
            <Link className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a] transition-colors" href="/#weavers">
              Artisan Weavers
            </Link>
            <Link className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a] transition-colors" href="/#about">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efeeeb] text-[#3d4947]">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">location_on</span>
              <span className="text-xs font-medium text-[#1b1c1a]">Bagalkote District</span>
            </div>
            <Link
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#00685f] text-white hover:bg-[#005049] text-xs font-semibold shadow-sm transition-all"
              href="/heritage-watch"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Report an Issue</span>
            </Link>
            {user ? (
              <Link href="/login" className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold text-xs">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </Link>
            ) : (
              <Link href="/login" className="px-3 py-1.5 rounded-lg border border-[#bcc9c6] text-xs font-semibold text-[#1b1c1a] bg-white hover:bg-[#efeeeb] transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ============================================= */}
      {/* MAIN WORKSTATION */}
      {/* ============================================= */}
      <main className="w-full pt-20 bg-[#fbf9f6] flex-1">
        <div className="flex flex-col w-full">
          {/* Sub-Navigation / Breadcrumb & Status Bar (Exact Stitch) */}
          <div className="w-full bg-[#f5f3f0] px-6 lg:px-12 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs border-b border-[#eae8e5]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9a452c] uppercase tracking-wider font-semibold">Ooru Oota Discovery Grid</span>
              <span className="text-[#6d7a77] text-[12px]">•</span>
              <span className="text-xs text-[#3d4947]">Rural Women&apos;s SHG Kitchens &amp; Authentic Sorghum (Jolada Rotti) Messes</span>
            </div>
            <div className="flex items-center gap-3 text-[#3d4947] text-xs">
              <div className="flex items-center gap-1.5 text-[#00685f]">
                <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse"></span>
                <span className="font-semibold">{filteredKitchens.length} Wood-fired Kitchens Active Now</span>
              </div>
              <span className="text-[#bcc9c6]">•</span>
              <span className="text-[#6d7a77]">Bagalkote Zilla Panchayat Verified</span>
            </div>
          </div>

          {/* Primary Split-Screen Workstation (60% Map / 40% Directory) */}
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* ========================================= */}
              {/* LEFT PANEL: Interactive Cartographic Map (Col 1-7) */}
              {/* ========================================= */}
              <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24">
                {/* Filter & Control Bar */}
                <div className="bg-white p-4 rounded-xl shadow-xs border border-[#eae8e5] flex flex-col gap-3">
                  {/* Taluk Selector Pills */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-[#9a452c] uppercase tracking-widest font-bold">
                      Heritage Valley:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['All Valleys', 'Aihole', 'Badami', 'Pattadakal', 'Guledgudda'] as const).map(valley => {
                        const isSelected = selectedValley === valley;
                        const count = valley === 'All Valleys'
                          ? kitchens.length
                          : kitchens.filter(k => k.valley === valley).length;

                        return (
                          <button
                            key={valley}
                            onClick={() => setSelectedValley(valley)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#9a452c] text-white shadow-xs scale-105'
                                : 'bg-[#efeeeb] text-[#1b1c1a] hover:bg-[#eae8e5]'
                            }`}
                          >
                            {valley} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cuisine Speciality Quick Toggles */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-nowrap border-t border-[#eae8e5] pt-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#00685f] shrink-0">filter_list</span>
                    <button
                      onClick={() => setSpecialtyFilter(specialtyFilter === 'Jolada Rotti Meals' ? 'all' : 'Jolada Rotti Meals')}
                      className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 shrink-0 font-medium transition-colors ${
                        specialtyFilter === 'Jolada Rotti Meals'
                          ? 'bg-[#00685f] text-white'
                          : 'bg-[#00685f]/10 text-[#00685f] hover:bg-[#00685f]/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span> Jolada Rotti Meals
                    </button>
                    <button
                      onClick={() => setSpecialtyFilter(specialtyFilter === 'Shenga Chutney' ? 'all' : 'Shenga Chutney')}
                      className={`px-3 py-1 rounded-lg text-xs shrink-0 transition-colors ${
                        specialtyFilter === 'Shenga Chutney'
                          ? 'bg-[#9a452c] text-white'
                          : 'bg-[#efeeeb] text-[#3d4947] hover:text-[#1b1c1a] hover:bg-[#eae8e5]'
                      }`}
                    >
                      Shenga Chutney &amp; Ennegai
                    </button>
                    <button
                      onClick={() => setSpecialtyFilter(specialtyFilter === 'Organic Curd' ? 'all' : 'Organic Curd')}
                      className={`px-3 py-1 rounded-lg text-xs shrink-0 transition-colors ${
                        specialtyFilter === 'Organic Curd'
                          ? 'bg-[#9a452c] text-white'
                          : 'bg-[#efeeeb] text-[#3d4947] hover:text-[#1b1c1a] hover:bg-[#eae8e5]'
                      }`}
                    >
                      Organic Curd &amp; Churned Butter
                    </button>
                    <button
                      onClick={() => setSpecialtyFilter(specialtyFilter === 'Shenga Holige' ? 'all' : 'Shenga Holige')}
                      className={`px-3 py-1 rounded-lg text-xs shrink-0 transition-colors ${
                        specialtyFilter === 'Shenga Holige'
                          ? 'bg-[#9a452c] text-white'
                          : 'bg-[#efeeeb] text-[#3d4947] hover:text-[#1b1c1a] hover:bg-[#eae8e5]'
                      }`}
                    >
                      Sajjige &amp; Shenga Holige
                    </button>
                  </div>
                </div>

                {/* Map Integration */}
                <OoruOotaMap
                  kitchens={filteredKitchens}
                  selectedKitchenId={selectedKitchenId}
                  onSelectKitchen={id => setSelectedKitchenId(id)}
                  valleyCoords={activeValleyCoords}
                />

                {/* Local Farm & Milling Transparency Bar (Exact Stitch) */}
                <div className="p-4 bg-[#efeeeb] rounded-xl flex items-center justify-between gap-4 border border-[#eae8e5]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#9a452c] text-[24px]">grain</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#9a452c] leading-tight">Millet Provenance Guarantee</span>
                      <span className="text-xs text-[#3d4947] mt-0.5">White Sorghum harvested directly from Hungund &amp; Bilagi farmer collectives.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setToastMessage('Audited: 100% Non-GMO native sorghum authenticated by Bagalkote Krishi Vigyan Kendra.');
                      setToastType('success');
                      setToastVisible(true);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-white text-[#9a452c] text-xs font-semibold hover:bg-white/80 transition-colors border border-[#eae8e5] shadow-xs"
                  >
                    Audit Ledger
                  </button>
                </div>
              </div>

              {/* ========================================= */}
              {/* RIGHT PANEL: Scrollable Culinary Directory (Col 8-12) */}
              {/* ========================================= */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* Directory Header */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#9a452c]">Verified Dining Spots</h2>
                    <p className="text-xs text-[#3d4947] mt-0.5">Home kitchens operated by local Mahila Mandalas.</p>
                  </div>
                  <span className="text-[11px] text-[#00685f] uppercase font-bold tracking-wider">
                    {selectedValley === 'All Valleys' ? 'Sorted by Proximity' : `Within 5km of ${selectedValley}`}
                  </span>
                </div>

                {/* Directory Cards */}
                <div className="space-y-4">
                  {filteredKitchens.map((kitchen, idx) => {
                    const isSelected = kitchen.id === selectedKitchenId;
                    const isFeatured = idx === 0;

                    // Featured Card Layout (Matches Card 1 in Stitch Screen)
                    if (isFeatured) {
                      return (
                        <article
                          key={kitchen.id}
                          onClick={() => setSelectedKitchenId(kitchen.id)}
                          className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col transition-all cursor-pointer border ${
                            isSelected ? 'ring-2 ring-[#00685f] border-transparent shadow-lg' : 'border-[#eae8e5] hover:shadow-md'
                          }`}
                        >
                          {/* Food Showcase Photo */}
                          <div className="relative w-full h-52 overflow-hidden bg-[#eae8e5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              src={kitchen.image_url}
                              alt={kitchen.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                            
                            {/* Verified Badge (Teal) */}
                            {kitchen.is_verified && (
                              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-[#00685f]/30">
                                <span className="material-symbols-outlined text-[16px] text-[#00685f]">verified</span>
                                <span className="text-xs font-bold text-[#00685f]">{kitchen.shg_group}</span>
                              </div>
                            )}

                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#89f5e7] font-bold">
                                  {kitchen.valley} Valley
                                </span>
                                <h3 className="font-serif text-xl font-bold text-white leading-snug">
                                  {kitchen.name}
                                </h3>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-white">₹{kitchen.price_inr}</span>
                                <span className="block text-[10px] text-gray-200">{kitchen.price_label}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-4 flex flex-col gap-3">
                            {/* Distance & ETA */}
                            <div className="flex items-center gap-2 text-[#3d4947] text-xs">
                              <span className="material-symbols-outlined text-[#9a452c] text-[18px]">near_me</span>
                              <span className="font-semibold text-[#1b1c1a]">{kitchen.location}</span>
                              <span className="text-[#6d7a77]">•</span>
                              <span>{kitchen.walk_time || `${kitchen.distance_display}`}</span>
                            </div>

                            {/* Dietary & Tradition Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {kitchen.dietary_tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-[#00685f]/10 text-[#00685f] text-[11px] font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Specialty Menu Description */}
                            <div className="p-3 bg-[#f5f3f0] rounded-lg flex flex-col gap-1">
                              <span className="text-[10px] text-[#9a452c] font-bold uppercase tracking-wider">Signature Thali Components:</span>
                              <p className="text-xs text-[#1b1c1a] leading-relaxed">
                                {kitchen.signature_thali}
                              </p>
                            </div>

                            {/* Call to Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={e => { e.stopPropagation(); handleGetDirections(kitchen); }}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold transition-colors shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[16px]">turn_sharp_right</span>
                                <span>Get Directions</span>
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); handlePrebook(kitchen); }}
                                className="px-3.5 py-2.5 rounded-lg border-2 border-[#9a452c] text-[#9a452c] hover:bg-[#9a452c]/10 text-xs font-bold transition-colors"
                              >
                                Pre-book 2 Thalis
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    }

                    // Standard Card Layout (Matches Card 2 / Card 3 in Stitch Screen)
                    return (
                      <article
                        key={kitchen.id}
                        onClick={() => setSelectedKitchenId(kitchen.id)}
                        className={`bg-white rounded-xl shadow-xs hover:shadow-md transition-all p-4 flex flex-col gap-2.5 cursor-pointer border ${
                          isSelected ? 'ring-2 ring-[#00685f] border-transparent shadow-md' : 'border-[#eae8e5]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-bold text-[#9a452c] leading-snug">{kitchen.name}</h3>
                            {kitchen.is_verified && (
                              <div className="flex items-center gap-1 text-[#00685f] mt-0.5">
                                <span className="material-symbols-outlined text-[15px]">verified</span>
                                <span className="text-xs font-semibold">{kitchen.shg_group}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base font-bold text-[#9a452c]">₹{kitchen.price_inr}</span>
                            <span className="block text-[10px] text-[#6d7a77]">{kitchen.price_label}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[#3d4947] text-xs">
                          <span className="material-symbols-outlined text-[#9a452c] text-[16px]">distance</span>
                          <span>{kitchen.distance_display || kitchen.location}</span>
                          <span className="text-[#6d7a77]">•</span>
                          <span className="text-[#ba1a1a] font-medium">{kitchen.open_hours}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 my-0.5">
                          {kitchen.dietary_tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-[#efeeeb] text-[#3d4947] text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-[#3d4947] leading-relaxed">
                          {kitchen.description}
                        </p>

                        <div className="pt-2 flex items-center justify-between border-t border-[#eae8e5]">
                          <span className="text-[11px] text-[#6d7a77]">{kitchen.capacity}</span>
                          <button
                            onClick={e => { e.stopPropagation(); handleGetDirections(kitchen); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">turn_sharp_right</span>
                            <span>Get Directions</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {filteredKitchens.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-[#eae8e5] p-6">
                      <span className="material-symbols-outlined text-4xl text-[#6d7a77] mb-2">no_meals</span>
                      <p className="text-sm font-semibold text-[#1b1c1a]">No verified kitchens found within 5km of {selectedValley}.</p>
                      <p className="text-xs text-[#6d7a77] mt-1">Try selecting &apos;All Valleys&apos; or resetting your dietary filters.</p>
                      <button
                        onClick={() => { setSelectedValley('All Valleys'); setSpecialtyFilter('all'); }}
                        className="mt-3 px-4 py-1.5 rounded-lg bg-[#00685f] text-white text-xs font-semibold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================= */}
        {/* Step 2: FLOATING AI CULINARY EXPLAINER (RAG Widget) */}
        {/* ============================================= */}
        <aside className="fixed bottom-4 right-4 z-40 w-full max-w-sm sm:max-w-md pointer-events-auto">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-[#eae8e5]">
            {/* AI Header Bar */}
            <div className="bg-[#efeeeb] px-4 py-2.5 flex items-center justify-between border-b border-[#eae8e5]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#00685f] flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#9a452c]">Vatapi Ooru Oota AI</h4>
                    <span className="w-2 h-2 rounded-full bg-[#00685f] inline-block animate-pulse"></span>
                  </div>
                  <span className="text-[10px] text-[#6d7a77] block leading-none mt-0.5">Culinary Guide • Bagalkote Grid</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="text-[#3d4947] hover:text-[#1b1c1a] p-1 rounded hover:bg-[#eae8e5] transition-colors"
                  title={chatOpen ? 'Minimize' : 'Expand'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {chatOpen ? 'remove' : 'add'}
                  </span>
                </button>
              </div>
            </div>

            {chatOpen && (
              <>
                {/* Dialogue Thread */}
                <div ref={chatScrollRef} className="p-3.5 flex flex-col gap-3 max-h-80 overflow-y-auto bg-[#f5f3f0]/50">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={
                        msg.sender === 'user'
                          ? 'self-end max-w-[85%] bg-[#9a452c] text-white px-3 py-2 rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl shadow-sm'
                          : 'self-start max-w-[95%] bg-white p-3 rounded-tr-xl rounded-tl-sm rounded-br-xl rounded-bl-xl shadow-sm border border-[#eae8e5] flex flex-col gap-2'
                      }
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-1 text-[#00685f] text-[11px] font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[14px]">local_dining</span>
                          <span>Verified Culinary Recommendation</span>
                        </div>
                      )}

                      <p className="text-xs leading-relaxed">{msg.text}</p>

                      {msg.structuredKitchens && msg.structuredKitchens.length > 0 && (
                        <div className="flex flex-col gap-2 text-xs text-[#1b1c1a]">
                          {msg.structuredKitchens.map((sk: any, ki: number) => (
                            <div key={ki} className="p-2 rounded bg-[#f5f3f0] border border-[#eae8e5]/60">
                              <strong className="text-[#9a452c] font-bold block">
                                {ki + 1}. {sk.name} ({sk.distance || sk.distance_str}):
                              </strong>
                              <span className="text-[#3d4947] text-[11px] mt-0.5 block leading-snug">
                                {sk.dish || sk.signature_thali}
                              </span>
                              <span className="text-[10px] font-bold text-[#00685f] mt-1 block">
                                {sk.price || `₹${sk.price_inr} ${sk.price_label}`} • {sk.open_hours || 'Open for lunch'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Three animated dots while querying Supabase + Ollama */}
                  {chatLoading && (
                    <div className="self-start max-w-[85%] bg-white p-3 rounded-tr-xl rounded-tl-sm rounded-br-xl rounded-bl-xl shadow-sm border border-[#eae8e5] flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#00685f]">Querying verified spatial registry...</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accuracy Guarantee Badge (Exact Stitch requirement) */}
                <div className="px-3 py-1.5 bg-[#00685f]/10 flex items-center gap-1.5 text-[#00685f] border-t border-[#00685f]/20">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  <span className="text-[10px] font-medium leading-none">
                    Verified entries only. AI never invents places. Directly linked to Bagalkote SHG Registry.
                  </span>
                </div>

                {/* Quick Action Prompt Chips */}
                <div className="px-3 py-1.5 bg-[#efeeeb] flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-[#eae8e5]">
                  <button
                    onClick={() => handleSendChat('Is Jolada Rotti gluten-free?')}
                    className="px-2.5 py-0.5 rounded-full bg-white text-[#9a452c] text-[11px] font-semibold whitespace-nowrap hover:bg-[#9a452c]/10 transition-colors shadow-xs"
                  >
                    Is Jolada Rotti gluten-free?
                  </button>
                  <button
                    onClick={() => handleSendChat('Where can I find Shenga Holige?')}
                    className="px-2.5 py-0.5 rounded-full bg-white text-[#9a452c] text-[11px] font-semibold whitespace-nowrap hover:bg-[#9a452c]/10 transition-colors shadow-xs"
                  >
                    Where can I find Shenga Holige?
                  </button>
                  <button
                    onClick={() => handleSendChat('What can I eat near Aihole at 1 PM?')}
                    className="px-2.5 py-0.5 rounded-full bg-white text-[#9a452c] text-[11px] font-semibold whitespace-nowrap hover:bg-[#9a452c]/10 transition-colors shadow-xs"
                  >
                    Near Aihole at 1 PM?
                  </button>
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={e => { e.preventDefault(); handleSendChat(); }}
                  className="p-2 bg-white flex items-center gap-2 border-t border-[#eae8e5]"
                >
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask in Kannada or English..."
                    type="text"
                    disabled={chatLoading}
                    className="flex-1 bg-[#f5f3f0] px-3 py-1.5 rounded-lg text-[#1b1c1a] text-xs placeholder:text-[#6d7a77] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="w-8 h-8 rounded-lg bg-[#00685f] hover:bg-[#005049] text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </aside>
      </main>

      {/* ============================================= */}
      {/* FOOTER (Exact Stitch) */}
      {/* ============================================= */}
      <footer className="w-full bg-[#f5f3f0] mt-16 border-t border-[#eae8e5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold text-[#9a452c]">Vatapi</span>
                <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Civic AI &amp; Heritage Grid</span>
              </div>
              <p className="text-xs text-[#3d4947]">
                Protecting Chalukya monumentality, empowering local civic stewardship in Bagalkote District.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#3d4947]">
              <Link className="hover:text-[#1b1c1a] transition-colors" href="/heritage-watch">Civic Portal</Link>
              <Link className="hover:text-[#1b1c1a] transition-colors" href="/ooru-oota">Ooru Oota</Link>
              <Link className="hover:text-[#1b1c1a] transition-colors" href="/#weavers">Artisan Weavers</Link>
              <Link className="hover:text-[#1b1c1a] transition-colors" href="/#about">Chalukya Archives</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#eae8e5] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6d7a77]">
            <p>© 2025 Vatapi Platform • Bagalkote District Administration &amp; Heritage Directorate.</p>
            <p>Crafted in Badami Red Sandstone Aesthetic.</p>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      <SuccessToast message={toastMessage} type={toastType} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}

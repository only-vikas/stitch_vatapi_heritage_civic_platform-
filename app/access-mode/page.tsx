'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ReportIssueModal from '@/components/ReportIssueModal';
import OllamaChatModal from '@/components/OllamaChatModal';
import SuccessToast from '@/components/SuccessToast';
import VirtualCaveTourModal from '@/components/VirtualCaveTourModal';
import {
  useAccessStore,
  AccessProfile,
  AccessItineraryStop,
  BASELINE_ACCESSIBLE_ITINERARY,
} from '@/lib/accessStore';

export default function AccessModePage() {
  // Global Zustand Access Store (Prompt 5.2.1)
  const {
    accessProfile,
    setAccessProfile,
    textSizeLevel,
    adjustTextSize,
    highContrast,
    toggleHighContrast,
    audioDescriptionActive,
    toggleAudioDescription,
  } = useAccessStore();

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [virtualTourOpen, setVirtualTourOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('Accessibility');

  // Itinerary state
  const [itinerary, setItinerary] = useState<AccessItineraryStop[]>(BASELINE_ACCESSIBLE_ITINERARY);
  const [isGeneratingAiItinerary, setIsGeneratingAiItinerary] = useState(false);
  const [activeSpeakingStopId, setActiveSpeakingStopId] = useState<string | null>(null);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // ----------------------------------------------------------------------
  // 1. Text-to-Speech Helper for Screen Reader Audio
  // ----------------------------------------------------------------------
  const handleToggleScreenReader = () => {
    toggleAudioDescription();
    if (!audioDescriptionActive) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `Welcome to Vatapi Access Mode for ${accessProfile} visitors. Showing 4 step-free and ramped accessible stops across Badami and Pattadakal. Stop one: Badami Cave Complex North Promenade, departure at nine AM.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
      setToastMessage('Screen Reader Audio active.');
      setToastType('success');
      setToastVisible(true);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setToastMessage('Screen Reader Audio stopped.');
      setToastType('success');
      setToastVisible(true);
    }
  };

  const handleSpeakStopNarrative = (stop: AccessItineraryStop) => {
    if (activeSpeakingStopId === stop.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeakingStopId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const narrative =
        stop.audio_narrative ||
        `${stop.site_name} at ${stop.time}. ${stop.description}. ${stop.accessibility_notes}.`;
      const utterance = new SpeechSynthesisUtterance(narrative);
      utterance.rate = 0.95;
      utterance.onend = () => setActiveSpeakingStopId(null);
      window.speechSynthesis.speak(utterance);
      setActiveSpeakingStopId(stop.id);
    }
  };

  // ----------------------------------------------------------------------
  // 2. Profile Selection (Prompt 5.2.1)
  // ----------------------------------------------------------------------
  const handleSelectProfile = (profile: AccessProfile) => {
    setAccessProfile(profile);

    // Filter/adapt itinerary tags dynamically per profile
    setItinerary((prev) =>
      prev.map((stop) => {
        let specializedBadges = ['Accessible Route'];
        if (profile === 'Wheelchair') {
          specializedBadges.push('Ramped Access (1:12 Grade)', 'Audio Description');
        } else if (profile === 'Senior') {
          specializedBadges.push('Rest Benches (80m)', 'Electric Shuttle');
        } else if (profile === 'Low Vision') {
          specializedBadges.push('Tactile Paving', 'Halegannada Audio');
        } else if (profile === 'Family with Pram') {
          specializedBadges.push('Stroller Curb Cuts', 'Baby Care Station');
        }
        return {
          ...stop,
          badge_labels: specializedBadges,
        };
      })
    );

    setToastMessage(`Switched Access Mode to "${profile}" profile.`);
    setToastType('success');
    setToastVisible(true);
  };

  // ----------------------------------------------------------------------
  // 3. AI-Generated Itinerary (Prompt 5.2.2)
  // ----------------------------------------------------------------------
  const handleGenerateAiItinerary = async () => {
    setIsGeneratingAiItinerary(true);
    try {
      const res = await fetch('/api/access-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessProfile,
        }),
      });

      const data = await res.json();
      if (data.success && data.stops && data.stops.length > 0) {
        setItinerary(data.stops);
        setToastMessage(`Generated personalized itinerary for ${accessProfile}!`);
        setToastType('success');
        setToastVisible(true);
      }
    } catch (err: any) {
      console.warn('AI Itinerary note:', err);
    } finally {
      setIsGeneratingAiItinerary(false);
    }
  };

  return (
    <div
      className={`min-h-screen text-[#1b1c1a] antialiased selection:bg-[#00685f]/20 transition-colors ${
        highContrast ? 'bg-black text-white' : 'bg-[#fbf9f6]'
      }`}
      style={{ fontSize: `${textSizeLevel * 100}%` }}
    >
      {/* Navigation */}
      <Navbar
        onOpenReportModal={() => {
          setReportCategory('Accessibility');
          setReportModalOpen(true);
        }}
        onOpenChatModal={() => setChatModalOpen(true)}
        activeSection="access-mode"
      />

      <main className="w-full pt-20 min-h-screen">
        <div className="flex flex-col w-full">
          {/* =================================================================== */}
          {/* TOP ACCESSIBILITY TOOLBAR & HERO */}
          {/* =================================================================== */}
          <section
            className={`w-full py-8 sm:py-12 border-b ${
              highContrast ? 'bg-stone-900 border-white/20' : 'bg-[#f5f3f0] border-[#eae8e5]'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#00685f]/10 text-[#00685f] text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">accessible_forward</span>
                  Universal Access Layer
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#9a452c] tracking-tight">
                  Access Mode • Inclusive Heritage Tourism
                </h1>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    highContrast ? 'text-stone-300' : 'text-[#3d4947]'
                  }`}
                >
                  Barrier-free exploration protocols, audited mobility pathways, and tactile &amp; sensory navigation for the Malaprabha Basin monuments.
                </p>
              </div>

              {/* Accessibility Adjuster Controls */}
              <div
                className={`flex flex-wrap items-center gap-2 p-2 rounded-2xl shadow-xs self-start md:self-auto ${
                  highContrast ? 'bg-stone-800' : 'bg-white border border-[#eae8e5]'
                }`}
              >
                {/* Text Sizing A- / A+ */}
                <div className="flex items-center rounded-xl bg-[#efeeeb] p-1 gap-1 text-xs">
                  <span className="text-[#6d7a77] pl-2 pr-1 font-bold">Text</span>
                  <button
                    type="button"
                    onClick={() => adjustTextSize(-0.05)}
                    aria-label="Decrease Text Size"
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#1b1c1a] font-bold shadow-xs hover:bg-[#00685f] hover:text-white transition-all active:scale-95"
                    title="Decrease Text Size"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustTextSize(0.05)}
                    aria-label="Increase Text Size"
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#1b1c1a] font-bold shadow-xs hover:bg-[#00685f] hover:text-white transition-all active:scale-95"
                    title="Increase Text Size"
                  >
                    A+
                  </button>
                </div>

                {/* High Contrast Toggle */}
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  aria-pressed={highContrast}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    highContrast
                      ? 'bg-amber-400 text-black ring-2 ring-white'
                      : 'bg-[#efeeeb] hover:bg-[#eae8e5] text-[#1b1c1a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">contrast</span>
                  <span>High Contrast</span>
                </button>

                {/* Screen Reader Audio Toggle */}
                <button
                  type="button"
                  onClick={handleToggleScreenReader}
                  aria-pressed={audioDescriptionActive}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    audioDescriptionActive
                      ? 'bg-[#00685f] text-white ring-2 ring-[#89f5e7]'
                      : 'bg-[#00685f]/10 text-[#00685f] hover:bg-[#00685f] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">volume_up</span>
                  <span>Screen Reader Audio</span>
                </button>
              </div>
            </div>
          </section>

          {/* =================================================================== */}
          {/* STEP 1: INDIVIDUAL MOBILITY PROFILE GRID (Prompt 5.2.1) */}
          {/* =================================================================== */}
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 pt-10 pb-8">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-6 gap-2">
              <div>
                <span className="text-xs font-bold text-[#9a452c] tracking-widest uppercase">
                  Step 1 • Individual Mobility Profile
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                  Select Your Assisted Travel Protocol
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#00685f] uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse" />
                Dynamic Routing Active
              </span>
            </div>

            {/* 4-Card Profile Grid */}
            <div
              aria-label="Select Mobility Profile"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              role="radiogroup"
            >
              {[
                {
                  id: 'Wheelchair' as AccessProfile,
                  title: 'Wheelchair User',
                  desc: 'Step-free ramps & smooth sandstone pathways audited for manual and motorized chairs.',
                  detail: 'Grade limit: 1:12 slope',
                  icon: 'accessible',
                },
                {
                  id: 'Senior' as AccessProfile,
                  title: 'Senior Citizen',
                  desc: 'Gentle gradient pathways, rest benches every 80m, and pre-booked golf cart shuttle links.',
                  detail: 'Zero steep climbing steps',
                  icon: 'elderly',
                },
                {
                  id: 'Low Vision' as AccessProfile,
                  title: 'Low Vision',
                  desc: 'Tactile stone braille reliefs, high-contrast markers, and immersive Halegannada audio narration.',
                  detail: 'Haptic beacons synced',
                  icon: 'visibility',
                },
                {
                  id: 'Family with Pram' as AccessProfile,
                  title: 'Family with Pram',
                  desc: 'Stroller-friendly curb cuts, shaded nursing & baby-care pavilions, and wide gate clearances.',
                  detail: 'Zero gate turnstiles',
                  icon: 'stroller',
                },
              ].map((card) => {
                const isSelected = accessProfile === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSelectProfile(card.id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={`group relative flex flex-col justify-between p-5 rounded-3xl transition-all cursor-pointer border ${
                      isSelected
                        ? highContrast
                          ? 'bg-stone-800 ring-2 ring-amber-400 border-transparent shadow-xl'
                          : 'bg-white ring-2 ring-[#00685f] border-transparent shadow-lg -translate-y-1'
                        : highContrast
                        ? 'bg-stone-900 border-white/20 hover:bg-stone-800'
                        : 'bg-[#f5f3f0] border-[#eae8e5] hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                            isSelected
                              ? 'bg-[#00685f] text-white'
                              : 'bg-[#9a452c]/10 text-[#9a452c]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[26px]">
                            {card.icon}
                          </span>
                        </div>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00685f] text-white text-[11px] font-bold tracking-wide shadow-xs">
                            <span className="material-symbols-outlined text-[13px]">check</span>
                            Active
                          </span>
                        ) : (
                          <span className="hidden group-hover:inline-flex items-center px-2 py-0.5 rounded-full bg-[#eae8e5] text-[#3d4947] text-[10px] font-semibold">
                            Select
                          </span>
                        )}
                      </div>

                      <h3
                        className={`font-serif text-lg font-bold mb-1 ${
                          isSelected ? 'text-[#9a452c]' : ''
                        }`}
                      >
                        {card.title}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed ${
                          highContrast ? 'text-stone-300' : 'text-[#3d4947]'
                        }`}
                      >
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#eae8e5]/60 flex items-center justify-between text-xs text-[#00685f] font-semibold">
                      <span>{card.detail}</span>
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =================================================================== */}
          {/* STEP 2: AUDITED CIRCUIT ITINERARY & AI GENERATOR (Prompt 5.2.2) */}
          {/* =================================================================== */}
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-8 gap-6 border-b border-[#eae8e5]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00685f] text-white text-xs font-bold uppercase mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Audited Circuit Active
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#9a452c] tracking-tight">
                  {accessProfile}-Audited Circuit: Badami &amp; Pattadakal
                </h2>
                <p
                  className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
                    highContrast ? 'text-stone-300' : 'text-[#3d4947]'
                  }`}
                >
                  Curated continuous path verified with 100% barrier-free transitions, non-slip sandstone surfacing, and dedicated resting alcoves.
                </p>
              </div>

              {/* Action: Generate AI Itinerary (Prompt 5.2.2) & Telemetry Pills */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mandated Button: Generate AI Itinerary (Prompt 5.2.2) */}
                <button
                  type="button"
                  onClick={handleGenerateAiItinerary}
                  disabled={isGeneratingAiItinerary}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingAiItinerary ? (
                    <>
                      <span className="material-symbols-outlined text-[17px] animate-spin">
                        sync
                      </span>
                      <span>Ollama Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                      <span>Generate AI Itinerary</span>
                    </>
                  )}
                </button>

                {/* Telemetry Stats */}
                <div
                  className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border ${
                    highContrast ? 'bg-stone-800 border-white/20' : 'bg-[#f5f3f0] border-[#eae8e5]'
                  }`}
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-xs text-xs">
                    <span className="material-symbols-outlined text-[#00685f] text-[18px]">
                      straighten
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#6d7a77]">Total Circuit</span>
                      <span className="font-bold text-[#1b1c1a]">3.8 km Accessible</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-xs text-xs">
                    <span className="material-symbols-outlined text-[#00685f] text-[18px]">
                      bolt
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#6d7a77]">E-Mobility</span>
                      <span className="font-bold text-[#1b1c1a]">2 Charging Hubs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-xs text-xs">
                    <span className="material-symbols-outlined text-[#9a452c] text-[18px]">
                      assist_walker
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#6d7a77]">Max Incline</span>
                      <span className="font-bold text-[#9a452c]">4.8° (Compliant)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Stops */}
            <div className="relative pl-6 md:pl-10 space-y-8 mt-8">
              <div className="absolute left-3 md:left-5 top-4 bottom-8 w-1 bg-[#eae8e5] rounded-full -translate-x-1/2" />

              {itinerary.map((stop, idx) => (
                <article
                  key={stop.id || idx}
                  className={`relative flex flex-col lg:flex-row items-stretch gap-6 p-6 sm:p-8 rounded-3xl border transition-all ${
                    highContrast
                      ? 'bg-stone-900 border-white/20'
                      : 'bg-white border-[#eae8e5] shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Step Number Dot */}
                  <div className="absolute -left-6 md:-left-10 top-8 -translate-x-1/2 w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-[#fbf9f6]">
                    {stop.step_number || idx + 1}
                  </div>

                  {/* Left Column: Details, Badges & Rest Alcove */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00685f]/10 text-[#00685f] text-xs font-bold tracking-wide">
                          {stop.time}
                        </span>

                        {stop.badge_labels.map((badge, bIdx) => {
                          const isAiBadge = badge.includes('AI Suggested');
                          return (
                            <span
                              key={bIdx}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isAiBadge
                                  ? 'bg-[#89f5e7] text-[#00201d] ring-1 ring-[#00685f]/30'
                                  : badge.includes('Accessible')
                                  ? 'bg-[#00685f] text-white'
                                  : 'bg-[#efeeeb] text-[#1b1c1a]'
                              }`}
                            >
                              {isAiBadge ? (
                                <span className="material-symbols-outlined text-[13px]">
                                  auto_awesome
                                </span>
                              ) : (
                                <span className="material-symbols-outlined text-[13px]">
                                  accessible
                                </span>
                              )}
                              <span>{badge}</span>
                            </span>
                          );
                        })}
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#9a452c] mb-2">
                        {stop.site_name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          highContrast ? 'text-stone-300' : 'text-[#3d4947]'
                        }`}
                      >
                        {stop.description}
                      </p>
                    </div>

                    {/* Rest Alcove / Comfort Point Block */}
                    <div className="mt-4 pt-3">
                      <div className="bg-[#f5f3f0] p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-[#eae8e5]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#9a452c]/15 text-[#9a452c] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">deck</span>
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#9a452c] block">
                              {stop.rest_point_title}
                            </span>
                            <span className="text-[11px] text-[#3d4947]">
                              {stop.rest_point_desc}
                            </span>
                          </div>
                        </div>

                        {/* Audio Narrator for this specific stop */}
                        <button
                          type="button"
                          onClick={() => handleSpeakStopNarrative(stop)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors ${
                            activeSpeakingStopId === stop.id
                              ? 'bg-[#00685f] text-white ring-2 ring-[#89f5e7]'
                              : 'bg-white hover:bg-[#eae8e5] text-[#00685f] border border-[#bcc9c6]/40'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {activeSpeakingStopId === stop.id ? 'stop' : 'volume_up'}
                          </span>
                          <span>{activeSpeakingStopId === stop.id ? 'Pause' : 'Listen'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Image & Incline Specs */}
                  <div className="w-full lg:w-80 shrink-0 flex flex-col gap-2">
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-stone-200 border border-[#eae8e5]">
                      <img
                        src={stop.image_url}
                        alt={stop.site_name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                        Audited Jan 2025
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6d7a77] px-1">
                      <span>{stop.doorway_or_passage}</span>
                      <span className="text-[#00685f] font-bold">{stop.slope_or_metric}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* =================================================================== */}
          {/* STEP 3: VIRTUAL CAVE TOUR & COMMUNITY AUDIT (Prompt 5.2.2) */}
          {/* =================================================================== */}
          <section className="w-full bg-[#eae8e5] py-12 my-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div
                className={`p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col gap-6 ${
                  highContrast ? 'bg-stone-900' : 'bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="max-w-2xl">
                    <span className="text-xs font-bold text-[#00685f] uppercase tracking-wider">
                      Remote &amp; On-Site Inclusivity
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#9a452c] mt-0.5">
                      Experience the Inaccessible Clefts Virtually
                    </h2>
                    <p
                      className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                        highContrast ? 'text-stone-300' : 'text-[#3d4947]'
                      }`}
                    >
                      Certain upper cliff sanctuaries in Badami remain structurally unmodifiable due to ASI heritage conservation protocols. Access them in lifelike 360° immersion with real-time sign language avatars and spatial audio descriptions.
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end shrink-0">
                    <span className="text-[11px] text-[#6d7a77] uppercase font-bold">
                      Official Collaboration
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-[#1b1c1a]">
                      Bagalkote Disability Welfare Dept
                    </span>
                    <span className="text-xs text-[#00685f] font-semibold flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      ASI Dharwad Circle
                    </span>
                  </div>
                </div>

                {/* 2 Main Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Action 1: Launch Virtual Cave Tour (Prompt 5.2.2) */}
                  <button
                    type="button"
                    onClick={() => setVirtualTourOpen(true)}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-[#00685f] text-white hover:bg-[#005049] shadow-md transition-all active:scale-[0.99] text-left group"
                    id="btn-virtual-tour"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[28px]">view_in_ar</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-base sm:text-lg font-bold">
                        Launch Virtual Cave Tour
                      </span>
                      <span className="text-xs text-white/80">
                        360° Photogrammetric digital twin with captions &amp; Indian Sign Language (ISL)
                      </span>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-white transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>

                  {/* Action 2: Community Access Audit (Prompt 5.2.2) */}
                  <button
                    type="button"
                    onClick={() => {
                      setReportCategory('Accessibility');
                      setReportModalOpen(true);
                    }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all active:scale-[0.99] text-left group ${
                      highContrast
                        ? 'bg-stone-800 border-white/20 text-white'
                        : 'bg-[#f5f3f0] hover:bg-[#eae8e5] border-[#eae8e5] text-[#1b1c1a]'
                    }`}
                    id="btn-community-audit"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#9a452c]/10 text-[#9a452c] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[28px]">rule</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-base sm:text-lg font-bold text-[#9a452c]">
                        Community Access Audit
                      </span>
                      <span className="text-xs text-[#3d4947]">
                        Submit real-time barrier report, review ramp inclines, or flag temporary repairs
                      </span>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-[#9a452c] transition-transform group-hover:translate-x-1">
                      chevron_right
                    </span>
                  </button>
                </div>

                {/* Footer notes */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-2 text-[11px] text-[#6d7a77]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                      info
                    </span>
                    <span>
                      All path measurements and obstacle clearances strictly follow CPWD Harmonised Guidelines 2021.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#eae8e5] font-mono text-[10px] tracking-widest uppercase">
                    Simulated Data • Platform v2.4
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Virtual Cave 360 Tour Modal (Prompt 5.2.2) */}
      <VirtualCaveTourModal
        isOpen={virtualTourOpen}
        onClose={() => setVirtualTourOpen(false)}
      />

      {/* Community Access Audit Modal (Phase 2 Report an Issue with pre-filled Accessibility) */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialCategory={reportCategory}
      />

      {/* Ollama Chat Modal */}
      <OllamaChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />

      {/* Global Toast */}
      {toastVisible && (
        <SuccessToast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
      )}
    </div>
  );
}

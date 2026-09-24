'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ReportIssueModal from '@/components/ReportIssueModal';
import OllamaChatModal from '@/components/OllamaChatModal';
import SuccessToast from '@/components/SuccessToast';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import LogWaterReadingModal from '@/components/LogWaterReadingModal';
import SubmitCleanupProofModal from '@/components/SubmitCleanupProofModal';
import { supabase } from '@/lib/supabaseClient';
import {
  CrowdForecast,
  DispersalNudge,
  WaterReading,
  TrailHotspot,
  BASELINE_CROWD_FORECASTS,
  BASELINE_NUDGES,
  BASELINE_WATER_READINGS,
  BASELINE_TRAIL_HOTSPOTS,
  BASELINE_LNT_METRICS,
  BASELINE_ECO_SENA_REMOVAL,
  getCrowdLevel,
  calculatePurityIndex,
} from '@/lib/sustainability';

export default function SustainablePlanningPage() {
  // Navigation & Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // State: Crowd Forecasts & Pressure Matrix (Prompt 5.1.1)
  const [crowdForecasts, setCrowdForecasts] = useState<CrowdForecast[]>(BASELINE_CROWD_FORECASTS);
  const [nudges, setNudges] = useState<DispersalNudge[]>(BASELINE_NUDGES);
  const [isGeneratingNudge, setIsGeneratingNudge] = useState<boolean>(false);

  // State: Water Sentinel (Prompt 5.1.2)
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>(BASELINE_WATER_READINGS);
  const [currentWaterIndex, setCurrentWaterIndex] = useState<number>(82);
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  // State: Waste & Hotspots (Prompt 5.1.3)
  const [hotspots, setHotspots] = useState<TrailHotspot[]>(BASELINE_TRAIL_HOTSPOTS);
  const [lntMetrics, setLntMetrics] = useState(BASELINE_LNT_METRICS);
  const [ecoRemoval, setEcoRemoval] = useState(BASELINE_ECO_SENA_REMOVAL);

  // ----------------------------------------------------------------------
  // 1. Fetch & Subscribe to Supabase Data
  // ----------------------------------------------------------------------
  useEffect(() => {
    // A. Load Crowd Forecasts
    async function loadCrowdForecasts() {
      try {
        const { data, error } = await supabase.from('crowd_forecasts').select('*');
        if (!error && data && data.length > 0) {
          setCrowdForecasts(data as CrowdForecast[]);
        }
      } catch (err) {
        console.warn('Using baseline crowd forecasts:', err);
      }
    }

    // B. Load Water Readings & Subscribe to Realtime (Prompt 5.1.2)
    async function loadWaterReadings() {
      try {
        const { data, error } = await supabase
          .from('sustainability_metrics')
          .select('*')
          .eq('metric_type', 'Water')
          .order('recorded_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((d: any) => ({
            id: d.id,
            metric_type: 'Water',
            location: d.location || 'Agastya Lake',
            dissolved_oxygen: Number(d.dissolved_oxygen) || 6.8,
            ph: Number(d.ph) || 7.4,
            turbidity: Number(d.turbidity) || 14.0,
            algal_biomass: Number(d.algal_biomass) || 0.12,
            purity_index: Number(d.purity_index) || 82,
            photo_url: d.photo_url || BASELINE_WATER_READINGS[0].photo_url,
            notes: d.notes,
            reported_by: d.reported_by || 'Citizen Sentinel',
            recorded_at: new Date(d.recorded_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
          setWaterReadings(formatted);
          if (formatted[0]?.purity_index) {
            setCurrentWaterIndex(formatted[0].purity_index);
          }
        }
      } catch (err) {
        console.warn('Using baseline water readings:', err);
      }
    }

    loadCrowdForecasts();
    loadWaterReadings();

    // Realtime subscription for sustainability_metrics (Prompt 5.1.2)
    const channel = supabase
      .channel('sustainability_live_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sustainability_metrics' },
        (payload: any) => {
          const newRow = payload.new;
          if (newRow.metric_type === 'Water') {
            const parsedReading: WaterReading = {
              id: newRow.id,
              metric_type: 'Water',
              location: newRow.location || 'Agastya Lake',
              dissolved_oxygen: Number(newRow.dissolved_oxygen) || 7.0,
              ph: Number(newRow.ph) || 7.4,
              turbidity: Number(newRow.turbidity) || 12.0,
              algal_biomass: Number(newRow.algal_biomass) || 0.11,
              purity_index: Number(newRow.purity_index) || 82,
              photo_url: newRow.photo_url,
              notes: newRow.notes,
              reported_by: newRow.reported_by,
              recorded_at: 'Just now',
            };
            setWaterReadings((prev) => [parsedReading, ...prev.slice(0, 5)]);
            setCurrentWaterIndex(parsedReading.purity_index);
            setToastMessage('Realtime: New water telemetry verified!');
            setToastType('success');
            setToastVisible(true);
          } else if (newRow.metric_type === 'Waste' && newRow.hotspot_name) {
            // Update hotspot status
            setHotspots((prev) =>
              prev.map((h) =>
                h.name === newRow.hotspot_name
                  ? { ...h, status: 'Cleared', status_color: 'primary', cleared_ago: 'Cleared just now' }
                  : h
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ----------------------------------------------------------------------
  // 2. Dispersal Nudge Generator (Prompt 5.1.1)
  // ----------------------------------------------------------------------
  const handleGenerateSmartNudge = async () => {
    setIsGeneratingNudge(true);
    try {
      // Find highest crowd site
      let highestSite = 'Badami Caves';
      let highestPct = 95;

      const peakForecast = crowdForecasts.find(
        (c) => c.visitor_count / c.capacity_limit >= 0.8
      );
      if (peakForecast) {
        highestSite = peakForecast.site_name;
        highestPct = Math.round((peakForecast.visitor_count / peakForecast.capacity_limit) * 100);
      }

      const res = await fetch('/api/dispersal-nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: highestSite,
          capacityPercent: highestPct,
        }),
      });

      const data = await res.json();
      if (data.success && data.nudge) {
        setNudges((prev) => [data.nudge, ...prev]);
        setToastMessage('AI Dispersal Nudge generated based on peak carrying capacity!');
        setToastType('success');
        setToastVisible(true);
      }
    } catch (err: any) {
      console.warn('Dispersal nudge notice:', err);
    } finally {
      setIsGeneratingNudge(false);
    }
  };

  // ----------------------------------------------------------------------
  // 3. Water Reading Callback (Prompt 5.1.2)
  // ----------------------------------------------------------------------
  const handleReadingLogged = (newReading: WaterReading) => {
    setWaterReadings((prev) => [newReading, ...prev.slice(0, 5)]);
    setCurrentWaterIndex(newReading.purity_index);
    setToastMessage(`Water reading logged for ${newReading.location}! Purity Score: ${newReading.purity_index}/100.`);
    setToastType('success');
    setToastVisible(true);
  };

  // ----------------------------------------------------------------------
  // 4. Cleanup Proof Callback (Prompt 5.1.3)
  // ----------------------------------------------------------------------
  const handleCleanupVerified = (hotspotName: string, photoUrl: string) => {
    setHotspots((prev) =>
      prev.map((h) =>
        h.name === hotspotName
          ? {
              ...h,
              status: 'Cleared',
              status_color: 'primary',
              cleared_ago: 'Cleared just now',
            }
          : h
      )
    );

    if (photoUrl) {
      setEcoRemoval((prev) => ({
        ...prev,
        after_img: photoUrl,
        location: hotspotName,
        resolved_by: 'Cleared by Eco-Sena Volunteer',
        timestamp: 'Just now',
      }));
    }

    setToastMessage(`Hotspot "${hotspotName}" verified clean by Ollama!`);
    setToastType('success');
    setToastVisible(true);
  };

  // Build matrix dictionary for table
  const sanctuaries = ['Badami Caves', 'Pattadakal', 'Aihole Ring'];
  const timeSlots = ['07:00 AM', '11:00 AM', '03:00 PM', '05:00 PM'];

  // Current water telemetry readings from the latest log
  const latestWater = waterReadings[0] || BASELINE_WATER_READINGS[0];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] antialiased selection:bg-[#00685f]/20">
      {/* Navigation */}
      <Navbar
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenChatModal={() => setChatModalOpen(true)}
        activeSection="sustainability"
      />

      <main className="w-full pt-20 bg-[#fbf9f6] min-h-screen">
        <div className="flex flex-col w-full">
          {/* =================================================================== */}
          {/* COMMAND HEADER & TELEMETRY SCRIM */}
          {/* =================================================================== */}
          <section className="w-full bg-[#fbf9f6] py-6 sm:py-8 border-b border-[#eae8e5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              {/* Title & Live Meta Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9a452c] text-white text-xs font-bold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-[#89f5e7] animate-pulse" />
                      ECO-SENTINEL GRID
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#eae8e5] text-[#3d4947] text-xs tracking-widest font-semibold uppercase">
                      Malaprabha Basin
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#9a452c] tracking-tight">
                    Sustainable Planning Dashboard
                  </h1>
                  <p className="text-sm sm:text-base text-[#3d4947] max-w-3xl leading-relaxed">
                    Real-time telemetry and crowd dispersal intelligence across the Malaprabha Heritage Basin. Balancing Chalukyan preservation with low-impact civic pilgrimage.
                  </p>
                </div>

                {/* Badges & Global Mode Actions */}
                <div className="flex items-center flex-wrap gap-2 self-start lg:self-center shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eae8e5] text-[#1b1c1a] text-xs font-semibold shadow-xs">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">sensors</span>
                    <span>KSPCB Telemetry Active</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffdbd1] text-[#3b0900] text-xs font-bold tracking-wide">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    Simulated Data
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage('Exporting Malaprabha Basin Sustainability Brief (PDF)...');
                      setToastType('success');
                      setToastVisible(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Export Brief</span>
                  </button>
                </div>
              </div>

              {/* Live Civic Ticker Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] shadow-xs">
                {/* Active Visitors */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#eae8e5]">
                  <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">groups</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-[#6d7a77] uppercase tracking-wider">
                      Active Visitors
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-xl font-bold text-[#1b1c1a]">3,420</span>
                      <span className="text-xs text-[#00685f] font-semibold">Safe Limit (&lt;5,000)</span>
                    </div>
                  </div>
                </div>

                {/* Waste SLA Clearance */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#eae8e5]">
                  <div className="w-10 h-10 rounded-xl bg-[#9a452c]/10 text-[#9a452c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">auto_delete</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-[#6d7a77] uppercase tracking-wider">
                      Waste SLA Clearance
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-xl font-bold text-[#1b1c1a]">94.2%</span>
                      <span className="text-xs text-[#00685f] font-semibold">18m Avg Dispatch</span>
                    </div>
                  </div>
                </div>

                {/* Agastya Teertha Quality */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#eae8e5]">
                  <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">water_ec</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-[#6d7a77] uppercase tracking-wider">
                      Agastya Teertha Quality
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-xl font-bold text-[#00685f]">{currentWaterIndex}/100</span>
                      <span className="text-xs text-[#00685f] font-semibold">Good (Grade B+)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================== */}
          {/* 3-COLUMN CORE ANALYTICAL DASHBOARD */}
          {/* =================================================================== */}
          <section className="w-full py-8 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ------------------------------------------------------------- */}
                {/* COLUMN 1: CROWD FORECAST & CARRYING CAPACITY (4 Cols) */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="rounded-3xl bg-white border border-[#eae8e5] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
                    {/* Panel Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#9a452c] uppercase tracking-wider">
                          Pillars of Density
                        </span>
                        <h2 className="font-serif text-xl font-bold text-[#9a452c] tracking-tight mt-0.5">
                          Crowd Forecast &amp; Carrying Capacity
                        </h2>
                      </div>
                      <span className="material-symbols-outlined text-[#9a452c] text-[24px]">
                        reduce_capacity
                      </span>
                    </div>

                    {/* Live Capacity Bar Gauge */}
                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5]">
                      <div className="flex justify-between items-center text-[#1b1c1a]">
                        <span className="text-xs font-semibold">Sustainable Basin Load</span>
                        <span className="font-serif text-base font-bold text-[#00685f]">68%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#eae8e5] overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#00685f] via-[#008378] to-[#9a452c] rounded-full transition-all duration-500"
                          style={{ width: '68%' }}
                        />
                      </div>
                      <div className="flex justify-between text-[#3d4947] text-[11px]">
                        <span>Current: 3,420 PAX</span>
                        <span>Max Ceiling: 5,000 PAX</span>
                      </div>
                    </div>

                    {/* Heatmap Grid by Site & Slot (Prompt 5.1.1) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider">
                          Hourly Pressure Matrix
                        </h3>
                        <span className="text-[11px] text-[#6d7a77]">Today (Live Cycle)</span>
                      </div>

                      <div className="overflow-x-auto pb-1 border border-[#eae8e5] rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-[11px] text-[#3d4947] bg-[#f5f3f0] border-b border-[#eae8e5]">
                              <th className="py-2 px-2.5 font-bold">Sanctuary</th>
                              <th className="py-2 px-1.5 text-center font-bold">07:00</th>
                              <th className="py-2 px-1.5 text-center font-bold">11:00</th>
                              <th className="py-2 px-1.5 text-center font-bold">15:00</th>
                              <th className="py-2 px-2 text-center font-bold">17:00</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eae8e5] bg-white">
                            {sanctuaries.map((site) => (
                              <tr key={site} className="hover:bg-[#fbf9f6] transition-colors">
                                <td className="py-2.5 px-2.5 font-semibold text-[#1b1c1a] text-[11px] whitespace-nowrap">
                                  {site}
                                </td>
                                {timeSlots.map((slot) => {
                                  const match = crowdForecasts.find(
                                    (c) =>
                                      c.site_name.toLowerCase().includes(site.toLowerCase().slice(0, 5)) &&
                                      c.hour_slot.includes(slot.slice(0, 5))
                                  );
                                  const visitorCount = match ? match.visitor_count : 400;
                                  const capLimit = match ? match.capacity_limit : 3500;
                                  const level = getCrowdLevel(visitorCount, capLimit);

                                  return (
                                    <td key={slot} className="py-2 px-1.5 text-center">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${level.bgClass} ${level.textClass}`}
                                        title={`${match?.site_name || site} at ${slot}: ${visitorCount}/${capLimit} visitors (${Math.round(level.ratio * 100)}%)`}
                                      >
                                        {level.label}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Dispersal Nudges Panel & AI Generator (Prompt 5.1.1) */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#eae8e5]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#9a452c]">
                          <span className="material-symbols-outlined text-[18px]">alt_route</span>
                          <h3 className="text-xs font-bold uppercase tracking-wider">
                            Active Dispersal Nudges
                          </h3>
                        </div>

                        {/* Mandated Button: 'Generate Smart Nudge' (Prompt 5.1.1) */}
                        <button
                          type="button"
                          onClick={handleGenerateSmartNudge}
                          disabled={isGeneratingNudge}
                          className="px-2.5 py-1 rounded-lg bg-[#00685f]/10 hover:bg-[#00685f]/20 text-[#00685f] text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {isGeneratingNudge ? (
                            <>
                              <span className="material-symbols-outlined text-[13px] animate-spin">
                                sync
                              </span>
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[13px]">
                                auto_awesome
                              </span>
                              <span>Generate Smart Nudge</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-[#3d4947]">
                        Dynamic routing algorithms shifting visitor streams to prevent cliffside sandstone micro-wear.
                      </p>

                      {/* Nudges List */}
                      <div className="flex flex-col gap-2 mt-1">
                        {nudges.map((nudge) => (
                          <div
                            key={nudge.id}
                            className={`p-3 rounded-2xl flex flex-col gap-1 transition-colors border ${
                              nudge.isAiGenerated
                                ? 'bg-[#f4fffc] border-[#89f5e7] ring-1 ring-[#00685f]/20'
                                : 'bg-[#f5f3f0] border-transparent hover:bg-[#eae8e5]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#00685f]">
                                  {nudge.title}
                                </span>
                                {/* Mandated Teal 'AI Suggested' Badge (Prompt 5.1.1) */}
                                {nudge.isAiGenerated && (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#89f5e7] text-[#00201d]">
                                    <span className="material-symbols-outlined text-[11px]">
                                      auto_awesome
                                    </span>
                                    AI Suggested
                                  </span>
                                )}
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-[#00685f]/10 text-[#00685f] text-[10px] font-bold">
                                {nudge.crowdDiff}
                              </span>
                            </div>

                            <p className="text-xs text-[#1b1c1a]">{nudge.bestTime}</p>
                            <p className="text-[11px] text-[#6d7a77]">{nudge.description}</p>

                            {nudge.perk && (
                              <div className="flex items-center gap-1 text-[#9a452c] text-[11px] font-bold mt-0.5">
                                <span className="material-symbols-outlined text-[15px]">stars</span>
                                <span>{nudge.perk}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footnote Info */}
                    <div className="p-2.5 rounded-xl bg-[#f5f3f0] text-[#3d4947] text-[11px] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#6d7a77]">
                        info
                      </span>
                      <span>ASI Badami Sub-Circle crowd thresholds updated every 5 minutes.</span>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COLUMN 2: LAKE HEALTH MONITOR - AGASTYA TEERTHA (4 Cols) */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="rounded-3xl bg-white border border-[#eae8e5] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
                    {/* Panel Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#9a452c] uppercase tracking-wider">
                          Hydrological Guard
                        </span>
                        <h2 className="font-serif text-xl font-bold text-[#9a452c] tracking-tight mt-0.5">
                          Agastya Lake Water Sentinel
                        </h2>
                      </div>
                      <span className="material-symbols-outlined text-[#9a452c] text-[24px]">
                        water_bottle
                      </span>
                    </div>

                    {/* 2x2 Telemetry Metric Matrix (Live Updated) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Dissolved Oxygen */}
                      <div className="p-3 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] flex flex-col">
                        <span className="text-[10px] font-bold text-[#6d7a77] uppercase">
                          Dissolved Oxygen
                        </span>
                        <span className="font-serif text-lg font-bold text-[#1b1c1a] mt-0.5">
                          {latestWater.dissolved_oxygen}{' '}
                          <span className="text-xs font-normal text-[#3d4947]">mg/L</span>
                        </span>
                        <div className="flex items-center gap-1 text-[#00685f] text-[10px] font-semibold mt-1">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          <span>Optimal Range</span>
                        </div>
                      </div>

                      {/* Lake Acidity */}
                      <div className="p-3 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] flex flex-col">
                        <span className="text-[10px] font-bold text-[#6d7a77] uppercase">
                          Lake Acidity (pH)
                        </span>
                        <span className="font-serif text-lg font-bold text-[#1b1c1a] mt-0.5">
                          {latestWater.ph}{' '}
                          <span className="text-xs font-normal text-[#3d4947]">pH</span>
                        </span>
                        <div className="flex items-center gap-1 text-[#00685f] text-[10px] font-semibold mt-1">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          <span>Neutral Alkaline</span>
                        </div>
                      </div>

                      {/* Turbidity Index */}
                      <div className="p-3 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] flex flex-col">
                        <span className="text-[10px] font-bold text-[#6d7a77] uppercase">
                          Turbidity Index
                        </span>
                        <span className="font-serif text-lg font-bold text-[#1b1c1a] mt-0.5">
                          {latestWater.turbidity}{' '}
                          <span className="text-xs font-normal text-[#3d4947]">NTU</span>
                        </span>
                        <div className="flex items-center gap-1 text-[#00685f] text-[10px] font-semibold mt-1">
                          <span className="material-symbols-outlined text-[13px]">waves</span>
                          <span>Normal Sediment</span>
                        </div>
                      </div>

                      {/* Algal Biomass */}
                      <div className="p-3 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] flex flex-col">
                        <span className="text-[10px] font-bold text-[#6d7a77] uppercase">
                          Algal Biomass
                        </span>
                        <span className="font-serif text-lg font-bold text-[#1b1c1a] mt-0.5">
                          {latestWater.algal_biomass}{' '}
                          <span className="text-xs font-normal text-[#3d4947]">RFU</span>
                        </span>
                        <div className="flex items-center gap-1 text-[#00685f] text-[10px] font-semibold mt-1">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          <span>Low Risk</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic SVG Trend Graph (30 Days) (Prompt 5.1.2) */}
                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1b1c1a]">
                          30-Day Purity Trajectory
                        </span>
                        <span className="text-[11px] text-[#00685f] font-bold">+6.4% MoM</span>
                      </div>

                      {/* Clean SVG Sparkline with Dynamic Current Point */}
                      <div className="w-full h-28 relative mt-1">
                        <svg
                          className="w-full h-full overflow-visible"
                          preserveAspectRatio="none"
                          viewBox="0 0 300 90"
                        >
                          <defs>
                            <linearGradient id="lakeGradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#00685f" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#00685f" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Baseline 70 Threshold */}
                          <line
                            stroke="#bcc9c6"
                            strokeDasharray="4,4"
                            strokeWidth="1"
                            x1="0"
                            x2="300"
                            y1="55"
                            y2="55"
                          />
                          <text fill="#6d7a77" fontFamily="Inter" fontSize="8" x="4" y="50">
                            Safe Baseline (70)
                          </text>

                          {/* Dynamic Curve depending on currentWaterIndex */}
                          {/* Map 0-100 to y 80-10: y = 85 - (index * 0.7) */}
                          {(() => {
                            const curY = Math.max(10, Math.min(80, 85 - currentWaterIndex * 0.7));
                            return (
                              <>
                                <path
                                  d={`M 0 65 Q 40 50, 75 58 T 150 40 T 225 32 T 300 ${curY} L 300 90 L 0 90 Z`}
                                  fill="url(#lakeGradient)"
                                />
                                <path
                                  d={`M 0 65 Q 40 50, 75 58 T 150 40 T 225 32 T 300 ${curY}`}
                                  fill="none"
                                  stroke="#00685f"
                                  strokeLinecap="round"
                                  strokeWidth="2.5"
                                />
                                <circle cx="300" cy={curY} fill="#00685f" r="4" />
                              </>
                            );
                          })()}
                        </svg>
                      </div>

                      <div className="flex justify-between text-[10px] text-[#6d7a77] pt-1">
                        <span>30 Days Ago (72 Index)</span>
                        <span>Day 15 (77 Index)</span>
                        <span className="font-bold text-[#00685f]">
                          Now ({currentWaterIndex} Index)
                        </span>
                      </div>

                      {/* Mandated 'Simulated Data' Badge in Chart Footer (Prompt 5.1.2) */}
                      <div className="pt-2 border-t border-[#eae8e5] flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-[#eae8e5] text-[#3d4947] border border-[#bcc9c6]">
                          Simulated Data
                        </span>
                        <span className="text-[#6d7a77]">Realtime SPCB Sensor Feed</span>
                      </div>
                    </div>

                    {/* Edge Telemetry & Field Stream 3-Photo Grid (Prompt 5.1.2) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider">
                          Edge Telemetry &amp; Field Stream
                        </h3>
                        <span className="text-[11px] text-[#00685f] font-bold">
                          {waterReadings.length} Submissions
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {waterReadings.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id || idx}
                            onClick={() => setActivePhotoPreview(item.photo_url || '')}
                            className="relative rounded-xl overflow-hidden h-20 group border border-[#eae8e5] cursor-pointer"
                          >
                            <img
                              src={item.photo_url || BASELINE_WATER_READINGS[idx % 3].photo_url}
                              alt={item.location}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold truncate max-w-[90%]">
                              {item.location.replace('Agastya Lake ', '')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action CTAs (Prompt 5.1.2) */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      {/* Mandated: 'Log Water Reading' Button */}
                      <button
                        type="button"
                        onClick={() => setWaterModalOpen(true)}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">opacity</span>
                        <span>Log Water Reading</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage('Silt inspection report dispatched to Badami TMC.');
                          setToastType('success');
                          setToastVisible(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#f5f3f0] hover:bg-[#eae8e5] text-[#3d4947] text-xs font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                        <span>Report Silt</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COLUMN 3: CLEAN TRAIL & WASTE OPERATIONS (4 Cols) */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="rounded-3xl bg-white border border-[#eae8e5] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
                    {/* Panel Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#9a452c] uppercase tracking-wider">
                          Zero-Waste Sentinel
                        </span>
                        <h2 className="font-serif text-xl font-bold text-[#9a452c] tracking-tight mt-0.5">
                          Clean Trail &amp; Waste Operations
                        </h2>
                      </div>
                      <span className="material-symbols-outlined text-[#9a452c] text-[24px]">
                        delete_sweep
                      </span>
                    </div>

                    {/* Circular Gauge / Donut Metric Block (Prompt 5.1.3) */}
                    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5]">
                      {/* SVG Donut Chart 88% */}
                      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          {/* Background Track */}
                          <path
                            className="text-[#eae8e5]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                          />
                          {/* Progress Value 88% */}
                          <path
                            className="text-[#00685f]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${lntMetrics.score}, 100`}
                            strokeLinecap="round"
                            strokeWidth="3.5"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="font-serif text-xl font-bold text-[#1b1c1a] leading-none">
                            {lntMetrics.score}
                          </span>
                          <span className="text-[10px] text-[#6d7a77] uppercase font-bold">/100</span>
                        </div>
                      </div>

                      {/* Breakdown metrics */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1b1c1a]">
                            Leave-No-Trace Score
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#00685f]/10 text-[#00685f] text-[10px] font-bold">
                            {lntMetrics.grade}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-[11px] text-[#3d4947] mt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span>Plastic-Free Zone:</span>
                            <span className="font-bold text-[#1b1c1a]">
                              {lntMetrics.plastic_free_percent}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Composting Compliance:</span>
                            <span className="font-bold text-[#1b1c1a]">
                              {lntMetrics.composting_compliance_percent}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Can Proximity (&lt;50m):</span>
                            <span className="font-bold text-[#1b1c1a]">
                              {lntMetrics.can_proximity_percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Regional Trail Hotspots (Prompt 5.1.3) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider">
                          Regional Trail Hotspots
                        </h3>
                        <span className="text-[11px] font-bold text-[#9a452c]">Live GIS Overlay</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {hotspots.map((hs) => (
                          <div
                            key={hs.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5f3f0] border border-[#eae8e5]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  hs.status_color === 'error'
                                    ? 'bg-[#ba1a1a]'
                                    : hs.status_color === 'secondary'
                                    ? 'bg-[#9a452c]'
                                    : 'bg-[#00685f]'
                                }`}
                              />
                              <div className="flex flex-col truncate">
                                <span className="text-xs font-semibold text-[#1b1c1a] truncate">
                                  {hs.name}
                                </span>
                                <span className="text-[10px] text-[#6d7a77]">
                                  {hs.pressure_label}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[11px] font-bold shrink-0 ${
                                hs.status === 'Cleared'
                                  ? 'text-[#00685f]'
                                  : hs.status === 'Optimal'
                                  ? 'text-[#00685f]'
                                  : 'text-[#9a452c]'
                              }`}
                            >
                              {hs.cleared_ago || hs.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Before & After Comparison Slider (Prompt 5.1.3) */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#eae8e5]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider">
                          Eco-Sena Verified Removals
                        </h3>
                        <span className="text-[11px] text-[#6d7a77]">Interactive Slider</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#9a452c]">{ecoRemoval.location}</span>
                          <span className="text-[11px] text-[#6d7a77]">{ecoRemoval.timestamp}</span>
                        </div>

                        {/* The Mandated Interactive Before/After Slider */}
                        <BeforeAfterSlider
                          beforeImage={ecoRemoval.before_img}
                          afterImage={ecoRemoval.after_img}
                          beforeLabel="BEFORE"
                          afterLabel="RESOLVED"
                          beforeAlt="Before cleanup litter debris"
                          afterAlt="After cleanup spotless sandstone"
                          className="h-44 w-full"
                        />

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-[#3d4947]">{ecoRemoval.before_debris}</span>
                          <span className="font-bold text-[#00685f]">
                            {ecoRemoval.resolved_by}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mandated Action: 'Submit Cleanup Proof' (Prompt 5.1.3) */}
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setCleanupModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#9a452c] hover:bg-[#7b2e17] text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          verified
                        </span>
                        <span>Submit Cleanup Proof (AI Verify)</span>
                      </button>
                    </div>

                    {/* Bottom CTA Link */}
                    <div className="pt-2 border-t border-[#eae8e5] flex items-center justify-between text-xs">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setToastMessage('Signed up for Saturday 6:30 AM Eco-Sena Trail Drive!');
                          setToastType('success');
                          setToastVisible(true);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-[#00685f] hover:underline"
                      >
                        <span>Join Weekend Clean Trail Drive</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </a>
                      <span className="text-[11px] text-[#6d7a77]">Next: Sat 6:30 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================== */}
          {/* TECHNICAL VERIFICATION / BOTTOM BAR */}
          {/* =================================================================== */}
          <section className="w-full bg-[#efeeeb] py-4 border-t border-[#eae8e5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-[#3d4947]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]" />
                <span>
                  Karnataka State Pollution Control Board &amp; ASI Environmental Division Integration Grid.
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#6d7a77] text-[11px]">
                <span className="font-mono">Cycle Hash: #MALA-8849-BGL</span>
                <span className="font-bold text-[#00685f]">Simulated Data for Civic Demonstration</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Photo Preview Modal */}
      {activePhotoPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActivePhotoPreview(null)}
        >
          <div className="max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl relative bg-black">
            <img
              src={activePhotoPreview}
              alt="High resolution field evidence"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Log Water Reading Modal (Prompt 5.1.2) */}
      <LogWaterReadingModal
        isOpen={waterModalOpen}
        onClose={() => setWaterModalOpen(false)}
        onReadingLogged={handleReadingLogged}
      />

      {/* Submit Cleanup Proof Modal (Prompt 5.1.3) */}
      <SubmitCleanupProofModal
        isOpen={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
        onCleanupVerified={handleCleanupVerified}
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

      {/* Global Report Issue Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* Global Ollama Chat Modal */}
      <OllamaChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />
    </div>
  );
}

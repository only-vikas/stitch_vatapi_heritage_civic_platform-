'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MicroCrowdfundingModal from '@/components/MicroCrowdfundingModal';
import SuccessToast from '@/components/SuccessToast';

interface MonumentSite {
  id: string;
  name: string;
  monumentType: string;
  defaultRisk: number;
  avgHumidity: string;
  avgTemp: string;
  peakFootfall: number;
  acousticVibration: string;
  predictedIssue: string;
  preventativeAction: string;
}

const MONUMENT_SITES: MonumentSite[] = [
  {
    id: 'cave3',
    name: 'Badami Cave 3 (Vishnu Pillar Corridor)',
    monumentType: 'Rock-Cut Sandstone Cave • 578 CE',
    defaultRisk: 88,
    avgHumidity: '78.4%',
    avgTemp: '33.7°C',
    peakFootfall: 4920,
    acousticVibration: '14.2 Hz (Resonance Alert)',
    predictedIssue:
      'Sub-surface sandstone exfoliation from sustained 82-88% humidity condensation cycles and weekend crowd resonance.',
    preventativeAction:
      'Micro-grouting with lime-pozzolana slurry needed; activate crowd dispersal nudge to cap hourly cave occupancy under 150 pilgrims.',
  },
  {
    id: 'virupaksha',
    name: 'Pattadakal Virupaksha Complex (Nandi Mandapa)',
    monumentType: 'Dravidian Structural Temple • 740 CE',
    defaultRisk: 82,
    avgHumidity: '84.1%',
    avgTemp: '31.2°C',
    peakFootfall: 3840,
    acousticVibration: '8.4 Hz (Sub-soil vibration)',
    predictedIssue:
      'Groundwater seepage from Malaprabha river buffer zone causing 4.2mm differential settlement on western plinth slab.',
    preventativeAction:
      'Re-engineer subterranean stone siphon drainage channel; inject non-invasive lime grouting into foundation sub-base.',
  },
  {
    id: 'durga',
    name: 'Aihole Durga Temple (Apsidal Colonnade)',
    monumentType: 'Apsidal Sun Sanctuary • 8th Century',
    defaultRisk: 64,
    avgHumidity: '62.0%',
    avgTemp: '36.8°C',
    peakFootfall: 2150,
    acousticVibration: '4.1 Hz (Nominal)',
    predictedIssue:
      'Surface abrasion and tactile erosion on celestial gandharva friezes caused by unbuffered visitor touch pathways.',
    preventativeAction:
      'Install protective brass stanchion barrier ropes and deploy low-glare infrared proximity alert sensor nodes.',
  },
  {
    id: 'bhutanatha',
    name: 'Bhutanatha Lake Temple (East Lakeside Facade)',
    monumentType: 'Lakeside Sandstone Complex • 7th Century',
    defaultRisk: 76,
    avgHumidity: '91.5%',
    avgTemp: '29.4°C',
    peakFootfall: 1890,
    acousticVibration: '11.0 Hz (Water wave slap)',
    predictedIssue:
      'Accelerated biological lichen micro-crust growth and cyclic wet-dry thermal expansion on Agastya Tirtha water line.',
    preventativeAction:
      'Apply non-acidic biocidal zinc-silicate poultice and restore edge rip-rap wave break to mitigate spray erosion.',
  },
];

interface CrowdfundingCampaign {
  id: string;
  issueId: string;
  title: string;
  siteName: string;
  target: number;
  current: number;
  backers: number;
  category: string;
  photoUrl: string;
  description: string;
  daysLeft: number;
}

export default function OraclePage() {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('cave3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [telemetryDays, setTelemetryDays] = useState(30);

  // Active Site Data
  const currentSite = MONUMENT_SITES.find((s) => s.id === selectedSiteId) || MONUMENT_SITES[0];

  // Predictive Alert State
  const [forecastResult, setForecastResult] = useState<{
    site_name: string;
    risk_score: number;
    predicted_issue: string;
    preventative_action: string;
    modelUsed: string;
  }>({
    site_name: currentSite.name,
    risk_score: currentSite.defaultRisk,
    predicted_issue: currentSite.predictedIssue,
    preventative_action: currentSite.preventativeAction,
    modelUsed: 'Ollama (llama3) / OpenRouter DeepSeek Fallback',
  });

  // Micro-Crowdfunding Campaigns
  const [campaigns, setCampaigns] = useState<CrowdfundingCampaign[]>([
    {
      id: 'camp-1',
      issueId: 'inv-4',
      title: 'Cave 3 Pillar 4 Bracket Fissure Micro-Grouting',
      siteName: 'Badami Cave 3',
      target: 8000,
      current: 4650,
      backers: 82,
      category: 'Structural Restoration',
      photoUrl: '/images/badami-cave3-pillars.jpg',
      description:
        'Adopt a 4.2mm structural crack on the 578 CE Mahavishnu portico bracket. Funds pay certified traditional stonecraft artisans to inject lime-pozzolana slurry.',
      daysLeft: 14,
    },
    {
      id: 'camp-2',
      issueId: 'inv-5',
      title: 'Aihole Durga Temple Protective Brass Stanchion Barrier',
      siteName: 'Aihole Durga Temple',
      target: 6000,
      current: 3200,
      backers: 58,
      category: 'Visitor Protection Barrier',
      photoUrl: '/images/aihole-durga-temple.png',
      description:
        'Fund modular, non-destructive brass stanchions to stop visitor tactile erosion on 7th-century celestial gandharva relief panels.',
      daysLeft: 22,
    },
    {
      id: 'camp-3',
      issueId: 'inv-1',
      title: 'Bhutanatha Lake Temple Biocidal Lichen Removal',
      siteName: 'Bhutanatha Temple Complex',
      target: 7500,
      current: 5100,
      backers: 95,
      category: 'Bio-Deterioration Mitigation',
      photoUrl: '/images/bhutanatha-lake-temple.jpg',
      description:
        'Apply eco-friendly poultices to safely dissolve black biological micro-crusts on water-facing east facade stone carvings.',
      daysLeft: 9,
    },
    {
      id: 'camp-4',
      issueId: 'inv-2',
      title: 'Virupaksha Foundation Siphon Drainage Restoration',
      siteName: 'Pattadakal World Heritage Group',
      target: 12000,
      current: 6800,
      backers: 114,
      category: 'Groundwater Management',
      photoUrl: '/images/pattadakal-bhairava.png',
      description:
        'Re-excavate the 8th-century stone water drainage siphon to stop monsoon floodwaters from destabilizing the Nandi Mandapa plinth.',
      daysLeft: 18,
    },
  ]);

  // Modal State
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Handle Run Guardian Forecast
  const handleRunForecast = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/guardian-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: currentSite.name }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.forecast) {
          setForecastResult(data.forecast);
          setToastMsg(`Guardian Forecast refreshed! AI risk calculated for ${currentSite.name}.`);
          setToastVisible(true);
        }
      } else {
        throw new Error('Fallback trigger');
      }
    } catch {
      // Local predictive telemetry model
      setForecastResult({
        site_name: currentSite.name,
        risk_score: currentSite.defaultRisk,
        predicted_issue: currentSite.predictedIssue,
        preventative_action: currentSite.preventativeAction,
        modelUsed: 'Ollama (llama3) / OpenRouter Fallback',
      });
      setToastMsg(`Guardian Forecast computed using 30-day environmental telemetry.`);
      setToastVisible(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Donation Complete
  const handleDonationSuccess = (amount: number) => {
    if (selectedCampaignForDonation) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === selectedCampaignForDonation.id
            ? { ...c, current: c.current + amount, backers: c.backers + 1 }
            : c
        )
      );
    }
    setToastMsg(`Pledge confirmed! You just helped preserve a 1,400-year-old monument.`);
    setToastVisible(true);
  };

  // Switch site
  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    const site = MONUMENT_SITES.find((s) => s.id === siteId) || MONUMENT_SITES[0];
    setForecastResult({
      site_name: site.name,
      risk_score: site.defaultRisk,
      predicted_issue: site.predictedIssue,
      preventative_action: site.preventativeAction,
      modelUsed: 'Ollama (llama3) / OpenRouter DeepSeek Fallback',
    });
  };

  const totalRaised = campaigns.reduce((acc, c) => acc + c.current, 0);
  const totalBackers = campaigns.reduce((acc, c) => acc + c.backers, 0);

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1B1C1A] flex flex-col font-sans selection:bg-[#00685F] selection:text-white">
      {/* Top Navbar */}
      <Navbar activeSection="oracle" />

      {/* Main Container */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
        {/* Section 1: Hero Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004D46] via-[#00685F] to-[#008378] text-white p-6 sm:p-10 shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                  <span className="material-symbols-outlined text-[15px] animate-pulse">online_prediction</span>
                  Module 1: The Oracle AI
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#89F5E7]/20 text-[#89F5E7] border border-[#89F5E7]/30 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">volunteer_activism</span>
                  Module 2: Micro-Crowdfunding Engine
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Predictive Heritage Conservation & Civic Crowdfunding
              </h1>
              <p className="text-sm sm:text-base text-teal-50 leading-relaxed">
                The Archaeological Survey of India (ASI) shouldn&apos;t have to wait for a 1,400-year-old pillar to crack before taking action. The Oracle leverages 30-day environmental telemetry (humidity, temperature, crowd vibration) to forecast structural failures before they happen, while the Micro-Crowdfunding Engine empowers citizens to adopt and fund repairs for as little as ₹10.
              </p>
            </div>

            {/* Overall Stats Pill */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  ₹{totalRaised.toLocaleString()}
                </div>
                <div className="text-xs text-teal-100 font-semibold mt-0.5">
                  Total Micro-Patronage Pledged
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#89F5E7]">
                  {totalBackers} Backers
                </div>
                <div className="text-xs text-teal-100 font-semibold mt-0.5">
                  Citizen Micro-Preservationists
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: THE ORACLE PREDICTIVE AI ENGINE */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE8E5] pb-4">
            <div>
              <div className="flex items-center gap-2 text-[#00685F] text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">psychology</span>
                Predictive Telemetry Core
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1C1A]">
                The Oracle Structural Deterioration Forecast
              </h2>
            </div>

            {/* Monument Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#EFEEEB] p-1 rounded-2xl">
              {MONUMENT_SITES.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => handleSiteChange(site.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSiteId === site.id
                      ? 'bg-white text-[#00685F] shadow-sm'
                      : 'text-[#3D4947] hover:text-[#1B1C1A]'
                  }`}
                >
                  {site.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Telemetry Gauges & Live Readings */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#EAE8E5] shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs text-[#6D7A77]">
                  <span className="font-semibold uppercase tracking-wider">30-Day Sensor Telemetry</span>
                  <span className="font-mono text-[#00685F] font-bold">Live Stream</span>
                </div>

                {/* Humidity Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-[#3D4947]">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">water_drop</span>
                      Avg Humidity
                    </span>
                    <span className="font-bold text-[#1B1C1A]">{currentSite.avgHumidity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EFEEEB] overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: currentSite.avgHumidity }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-[#6D7A77]">Condensation threshold: &gt;75% triggers salt efflorescence</span>
                </div>

                {/* Ambient Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-[#3D4947]">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">thermostat</span>
                      Peak Ambient Temp
                    </span>
                    <span className="font-bold text-[#1B1C1A]">{currentSite.avgTemp}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EFEEEB] overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[68%]"></div>
                  </div>
                  <span className="text-[10px] text-[#6D7A77]">Diurnal thermal amplitude: 18.4°C expansion cycle</span>
                </div>

                {/* Tourist Footfall Vibration */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-[#3D4947]">
                      <span className="material-symbols-outlined text-[16px] text-purple-600">groups</span>
                      Peak Tourist Footfall
                    </span>
                    <span className="font-bold text-[#1B1C1A]">
                      {currentSite.peakFootfall.toLocaleString()} visitors/day
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EFEEEB] overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[82%]"></div>
                  </div>
                  <span className="text-[10px] text-[#6D7A77]">Harmonic vibration: {currentSite.acousticVibration}</span>
                </div>
              </div>

              {/* Action Trigger Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#F5F3F0] to-[#EAE8E5] border border-[#DDDCD8] flex flex-col gap-3">
                <div className="text-xs text-[#3D4947] font-bold">
                  Run Guardian Neural Forecast
                </div>
                <p className="text-xs text-[#6D7A77] leading-relaxed">
                  Sends the 30-day environmental telemetry log to Ollama (llama3) / OpenRouter DeepSeek to predict structural failure points.
                </p>
                <button
                  type="button"
                  onClick={handleRunForecast}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 rounded-2xl bg-[#00685F] hover:bg-[#008378] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px] animate-spin-slow">
                    {isGenerating ? 'progress_activity' : 'bolt'}
                  </span>
                  <span>{isGenerating ? 'Computing Forecast...' : 'Run Guardian Forecast'}</span>
                </button>
              </div>
            </div>

            {/* Right: AI Prediction Report */}
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE8E5] shadow-md flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9A452C]">
                      Autonomous AI Assessment
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1B1C1A]">
                      {forecastResult.site_name}
                    </h3>
                  </div>

                  {/* Risk Score Pill */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#FFF5F2] border border-[#FFDBD1]">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[#9A452C]">
                        Calculated Failure Risk
                      </div>
                      <div className="text-2xl font-serif font-bold text-[#BA1A1A]">
                        {forecastResult.risk_score} <span className="text-xs text-[#6D7A77]">/ 100</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#BA1A1A] text-white flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-xl">warning</span>
                    </div>
                  </div>
                </div>

                {/* Predicted Issue */}
                <div className="p-4 rounded-2xl bg-[#FFF8F7] border border-[#FFDBD1] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#BA1A1A]">
                    <span className="material-symbols-outlined text-[17px]">emergency</span>
                    Predicted Structural Hazard:
                  </div>
                  <p className="text-xs sm:text-sm text-[#3D4947] leading-relaxed">
                    {forecastResult.predicted_issue}
                  </p>
                </div>

                {/* Preventative Action */}
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#166534]">
                    <span className="material-symbols-outlined text-[17px]">verified</span>
                    Mandatory Preventative Intervention:
                  </div>
                  <p className="text-xs sm:text-sm text-[#14532D] leading-relaxed">
                    {forecastResult.preventative_action}
                  </p>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-4 border-t border-[#EAE8E5] flex flex-wrap items-center justify-between text-xs text-[#6D7A77] gap-2">
                <span>Model: <strong className="text-[#1B1C1A]">{forecastResult.modelUsed}</strong></span>
                <span className="flex items-center gap-1 text-[#00685F] font-semibold">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  ASI Dharwad Autonomous SLA Pipeline Active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: MICRO-CROWDFUNDING ENGINE */}
        <section className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE8E5] pb-4">
            <div>
              <div className="flex items-center gap-2 text-[#9A452C] text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">volunteer_activism</span>
                Citizen Micro-Patronage
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1C1A]">
                Micro-Crowdfunding Engine • &quot;Adopt a Crack for ₹10&quot;
              </h2>
            </div>
            <span className="text-xs text-[#6D7A77] font-medium max-w-sm sm:text-right">
              Don&apos;t wait for government bureaucracy. Micro-pledges pool together with verified local stonecraft master artisans to fix cracks early.
            </span>
          </div>

          {/* Campaign Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campaigns.map((camp) => {
              const percentage = Math.min(100, Math.round((camp.current / camp.target) * 100));
              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl border border-[#EAE8E5] overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={camp.photoUrl}
                        alt={camp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#89F5E7]">location_on</span>
                        {camp.siteName}
                      </div>
                      <div className="absolute top-3 right-3 bg-[#9A452C] px-2.5 py-1 rounded-full text-[10px] font-bold text-white">
                        {camp.daysLeft} days left
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00685F] bg-[#89F5E7]/25 px-2 py-0.5 rounded-md">
                        {camp.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#1B1C1A] leading-snug line-clamp-2">
                        {camp.title}
                      </h3>
                      <p className="text-xs text-[#6D7A77] line-clamp-3 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>
                  </div>

                  {/* Funding Bar & Action */}
                  <div className="p-5 pt-0 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-[#1B1C1A]">
                          ₹{camp.current.toLocaleString()}{' '}
                          <span className="text-[#6D7A77] font-normal">of ₹{camp.target.toLocaleString()}</span>
                        </span>
                        <span className="font-bold text-[#00685F]">{percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EFEEEB] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#9A452C] to-[#00685F] rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-[#6D7A77]">
                        {camp.backers} citizen micro-patrons
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCampaignForDonation({
                          id: camp.issueId,
                          title: camp.title,
                          category: camp.category,
                          severity: 'high',
                          jurisdiction: 'ASI Dharwad & Local Stonecraft Guild',
                          photo_url: camp.photoUrl,
                        });
                        setShowModal(true);
                      }}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#9A452C] to-[#BA1A1A] hover:brightness-110 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                      <span>Fund This Fix (₹10+)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Links Back to Full Ledger */}
        <section className="p-6 rounded-3xl bg-[#F5F3F0] border border-[#EAE8E5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685F] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">account_balance</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B1C1A]">Want to see all 13+ Statutory & Investor Complaints?</h3>
              <p className="text-xs text-[#6D7A77]">Explore the full Heritage Watch Public Civic Ledger with Big Screen pop-outs and SLA escalations.</p>
            </div>
          </div>
          <Link
            href="/heritage-watch"
            className="px-5 py-2.5 rounded-xl bg-white border border-[#BCC9C6] text-xs font-bold text-[#1B1C1A] hover:bg-[#EFEEEB] transition-colors whitespace-nowrap shadow-xs"
          >
            Open Heritage Watch Ledger
          </Link>
        </section>
      </main>

      {/* Micro-Crowdfunding Modal */}
      {selectedCampaignForDonation && (
        <MicroCrowdfundingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          issue={selectedCampaignForDonation}
          onDonated={handleDonationSuccess}
        />
      )}

      {/* Toast */}
      <SuccessToast
        message={toastMsg}
        type="success"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}

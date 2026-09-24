'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ReportIssueModal from '@/components/ReportIssueModal';
import OllamaChatModal from '@/components/OllamaChatModal';
import SuccessToast from '@/components/SuccessToast';
import { supabase } from '@/lib/supabaseClient';
import {
  WeaverProfile,
  ArtisanProduct,
  ProvenanceStep,
  BASELINE_WEAVERS,
  DEFAULT_SUGGESTED_PRODUCTS,
  FAIR_PRICE_SEGMENTS,
} from '@/lib/weavers';

export default function WeaversPage() {
  // Navigation & Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);
  const [selectedWeaverForProvenance, setSelectedWeaverForProvenance] = useState<WeaverProfile>(
    BASELINE_WEAVERS[0]
  );

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Weavers Data State (from Supabase)
  const [weavers, setWeavers] = useState<WeaverProfile[]>(BASELINE_WEAVERS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loadingWeavers, setLoadingWeavers] = useState<boolean>(true);

  // Chitra-Sutra AI & Canvas State
  const [selectedMotifUrl, setSelectedMotifUrl] = useState<string>('/images/badami_rock_cut.png');
  const [motifName, setMotifName] = useState<string>('Badami Cave 1 Nataraja Flying Gandharva');
  const [motifCode, setMotifCode] = useState<string>('#CHALUKYA-89');
  const [products, setProducts] = useState<ArtisanProduct[]>(DEFAULT_SUGGESTED_PRODUCTS);
  const [selectedProductForPreview, setSelectedProductForPreview] = useState<ArtisanProduct>(
    DEFAULT_SUGGESTED_PRODUCTS[0]
  );
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState<boolean>(false);
  const [activePreviewProduct, setActivePreviewProduct] = useState<string>('prod-stole');

  // Interactive Fair Price Breakdown State
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string>('wage'); // default hover on wage

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------------------------
  // 1. Fetch Weavers from Supabase
  // ----------------------------------------------------------------------
  useEffect(() => {
    async function loadWeavers() {
      setLoadingWeavers(true);
      try {
        const { data, error } = await supabase.from('weavers').select('*');

        if (!error && data && data.length > 0) {
          // Merge with baseline to retain rich provenance timeline
          const enriched = data.map((d: any, index: number) => {
            const fallback = BASELINE_WEAVERS[index % BASELINE_WEAVERS.length];
            return {
              id: d.id || fallback.id,
              name: d.name || fallback.name,
              specialty: d.specialty || fallback.specialty,
              gi_verified: d.gi_verified ?? true, // required gi_verified boolean
              location: d.location || fallback.location,
              experience_years: d.experience_years || fallback.experience_years,
              loom_type: d.loom_type || fallback.loom_type,
              photo_url: d.photo_url || fallback.photo_url,
              rating: fallback.rating,
              visits_count: fallback.visits_count,
              open_slots: fallback.open_slots,
              provenance_timeline: fallback.provenance_timeline,
              blockchain_contract: fallback.blockchain_contract,
            };
          });
          setWeavers(enriched);
        } else {
          setWeavers(BASELINE_WEAVERS);
        }
      } catch (err) {
        console.warn('Using baseline weavers:', err);
        setWeavers(BASELINE_WEAVERS);
      } finally {
        setLoadingWeavers(false);
      }
    }

    loadWeavers();
  }, []);

  // ----------------------------------------------------------------------
  // 2. HTML5 Canvas: Overlay Motif onto Flat Lay Stole Mockup
  // ----------------------------------------------------------------------
  const renderCanvasPreview = (motifSrc: string, product: ArtisanProduct) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = '/images/stole_flatlay_mockup.jpg';

    baseImg.onload = () => {
      // Set canvas dimension matching container aspect ratio
      canvas.width = 800;
      canvas.height = 540;

      // Draw flat lay silk stole base
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      // Now load and composite the motif
      const motifImg = new Image();
      motifImg.crossOrigin = 'anonymous';
      motifImg.src = motifSrc;

      motifImg.onload = () => {
        // Draw centered motif placement on stole
        const motifW = 260;
        const motifH = 260;
        const motifX = (canvas.width - motifW) / 2;
        const motifY = (canvas.height - motifH) / 2 - 10;

        ctx.save();

        // Subtle shadow behind embroidered patch
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        // Circular or rounded clipping for artisanal medallion
        ctx.beginPath();
        ctx.arc(motifX + motifW / 2, motifY + motifH / 2, motifW / 2 - 8, 0, Math.PI * 2);
        ctx.clip();

        // Draw motif
        ctx.globalAlpha = 0.88;
        ctx.drawImage(motifImg, motifX, motifY, motifW, motifH);

        // Gold Zari thread overlay tint
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = '#f59e0b'; // golden zari hue
        ctx.fillRect(motifX, motifY, motifW, motifH);

        ctx.restore();

        // Draw Decorative Gold Zari Embroidered Ring around motif
        ctx.save();
        ctx.beginPath();
        ctx.arc(motifX + motifW / 2, motifY + motifH / 2, motifW / 2 - 8, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 6;
        ctx.stroke();

        // Inner dashed ring mimicking fine hand-stitch
        ctx.beginPath();
        ctx.arc(motifX + motifW / 2, motifY + motifH / 2, motifW / 2 - 14, 0, Math.PI * 2);
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fef3c7';
        ctx.stroke();

        ctx.restore();

        // Draw telemetry label badge on bottom left of canvas
        ctx.save();
        ctx.fillStyle = 'rgba(27, 28, 26, 0.82)';
        ctx.roundRect(24, canvas.height - 54, 380, 36, 8);
        ctx.fill();

        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#89f5e7';
        ctx.fillText('CHITRA-SUTRA CAD LIVE MOCKUP', 38, canvas.height - 35);

        ctx.font = 'normal 11px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`• ${product.product_name} • 120 Ends/Inch`, 225, canvas.height - 35);
        ctx.restore();
      };
    };
  };

  // Re-render canvas when motif or selected product changes
  useEffect(() => {
    renderCanvasPreview(selectedMotifUrl, selectedProductForPreview);
  }, [selectedMotifUrl, selectedProductForPreview]);

  // ----------------------------------------------------------------------
  // 3. Handle Motif Upload / Replacement
  // ----------------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedMotifUrl(url);
      setMotifName(file.name.replace(/\.[^/.]+$/, ''));
      setMotifCode('#CUSTOM-MOTIF');
      triggerOllamaSuggestions(file.name);
      setToastMessage('Custom motif loaded into Chitra-Sutra Canvas!');
      setToastType('success');
      setToastVisible(true);
    }
  };

  const handleSelectPresetMotif = (url: string, name: string, code: string) => {
    setSelectedMotifUrl(url);
    setMotifName(name);
    setMotifCode(code);
    triggerOllamaSuggestions(name);
    setToastMessage(`Selected: ${name}`);
    setToastType('success');
    setToastVisible(true);
  };

  // ----------------------------------------------------------------------
  // 4. Trigger Ollama Product Suggestions (Prompt 4.3.1)
  // ----------------------------------------------------------------------
  const triggerOllamaSuggestions = async (motifTitle: string) => {
    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch('/api/weaver-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motifTitle }),
      });

      const data = await response.json();
      if (data.success && data.products && data.products.length > 0) {
        setProducts(data.products);
        setSelectedProductForPreview(data.products[0]);
        setActivePreviewProduct(data.products[0].id);
      }
    } catch (err) {
      console.warn('Ollama suggestion fallback:', err);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // ----------------------------------------------------------------------
  // 5. Filter Weavers
  // ----------------------------------------------------------------------
  const filteredWeavers = weavers.filter((w) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'khana') return w.specialty.toLowerCase().includes('khana');
    if (activeFilter === 'ilkal') return w.location.toLowerCase().includes('ilkal') || w.specialty.toLowerCase().includes('ilkal');
    if (activeFilter === 'indigo') return w.specialty.toLowerCase().includes('indigo') || w.specialty.toLowerCase().includes('terracotta');
    return true;
  });

  const activeFairSegment =
    FAIR_PRICE_SEGMENTS.find((s) => s.id === hoveredSegmentId) || FAIR_PRICE_SEGMENTS[0];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] antialiased selection:bg-[#00685f]/20">
      {/* Navigation */}
      <Navbar
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenChatModal={() => setChatModalOpen(true)}
        activeSection="weavers"
      />

      {/* Main Container */}
      <main className="pt-24 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* =================================================================== */}
        {/* SECTION 1: MASTER WEAVERS PROFILE GRID (Prompt 4.3.1) */}
        {/* =================================================================== */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#eae8e5] mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-[#9a452c] tracking-widest uppercase">
                Verified Pit-Loom Keepers • Direct GI Marketplace
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1b1c1a] tracking-tight mt-1">
                Master Weavers of the Malaprabha Basin
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#6d7a77] leading-relaxed">
                Connect directly with certified handloom artisans. Trace the journey from cocoon to loom, book authentic studio visits, and commission custom yardage with zero intermediaries.
              </p>
            </div>

            {/* Active Looms Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#eae8e5] shadow-xs text-xs font-semibold text-[#1b1c1a] shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] animate-pulse" />
              <span>18 Looms Actively Hosting Today</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-6">
            {[
              { id: 'all', label: 'All Clusters', icon: 'apps' },
              { id: 'khana', label: 'Guledgudda Khana', icon: 'checkroom' },
              { id: 'ilkal', label: 'Ilkal Kasuti Borders', icon: 'texture' },
              { id: 'indigo', label: 'Natural Indigo Vats', icon: 'palette' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-[#9a452c] text-white shadow-xs'
                    : 'bg-[#efeeeb] text-[#3d4947] hover:bg-[#eae8e5]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 3-Column Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeavers.map((weaver) => (
              <article
                key={weaver.id}
                className="bg-white rounded-3xl border border-[#eae8e5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1 duration-300"
              >
                <div>
                  {/* Image with GI Verified Badge */}
                  <div className="relative h-60 w-full overflow-hidden bg-[#efeeeb]">
                    <img
                      src={weaver.photo_url}
                      alt={weaver.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Teal GI Verified Badge (Mandated by Prompt 4.3.1) */}
                    {weaver.gi_verified && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#00685f] text-white flex items-center gap-1 text-xs font-bold shadow-md">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>GI Verified</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium">
                      Cluster: {weaver.location}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9a452c] uppercase tracking-wider">
                        {weaver.specialty}
                      </span>
                      <span className="text-xs font-bold text-[#1b1c1a] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px] text-amber-500 fill">
                          star
                        </span>
                        {weaver.rating} ({weaver.visits_count} visits)
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#1b1c1a]">
                      {weaver.name}
                    </h3>
                    <p className="text-xs text-[#6d7a77]">
                      {weaver.experience_years} Years Master • {weaver.loom_type}
                    </p>

                    <div className="mt-2 pt-2.5 border-t border-[#eae8e5] space-y-1.5 text-xs text-[#3d4947]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#00685f]">
                          schedule
                        </span>
                        <span className="font-semibold text-[#00685f]">{weaver.open_slots}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Book Visit + Provenance QR Button (Prompt 4.3.2) */}
                <div className="p-5 pt-0 flex flex-col gap-2">
                  {/* Scan Provenance QR Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWeaverForProvenance(weaver);
                      setProvenanceModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#efeeeb] hover:bg-[#eae8e5] text-[#1b1c1a] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#bcc9c6]/40"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                      qr_code_scanner
                    </span>
                    <span>Scan Provenance QR</span>
                  </button>

                  {/* Book Loom Visit */}
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`Studio visit requested with ${weaver.name}!`);
                      setToastType('success');
                      setToastVisible(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>Book Loom Visit</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 2: CHITRA-SUTRA AI - INTERACTIVE CANVAS (Prompt 4.3.1) */}
        {/* =================================================================== */}
        <section className="mb-16 bg-white rounded-3xl border border-[#eae8e5] p-6 sm:p-8 lg:p-10 shadow-xs">
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#eae8e5] mb-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00685f]/10 text-[#00685f] text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                Chitra-Sutra AI • Neural Motif Transmutation
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b1c1a] tracking-tight">
                Motif-to-Loom Translation &amp; Interactive Canvas
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#6d7a77] leading-relaxed">
                Capture a Chalukya rock-cut relief from Badami or Pattadakal. The neural pipeline adapts the carvings into warp/weft matrices and renders live composited previews on handwoven silk stoles.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#efeeeb] text-xs font-semibold text-[#1b1c1a] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#00685f]" />
              <span>Chitra-Sutra-v2.4 (Fine-tuned on 1,400 Chalukya Steles)</span>
            </div>
          </div>

          {/* Interactive Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 Cols: Motif Selector & Interactive HTML5 Canvas Preview */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              {/* Canvas Container */}
              <div className="bg-[#fbf9f6] rounded-2xl border border-[#eae8e5] p-4 shadow-inner flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 border-b border-[#eae8e5] text-xs">
                  <span className="font-bold text-[#1b1c1a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-[#00685f]">
                      layers
                    </span>
                    Interactive Silk Stole Canvas
                  </span>
                  <span className="text-[#6d7a77]">HTML5 Composited Mockup</span>
                </div>

                {/* The HTML5 Canvas */}
                <div className="mt-3 w-full rounded-xl overflow-hidden border border-[#bcc9c6]/50 shadow-md bg-stone-100 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto max-h-[360px] object-contain block"
                  />
                </div>

                {/* Canvas Controls */}
                <div className="w-full mt-3 flex items-center justify-between text-xs text-[#6d7a77]">
                  <span>Active Preview: <strong>{selectedProductForPreview.product_name}</strong></span>
                  <span className="text-[#00685f] font-semibold">Gold Zari Filigree Applied</span>
                </div>
              </div>

              {/* Active Motif Selector / Upload Box */}
              <div className="p-4 rounded-2xl bg-[#fbf9f6] border border-[#eae8e5] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider">
                    Select or Upload Badami Relief Motif
                  </h4>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#00685f] hover:underline"
                  >
                    <span className="material-symbols-outlined text-[15px]">upload_file</span>
                    Upload Custom Motif
                  </button>
                </div>

                {/* Preset Motif Thumbnails */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPresetMotif(
                        '/images/badami_rock_cut.png',
                        'Badami Cave 1 Nataraja Flying Gandharva',
                        '#CHALUKYA-89'
                      )
                    }
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMotifUrl.includes('badami_rock_cut')
                        ? 'border-[#00685f] bg-[#f4fffc] ring-2 ring-[#00685f]/20'
                        : 'border-[#eae8e5] bg-white hover:border-[#bcc9c6]'
                    }`}
                  >
                    <img
                      src="/images/badami_rock_cut.png"
                      alt="Cave 1 Nataraja"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#1b1c1a] truncate">
                        Cave 1 Gandharva
                      </div>
                      <div className="text-[10px] text-[#6d7a77]">#CHALUKYA-89</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPresetMotif(
                        '/images/badami_inscription_cave3.jpg',
                        'Badami Cave 3 Mangalesha Inscription (578 CE)',
                        '#EPIGRAPH-578'
                      )
                    }
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMotifUrl.includes('badami_inscription_cave3')
                        ? 'border-[#00685f] bg-[#f4fffc] ring-2 ring-[#00685f]/20'
                        : 'border-[#eae8e5] bg-white hover:border-[#bcc9c6]'
                    }`}
                  >
                    <img
                      src="/images/badami_inscription_cave3.jpg"
                      alt="Cave 3 Inscription"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#1b1c1a] truncate">
                        Cave 3 Epigraph
                      </div>
                      <div className="text-[10px] text-[#6d7a77]">#EPIGRAPH-578</div>
                    </div>
                  </button>
                </div>

                {/* Technical Loom Specifications */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eae8e5] text-xs">
                  <div className="p-2 rounded-xl bg-white border border-[#eae8e5]">
                    <span className="text-[10px] text-[#6d7a77] uppercase block font-semibold">
                      Computed Warp Density
                    </span>
                    <span className="font-bold text-[#1b1c1a]">120 Ends / Inch</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#eae8e5]">
                    <span className="text-[10px] text-[#6d7a77] uppercase block font-semibold">
                      Loom Compatibility
                    </span>
                    <span className="font-bold text-[#9a452c]">Khana 4-Shaft Pit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: AI Generated Tourist Products with "Preview on Product" */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#eae8e5]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1b1c1a]">
                    Suggested Tourist Products
                  </h3>
                  <p className="text-xs text-[#6d7a77]">
                    Generated by Ollama (LLaVA) based on active motif
                  </p>
                </div>
                {isGeneratingSuggestions && (
                  <span className="text-xs text-[#00685f] flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                    Analyzing...
                  </span>
                )}
              </div>

              {/* Product Cards */}
              <div className="space-y-3.5">
                {products.map((prod) => {
                  const isCurrentPreview = activePreviewProduct === prod.id;
                  return (
                    <div
                      key={prod.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center gap-4 ${
                        isCurrentPreview
                          ? 'border-[#00685f] bg-[#f4fffc] ring-2 ring-[#00685f]/20'
                          : 'border-[#eae8e5] bg-[#fbf9f6] hover:bg-white hover:border-[#bcc9c6]'
                      }`}
                    >
                      {/* Product Thumbnail */}
                      <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-stone-200 shrink-0 relative">
                        <img
                          src={prod.image_url}
                          alt={prod.product_name}
                          className="w-full h-full object-cover"
                        />
                        {prod.badge && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00685f] text-white">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      {/* Product Details & Actions */}
                      <div className="flex-1 flex flex-col justify-between w-full h-full gap-2">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-[#1b1c1a]">
                              {prod.product_name}
                            </h4>
                            <span className="font-serif text-base font-bold text-[#9a452c]">
                              ₹{prod.estimated_price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-[#6d7a77] line-clamp-2 mt-0.5">
                            {prod.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#eae8e5] flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-[#00685f] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">handshake</span>
                            ₹{prod.direct_wage.toLocaleString()} direct wage
                          </span>

                          {/* "Preview on Product" Button (Mandated by Prompt 4.3.1) */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForPreview(prod);
                              setActivePreviewProduct(prod.id);
                              renderCanvasPreview(selectedMotifUrl, prod);
                              setToastMessage(`Compositing motif onto ${prod.product_name}...`);
                              setToastType('success');
                              setToastVisible(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1 ${
                              isCurrentPreview
                                ? 'bg-[#00685f] text-white shadow-xs'
                                : 'bg-[#efeeeb] text-[#1b1c1a] hover:bg-[#eae8e5]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">preview</span>
                            <span>{isCurrentPreview ? 'Active on Canvas' : 'Preview on Product'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 3: FAIR-PRICE BREAKDOWN - INTERACTIVE CHART (Prompt 4.3.2) */}
        {/* =================================================================== */}
        <section className="bg-white rounded-3xl border border-[#eae8e5] p-6 sm:p-8 lg:p-10 shadow-xs">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#eae8e5] mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#00685f] font-semibold text-xs uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-[17px]">account_balance_wallet</span>
                Decentralized Heritage Ledger
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b1c1a] tracking-tight">
                Fair-Price Breakdown: Where Does Your ₹3,200 Go?
              </h2>
              <p className="text-xs sm:text-sm text-[#6d7a77] mt-0.5">
                Standard 2-meter Handspun Guledgudda Khana Stole purchased through Vatapi.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#fbf9f6] border border-[#eae8e5] text-xs shrink-0">
              <span className="material-symbols-outlined text-[18px] text-[#00685f]">lock</span>
              <span className="font-mono font-bold text-[#1b1c1a]">KT-HERITAGE-7890</span>
            </div>
          </div>

          {/* Interactive Horizontal Stacked Bar (Prompt 4.3.2) */}
          <div className="space-y-3">
            <div className="w-full h-10 rounded-2xl overflow-hidden flex bg-[#efeeeb] p-1 gap-1 border border-[#eae8e5] cursor-pointer">
              {FAIR_PRICE_SEGMENTS.map((segment) => {
                const isHovered = hoveredSegmentId === segment.id;
                return (
                  <div
                    key={segment.id}
                    onMouseEnter={() => setHoveredSegmentId(segment.id)}
                    onClick={() => setHoveredSegmentId(segment.id)}
                    style={{ width: `${segment.percentage}%` }}
                    className={`h-full rounded-xl flex items-center justify-center text-white text-xs font-bold transition-all duration-200 select-none ${
                      segment.colorClass
                    } ${isHovered ? 'ring-2 ring-black/40 scale-[1.02] shadow-md z-10' : 'opacity-95 hover:opacity-100'}`}
                  >
                    <span>{segment.percentage}%</span>
                  </div>
                );
              })}
            </div>

            {/* Segment Legend Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              {FAIR_PRICE_SEGMENTS.map((seg) => (
                <button
                  key={seg.id}
                  type="button"
                  onMouseEnter={() => setHoveredSegmentId(seg.id)}
                  onClick={() => setHoveredSegmentId(seg.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                    hoveredSegmentId === seg.id ? 'bg-[#efeeeb] font-bold text-[#1b1c1a]' : 'text-[#6d7a77]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: seg.bgHex }}
                  />
                  <span>
                    {seg.name} ({seg.percentage}%)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Interactive Tooltip Card (Highlighted on Hover) */}
          <div className="mt-6 p-5 rounded-2xl bg-[#f4fffc] border border-[#89f5e7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: activeFairSegment.bgHex }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {activeFairSegment.id === 'wage'
                    ? 'handshake'
                    : activeFairSegment.id === 'raw'
                    ? 'spa'
                    : activeFairSegment.id === 'cad'
                    ? 'memory'
                    : 'health_and_safety'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#1b1c1a]">
                    {activeFairSegment.name} ({activeFairSegment.percentage}%)
                  </h4>
                  <span className="font-serif text-base font-bold text-[#00685f]">
                    ₹{activeFairSegment.amount_inr}
                  </span>
                </div>
                {/* The required exact prompt tooltip text */}
                <p className="text-xs text-[#005049] font-medium mt-0.5">
                  &ldquo;{activeFairSegment.tooltip}&rdquo;
                </p>
                <p className="text-[11px] text-[#6d7a77] mt-1">
                  Impact: {activeFairSegment.impact}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-[#00685f] font-semibold bg-white px-2.5 py-1 rounded-md border border-[#89f5e7]/30">
                Instant UPI Escrow
              </span>
            </div>
          </div>

          {/* Chart Footer with Simulated Data Label (Prompt 4.3.2) */}
          <div className="mt-6 pt-4 border-t border-[#eae8e5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#6d7a77]">
            <div className="flex items-center gap-1.5">
              {/* Mandatory Simulated Data Label */}
              <span className="px-2 py-0.5 rounded-full font-bold bg-[#efeeeb] text-[#3d4947] border border-[#bcc9c6]">
                Simulated Data
              </span>
              <span>
                Based on Karnataka State Handloom Weavers Cooperative smart contract audited cost sheets.
              </span>
            </div>
            <span>Smart Contract #KT-HERITAGE-7890 • Polygon Mainnet</span>
          </div>
        </section>
      </main>

      {/* =================================================================== */}
      {/* PROVENANCE LEDGER TIMELINE MODAL (Prompt 4.3.2) */}
      {/* =================================================================== */}
      {provenanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#eae8e5] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 px-6 border-b border-[#eae8e5] flex items-center justify-between bg-[#fbf9f6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00685f] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1b1c1a]">
                      Silk Provenance Ledger
                    </h3>
                    {/* Mandatory Teal Verified on Blockchain Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#89f5e7]/30 text-[#00685f] border border-[#00685f]/20">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      Verified on Blockchain
                    </span>
                  </div>
                  <p className="text-xs text-[#6d7a77]">
                    Artisan: {selectedWeaverForProvenance.name} • {selectedWeaverForProvenance.location}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProvenanceModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#efeeeb] hover:bg-[#eae8e5] text-[#3d4947] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body: The 4-step Provenance Timeline */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* QR Verification Summary Card */}
              <div className="p-4 rounded-2xl bg-[#f4fffc] border border-[#89f5e7]/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#00685f] uppercase tracking-wider">
                    Provenance Chain ID
                  </div>
                  <div className="font-mono text-xs text-[#1b1c1a] font-bold">
                    {selectedWeaverForProvenance.blockchain_contract}
                  </div>
                  <div className="text-[11px] text-[#6d7a77]">
                    100% Traceable • Zero Middleman • GI Tag Protected
                  </div>
                </div>

                <div className="w-14 h-14 bg-white p-1 rounded-xl border border-[#eae8e5] shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[42px] text-[#1b1c1a]">qr_code</span>
                </div>
              </div>

              {/* 4-Step Journey Timeline */}
              <div className="relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#00685f]/30">
                {selectedWeaverForProvenance.provenance_timeline.map((step, sIdx) => (
                  <div key={sIdx} className="relative mb-6 last:mb-0">
                    {/* Milestone Dot */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#00685f] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      {sIdx + 1}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#fbf9f6] border border-[#eae8e5] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#9a452c] uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">{step.icon}</span>
                          {step.stage}
                        </span>
                        <span className="font-mono text-[10px] text-[#00685f] font-semibold">
                          Tx: {step.txHash}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#1b1c1a]">{step.location}</div>
                      <p className="text-xs text-[#3d4947] leading-relaxed">{step.details}</p>

                      <div className="pt-1.5 border-t border-[#eae8e5] flex justify-between text-[10px] text-[#6d7a77]">
                        <span>Operator: {step.operator}</span>
                        <span>{step.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastVisible && (
        <SuccessToast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
      )}

      {/* Report Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* Ollama Chat Modal */}
      <OllamaChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />
    </div>
  );
}

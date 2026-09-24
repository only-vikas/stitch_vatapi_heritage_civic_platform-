'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIssueStore } from '@/context/IssueContext';

interface VisionAnalysisResult {
  damage_type: string;
  severity_score: number;
  story: string;
  grade: string;
  fissure_pct: number;
  weathering_pct: number;
  intact_pct: number;
  model_used?: string;
  is_fallback?: boolean;
}

interface HeritageHealthScannerProps {
  onClose?: () => void;
  isDrawer?: boolean;
}

export default function HeritageHealthScanner({ onClose, isDrawer = false }: HeritageHealthScannerProps) {
  const router = useRouter();
  const { openReportModalWithData } = useIssueStore();

  const [torchActive, setTorchActive] = useState(false);
  const [gridActive, setGridActive] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDamageType, setSelectedDamageType] = useState<string>('Fissure');

  // Initial State matching Stitch screen mock 'Grade B- Deterioration'
  const [analysis, setAnalysis] = useState<VisionAnalysisResult>({
    damage_type: 'Fissure',
    severity_score: 58,
    story:
      'This 7th-century Chalukyan pillar shows minor surface weathering and one structural crack along the upper lintel joint. Immediate micro-grouting and moisture remediation is recommended before monsoon.',
    grade: 'Grade B- • Deterioration',
    fissure_pct: 35,
    weathering_pct: 45,
    intact_pct: 20,
    model_used: 'Vatapi Vision Heuristics',
  });

  const [hasScanned, setHasScanned] = useState(false);

  // Analyze Monument Vision Call
  const handleAnalyzeMonument = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Fetch static Badami pillar image as base64
      let imageBase64 = '';
      try {
        const imgRes = await fetch('/images/badami_pillar_scanner.png');
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          imageBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string) || '');
            reader.readAsDataURL(blob);
          });
        }
      } catch (err) {
        console.warn('Could not read image blob from frontend:', err);
      }

      // 2. Call local Ollama vision endpoint
      const res = await fetch('/api/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        if (data.damage_type) {
          setSelectedDamageType(data.damage_type);
        }
        setHasScanned(true);
      }
    } catch (err) {
      console.error('Monument analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: The Bridge to Phase 2 (State Management)
  const handleReportToHeritageWatch = () => {
    // Map severity score to category and severity
    const sev: 'low' | 'medium' | 'high' =
      analysis.severity_score >= 70 ? 'high' : analysis.severity_score >= 40 ? 'medium' : 'low';

    const pendingData = {
      category: 'Structural Damage',
      severity: sev,
      title: `Badami Cave 3 - ${analysis.damage_type} & Lintel Deterioration`,
      description: analysis.story,
      photo_url: '/images/badami_pillar_scanner.png',
      damage_type: analysis.damage_type,
      severity_score: analysis.severity_score,
      source: 'ar_scanner' as const,
      location: 'Badami Cave 3, Mandapa Pillar (312° NW)',
      landmark: 'Badami Cave 3',
      jurisdiction: 'ASI Dharwad Circle (Superintending Archaeologist)',
    };

    // Store in IssueContext and session storage
    openReportModalWithData(pendingData);

    if (onClose) {
      onClose();
    }

    // Navigate to /heritage-watch with open parameter
    router.push('/heritage-watch?report=true&from=scanner');
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Laser scan animation & custom styles */}
      <style jsx global>{`
        @keyframes scanMove {
          0% {
            top: 14%;
            opacity: 0.2;
          }
          25% {
            opacity: 0.9;
          }
          75% {
            opacity: 0.9;
          }
          100% {
            top: 60%;
            opacity: 0.2;
          }
        }
        .laser-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #2dd4bf 35%, #ffffff 50%, #2dd4bf 65%, transparent);
          box-shadow: 0 0 14px 3px rgba(45, 212, 191, 0.7);
          animation: scanMove 3.5s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 25;
        }
        .ar-reticle-corner {
          width: 10px;
          height: 10px;
          position: absolute;
          border-color: currentColor;
        }
        .glass-dark {
          background: rgba(18, 14, 12, 0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>

      {/* BEGIN: MobileDeviceFrame (Exact Stitch Screen Dimensions & Structure) */}
      <div
        className="relative w-full max-w-[390px] h-[844px] max-h-[844px] overflow-hidden bg-[#261D18] shadow-2xl flex flex-col justify-between border border-stone-800 rounded-[44px]"
        data-purpose="mobile-viewport"
      >
        {/* Torch Brightness Filter Overlay */}
        {torchActive && (
          <div className="absolute inset-0 bg-amber-100/15 pointer-events-none z-10 mix-blend-screen transition-opacity duration-300"></div>
        )}

        {/* BEGIN: BackgroundCameraStream */}
        <div className="absolute inset-0 z-0 overflow-hidden" data-purpose="camera-stream-container">
          <img
            alt="High-resolution vertical smartphone camera view of an ancient 6th century Chalukyan carved sandstone temple wall and carved pillar in Badami cave temples Karnataka"
            className={`w-full h-full object-cover object-center scale-[1.03] transition-filter duration-300 ${
              isAnalyzing ? 'brightness-110 contrast-125' : ''
            }`}
            src="/images/badami_pillar_scanner.png"
          />
          {/* Vignette Overlay for Crisp Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.75)_100%)] pointer-events-none"></div>
        </div>
        {/* END: BackgroundCameraStream */}

        {/* BEGIN: LaserScanningBeam */}
        <div className={`laser-line ${isAnalyzing ? 'scale-y-150 animate-pulse' : ''}`}></div>
        {/* END: LaserScanningBeam */}

        {/* BEGIN: CameraHudTop */}
        <header className="relative z-30 pt-9 px-4 pb-2 space-y-2.5" data-purpose="ar-hud-header">
          {/* iOS Status Bar Emulation & Sensor Meta */}
          <div className="flex items-center justify-between text-[#FAF8F5] text-xs">
            <span className="font-semibold text-xs tracking-tight">9:41</span>
            {/* Live Depth Sensor Chip */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-dark border border-[#2DD4BF]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-ping"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] -ml-3"></span>
              <span className="font-medium text-[11px] text-teal-200">
                {isAnalyzing ? 'Ollama Vision AI Active' : 'LiDAR Active • 1.4m Depth'}
              </span>
            </div>
            {/* System Icons Status */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>5G</span>
              <div className="w-4 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Main Action Controls Bar */}
          <nav className="flex items-center justify-between mt-1">
            {/* Back Navigation Button */}
            <button
              aria-label="Go Back"
              onClick={() => {
                if (onClose) onClose();
                else router.push('/heritage-watch');
              }}
              className="w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
              </svg>
            </button>

            {/* Location & Spatial Compass Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark border border-white/15 shadow-lg">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#8B3A22] text-[10px] font-bold text-[#FAF8F5] border border-[#E5DACD]/30">
                NW
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold tracking-wide text-[#FAF8F5] leading-tight">
                  Badami Cave 3
                </span>
                <span className="text-[9px] text-[#E5DACD] font-medium">Mandapa • 312° Compass</span>
              </div>
            </div>

            {/* Camera Toggles (Flashlight & AR Grid) */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Toggle Torch"
                onClick={() => setTorchActive(!torchActive)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-all ${
                  torchActive ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/50' : 'glass-dark text-amber-300'
                }`}
                type="button"
                title={torchActive ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    clipRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </button>
              <button
                aria-label="Toggle AR Grid"
                onClick={() => setGridActive(!gridActive)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
                  gridActive
                    ? 'bg-[#0D9488]/80 text-white border-[#2DD4BF]/50 shadow-sm'
                    : 'glass-dark text-stone-400 border-white/10'
                }`}
                type="button"
                title="Toggle AR Grid"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M4 6h16M4 12h16M4 18h16M9 4v16M15 4v16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </button>
            </div>
          </nav>
        </header>
        {/* END: CameraHudTop */}

        {/* BEGIN: ArVisionOverlayBoxes (Dynamic Render based on damage_type) */}
        {gridActive && (
          <div className="relative flex-1 pointer-events-none z-20" data-purpose="ar-bounding-boxes">
            {/* Fissure Warning Reticle 1 (Pillar Top Joint / Red) */}
            <div
              className={`absolute top-[28%] right-[8%] w-[138px] h-[72px] rounded-lg transition-all duration-300 ${
                selectedDamageType.toLowerCase().includes('fissure') || analysis.damage_type.toLowerCase().includes('fissure')
                  ? 'border-2 border-[#EF4444] bg-[#EF4444]/25 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105'
                  : 'border border-[#EF4444]/50 bg-[#EF4444]/10 opacity-70'
              }`}
            >
              {/* Reticle Corners */}
              <div className="ar-reticle-corner border-t-2 border-l-2 text-[#EF4444] -top-1 -left-1"></div>
              <div className="ar-reticle-corner border-t-2 border-r-2 text-[#EF4444] -top-1 -right-1"></div>
              <div className="ar-reticle-corner border-b-2 border-l-2 text-[#EF4444] -bottom-1 -left-1"></div>
              <div className="ar-reticle-corner border-b-2 border-r-2 text-[#EF4444] -bottom-1 -right-1"></div>
              {/* Tag Chip */}
              <div className="absolute -top-7 right-0 flex items-center gap-1 bg-red-950/95 text-red-200 border border-[#EF4444]/60 px-2 py-0.5 rounded text-[9.5px] font-semibold whitespace-nowrap backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse"></span>
                <span>[!] Fissure • {analysis.fissure_pct}% Load Risk</span>
              </div>
            </div>

            {/* Weathering Reticle 2 (Center Carved Relief / Amber) */}
            <div
              className={`absolute top-[41%] left-[9%] w-[155px] h-[92px] rounded-lg transition-all duration-300 ${
                selectedDamageType.toLowerCase().includes('weather') || analysis.damage_type.toLowerCase().includes('weather')
                  ? 'border-2 border-[#F59E0B] bg-[#F59E0B]/25 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                  : 'border border-[#F59E0B]/50 bg-[#F59E0B]/10 opacity-70'
              }`}
            >
              <div className="ar-reticle-corner border-t-2 border-l-2 text-[#F59E0B] -top-1 -left-1"></div>
              <div className="ar-reticle-corner border-t-2 border-r-2 text-[#F59E0B] -top-1 -right-1"></div>
              <div className="ar-reticle-corner border-b-2 border-l-2 text-[#F59E0B] -bottom-1 -left-1"></div>
              <div className="ar-reticle-corner border-b-2 border-r-2 text-[#F59E0B] -bottom-1 -right-1"></div>
              {/* Tag Chip */}
              <div className="absolute -top-6 left-0 flex items-center gap-1 bg-amber-950/95 text-amber-200 border border-[#F59E0B]/60 px-2 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                <span>Weathering • {analysis.weathering_pct}% Attrition</span>
              </div>
            </div>

            {/* Bio-Colony Reticle 3 (Base plinth / Emerald) */}
            <div
              className={`absolute top-[66%] right-[22%] w-[124px] h-[52px] rounded-lg transition-all duration-300 ${
                selectedDamageType.toLowerCase().includes('lichen') || analysis.damage_type.toLowerCase().includes('lichen')
                  ? 'border-2 border-[#10B981] bg-[#10B981]/25 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105'
                  : 'border border-[#10B981]/50 bg-[#10B981]/10 opacity-70'
              }`}
            >
              <div className="ar-reticle-corner border-t-2 border-l-2 text-[#10B981] -top-1 -left-1"></div>
              <div className="ar-reticle-corner border-t-2 border-r-2 text-[#10B981] -top-1 -right-1"></div>
              <div className="ar-reticle-corner border-b-2 border-l-2 text-[#10B981] -bottom-1 -left-1"></div>
              <div className="ar-reticle-corner border-b-2 border-r-2 text-[#10B981] -bottom-1 -right-1"></div>
              {/* Tag Chip */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-950/95 text-emerald-200 border border-[#10B981]/60 px-2 py-0.5 rounded text-[9px] font-medium whitespace-nowrap backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Lichen Colony • Stable</span>
              </div>
            </div>

            {/* Dynamic AR Center Reticle Target Focus */}
            <div className="absolute top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 pointer-events-none">
              <div
                className="w-full h-full border border-dashed border-[#2DD4BF]/60 rounded-full animate-spin"
                style={{ animationDuration: '14s' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#2DD4BF] rounded-full shadow-[0_0_10px_#2DD4BF]"></div>
              </div>
            </div>
          </div>
        )}
        {/* END: ArVisionOverlayBoxes */}

        {/* BEGIN: HeritageHealthBottomSheet */}
        <section
          className="relative z-30 bg-gradient-to-b from-[#7A2C17] via-[#652312] to-[#45160A] text-[#FAF8F5] rounded-t-[24px] pt-3 px-5 pb-6 border-t border-amber-500/20 shadow-2xl flex flex-col space-y-2.5"
          data-purpose="heritage-health-drawer"
        >
          {/* Drawer Drag Handle Indicator */}
          <div className="w-10 h-1.5 bg-[#F2ECE4]/35 rounded-full mx-auto mb-0.5"></div>

          {/* Section Title & Grade Pill */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200/80">
                Diagnostic Assessment
              </span>
              <h2 className="text-xl font-serif font-bold text-[#FAF8F5] tracking-tight leading-none mt-0.5">
                Heritage Health Report
              </h2>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`px-2.5 py-1 rounded-md border text-[11px] font-bold tracking-wide transition-colors ${
                  analysis.severity_score >= 70
                    ? 'bg-red-400/20 border-red-400/60 text-red-200'
                    : analysis.severity_score >= 40
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-200'
                    : 'bg-teal-400/20 border-teal-400/50 text-teal-200'
                }`}
              >
                {analysis.grade || 'Grade B- • Deterioration'}
              </span>
            </div>
          </div>

          {/* Damage Severity Segmented Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline text-[11px]">
              <span className="font-semibold text-[#FAF8F5]">Stone Structural Index</span>
              <span
                className={`font-bold ${
                  analysis.severity_score >= 70
                    ? 'text-red-300'
                    : analysis.severity_score >= 40
                    ? 'text-amber-200'
                    : 'text-teal-200'
                }`}
              >
                {analysis.severity_score}/100 •{' '}
                {analysis.severity_score >= 70
                  ? 'Critical Focus'
                  : analysis.severity_score >= 40
                  ? 'Moderate Concern'
                  : 'Stable Structure'}
              </span>
            </div>
            {/* Multi-segment visual bar */}
            <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden flex p-0.5 gap-0.5 border border-white/10">
              <div
                className="h-full rounded-l-full bg-[#EF4444] transition-all duration-500"
                style={{ width: `${analysis.fissure_pct}%` }}
                title="Structural Fissures"
              ></div>
              <div
                className="h-full bg-[#F59E0B] transition-all duration-500"
                style={{ width: `${analysis.weathering_pct}%` }}
                title="Weathering Erosion"
              ></div>
              <div
                className="h-full rounded-r-full bg-[#2DD4BF] transition-all duration-500"
                style={{ width: `${analysis.intact_pct}%` }}
                title="Intact Matrix"
              ></div>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] text-stone-300/90 pt-0.5 px-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                <span>{analysis.fissure_pct}% Fissure</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <span>{analysis.weathering_pct}% Weathering</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF]"></span>
                <span>{analysis.intact_pct}% Intact</span>
              </div>
            </div>
          </div>

          {/* Plain-Language Story Card (Dynamically populated from AI response) */}
          <article className="bg-[#FAF8F5] text-stone-900 rounded-lg p-3 shadow-md border border-stone-200/80">
            <p className="text-[12px] leading-relaxed font-sans font-medium text-stone-800">
              {analysis.story}
            </p>
            {analysis.model_used && (
              <div className="mt-2 pt-1.5 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]"></span>
                  Engine: <span className="font-semibold text-stone-700">{analysis.model_used}</span>
                </span>
                {analysis.is_fallback && (
                  <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Offline Fallback Active
                  </span>
                )}
              </div>
            )}
          </article>

          {/* Action Buttons: Analyze Monument & Report this to Heritage Watch */}
          <div className="space-y-2 pt-0.5">
            {/* Analyze Monument Button (Prompt 3.2 Step 1) */}
            <button
              onClick={handleAnalyzeMonument}
              disabled={isAnalyzing}
              className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-[13px] border transition-all duration-150 active:scale-[0.98] ${
                isAnalyzing
                  ? 'bg-stone-800 text-stone-400 border-stone-700 cursor-wait'
                  : 'bg-white/10 hover:bg-white/20 text-[#FAF8F5] border-white/20 shadow-sm'
              }`}
              type="button"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-teal-300 border-t-transparent rounded-full animate-spin"></span>
                  <span>Scanning Stone Matrix via Ollama Vision...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-[#2DD4BF]">document_scanner</span>
                  <span>Analyze Monument (Ollama Vision)</span>
                </>
              )}
            </button>

            {/* Primary Action Button: Report this to Heritage Watch (Prompt 3.2 Step 2 Bridge) */}
            <button
              onClick={handleReportToHeritageWatch}
              className="w-full py-3 px-4 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 text-[#FAF8F5] font-semibold text-[13.5px] border border-[#2DD4BF]/30 cursor-pointer"
              type="button"
            >
              <span>Report this to Heritage Watch</span>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
              </svg>
            </button>
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="pt-0.5 flex justify-center">
            <div className="w-32 h-1 bg-white/30 rounded-full"></div>
          </div>
        </section>
        {/* END: HeritageHealthBottomSheet */}
      </div>
      {/* END: MobileDeviceFrame */}
    </div>
  );
}

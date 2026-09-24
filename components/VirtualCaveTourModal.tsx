'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VirtualCaveTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VirtualCaveTourModal({ isOpen, onClose }: VirtualCaveTourModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSignLanguage, setShowSignLanguage] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // 360 Pan drag state
  const [panX, setPanX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startPanRef = useRef(0);

  const narrationText =
    'Welcome to the 360-degree Virtual Sanctuary of Badami Cave One, excavated into the red sandstone cliffs around 578 CE by the Early Chalukyas. Directly before you stands the celebrated eighteen-armed Dancing Shiva, or Nataraja, capturing cosmic rhythm and geometry. To the right, massive fluted pillars carved from solid bedrock support the verandah ceiling, adorned with celestial gandharva couples and the coiled Nagaraja medallion. The space is completely step-free in this photogrammetric digital twin.';

  // Speech synthesis effect
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (isPlayingAudio && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narrationText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else if (!isPlayingAudio && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlayingAudio, isOpen]);

  // Handle drag for 360 pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startPanRef.current = panX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setPanX(startPanRef.current + deltaX * 0.5);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startPanRef.current = panX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setPanX(startPanRef.current + deltaX * 0.5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between bg-black/50 backdrop-blur-xs border-b border-white/10 text-white z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00685f] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                Badami Cave 1 • 360° Photogrammetric Sanctuary
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#89f5e7] text-[#00201d]">
                Universal Virtual Access
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Drag left/right to rotate • Spatial audio description &amp; tactile annotations
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          {/* Audio Description Toggle (Prompt 5.2.2) */}
          <button
            type="button"
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPlayingAudio
                ? 'bg-[#00685f] text-white ring-2 ring-[#89f5e7]'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlayingAudio ? 'volume_up' : 'volume_off'}
            </span>
            <span>{isPlayingAudio ? 'Audio Playing' : 'Audio Description'}</span>
          </button>

          {/* Sign Language Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowSignLanguage(!showSignLanguage)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showSignLanguage
                ? 'bg-[#9a452c] text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">sign_language</span>
            <span className="hidden sm:inline">ISL Avatar</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* 360 Panoramic Viewport (Canvas / Drag Area) */}
      <div
        className="relative flex-1 w-full overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Seamless Panoramic Image */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `translateX(${panX % 1200}px) scale(1.05)`,
          }}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkdRVaVwWe2-n_1MD1jf_sqVLgEbYBRzzr0F6FHMf6Sk37BxGc2XQBcOcCQzgzucHQwQJ-MMsXkk5LxiNwIOMPFNv2cGsTSBHLWZrv4HSyQXBAvPhC0NH0Q40PDuaR575JaxbI-k94q5dJbZPtgLLx-hESg8jzXFAd8cebCkpyXOUL4kz9Y6fZcc5k3P5QGK2wwb2kRZtXRCAcl0KK_ExrYvDiVUAW7EMjHrVcUFbafe-XqWa9VEYr"
            alt="Badami Cave 1 360 Panorama"
            className="h-full w-auto min-w-[2400px] object-cover pointer-events-none opacity-90 filter brightness-95"
          />

          {/* Hotspot 1: 18-Armed Nataraja */}
          <div
            className="absolute top-[40%] left-[800px] -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(
                '18-Armed Dancing Nataraja: 81 possible Bharatanatyam dance mudras carved in monolithic relief. Sculpted directly into sandstone by 6th-century Chalukya master stone masons.'
              );
            }}
          >
            <div className="w-9 h-9 rounded-full bg-[#00685f] text-white flex items-center justify-center shadow-lg animate-pulse ring-4 ring-[#89f5e7]/40">
              <span className="material-symbols-outlined text-[20px]">info</span>
            </div>
            <span className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black/80 text-white text-[11px] font-semibold whitespace-nowrap shadow-md">
              18-Armed Nataraja Relief
            </span>
          </div>

          {/* Hotspot 2: Nagaraja Ceiling Medallion */}
          <div
            className="absolute top-[28%] left-[1350px] -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(
                'Nagaraja Serpent Medallion: Coiled 5-hooded cobra king holding garland, surrounded by flying gandharva couples. Carved with remarkable undercut depth.'
              );
            }}
          >
            <div className="w-9 h-9 rounded-full bg-[#9a452c] text-white flex items-center justify-center shadow-lg animate-pulse ring-4 ring-[#ffdbd1]/40">
              <span className="material-symbols-outlined text-[20px]">palette</span>
            </div>
            <span className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black/80 text-white text-[11px] font-semibold whitespace-nowrap shadow-md">
              Nagaraja Ceiling Medallion
            </span>
          </div>
        </div>

        {/* Hotspot Detail Card Pop-up */}
        {activeHotspot && (
          <div className="absolute bottom-24 max-w-lg mx-auto bg-stone-900/90 border border-white/20 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md z-30 animate-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#89f5e7] uppercase tracking-wider">
                  Architectural Detail • Photogrammetry
                </span>
                <p className="text-xs text-stone-200 leading-relaxed">{activeHotspot}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveHotspot(null)}
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ISL Sign Language Overlay Avatar (Simulated) */}
        {showSignLanguage && (
          <div className="absolute bottom-6 right-6 w-44 sm:w-52 h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-[#89f5e7] shadow-2xl bg-stone-900/90 z-30 flex flex-col">
            <div className="px-2.5 py-1 bg-[#00685f] text-white text-[10px] font-bold flex items-center justify-between">
              <span>ISL Digital Signer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
              <span className="material-symbols-outlined text-[44px] text-[#89f5e7] animate-bounce">
                sign_language
              </span>
              <span className="text-[11px] text-white font-medium mt-1">
                Sign Language Stream Active
              </span>
              <span className="text-[9px] text-stone-400">Synced to Chalukya audio guide</span>
            </div>
          </div>
        )}

        {/* 360 Compass & Drag Hint */}
        <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs backdrop-blur-xs flex items-center gap-2 pointer-events-none">
          <span className="material-symbols-outlined text-[16px] text-[#89f5e7] animate-spin">
            explore
          </span>
          <span>Click &amp; Drag 360° Panorama</span>
        </div>
      </div>

      {/* Bottom Audio Subtitle Bar */}
      <div className="p-4 bg-black/70 backdrop-blur-xs border-t border-white/10 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-20">
        <div className="flex items-center gap-2 max-w-2xl">
          <span className="material-symbols-outlined text-[18px] text-[#89f5e7]">subtitles</span>
          <p className="text-stone-300 text-[11px] line-clamp-1 italic">
            &ldquo;{narrationText}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-400">
          <span>ASI Photogrammetry #CAD-360-CAVE1</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Exit 360° Tour
          </button>
        </div>
      </div>
    </div>
  );
}

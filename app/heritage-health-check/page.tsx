'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HeritageHealthScanner from '@/components/HeritageHealthScanner';
import GhostGuide from '@/components/GhostGuide';

export default function HeritageHealthCheckPage() {
  const [isGhostGuideOpen, setIsGhostGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#120E0C] text-[#FAF8F5] flex flex-col font-[Inter,sans-serif] selection:bg-[#0D9488] selection:text-white">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#1A1411]/90 backdrop-blur-md border-b border-stone-800 shadow-sm">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B3A22] to-[#0D9488] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold text-[#FAF8F5] tracking-tight leading-none">
                  Vatapi
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mt-0.5">
                  AR Monument Scanner
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white transition-all"
            >
              Home
            </Link>
            <Link
              href="/heritage-watch"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white transition-all"
            >
              Heritage Watch
            </Link>
            <Link
              href="/ooru-oota"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white transition-all"
            >
              Ooru Oota
            </Link>
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0D9488] text-white shadow-xs">
              AR Scanner
            </span>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/heritage-watch"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 text-xs font-medium border border-stone-700 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-300">emergency_home</span>
              <span className="hidden sm:inline">Civic Ledger</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Scanner Section */}
      <main className="flex-1 pt-20 pb-8 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient background glow matching sandstone / terracotta theme */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#8B3A22]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Info Bar */}
        <div className="mb-4 text-center max-w-md z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-[11px] text-teal-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Edge Vision Neural Pipeline • Ollama LLaVA Model</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-sandstone-100">
            Heritage Health Check
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Real-time optical structural diagnosis of 6th-century Chalukyan masonry with instant bridge to Heritage Watch.
          </p>
        </div>

        {/* The AR Scanner Phone Viewport (From Stitch Screen) */}
        <div className="z-10 shadow-2xl">
          <HeritageHealthScanner />
        </div>
      </main>

      {/* Floating Action Button: 'Talk to the Past' */}
      <aside className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
        <button
          type="button"
          onClick={() => setIsGhostGuideOpen(true)}
          className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-[#9A452C] hover:from-amber-500 hover:to-[#8B3A22] text-stone-950 font-bold text-sm tracking-wide shadow-[0_10px_30px_rgba(217,119,6,0.4)] hover:shadow-[0_15px_40px_rgba(217,119,6,0.6)] transition-all hover:-translate-y-1 active:scale-95 border border-amber-300/40"
          title="Speak with King Mangalesha, a Chalukyan Sculptor, or a 7th-Century Pilgrim"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">
            history_edu
          </span>
          <span>Talk to the Past</span>
          <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
        </button>
      </aside>

      {/* Ghost Guide Conversational AI Modal */}
      <GhostGuide
        isOpen={isGhostGuideOpen}
        onClose={() => setIsGhostGuideOpen(false)}
        monumentName="Badami Cave 3 (Vishnu Shrine)"
      />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenReportModal: () => void;
  onOpenChatModal: () => void;
  activeSection?: string;
}

export default function Navbar({ onOpenReportModal, onOpenChatModal, activeSection = 'home' }: NavbarProps) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#fbf9f6]/90 backdrop-blur-md border-b border-[#eae8e5] shadow-xs">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-[#9a452c] tracking-tight leading-none">
                Vatapi
              </span>
              <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold mt-0.5">
                Bagalkote Heritage AI
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#efeeeb]/70 p-1 rounded-xl">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'home'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Home
          </Link>
          <Link
            href="/heritage-watch"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'heritage-watch'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Heritage Watch
          </Link>
          <Link
            href="/ooru-oota"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'ooru-oota'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Ooru Oota
          </Link>
          <Link
            href="/circuit-planner"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'circuit-planner'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Circuit Planner
          </Link>
          <Link
            href="/vatapi-voice"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'vatapi-voice'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Vatapi Voice
          </Link>
          <Link
            href="/weavers"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'weavers'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Artisan Weavers
          </Link>
          <Link
            href="/sustainability"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'sustainability'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Sustainability
          </Link>
          <Link
            href="/access-mode"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'access-mode'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            Access Mode
          </Link>
          <Link
            href="/heritage-health-check"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeSection === 'ar-scanner'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#3d4947] hover:text-[#1b1c1a]'
            }`}
          >
            AR Scanner
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Ask DeepSeek Button */}
          <button
            type="button"
            onClick={onOpenChatModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#00685f] to-[#008378] text-white text-xs font-medium shadow-sm hover:shadow-md transition-all group"
          >
            <span className="material-symbols-outlined text-[17px] text-[#89f5e7] animate-pulse">
              neurology
            </span>
            <span className="hidden sm:inline">Ask DeepSeek</span>
          </button>

          {/* Report an Issue Button */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9a452c] text-white text-xs font-medium shadow-sm hover:bg-[#762b14] transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">add_circle</span>
            <span className="hidden sm:inline">Report Issue</span>
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <Link
                href="/login"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#eae8e5] bg-white hover:bg-[#f5f3f0] transition-colors"
                title="View Profile"
              >
                <div className="w-7 h-7 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold text-xs uppercase">
                  {profile?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#1b1c1a] leading-none">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] uppercase text-[#00685f] font-semibold mt-0.5">
                    {profile?.role || 'Citizen'}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                title="Sign Out"
                className="p-2 text-[#6d7a77] hover:text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs font-semibold text-[#1b1c1a] bg-white hover:bg-[#efeeeb] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">login</span>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

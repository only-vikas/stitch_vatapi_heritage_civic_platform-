'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import FloatingParticles from '@/components/FloatingParticles';

/**
 * VATAPI STARTING PAGE & BUILT PHASE SHOWCASE
 *
 * SECTION 1: CINEMATIC HERO VIEWPORT (100vh)
 *   ✅ High-definition looping video (Badami_home_video.mp4)
 *   ✅ Curtain split animation at 1.1s
 *   ✅ Animated Vatapi Brand Header & Auth Buttons (Gmail + Guest)
 *   ✅ Minimalist Compact Glassmorphic Center Card (Badami Heritage stats)
 *   ✅ Prominent Animated Gradient "Explore Vatapi Platform" Button
 *   ✅ Canvas2D Floating Chalukyan Lotus Petal Particles
 *   ✅ Smooth Scroll to Phase Showcase Indicator
 *
 * SECTION 2: BUILT PHASES SHOWCASE (One-by-one, one below one)
 *   ✅ 6 Large Glassmorphic Showcase Cards with live platform screenshots
 *   ✅ Touching/clicking any card directly navigates to that page:
 *       1. Heritage Watch & Civic AI Triage (/heritage-watch)
 *       2. Ooru Oota Authentic Village Meals (/ooru-oota)
 *       3. Artisan-to-Traveller GI Weavers (/weavers)
 *       4. UNESCO Circuit Planner & Mobility (/circuit-planner)
 *       5. Vatapi Voice & 578 CE Epigraphy (/vatapi-voice)
 *       6. Sustainable Planning & Universal Access (/sustainability)
 */

interface PhaseShowcase {
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  fallbackImage: string;
  route: string;
  badge: string;
  accentGradient: string;
  badgeColor: string;
  tags: string[];
  ctaLabel: string;
}

const BUILT_PHASES: PhaseShowcase[] = [
  {
    phase: 'Phase 1',
    title: 'Heritage Watch & Civic AI Triage',
    subtitle: 'Public Ledger & Automated ASI/TMC Classification',
    description:
      'Real-time citizen reporting for monument erosion, micro-fissures, and civic sanitation. Ingests photo evidence and audio notes, utilizing AI to immediately classify severity and assign jurisdiction between ASI Dharwad Circle and Badami TMC with SLA countdown timers.',
    image: '/images/screenshots/Screenshot (436).png',
    fallbackImage: '/images/badami_caves.png',
    route: '/heritage-watch',
    badge: 'Civic Ledger & Triage',
    accentGradient: 'from-[#9a452c] to-[#ff9475]',
    badgeColor: 'bg-[#9a452c]/20 text-[#ffb5a0] border-[#9a452c]/40',
    tags: ['AI Triage Engine', 'SLA Countdown Clock', 'ASI Dharwad', 'Leaflet GIS Map'],
    ctaLabel: 'Launch Heritage Watch',
  },
  {
    phase: 'Phase 2',
    title: 'Ooru Oota • Authentic Village Meals',
    subtitle: 'Verified SHG Culinary Grid & Food RAG',
    description:
      'Curated directory of authentic North Karnataka rural home messes and SHG Khanavalis. Discover hot Jolada Rotti, Yennegai (stuffed brinjal), and Shenga chutney with zero-hallucination spatial distance filtering and live dietary search.',
    image: '/images/screenshots/Screenshot (440).png',
    fallbackImage: '/images/jolada_rotti_feast.png',
    route: '/ooru-oota',
    badge: 'Culinary Heritage',
    accentGradient: 'from-[#00685f] to-[#89f5e7]',
    badgeColor: 'bg-[#00685f]/20 text-[#89f5e7] border-[#00685f]/40',
    tags: ['Verified SHG Directory', 'Jolada Rotti Thali', 'Zero-Hallucination RAG', 'Spatial 5km Radius'],
    ctaLabel: 'Explore Ooru Oota',
  },
  {
    phase: 'Phase 3',
    title: 'Artisan-to-Traveller Weavers',
    subtitle: 'Guledgudda Khana & Ilkal Handlooms',
    description:
      'Direct weaver-to-consumer platform for GI-certified Guledgudda Khana and Ilkal sarees. Features a transparent 64% direct artisan wage guarantee, eliminating middlemen, with AI-driven motif suggestions based on Chalukyan rock carvings.',
    image: '/images/screenshots/Screenshot (439).png',
    fallbackImage: '/images/weaver_loom.png',
    route: '/weavers',
    badge: 'GI Handloom Commerce',
    accentGradient: 'from-[#d97706] to-[#fcd34d]',
    badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    tags: ['64% Direct Wage', 'GI Guledgudda Khana', 'Ilkal Topi Teni Pallu', 'AI Motif Matching'],
    ctaLabel: 'Meet Master Weavers',
  },
  {
    phase: 'Phase 4',
    title: 'UNESCO Circuit Planner & Mobility',
    subtitle: 'Fair-Fare Rickshaw Calculator & Seat Pooling',
    description:
      'Smart multi-site circuit planner covering Badami, Pattadakal, and Aihole. Includes an interactive Fair-Fare Auto Rickshaw Calculator, NWKRTC rural bus schedules, and a real-time ride-pooling board reducing tourist transit costs by up to 60%.',
    image: '/images/screenshots/Screenshot (438).png',
    fallbackImage: '/images/badami_carvings_col.png',
    route: '/circuit-planner',
    badge: 'Smart Mobility Grid',
    accentGradient: 'from-[#2563eb] to-[#93c5fd]',
    badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
    tags: ['Fair-Fare Formula', 'Shared Ride Pooling', '3 UNESCO Sites', 'EV Rickshaw Fleet'],
    ctaLabel: 'Plan UNESCO Circuit',
  },
  {
    phase: 'Phase 5',
    title: 'Vatapi Voice & Epigraphical Lens',
    subtitle: 'Bhashini Audio Concierge & 578 CE Inscription AI',
    description:
      'Spoken audio guide speaking North Karnataka Kannada with cultural etiquette tips. Includes a two-way tourist-to-vendor communication bridge and an interactive AI decipherer for King Mangalesha’s 578 CE Old Kannada cave pillar inscription.',
    image: '/images/screenshots/Screenshot (437).png',
    fallbackImage: '/images/badami_inscription_cave3.jpg',
    route: '/vatapi-voice',
    badge: 'Multilingual Audio & Epigraphy',
    accentGradient: 'from-[#7c3aed] to-[#c4b5fd]',
    badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
    tags: ['5 Dialects Supported', 'Mangalesha 578 CE Epigraph', 'Two-Way Vendor Bridge', 'Bhashini AI'],
    ctaLabel: 'Listen to Vatapi Voice',
  },
  {
    phase: 'Phase 6',
    title: 'Sustainable Planning & Universal Access',
    subtitle: 'Agastya Lake Telemetry & 360° Barrier-Free Mode',
    description:
      'Agastya Lake ecological monitoring and crowd dispersal nudges away from bottleneck cave trails. Features verified community cleanup proof and 360° barrier-free accessibility pathways for elderly and wheelchair pilgrims.',
    image: '/images/screenshots/Screenshot (442).png',
    fallbackImage: '/images/badami_pillar_scanner.png',
    route: '/sustainability',
    badge: 'Ecological & Barrier-Free',
    accentGradient: 'from-[#059669] to-[#6ee7b7]',
    badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
    tags: ['Crowd Dispersal Nudges', 'Agastya Lake Telemetry', 'Universal Access Mode', 'AR Pillar Health Check'],
    ctaLabel: 'Open Sustainability Grid',
  },
];

export default function StartingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [curtainDone, setCurtainDone] = useState(false);
  const [curtainOpening, setCurtainOpening] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Detect desktop ──────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Curtain split ────────────────────────────────────────────────
  useEffect(() => {
    const timerOpen = setTimeout(() => setCurtainOpening(true), 500);
    const timerDone = setTimeout(() => setCurtainDone(true), 1800);
    return () => {
      clearTimeout(timerOpen);
      clearTimeout(timerDone);
    };
  }, []);

  // ── GSAP Ambient animations ──────────────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;
    let cleanup: (() => void) | null = null;

    const init = async () => {
      const { gsap: g }: any = await import('gsap');

      const ctx = g.context(() => {
        const tl = g.timeline({ defaults: { ease: 'power3.out' } });

        // Curtain reveal
        const cTop = document.getElementById('curtain-top');
        const cBot = document.getElementById('curtain-bottom');
        const cWord = document.getElementById('curtain-wordmark');
        if (cTop && cBot) {
          tl.from(cWord, { opacity: 0, y: 12, duration: 0.6 }, 0)
            .to(cTop, { yPercent: -100, duration: 0.9, ease: 'power2.inOut' }, 1.1)
            .to(cBot, { yPercent: 100, duration: 0.9, ease: 'power2.inOut' }, 1.1)
            .set([cTop, cBot], { display: 'none' });
        }

        // Cave glow pulse (3s yoyo)
        const caveGlow = document.getElementById('layer-cave-glow');
        if (caveGlow) {
          g.to(caveGlow, {
            opacity: 0.55,
            duration: 3,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
          });
        }

        // Boat shadows bobbing
        document.querySelectorAll<HTMLElement>('.boat-shadow').forEach((el, i) => {
          g.to(el, {
            y: -3,
            duration: 6,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 1.5,
          });
        });

        // Sun flare breathe (8s)
        const sunFlare = document.getElementById('sun-flare');
        if (sunFlare) {
          g.to(sunFlare, {
            scale: 1.08,
            opacity: 0.45,
            duration: 8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }

        // Nav wordmark teal glow sync (3s)
        g.to('.vatapi-wordmark-glow', {
          filter: 'drop-shadow(0 0 16px rgba(137,245,231,0.9))',
          duration: 3,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        });
      });

      cleanup = () => ctx.revert();
    };

    init().catch(console.error);
    return () => cleanup?.();
  }, [isDesktop]);

  // ── Auth handlers ────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const redirectTo = `${window.location.origin}/home`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) {
        setAuthError(error.message);
        setTimeout(() => setAuthError(null), 5000);
      }
    } catch {
      setAuthError('Auth service unavailable');
      setTimeout(() => setAuthError(null), 4000);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0805] text-white selection:bg-[#00685f] selection:text-white">
      {/* ══════════════════════════════════════════════════
          CINEMATIC CURTAIN
          ══════════════════════════════════════════════════ */}
      {!curtainDone && (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
          {/* Top Curtain */}
          <div
            id="curtain-top"
            className="absolute top-0 inset-x-0 flex flex-col items-center justify-end pb-8 border-b border-[#9a452c]/40"
            style={{
              height: '50vh',
              background: 'linear-gradient(to bottom, #140b06 60%, #2d1a0e)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
              transform: curtainOpening ? 'translateY(-100%)' : 'translateY(0%)',
              transition: 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          >
            <div id="curtain-wordmark" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-white font-serif font-black text-2xl shadow-xl border border-white/20">
                V
              </div>
              <h1 className="font-serif text-3xl font-extrabold tracking-[0.2em] text-[#ffdbd1]">
                VATAPI
              </h1>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#89f5e7]/80 font-medium">
                Heritage · Civic · AI · Grid
              </p>
            </div>
          </div>

          {/* Bottom Curtain */}
          <div
            id="curtain-bottom"
            className="absolute bottom-0 inset-x-0 flex items-start justify-center pt-8 border-t border-[#9a452c]/40"
            style={{
              height: '50vh',
              background: 'linear-gradient(to top, #140b06 60%, #2d1a0e)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
              transform: curtainOpening ? 'translateY(100%)' : 'translateY(0%)',
              transition: 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-200/40">
              Initiating Chalukyan Grid...
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 1: CINEMATIC HERO VIEWPORT (100vh)
          ══════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen min-h-[660px] flex flex-col justify-between overflow-hidden">
        {/* Fullscreen Looping Video Background */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src="/video/Badami_home_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
        </div>

        {/* Soft Vignettes */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none z-[2]" />
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#0d0805] via-[#0d0805]/70 to-transparent pointer-events-none z-[2]" />

        {/* Ambient Cave Glow & Sun Flare */}
        <div
          id="layer-cave-glow"
          className="absolute z-[3] pointer-events-none"
          style={{
            top: '32%',
            left: '4%',
            width: '320px',
            height: '280px',
            background:
              'radial-gradient(ellipse at center, rgba(255,140,40,0.25) 0%, rgba(154,69,44,0.12) 50%, transparent 80%)',
            opacity: 0.35,
            borderRadius: '50%',
          }}
          aria-hidden="true"
        />
        <div
          id="sun-flare"
          className="absolute z-[3] pointer-events-none"
          style={{
            top: '4%',
            right: '16%',
            width: '320px',
            height: '320px',
            background:
              'radial-gradient(circle, rgba(255,215,120,0.22) 0%, rgba(255,150,50,0.10) 50%, transparent 75%)',
            opacity: 0.3,
            borderRadius: '50%',
            willChange: 'transform, opacity',
          }}
          aria-hidden="true"
        />

        {/* Floating Lotus Particles */}
        <div className="absolute inset-0 z-[5] pointer-events-none">
          <FloatingParticles />
        </div>

        {/* ── TOP NAV BAR (Slightly Bigger, More Stylish & Animated) ── */}
        <header className="pointer-events-auto w-full px-5 lg:px-12 pt-5 flex items-center justify-between z-20">
          {/* Brand Wordmark */}
          <Link href="/home" className="flex items-center gap-3.5 group animate-brand-float">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9a452c] via-[#d97706] to-[#00685f] p-0.5 shadow-xl shadow-black/40 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[14px] bg-[#140b06]/85 backdrop-blur-sm flex items-center justify-center text-white font-serif font-black text-2xl border border-white/20">
                V
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="vatapi-wordmark-glow font-serif text-3xl sm:text-4xl font-black tracking-tight text-white"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(137,245,231,0.55))',
                    transition: 'filter 0.3s ease',
                  }}
                >
                  Vatapi
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#9a452c]/90 to-[#00685f]/90 text-[#89f5e7] border border-white/25 shadow-md backdrop-blur-md">
                  Chalukyan Grid
                </span>
              </div>
              <span className="text-[11px] text-[#ffdbd1]/80 font-medium tracking-wide">
                AI Civic & Heritage Platform
              </span>
            </div>
          </Link>

          {/* AUTH CORNER WIDGET (Animated, Frosted Glass) */}
          <div
            className="glass-card pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-white/25 shadow-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(20, 12, 6, 0.65)',
            }}
          >
            {user ? (
              <Link
                href="/home"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#89f5e7] hover:text-white bg-white/10 hover:bg-white/20 transition-all"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-[10px] font-bold text-white">
                  {user.email?.[0]?.toUpperCase()}
                </span>
                <span>Enter Platform →</span>
              </Link>
            ) : (
              <>
                {/* Google Sign-In button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  title="Sign in with Gmail"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-stone-900 bg-white hover:bg-stone-100 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-black/20"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span className="hidden sm:inline">
                    {authLoading ? 'Signing in...' : 'Gmail'}
                  </span>
                </button>

                <div className="w-px h-6 bg-white/20" />

                {/* Explore as Guest button */}
                <Link
                  href="/home"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#9a452c] to-[#00685f] hover:from-[#aa4c31] hover:to-[#007f74] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#9a452c]/30 flex items-center gap-1.5 group"
                >
                  <span>Guest</span>
                  <span className="text-[#89f5e7] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </>
            )}

            {authError && (
              <span
                className="text-[10px] text-amber-300 font-mono px-2 truncate max-w-[120px]"
                title={authError}
              >
                ⚠ {authError.slice(0, 20)}…
              </span>
            )}
          </div>
        </header>

        {/* ── CENTER COMPACT MINIMALIST GLASS CARD ────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 pointer-events-none my-4 z-20">
          <div
            className="glass-card pointer-events-auto text-center max-w-md w-full px-6 py-5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/35"
            style={{
              background: 'rgba(18, 10, 5, 0.65)',
              boxShadow:
                '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] font-bold tracking-wider mb-2">
              <span className="text-amber-400">✦</span> Chalukyan Capital · 543 – 757 CE{' '}
              <span className="text-amber-400">✦</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white drop-shadow-md leading-tight">
              Badami <span className="text-[#ffb29e]">Heritage</span>
            </h2>
            <p className="text-xs font-medium text-[#d1ece6]/90 mt-1">
              AI-Powered Civic Heritage Grid • Bagalkote, Karnataka
            </p>

            {/* Compact Stats Grid */}
            <div className="mt-3.5 grid grid-cols-4 gap-2">
              {[
                { val: '4', label: 'UNESCO', sub: 'Sites' },
                { val: '1400+', label: 'Years', sub: 'Legacy' },
                { val: '312', label: 'GI', sub: 'Weavers' },
                { val: '98%', label: 'Triaged', sub: 'AI Speed' },
              ].map(({ val, label, sub }) => (
                <div
                  key={label}
                  className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center"
                >
                  <span className="text-sm sm:text-base font-extrabold font-mono text-[#89f5e7]">
                    {val}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">
                    {label}
                  </span>
                  <span className="text-[8px] text-white/50">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM CTA (Animated Color Gradient Button) ─────────── */}
        <div className="pointer-events-auto w-full px-6 pb-6 flex flex-col items-center gap-3 z-20">
          <Link
            href="/home"
            className="animate-gradient-flow group inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl text-base sm:text-lg font-black text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #9a452c 0%, #d97706 35%, #00685f 70%, #00e5c9 100%)',
              boxShadow:
                '0 0 35px rgba(0,229,201,0.45), 0 15px 35px rgba(0,0,0,0.6)',
            }}
          >
            <span className="tracking-wide drop-shadow">Explore Vatapi Platform</span>
            <span className="text-[#ffdbd1] group-hover:translate-x-1.5 transition-transform text-xl">
              →
            </span>
          </Link>

          {/* Smooth Scroll to Showcase */}
          <a
            href="#showcase"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#89f5e7] hover:text-white transition-colors py-1 px-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 animate-bounce"
          >
            <span>Scroll Down to Discover All Built Modules</span>
            <span>↓</span>
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2: ALL BUILT PHASES SHOWCASE
          One by one, one below one in glassmorphic cards
          Touching/clicking any card takes user to that page
          ══════════════════════════════════════════════════ */}
      <section id="showcase" className="relative z-20 py-20 px-5 sm:px-8 max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#9a452c]/30 to-[#00685f]/30 border border-white/20 text-[#89f5e7] text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <span>✦</span> Complete Platform Ecosystem <span>✦</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Explore Every Built Phase
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300">
            A comprehensive, multi-phase civic preservation, culinary discovery, and smart mobility
            grid for Bagalkote heritage. Touch or click any module card to launch directly into that
            working feature.
          </p>
        </div>

        {/* Vertical Stack of Glassmorphic Cards (One Below One) */}
        <div className="space-y-10">
          {BUILT_PHASES.map((p, idx) => (
            <Link
              key={p.phase}
              href={p.route}
              className="group block relative rounded-3xl overflow-hidden border border-white/15 hover:border-[#89f5e7]/60 shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_20px_60px_rgba(0,104,95,0.35)]"
              style={{
                background: 'rgba(24, 15, 10, 0.75)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
                {/* Left/Preview Image Column */}
                <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 aspect-[16/10] shadow-inner">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500 brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${p.badgeColor}`}
                    >
                      {p.phase} • {p.badge}
                    </span>
                  </div>
                </div>

                {/* Right/Content Column */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#89f5e7]">
                      {p.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white mt-1 group-hover:text-[#ffdbd1] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed mt-2.5">
                      {p.description}
                    </p>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px] font-semibold text-stone-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Launch CTA */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-[#89f5e7] group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>{p.ctaLabel}</span>
                      <span className="text-lg">→</span>
                    </span>
                    <span className="text-xs text-stone-400 font-mono">Touch to Launch</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 text-center p-8 rounded-3xl bg-gradient-to-r from-[#9a452c]/30 via-[#180f0a] to-[#00685f]/30 border border-white/20 backdrop-blur-xl">
          <h3 className="font-serif text-2xl font-bold text-white">
            Experience the Unified Platform
          </h3>
          <p className="text-sm text-stone-300 mt-2 max-w-xl mx-auto">
            All 6 phases are fully integrated with Supabase PostgreSQL, local DeepSeek-R1, and
            OpenRouter cloud failover.
          </p>
          <Link
            href="/home"
            className="animate-gradient-flow inline-flex items-center gap-2.5 px-8 py-3.5 mt-5 rounded-2xl text-sm sm:text-base font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all border border-white/30"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #9a452c 0%, #d97706 40%, #00685f 80%, #00e5c9 100%)',
            }}
          >
            <span>Enter Main Platform Dashboard</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

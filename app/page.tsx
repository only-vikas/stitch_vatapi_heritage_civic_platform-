'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import FloatingParticles from '@/components/FloatingParticles';

/**
 * VATAPI STARTING PAGE (Clean, Bright Cinematic Version)
 *
 * Full cinematic landing experience — 100vw × 100vh, pure & bright.
 *
 * ANIMATIONS INCLUDED:
 *   ✅ Curtain split — terracotta screen with "Vatapi" wordmark splits top/bottom at 1.1s
 *   ✅ Pure Video Background — Boats on Agastya Lake at natural brightness, vibrant & clean
 *   ✅ Cave glow — subtle warm amber pulse over cliff zone
 *   ✅ Sun flare — subtle top-right radial breathes over 8s
 *   ✅ Boat shadows — tiny ellipses bob on sine loop over lake
 *   ✅ Nav wordmark — "Vatapi" pulses with drop-shadow teal glow
 *   ✅ Lotus particles — Canvas2D Chalukyan lotus petal particles float upward
 *   ✅ Auth corner widget — frosted glass, Google Sign-In + Explore as Guest
 *   ✅ Minimalist bottom pill — clean "Enter Platform →" with zero screen clutter
 *
 * REMOVED:
 *   ❌ Center Badami Heritage card & stats
 *   ❌ LIVE · BADAMI · PATTADAKAL · AIHOLE top panel
 *   ❌ 4 bottom glassmorphic cards
 *   ❌ Ugly dashboard text watermark overlay
 *   ❌ Dark muddy gradients
 */

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
        window.scrollTo(0, 0);
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
            opacity: 0.6,
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
          filter: 'drop-shadow(0 0 14px rgba(137,245,231,0.85))',
          duration: 3,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        });

        // Water ripple — feTurbulence seed increment
        const turbulence = document.getElementById('water-turbulence');
        if (turbulence) {
          let seed = 0;
          const interval = setInterval(() => {
            seed = (seed + 1) % 100;
            turbulence.setAttribute('seed', String(seed));
          }, 180);
          (turbulence as any).__rippleInterval = interval;
        }
      });

      cleanup = () => {
        ctx.revert();
        const turb = document.getElementById('water-turbulence');
        if (turb && (turb as any).__rippleInterval) clearInterval((turb as any).__rippleInterval);
      };
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
    <main
      id="hero-parallax"
      className="relative w-screen h-screen overflow-hidden bg-black text-white"
      style={{ maxHeight: '100dvh' }}
    >
      {/* ══════════════════════════════════════════════════
          SVG WATER RIPPLE FILTER
          ══════════════════════════════════════════════════ */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="water-ripple-filter">
            <feTurbulence
              id="water-turbulence"
              type="turbulence"
              baseFrequency="0.01 0.012"
              numOctaves="2"
              seed="0"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

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
          PURE VIDEO BACKGROUND (Clean, Bright & Vibrant)
          Zero dark filters, zero watermark overlay images
          ══════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════
          LIGHTWEIGHT AMBIENT OVERLAYS
          ══════════════════════════════════════════════════ */}

      {/* Soft header-only vignette to ensure top navbar legibility without darkening the video */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-[2]" />

      {/* Soft footer-only vignette for bottom control legibility */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none z-[2]" />

      {/* Cave glow: warm amber pulse over cliff zone */}
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

      {/* Sun flare: warm golden breathing glow in upper right */}
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

      {/* Boat shadows bobbing over lake water */}
      {[
        { left: '38%', top: '58%' },
        { left: '48%', top: '61%' },
        { left: '57%', top: '59%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="boat-shadow absolute z-[4] pointer-events-none"
          style={{
            left: pos.left,
            top: pos.top,
            width: '24px',
            height: '8px',
            background: 'rgba(20,10,5,0.35)',
            borderRadius: '50%',
            filter: 'blur(1.5px)',
            willChange: 'transform',
          }}
          aria-hidden="true"
        />
      ))}

      {/* ══════════════════════════════════════════════════
          FLOATING LOTUS PETAL PARTICLES
          ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <FloatingParticles />
      </div>

      {/* ══════════════════════════════════════════════════
          FOREGROUND UI LAYER
          ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[10] flex flex-col justify-between pointer-events-none">
        {/* ── TOP NAV BAR ──────────────────────────────────── */}
        <nav className="pointer-events-auto w-full px-5 lg:px-10 pt-4 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-white font-serif font-bold text-lg shadow-md border border-white/25 group-hover:scale-105 transition-transform">
              V
            </div>
            <span
              className="vatapi-wordmark-glow font-serif text-2xl font-extrabold tracking-tight text-white"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(137,245,231,0.45))',
                transition: 'filter 0.3s ease',
              }}
            >
              Vatapi
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/15 text-[#89f5e7] border border-white/20 backdrop-blur-md">
              Chalukyan Grid
            </span>
          </Link>

          {/* AUTH CORNER — Frosted Glass Widget (top-right) */}
          <div
            className="glass-card pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(20, 12, 6, 0.55)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
              borderRadius: '14px',
            }}
          >
            {user ? (
              <Link
                href="/home"
                className="flex items-center gap-2 text-xs font-semibold text-[#89f5e7] hover:text-white transition-colors"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                  <span className="hidden sm:inline">{authLoading ? '…' : 'Gmail'}</span>
                </button>

                <div className="w-px h-5 bg-white/25" />

                {/* Explore as Guest */}
                <Link
                  href="/home"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#9a452c] to-[#00685f] hover:from-[#aa4c31] hover:to-[#007f74] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#9a452c]/30 flex items-center gap-1 group"
                >
                  <span>Guest</span>
                  <span className="text-[#89f5e7] group-hover:translate-x-0.5 transition-transform">
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
        </nav>

        {/* ── CENTER AREA: Unobstructed View of the Pure Video ─ */}
        <div className="flex-1" />

        {/* ── BOTTOM CONTROLS: Clean Minimalist Entry Pill ──── */}
        <div className="pointer-events-auto w-full px-4 pb-6 flex flex-col items-center gap-3">
          <Link
            href="/home"
            className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/25 hover:border-[#89f5e7]/70 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              boxShadow:
                '0 0 25px rgba(137,245,231,0.20), 0 8px 24px rgba(0,0,0,0.45)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#00e5c9] animate-pulse" />
            <span className="tracking-wider">Enter Vatapi Platform</span>
            <span className="text-[#89f5e7] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

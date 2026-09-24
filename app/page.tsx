'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import FloatingParticles from '@/components/FloatingParticles';

/**
 * VATAPI STARTING PAGE
 *
 * Full cinematic landing experience — 100vw × 100vh, no overflow.
 * Contains ALL Prompt 1, 2, 3 animations:
 *
 * PROMPT 1 – Cinematic Load-In & Multi-Layer Parallax
 *   ✅ Curtain split — terracotta screen with "Vatapi" wordmark splits top/bottom at 1.1s
 *   ✅ 4-layer entrance — sky scales in (2s), town fades from bottom, lake opacity ramps, cliff slides from left
 *   ✅ ScrollTrigger depth — cliff 0.3x, town 0.1x, sky 0.05x; hero text fades out
 *   ✅ Cave glow — warm orange radial pulse (3s yoyo loop) over temple zone
 *   ✅ Boat shadows — 3 tiny ellipses bob -3px on 6s sine loop, staggered 1.5s each
 *   ✅ Sun flare — top-right radial breathes scale 1.05 over 8s
 *   ✅ Water ripple — SVG feTurbulence seed increments every 180ms on lake layer
 *   ✅ VIDEO background — Boats on Agastya Lake mp4 plays looped muted behind all layers
 *
 * PROMPT 2 – Ambient Micro-Interactions
 *   ✅ GlassCard tilt — perspective(900px) rotates ±5° on cursor, light sheen tracks mouse
 *   ✅ Teal CTA glow — Explore button emits teal shadow, intensifies on hover
 *   ✅ Nav wordmark — "Vatapi" pulses with drop-shadow teal glow synced to 3s cave period
 *   ✅ Scroll indicator — teal pulse line at bottom center
 *   ✅ Lotus particles — Canvas2D Chalukyan lotus sprites float upward, terracotta-to-gold
 *
 * PROMPT 3 – Glassmorphic UI
 *   ✅ Auth corner widget — frosted glass, Google Sign-In + Explore as Guest
 *   ✅ Bottom gallery dock — 4 photos, drag scrollable, glassmorphic cards
 *   ✅ Mouse-tilt GlassCard over the hero — dynamic light sheen
 */

export default function StartingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [curtainDone, setCurtainDone] = useState(false);
  const [curtainOpening, setCurtainOpening] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const heroCardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Detect desktop ──────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Curtain split (Prompt 1) ─────────────────────────────────────
  useEffect(() => {
    const timerOpen = setTimeout(() => setCurtainOpening(true), 500);
    const timerDone = setTimeout(() => setCurtainDone(true), 1800);
    return () => { clearTimeout(timerOpen); clearTimeout(timerDone); };
  }, []);

  // ── Scroll indicator (Prompt 2) ─────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── GSAP Parallax + all ambient animations (Prompts 1 & 2) ──────
  useEffect(() => {
    if (!isDesktop) return;
    let cleanup: (() => void) | null = null;

    const init = async () => {
      const { gsap: g }: any = await import('gsap');
      const { ScrollTrigger }: any = await import('gsap/ScrollTrigger');
      g.registerPlugin(ScrollTrigger);

      const ctx = g.context(() => {
        window.scrollTo(0, 0);
        const tl = g.timeline({ defaults: { ease: 'power3.out' } });

        // ── PHASE 1: Curtain reveal ────────────────────────────
        const cTop = document.getElementById('curtain-top');
        const cBot = document.getElementById('curtain-bottom');
        const cWord = document.getElementById('curtain-wordmark');
        if (cTop && cBot) {
          tl.from(cWord, { opacity: 0, y: 12, duration: 0.6 }, 0)
            .to(cTop, { yPercent: -100, duration: 0.9, ease: 'power2.inOut' }, 1.1)
            .to(cBot, { yPercent: 100, duration: 0.9, ease: 'power2.inOut' }, 1.1)
            .set([cTop, cBot], { display: 'none' });
        }

        // ── PHASE 2: Layer entrance ────────────────────────────
        const sky = document.getElementById('layer-sky');
        const town = document.getElementById('layer-town');
        const lake = document.getElementById('layer-lake');
        const cliff = document.getElementById('layer-cliff');
        const hc = document.getElementById('hero-content');
        const t0 = cTop ? 1.5 : 0;

        if (sky)   tl.from(sky,   { scale: 1.1, duration: 2.0 }, t0);
        if (town)  tl.from(town,  { opacity: 0, y: 30, scale: 1.05, duration: 1.4 }, t0 + 0.1);
        if (lake)  tl.from(lake,  { opacity: 0, duration: 1.6 }, t0 + 0.2);
        if (cliff) tl.from(cliff, { x: -100, opacity: 0, duration: 1.5 }, t0 + 0.05);
        if (hc)    tl.from(hc,    { opacity: 0, y: 24, duration: 1.0, ease: 'power2.out' }, t0 + 0.5);

        // ── PHASE 3: ScrollTrigger depth ──────────────────────
        const hero = document.getElementById('hero-parallax');
        if (hero) {
          const stl = g.timeline({
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2 },
          });
          if (cliff) stl.to(cliff, { yPercent: 30 }, 0);
          if (town)  stl.to(town,  { yPercent: 10 }, 0);
          if (sky)   stl.to(sky,   { yPercent: 5 },  0);
          if (hc)    stl.to(hc,    { opacity: 0, yPercent: -15 }, 0);
        }

        // ── PHASE 4: Ambient micro-animations ─────────────────
        // Cave glow pulse (3s yoyo)
        const caveGlow = document.getElementById('layer-cave-glow');
        if (caveGlow) g.to(caveGlow, { opacity: 1.0, duration: 3, ease: 'power1.inOut', yoyo: true, repeat: -1 });

        // Boat bob — 3 ellipses staggered 1.5s
        document.querySelectorAll<HTMLElement>('.boat-shadow').forEach((el, i) => {
          g.to(el, { y: -3, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 1.5 });
        });

        // Sun flare breathe (8s)
        const sunFlare = document.getElementById('sun-flare');
        if (sunFlare) g.to(sunFlare, { scale: 1.05, opacity: 0.5, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        // Nav wordmark teal glow sync (3s)
        g.to('.vatapi-wordmark-glow', {
          filter: 'drop-shadow(0 0 12px rgba(137,245,231,0.75))',
          duration: 3,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        });

        // Water ripple — feTurbulence seed increment every 180ms
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

  // ── GlassCard mouse-tilt (Prompt 3) ─────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;
    const card = heroCardRef.current;
    if (!card) return;

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rotX = ((e.clientY - cy) / rect.height) * -5;
      const rotY = ((e.clientX - cx) / rect.width) * 5;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      const nx = ((e.clientX - rect.left) / rect.width) * 100;
      const ny = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--shine-x', `${nx}%`);
      card.style.setProperty('--shine-y', `${ny}%`);
      card.classList.add('glass-shine-active');
    };
    const handleLeave = () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      card.classList.remove('glass-shine-active');
    };
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => { card.removeEventListener('mousemove', handleMove); card.removeEventListener('mouseleave', handleLeave); };
  }, [isDesktop]);

  // ── Auth handlers ────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const redirectTo = `${window.location.origin}/home`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) { setAuthError(error.message); setTimeout(() => setAuthError(null), 5000); }
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
      className="relative w-screen h-screen overflow-hidden bg-[#130d09] text-white"
      style={{ maxHeight: '100dvh' }}
    >
      {/* ══════════════════════════════════════════════════
          SVG WATER RIPPLE FILTER
          ══════════════════════════════════════════════════ */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="water-ripple-filter">
            <feTurbulence id="water-turbulence" type="turbulence" baseFrequency="0.01 0.012" numOctaves="2" seed="0" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ══════════════════════════════════════════════════
          CINEMATIC CURTAIN (Prompt 1)
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
              <h1 className="font-serif text-3xl font-extrabold tracking-[0.2em] text-[#ffdbd1]">VATAPI</h1>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#89f5e7]/80 font-medium">Heritage · Civic · AI · Grid</p>
            </div>
          </div>

          {/* Bottom Curtain */}
          <div
            id="curtain-bottom"
            className="absolute bottom-0 inset-x-0 flex items-start justify-center pt-5 border-t border-[#9a452c]/40"
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
              Initiating Chalukyan Reveal Sequence...
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          BACKGROUND LAYER: VIDEO (Boats on Agastya Lake)
          + Fallback image = attached Badami aerial photo
          ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        {/* Video — looped, muted, covers full viewport */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/video/boats_agastya_lake.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          style={{ filter: 'brightness(0.80) contrast(1.10) saturate(1.15)' }}
        />
        {/* Static hero image (poster / SSR fallback) sits under video */}
        <Image
          src="/images/badami_sunset_aerial.png"
          alt="Badami Agastya Lake Aerial"
          fill
          priority
          sizes="100vw"
          quality={95}
          className="object-cover object-center"
          style={{ filter: 'brightness(0.72) contrast(1.12) saturate(1.1)', zIndex: -1 }}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          4-LAYER DEPTH STACK (clip-path simulated zones)
          ══════════════════════════════════════════════════ */}

      {/* SKY LAYER — top 40% */}
      <div id="layer-sky" className="absolute inset-0 z-[1] pointer-events-none" style={{ willChange: 'transform' }}>
        <Image src="/images/badami_sunset_aerial.png" alt="" fill aria-hidden="true" sizes="100vw"
          className="object-cover object-top opacity-15"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 42%, 0 42%)' }} />
      </div>

      {/* TOWN LAYER — right 30% */}
      <div id="layer-town" className="absolute inset-0 z-[2] pointer-events-none" style={{ willChange: 'transform' }}>
        <Image src="/images/badami_sunset_aerial.png" alt="" fill aria-hidden="true" sizes="100vw"
          className="object-cover object-right opacity-20"
          style={{ clipPath: 'polygon(65% 30%, 100% 30%, 100% 80%, 65% 80%)' }} />
      </div>

      {/* LAKE LAYER — center band, water ripple filter */}
      <div id="layer-lake" className="absolute inset-0 z-[3] pointer-events-none" style={{ willChange: 'transform' }}>
        <Image src="/images/badami_sunset_aerial.png" alt="" fill aria-hidden="true" sizes="100vw"
          className="object-cover object-center opacity-25"
          style={{
            clipPath: 'polygon(20% 45%, 80% 45%, 80% 72%, 20% 72%)',
            filter: 'url(#water-ripple-filter)',
          }} />
      </div>

      {/* CLIFF LAYER — left 40% */}
      <div id="layer-cliff" className="absolute inset-0 z-[4] pointer-events-none" style={{ willChange: 'transform' }}>
        <Image src="/images/badami_sunset_aerial.png" alt="" fill aria-hidden="true"
          className="object-cover object-left opacity-30"
          style={{ clipPath: 'polygon(0 20%, 42% 20%, 42% 88%, 0 88%)' }} />
      </div>

      {/* ══════════════════════════════════════════════════
          AMBIENT OVERLAYS
          ══════════════════════════════════════════════════ */}
      {/* Global darkening gradients */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#120a06]/75 via-transparent to-[#0a0705]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(8,4,2,0.72)_100%)]" />
      </div>

      {/* CAVE GLOW — warm amber pulse over left cliff temple zone */}
      <div
        id="layer-cave-glow"
        className="absolute z-[6] pointer-events-none"
        style={{
          top: '36%', left: '6%',
          width: '340px', height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(210,100,20,0.38) 0%, rgba(154,69,44,0.20) 45%, transparent 80%)',
          opacity: 0.4,
          borderRadius: '50%',
        }}
        aria-hidden="true"
      />

      {/* SUN FLARE — top right breathe */}
      <div
        id="sun-flare"
        className="absolute z-[6] pointer-events-none"
        style={{
          top: '6%', right: '18%',
          width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(255,200,80,0.18) 0%, rgba(255,140,40,0.10) 50%, transparent 80%)',
          opacity: 0.35,
          borderRadius: '50%',
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      />

      {/* BOAT SHADOWS — 3 tiny ellipses over lake (Agastya Lake zone) */}
      {[
        { left: '38%', top: '58%' },
        { left: '48%', top: '61%' },
        { left: '57%', top: '59%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="boat-shadow absolute z-[7] pointer-events-none"
          style={{
            left: pos.left, top: pos.top,
            width: '22px', height: '8px',
            background: 'rgba(10,6,3,0.45)',
            borderRadius: '50%',
            filter: 'blur(1px)',
            willChange: 'transform',
          }}
          aria-hidden="true"
        />
      ))}

      {/* ══════════════════════════════════════════════════
          FLOATING LOTUS PARTICLES (Prompt 2)
          ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[8] pointer-events-none">
        <FloatingParticles />
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN HERO CONTENT
          ══════════════════════════════════════════════════ */}
      <div id="hero-content" className="absolute inset-0 z-[10] flex flex-col justify-between pointer-events-none">

        {/* ── TOP NAV BAR ──────────────────────────────────── */}
        <nav className="pointer-events-auto w-full px-5 lg:px-10 pt-4 flex items-center justify-between">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-white font-serif font-bold text-lg shadow-md border border-white/25">
              V
            </div>
            <span
              className="vatapi-wordmark-glow font-serif text-2xl font-extrabold tracking-tight text-white"
              style={{ filter: 'drop-shadow(0 0 5px rgba(137,245,231,0.35))', transition: 'filter 0.3s ease' }}
            >
              Vatapi
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-[#89f5e7] border border-white/15 backdrop-blur-sm">
              Chalukyan Grid
            </span>
          </div>

          {/* Live indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-xs text-[#d1ece6]">
            <span className="w-2 h-2 rounded-full bg-[#00e5c9] animate-ping shrink-0" />
            <span className="font-mono text-[10px] tracking-wider">LIVE · BADAMI · PATTADAKAL · AIHOLE</span>
          </div>

          {/* AUTH CORNER — Prompt 3 glassmorphic widget (top-right) */}
          <div
            className="glass-card pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(20,12,6,0.70)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
              borderRadius: '14px',
            }}
          >
            {user ? (
              <Link href="/home" className="flex items-center gap-1.5 text-xs font-semibold text-[#89f5e7] hover:text-white transition-colors">
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-[10px] font-bold text-white">
                  {user.email?.[0]?.toUpperCase()}
                </span>
                <span className="hidden sm:inline">Continue →</span>
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
                  {/* Google G icon */}
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
                  </svg>
                  <span className="hidden sm:inline">{authLoading ? '…' : 'Gmail'}</span>
                </button>

                <div className="w-px h-5 bg-white/20" />

                {/* Explore as Guest */}
                <Link
                  href="/home"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#9a452c] to-[#00685f] hover:from-[#aa4c31] hover:to-[#007f74] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#9a452c]/30 flex items-center gap-1 group"
                >
                  <span>Guest</span>
                  <span className="text-[#89f5e7] group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </>
            )}

            {authError && (
              <span className="text-[10px] text-amber-300 font-mono px-2 truncate max-w-[120px]" title={authError}>
                ⚠ {authError.slice(0, 20)}…
              </span>
            )}
          </div>
        </nav>

        {/* ── CENTER HERO TITLE OVERLAY ─────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 pointer-events-none">
          {/* Glassmorphic hero info card — mouse tilt applied via ref */}
          <div
            ref={heroCardRef}
            className="glass-card text-center max-w-xl w-full px-5 py-6 sm:px-8 sm:py-8"
            style={{
              background: 'rgba(18, 10, 5, 0.65)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'transform 0.12s ease-out',
              willChange: 'transform',
            }}
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[10px] font-semibold tracking-wider mb-3">
              <span className="text-amber-400">✦</span> Chalukyan Capital · 543 – 757 CE <span className="text-amber-400">✦</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg leading-tight">
              Badami <span className="text-[#ffb29e]">Heritage</span><br />
              <span className="text-sm sm:text-base font-semibold tracking-wide text-[#d1ece6]/80 font-sans">
                AI-Powered Civic Heritage Grid
              </span>
            </h1>

            {/* Animated stat counters (Prompt 2) */}
            <div className="mt-4 grid grid-cols-4 gap-1 sm:gap-2">
              {[
                { val: '4', label: 'UNESCO', sub: 'Sites' },
                { val: '1400+', label: 'Years', sub: 'Legacy' },
                { val: '312', label: 'GI', sub: 'Weavers' },
                { val: '98%', label: 'Triaged', sub: 'AI Speed' },
              ].map(({ val, label, sub }) => (
                <div key={label} className="flex flex-col items-center p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm sm:text-base font-bold font-mono text-[#89f5e7]">{val}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{label}</span>
                  <span className="text-[8px] text-white/45">{sub}</span>
                </div>
              ))}
            </div>

            {/* Explore CTA — teal glow button (Prompt 2) */}
            <div className="mt-4 pointer-events-auto">
              <Link
                href="/heritage-watch"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 group"
                style={{
                  background: 'linear-gradient(135deg, #9a452c 0%, #006860 100%)',
                  boxShadow: '0 0 20px rgba(13,148,136,0.35)',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(13,148,136,0.65), 0 8px 20px rgba(0,0,0,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(13,148,136,0.35)')}
              >
                <span>Explore Heritage Watch</span>
                <span className="text-[#89f5e7] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: DISCOVER STRIP (Prompt 2) + SCROLL INDICATOR ── */}
        <div className="pointer-events-auto w-full px-4 lg:px-8 pb-4 pt-2 space-y-2">
          {/* Drag-scrollable gallery dock */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 w-max pb-1">
              {[
                { src: '/images/jolada_rotti_feast.png', label: 'Banana Leaf Feast', tag: 'Culinary', color: 'bg-emerald-700/80', glow: 'hover:border-[#89f5e7]', href: '/home#food' },
                { src: '/images/badami_carvings_col.png', label: 'Rock-Cut Caves', tag: 'Heritage', color: 'bg-[#9a452c]/90', glow: 'hover:border-[#ffb29e]', href: '/home#heritage' },
                { src: '/images/weaver_loom.png', label: 'Handloom Craft', tag: 'GI Weavers', color: 'bg-amber-600/90', glow: 'hover:border-amber-300', href: '/home#crafts' },
                { src: '/images/badami_sunset_aerial.png', label: 'Heritage Watch', tag: 'Civic AI', color: 'bg-teal-700/90', glow: 'hover:border-teal-300', href: '/heritage-watch' },
              ].map(({ src, label, tag, color, glow, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`group relative w-36 sm:w-44 h-16 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 ${glow} transition-all duration-300 hover:scale-[1.04] vatapi-card-ripple`}
                  style={{ '--ripple-x': '50%', '--ripple-y': '50%' } as React.CSSProperties}
                  onMouseMove={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--ripple-x', `${((e.clientX - rect.left) / rect.width * 100)}%`);
                    e.currentTarget.style.setProperty('--ripple-y', `${((e.clientY - rect.top) / rect.height * 100)}%`);
                  }}
                >
                  <Image src={src} alt={label} fill className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-[0.72]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-1.5 left-2 right-2">
                    <span className={`inline-block px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${color} text-white mb-0.5`}>{tag}</span>
                    <p className="text-[10px] sm:text-xs font-semibold text-white truncate leading-tight">{label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Scroll indicator — teal pulse line */}
          <div
            className={`mx-auto w-12 h-px rounded-full transition-opacity duration-700 ${scrolled ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(137,245,231,0.85), transparent)' }}
            aria-hidden="true"
          >
            <div
              className="h-px w-full rounded-full animate-pulse"
              style={{ background: 'rgba(137,245,231,0.6)', animationDuration: '1.8s' }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

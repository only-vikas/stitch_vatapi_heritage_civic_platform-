'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParallaxHero } from '@/hooks/useParallaxHero';
import FloatingParticles from '@/components/FloatingParticles';

/**
 * CinematicHero
 *
 * Wraps the homepage hero with:
 *  - Cinematic curtain reveal (Vatapi wordmark → split open)
 *  - 4 simulated image depth layers (sky / town / lake / cliff)
 *  - GSAP ScrollTrigger parallax
 *  - Ambient overlays (cave glow, sun flare, boat shadows, water ripple)
 *  - Glassmorphic content card with mouse-tilt
 *
 * The children prop receives the original hero content (headline + CTAs).
 * On screens < 768 px the multi-layer parallax is disabled for performance.
 */
interface CinematicHeroProps {
  children: React.ReactNode;
}

export default function CinematicHero({ children }: CinematicHeroProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [curtainDone, setCurtainDone] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Detect desktop (hydration-safe)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Hide curtain after 2.2 s (GSAP animation is 1.1 + 0.9 = 2 s)
  useEffect(() => {
    const t = setTimeout(() => setCurtainDone(true), 2300);
    return () => clearTimeout(t);
  }, []);

  // Activate GSAP hook
  useParallaxHero(isDesktop);

  // Mouse-tracking tilt for glass card
  useEffect(() => {
    if (!isDesktop) return;
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rotX = ((e.clientY - cy) / rect.height) * -5;
      const rotY = ((e.clientX - cx) / rect.width) * 5;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    };

    const handleLeave = () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
    };
  }, [isDesktop]);

  return (
    <section
      id="hero-parallax"
      className="relative w-full overflow-hidden bg-[#1b1c1a] text-white"
      style={{ minHeight: '88vh' }}
    >
      {/* ══════════════════════════════════════════════════
          CINEMATIC CURTAIN (hides behind hero, then splits)
          ══════════════════════════════════════════════════ */}
      {!curtainDone && (
        <>
          {/* Top half */}
          <div
            id="curtain-top"
            className="fixed inset-x-0 top-0 z-[200] flex items-end justify-center pb-0"
            style={{
              height: '50vh',
              background: 'linear-gradient(to bottom, #1a0f08 60%, #2d1a0e)',
              willChange: 'transform',
            }}
          >
            {/* Wordmark centred across both halves – visible on top half */}
            <div
              id="curtain-wordmark"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ top: 0, bottom: '-50vh' }}
            >
              <div className="flex flex-col items-center gap-3 select-none">
                <Image
                  src="/images/vatapi_wordmark.png"
                  alt="Vatapi"
                  width={160}
                  height={56}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                <span className="text-[#ffdbd1]/70 text-xs uppercase tracking-[0.35em] font-semibold">
                  AI Heritage Civic Grid
                </span>
              </div>
            </div>
          </div>
          {/* Bottom half */}
          <div
            id="curtain-bottom"
            className="fixed inset-x-0 bottom-0 z-[200]"
            style={{
              height: '50vh',
              background: 'linear-gradient(to top, #1a0f08 60%, #2d1a0e)',
              willChange: 'transform',
            }}
          />
        </>
      )}

      {/* ══════════════════════════════════════════════════
          FLOATING LOTUS PARTICLES (Prompt 2)
          ══════════════════════════════════════════════════ */}
      <FloatingParticles />

      {/* ══════════════════════════════════════════════════
          SVG FILTER (water ripple applied to layer-lake)
          ══════════════════════════════════════════════════ */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
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
          LAYER STACK  (clip-path simulated depth zones)
          ══════════════════════════════════════════════════ */}

      {/* BASE – full image (acts as fallback / mobile layer) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ willChange: 'transform' }}
      >
        <Image
          src="/images/badami_caves.png"
          alt="Badami Aerial View"
          fill
          className="object-cover object-center opacity-35 mix-blend-luminosity"
          priority
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      </div>

      {/* LAYER SKY – top 40% of image */}
      <div
        id="layer-sky"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <Image
          src="/images/badami_caves.png"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover object-top opacity-20"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 42%, 0 42%)' }}
        />
      </div>

      {/* LAYER TOWN – right 30% */}
      <div
        id="layer-town"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <Image
          src="/images/badami_caves.png"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover object-right opacity-25"
          style={{ clipPath: 'polygon(70% 0, 100% 0, 100% 100%, 70% 100%)' }}
        />
      </div>

      {/* LAYER LAKE – bottom 50% */}
      <div
        id="layer-lake"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          willChange: 'transform',
          filter: 'url(#water-ripple-filter)',
        }}
      >
        <Image
          src="/images/badami_caves.png"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover object-bottom opacity-30"
          style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
        />
      </div>

      {/* LAYER CLIFF – left 40% */}
      <div
        id="layer-cliff"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <Image
          src="/images/badami_caves.png"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover object-left opacity-40"
          style={{ clipPath: 'polygon(0 0, 42% 0, 42% 100%, 0 100%)' }}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          AMBIENT OVERLAYS
          ══════════════════════════════════════════════════ */}

      {/* Cave glow (positioned over cave-temple zone ~35-65% down, 10-50% right) */}
      <div
        id="layer-cave-glow"
        className="absolute pointer-events-none"
        style={{
          top: '32%',
          left: '8%',
          width: '44%',
          height: '38%',
          opacity: 0.85,
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(255,148,100,0.22) 0%, rgba(255,100,50,0.08) 55%, transparent 80%)',
          willChange: 'opacity',
        }}
      />

      {/* Sun flare (top-right sky area) */}
      <div
        id="sun-flare"
        className="absolute pointer-events-none"
        style={{
          top: '4%',
          right: '18%',
          width: '180px',
          height: '180px',
          opacity: 0.35,
          background:
            'radial-gradient(circle, rgba(255,220,140,0.7) 0%, rgba(255,180,80,0.3) 40%, transparent 70%)',
          willChange: 'transform, opacity',
          transform: 'scale(1)',
        }}
      />

      {/* Boat shadows (bottom-right lake zone ~60% down, 65% right) */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="boat-shadow absolute pointer-events-none"
          style={{
            top: `${62 + i * 2.5}%`,
            left: `${64 + i * 4}%`,
            width: '18px',
            height: '6px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.25)',
            willChange: 'transform',
          }}
        />
      ))}

      {/* Gradient overlay (depth + readability) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a100c]/88 via-[#24140e]/55 to-[#1b1c1a]/95 pointer-events-none" />

      {/* ══════════════════════════════════════════════════
          HERO CONTENT — Glassmorphic card + original markup
          ══════════════════════════════════════════════════ */}
      <div
        id="hero-content"
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-20 flex flex-col justify-between"
        style={{ minHeight: '85vh' }}
      >
        {children}
      </div>

      {/* ══════════════════════════════════════════════════
          SCROLL INDICATOR
          ══════════════════════════════════════════════════ */}
      <ScrollIndicator />
    </section>
  );
}

/* ── Scroll indicator ─────────────────────────────────── */
function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-[#89f5e7]/60 font-semibold">
        Scroll
      </span>
      <div className="w-px h-10 relative overflow-hidden bg-white/10 rounded-full">
        <div className="absolute top-0 left-0 w-full bg-[#89f5e7] rounded-full animate-scroll-line" />
      </div>
    </div>
  );
}

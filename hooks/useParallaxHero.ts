'use client';

import { useEffect, useRef } from 'react';


/**
 * useParallaxHero
 *
 * Orchestrates the cinematic 4-layer parallax on the homepage hero:
 *   - Curtain reveal (split top/bottom)
 *   - Per-layer entrance animations (sky, town, lake, cliff)
 *   - ScrollTrigger-driven parallax depth
 *   - Ambient micro-animations (cave glow, boat bob, sun flare, water ripple)
 *   - Cleans up all timelines on unmount via gsap.context()
 */
export function useParallaxHero(enabled: boolean = true) {
  const contextRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    let gsapModule: any;
    let ScrollTriggerModule: any;

    const init = async () => {
      // Dynamic imports so SSR never touches GSAP
      const { gsap: gsapImport, default: gsapDefault } = await import('gsap') as any;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger') as any;

      gsapModule = gsapImport ?? gsapDefault;
      ScrollTriggerModule = ScrollTrigger;

      gsapModule.registerPlugin(ScrollTrigger);

      contextRef.current = gsapModule.context(() => {
        // ─────────────────────────────────────────────────
        // PHASE 0 – Kill default browser scroll-restoration
        // ─────────────────────────────────────────────────
        window.scrollTo(0, 0);

        const tl = gsapModule.timeline({ defaults: { ease: 'power3.out' } });

        // ─────────────────────────────────────────────────
        // PHASE 1 – Cinematic curtain (split top/bottom)
        // ─────────────────────────────────────────────────
        const curtainTop = document.getElementById('curtain-top');
        const curtainBot = document.getElementById('curtain-bottom');
        const curtainWord = document.getElementById('curtain-wordmark');

        if (curtainTop && curtainBot) {
          // Word mark fades in first
          tl.from(curtainWord, { opacity: 0, y: 12, duration: 0.6 }, 0)
            // Hold, then split
            .to(curtainTop, { yPercent: -100, duration: 0.9, ease: 'power2.inOut' }, 1.1)
            .to(curtainBot, { yPercent: 100, duration: 0.9, ease: 'power2.inOut' }, 1.1)
            .set([curtainTop, curtainBot], { display: 'none' }, '+=0');
        }

        // ─────────────────────────────────────────────────
        // PHASE 2 – Layer entrance animations
        // ─────────────────────────────────────────────────
        const layerSky = document.getElementById('layer-sky');
        const layerTown = document.getElementById('layer-town');
        const layerLake = document.getElementById('layer-lake');
        const layerCliff = document.getElementById('layer-cliff');
        const heroContent = document.getElementById('hero-content');

        const startTime = curtainTop ? 1.5 : 0;

        if (layerSky) {
          tl.from(layerSky, { scale: 1.1, duration: 2.0 }, startTime);
        }
        if (layerTown) {
          tl.from(layerTown, { opacity: 0, y: 30, scale: 1.05, duration: 1.4 }, startTime + 0.1);
        }
        if (layerLake) {
          tl.from(layerLake, { opacity: 0, duration: 1.6 }, startTime + 0.2);
        }
        if (layerCliff) {
          tl.from(layerCliff, { x: -100, opacity: 0, duration: 1.5, ease: 'power3.out' }, startTime + 0.05);
        }
        if (heroContent) {
          tl.from(
            heroContent,
            { opacity: 0, y: 24, duration: 1.0, ease: 'power2.out' },
            startTime + 0.5,
          );
        }

        // ─────────────────────────────────────────────────
        // PHASE 3 – ScrollTrigger parallax depth
        // ─────────────────────────────────────────────────
        const heroSection = document.getElementById('hero-parallax');

        if (heroSection) {
          const scrollTl = gsapModule.timeline({
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.2,
            },
          });

          if (layerCliff)  scrollTl.to(layerCliff,  { yPercent: 30 }, 0);
          if (layerTown)   scrollTl.to(layerTown,   { yPercent: 10 }, 0);
          if (layerSky)    scrollTl.to(layerSky,    { yPercent: 5  }, 0);
          if (heroContent) scrollTl.to(heroContent, { opacity: 0, yPercent: -15 }, 0);
        }

        // ─────────────────────────────────────────────────
        // PHASE 4 – Ambient micro-animations
        // ─────────────────────────────────────────────────

        // Cave glow pulse
        const caveGlow = document.getElementById('layer-cave-glow');
        if (caveGlow) {
          gsapModule.to(caveGlow, {
            opacity: 1.0,
            duration: 3,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
          });
        }

        // Boats bob
        const boats = document.querySelectorAll<HTMLElement>('.boat-shadow');
        boats.forEach((boat, i) => {
          gsapModule.to(boat, {
            y: -3,
            duration: 6,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 1.5,
          });
        });

        // Sun flare breathe
        const sunFlare = document.getElementById('sun-flare');
        if (sunFlare) {
          gsapModule.to(sunFlare, {
            scale: 1.05,
            opacity: 0.5,
            duration: 8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }

        // Water ripple via SVG feTurbulence seed increment
        const turbulence = document.getElementById('water-turbulence');
        if (turbulence) {
          let seed = 0;
          const rippleInterval = setInterval(() => {
            seed = (seed + 1) % 100;
            turbulence.setAttribute('seed', String(seed));
          }, 180);
          // Store cleanup ref on element
          (turbulence as any).__rippleInterval = rippleInterval;
        }
      });
    };

    init().catch(console.error);

    return () => {
      contextRef.current?.revert();
      // Clean up water ripple interval if set
      const turbulence = document.getElementById('water-turbulence');
      if (turbulence && (turbulence as any).__rippleInterval) {
        clearInterval((turbulence as any).__rippleInterval);
      }
    };
  }, [enabled]);
}

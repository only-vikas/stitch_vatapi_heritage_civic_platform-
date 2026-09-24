'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms delay before animation starts
  direction?: 'up' | 'left' | 'right' | 'fade';
}

/**
 * ScrollReveal
 *
 * Uses IntersectionObserver to trigger a one-shot reveal animation
 * when the element scrolls into view. Respects prefers-reduced-motion.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  const initialStyles: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      opacity: 0,
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      willChange: 'opacity, transform',
    };
    switch (direction) {
      case 'up':
        return { ...base, transform: 'translateY(40px)' };
      case 'left':
        return { ...base, transform: 'translateX(-40px)' };
      case 'right':
        return { ...base, transform: 'translateX(40px)' };
      case 'fade':
        return { ...base };
    }
  })();

  const revealedStyles: React.CSSProperties = {
    opacity: 1,
    transform: 'translate(0,0)',
    transition: `opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)`,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={revealed ? revealedStyles : initialStyles}
    >
      {children}
    </div>
  );
}

/**
 * useCountUp
 *
 * Returns a display string that counts up from 0 to `target` over `duration` ms.
 * Starts when `start` is true (e.g. when element scrolls into view).
 */
export function useCountUp(target: number, duration = 1800, start = false): string {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setCount(target);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return count.toLocaleString();
}

/**
 * StatCounter
 *
 * Animated counter card for the hero metrics strip.
 * Auto-starts when it scrolls into view.
 */
interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
  icon: string;
  delay?: number;
}

export function StatCounter({ value, suffix = '', label, icon, delay = 0 }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const display = useCountUp(value, 1600, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setActive(true), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 min-w-[100px]">
      <span className="material-symbols-outlined text-[#89f5e7] text-[22px]">{icon}</span>
      <span className="text-2xl font-bold font-serif text-white tabular-nums">
        {display}{suffix}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-[#f5f3f0]/70 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

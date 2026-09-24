'use client';

import React, { useRef, useEffect, useState } from 'react';

/**
 * GlassCard
 *
 * Glassmorphic container for the hero headline + CTAs.
 * Features:
 *  - Frosted glass background (backdrop-filter blur + saturation)
 *  - Mouse-tracking 3D tilt (max ±6°) with CSS perspective
 *  - Dynamic light-reflection ::before sheen on hover (via data-attrs + CSS vars --shine-x/--shine-y)
 *  - Smooth spring-like lerp / return on mouse leave
 *  - Disabled on mobile (< 768px) for performance
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, className = '', style = {} }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rotX = ((e.clientY - cy) / rect.height) * -6;
      const rotY = ((e.clientX - cx) / rect.width) * 6;

      // Tilt with perspective
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;

      // Move the light-sheen pseudo element via CSS custom properties
      const nx = ((e.clientX - rect.left) / rect.width) * 100;
      const ny = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--shine-x', `${nx}%`);
      card.style.setProperty('--shine-y', `${ny}%`);
      card.classList.add('glass-shine-active');
    };

    const handleLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      card.classList.remove('glass-shine-active');
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
    };
  }, [isDesktop]);

  return (
    <div
      ref={cardRef}
      className={`glass-card ${className}`}
      style={{
        background: 'rgba(27, 28, 26, 0.62)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -1px 1px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.12s ease-out, box-shadow 0.2s ease',
        willChange: 'transform',
        ...style,
      }}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

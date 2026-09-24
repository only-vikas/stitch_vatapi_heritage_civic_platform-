'use client';

import Image from 'next/image';
import { useRef } from 'react';

interface DiscoverCard {
  src: string;
  label: string;
  sublabel: string;
  tag: string;
  href: string;
  accent: string; // hex for tag bg
}

const cards: DiscoverCard[] = [
  {
    src: '/images/badami_sunset_aerial.png',
    label: 'Badami Caves',
    sublabel: 'Agastya Lake at Dusk',
    tag: 'Heritage Watch',
    href: '#heritage-watch',
    accent: '#00685f',
  },
  {
    src: '/images/badami_carvings_col.png',
    label: 'Chalukyan Carvings',
    sublabel: '6th Century Rock-Cut Temples',
    tag: 'Inscription Scanner',
    href: '/vatapi-voice',
    accent: '#9a452c',
  },
  {
    src: '/images/jolada_rotti_feast.png',
    label: 'Jolada Rotti Thali',
    sublabel: 'North Karnataka Gastronomic Heritage',
    tag: 'Ooru Oota',
    href: '#ooru-oota',
    accent: '#5b7c34',
  },
  {
    src: '/images/weaver_loom.png',
    label: 'Handloom Weavers',
    sublabel: 'Guledgudda Khana · GI Certified',
    tag: 'Artisan Guild',
    href: '#weavers',
    accent: '#7c4d9a',
  },
];

/**
 * DiscoverStrip
 *
 * A horizontally-scrollable row of glassmorphic image cards linking to the
 * platform's four main content pillars. Uses the user-provided photos.
 * Scroll-drag is enabled via pointer events.
 */
export default function DiscoverStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Mouse-drag scroll
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    startX = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeft = trackRef.current?.scrollLeft ?? 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    isDown = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };
  const onMouseUp = () => {
    isDown = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="relative py-16 overflow-hidden bg-[#1b1c1a]" aria-label="Discover Vatapi">
      {/* Ambient gradient top/bottom edges */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#1b1c1a] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#1b1c1a] to-transparent z-10 pointer-events-none" />

      {/* Section label */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-px bg-[#89f5e7]" />
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#89f5e7]">
            Discover Vatapi
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-white mt-2">
          Heritage · Cuisine · Craft · Inscription
        </h2>
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-4 px-6 lg:px-12 select-none scrollbar-hide"
        style={{ cursor: 'grab', WebkitOverflowScrolling: 'touch' }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {cards.map((card, i) => (
          <a
            key={i}
            href={card.href}
            className="group relative shrink-0 w-72 h-80 rounded-2xl overflow-hidden block"
            style={{ textDecoration: 'none' }}
            draggable={false}
          >
            {/* Image */}
            <Image
              src={card.src}
              alt={card.label}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="288px"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            {/* Tag pill */}
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider"
              style={{ background: card.accent }}
            >
              {card.tag}
            </div>

            {/* Glass card bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <p className="text-white font-serif font-bold text-base leading-tight">{card.label}</p>
              <p className="text-white/65 text-[11px] mt-0.5">{card.sublabel}</p>
              <div className="flex items-center gap-1 mt-2 text-[#89f5e7] text-[11px] font-semibold group-hover:gap-2 transition-all">
                <span>Explore</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>

            {/* Shine sweep on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
              }}
            />
          </a>
        ))}
      </div>
    </section>
  );
}

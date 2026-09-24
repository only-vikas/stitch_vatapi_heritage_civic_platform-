'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  hue: number; // 10–40 for terracotta/gold tones
}

/**
 * FloatingParticles
 *
 * Renders a canvas layer of floating Chalukyan "lotus petal" particles
 * drifting upward over the hero section. Pure Canvas2D — no GSAP needed.
 * Automatically disabled on prefers-reduced-motion.
 */
export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn initial particles
    const spawnParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      size: 3 + Math.random() * 6,
      speed: 0.3 + Math.random() * 0.7,
      opacity: 0.1 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      hue: 15 + Math.random() * 30, // terracotta → gold
    });

    // Seed initial particles scattered throughout the height
    for (let i = 0; i < 28; i++) {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    /** Draw a simplified 6-petal lotus shape */
    const drawLotus = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      hue: number,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      const petals = 6;
      for (let i = 0; i < petals; i++) {
        ctx.save();
        ctx.rotate((i / petals) * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.7, size * 0.25, size * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 70%, 68%)`;
        ctx.fill();
        ctx.restore();
      }

      // Centre dot
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue + 20}, 80%, 80%)`;
      ctx.fill();

      ctx.restore();
    };

    let spawnTimer = 0;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnTimer++;
      // Spawn a new particle every ~90 frames
      if (spawnTimer > 90) {
        spawnTimer = 0;
        if (particles.length < 40) {
          particles.push(spawnParticle());
        }
      }

      particles = particles.filter((p) => p.y > -30 && p.opacity > 0.01);

      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.rotation += p.rotationSpeed;
        // Fade in near bottom, fade out near top
        if (p.y > canvas.height * 0.8) {
          p.opacity = Math.min(0.45, p.opacity + 0.003);
        } else if (p.y < canvas.height * 0.2) {
          p.opacity = Math.max(0, p.opacity - 0.004);
        }

        drawLotus(ctx, p.x, p.y, p.size, p.rotation, p.opacity, p.hue);
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

'use client';

/**
 * SlideParticles — partikel bergerak dinamis yang dibatasi (confined) ke
 * elemen induknya, bukan seluruh viewport. Cocok dipasang sebagai latar
 * satu slide dengan warna solid.
 *
 * - Titik-titik kecil bergerak ke segala arah, memantul di tepi.
 * - Garis tipis menghubungkan titik yang berdekatan (efek jaringan/konstelasi).
 * - Ringan: satu canvas 2D + requestAnimationFrame; berhenti saat tab tidak
 *   aktif atau saat prefers-reduced-motion aktif; mengikuti ukuran induk.
 */

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** Warna partikel per tema: terlihat baik di latar terang maupun gelap. */
function themeColor(): { r: number; g: number; b: number } {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark'
    ? { r: 150, g: 180, b: 255 } // dark bg → biru terang
    : { r: 84, g: 105, b: 168 }; // light bg → slate-biru
}

export function SlideParticles({ className, paused = false }: { className?: string; paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext('2d');
    if (!context) return;
    const parentEl = canvasEl.parentElement;
    if (!parentEl) return;
    const canvas = canvasEl;
    const ctx = context;
    const parent = parentEl;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINK_DIST = 140;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let rafId = 0;
    let reduced = prefersReduced.matches;
    let color = themeColor();

    function build() {
      const count = Math.min(46, Math.max(15, Math.round((width * height) / 30000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        r: Math.random() * 1.6 + 1,
      }));
    }

    function resize() {
      // Skip while the slide has no size yet; the ResizeObserver re-runs this
      // once layout settles, so the canvas is never left blank at 0x0.
      if (parent.clientWidth === 0 || parent.clientHeight === 0) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      // Paint immediately so the slide never shows an empty canvas, even while
      // paused (off-screen or mid-transition). Resizing clears the bitmap, so
      // this has to run after every resize as well.
      render();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // garis penghubung antar titik berdekatan
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const op = (1 - dist / LINK_DIST) * 0.14;
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${op})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // titik-titik bergerak + pantulan tepi
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
        ctx.fill();
      }
    }

    let lastFrame = 0;
    const frameInterval = 1000 / 30; // cap at ~30fps; drift is slow enough

    function loop(now: number) {
      rafId = requestAnimationFrame(loop);
      // Skip repaints while off-screen or mid-transition, and throttle the rest,
      // so scrolling and sliding stay smooth.
      if (pausedRef.current) return;
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;
      render();
    }

    function start() {
      cancelAnimationFrame(rafId);
      // Always show a first frame right away, then animate if motion is allowed.
      render();
      if (!reduced) rafId = requestAnimationFrame(loop);
    }

    function stop() {
      cancelAnimationFrame(rafId);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onReducedChange() {
      reduced = prefersReduced.matches;
      start();
    }

    const themeObserver = new MutationObserver(() => {
      color = themeColor();
      // Repaint even while paused so a theme toggle is reflected immediately.
      render();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    resize();
    start();

    document.addEventListener('visibilitychange', onVisibility);
    prefersReduced.addEventListener('change', onReducedChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      prefersReduced.removeEventListener('change', onReducedChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}

'use client';

/**
 * KawalKontrak.ai — Background Partikel + Neraca Hukum Melayang
 * =============================================================
 * Canvas full-viewport (fixed, z-index -1) berisi:
 *  1. Partikel kecil melayang naik dengan ayunan halus (seperti debu).
 *  2. Ikon timbangan/neraca keadilan (line-art) yang melayang naik
 *     perlahan sambil berayun seperti pendulum — sesuai tema hukum.
 *
 * Prinsip desain:
 *  - Warna = senada background, sedikit lebih terang (dark) / lebih
 *    gelap (light) agar terlihat bergerak tanpa mengganggu keterbacaan.
 *  - Ringan: satu canvas 2D + requestAnimationFrame; pause saat tab
 *    tidak aktif; berhenti saat prefers-reduced-motion aktif.
 *  - Adaptif: warna ikut berubah saat tema light/dark di-toggle.
 */

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
}

interface Scale {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  rockPhase: number;
  rockSpeed: number;
  rockAmp: number;
  opacity: number;
}

/** Warna per tema: senada background, sedikit kontras agar terlihat. */
function themeColor(): { r: number; g: number; b: number } {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark'
    ? { r: 120, g: 150, b: 235 } // dark bg → biru-indigo lembut (lebih terang)
    : { r: 84, g: 105, b: 168 }; // light bg → slate-biru (senada dark, sedikit lebih gelap)
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext('2d');
    if (!context) return;
    // Alias ke const non-null agar tipe tetap ter-narrow di dalam closure
    const canvas = canvasEl;
    const ctx = context;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Diisi/dikurangi di tempat oleh fit(), tidak pernah diganti wholesale,
    // supaya partikel yang sedang melayang tetap pada posisinya.
    const particles: Particle[] = [];
    const scales: Scale[] = [];
    let rafId = 0;
    let color = themeColor();
    let reduced = prefersReduced.matches;

    // ── Partikel ─────────────────────────────────────────────
    function spawnParticle(atBottom: boolean): Particle {
      return {
        x: Math.random() * width,
        y: atBottom ? height + Math.random() * 40 : Math.random() * height,
        size: Math.random() * 4 + 3.5, // sisi persegi 3.5–7.5 px (sedikit lebih besar)
        speedY: -(Math.random() * 0.32 + 0.1),
        driftX: (Math.random() - 0.5) * 0.25,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.015 + 0.004,
        swayAmp: Math.random() * 0.5 + 0.15,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.014, // rotasi lambat dua arah (kesan melayang)
        opacity: Math.random() * 0.4 + 0.18,
      };
    }

    // ── Neraca keadilan ──────────────────────────────────────
    function spawnScale(atBottom: boolean): Scale {
      return {
        x: Math.random() * width,
        y: atBottom ? height + Math.random() * 120 : Math.random() * height,
        size: Math.random() * 22 + 18, // 18–40 px
        speedY: -(Math.random() * 0.16 + 0.05), // lebih pelan dari partikel
        driftX: (Math.random() - 0.5) * 0.2,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.006 + 0.002,
        swayAmp: Math.random() * 0.8 + 0.3,
        rockPhase: Math.random() * Math.PI * 2,
        rockSpeed: Math.random() * 0.012 + 0.006,
        rockAmp: Math.random() * 0.1 + 0.08, // ±~5–10° ayunan pendulum
        opacity: Math.random() * 0.07 + 0.08, // 0.08–0.15 (halus)
      };
    }

    function targetCounts() {
      const area = width * height;
      return {
        p: Math.min(46, Math.max(18, Math.round(area / 40000))),
        s: Math.min(4, Math.max(2, Math.round(area / 420000))),
      };
    }

    /**
     * Menyesuaikan jumlah partikel tanpa mengacak yang sudah melayang.
     * Partikel lama dipertahankan apa adanya; hanya kelebihannya yang dibuang
     * dan kekurangannya yang ditambah, lalu yang terlanjur di luar bingkai
     * baru digeser masuk. Dengan begitu perubahan ukuran tidak pernah terlihat
     * sebagai "reset" di layar.
     */
    function fit() {
      const { p: pCount, s: sCount } = targetCounts();

      while (particles.length > pCount) particles.pop();
      while (particles.length < pCount) particles.push(spawnParticle(false));
      while (scales.length > sCount) scales.pop();
      while (scales.length < sCount) scales.push(spawnScale(false));

      for (const p of particles) {
        if (p.x > width + 16) p.x = Math.random() * width;
        if (p.y > height + 40) p.y = Math.random() * height;
      }
      for (const sc of scales) {
        if (sc.x > width + sc.size * 2) sc.x = Math.random() * width;
        if (sc.y > height + sc.size * 2) sc.y = Math.random() * height;
      }
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Bail out while the viewport reports 0 (hidden tab, ancestor still
      // laying out). Otherwise the canvas would be sized 0x0 and stay blank
      // until the next window resize. The ResizeObserver below re-runs this
      // as soon as a real size is available.
      if (w === 0 || h === 0) return;
      // The ResizeObserver watches documentElement, so it also fires when the
      // page merely grows taller (an FAQ item expanding, a card opening). The
      // viewport itself has not changed then, so there is nothing to redraw:
      // returning here is what keeps the particles from visibly jumping.
      if (w === width && h === height) return;

      width = w;
      height = h;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fit();
      // Paint at once so particles are on screen the moment layout settles.
      render();
    }

    /** Menggambar satu ikon neraca (line-art) berpusat di (cx, cy). */
    function drawScale(sc: Scale) {
      const s = sc.size;
      ctx.save();
      ctx.translate(sc.x, sc.y);
      ctx.rotate(Math.sin(sc.rockPhase) * sc.rockAmp);
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${sc.opacity})`;
      ctx.lineWidth = Math.max(1, s * 0.045);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const beamY = -s * 0.62;
      const armX = s * 0.78;
      const panR = s * 0.3;
      const panY = beamY + s * 0.52;

      // tiang tengah
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.86);
      ctx.lineTo(0, s * 0.78);
      ctx.stroke();

      // knop atas
      ctx.beginPath();
      ctx.arc(0, -s * 0.86, s * 0.08, 0, Math.PI * 2);
      ctx.stroke();

      // palang (beam)
      ctx.beginPath();
      ctx.moveTo(-armX, beamY);
      ctx.lineTo(armX, beamY);
      ctx.stroke();

      // alas + kaki
      ctx.beginPath();
      ctx.moveTo(-s * 0.42, s * 0.78);
      ctx.lineTo(s * 0.42, s * 0.78);
      ctx.moveTo(-s * 0.22, s * 0.78);
      ctx.lineTo(-s * 0.1, s * 0.55);
      ctx.moveTo(s * 0.22, s * 0.78);
      ctx.lineTo(s * 0.1, s * 0.55);
      ctx.stroke();

      // dua piringan + rantai
      for (const sign of [-1, 1] as const) {
        const ex = sign * armX;
        ctx.beginPath();
        ctx.moveTo(ex, beamY);
        ctx.lineTo(ex - panR, panY);
        ctx.moveTo(ex, beamY);
        ctx.lineTo(ex + panR, panY);
        ctx.stroke();
        // mangkuk (setengah lingkaran terbuka ke atas)
        ctx.beginPath();
        ctx.arc(ex, panY, panR, 0, Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // neraca (di belakang partikel)
      for (const sc of scales) {
        sc.rockPhase += sc.rockSpeed;
        sc.swayPhase += sc.swaySpeed;
        sc.x += sc.driftX + Math.sin(sc.swayPhase) * sc.swayAmp * 0.2;
        sc.y += sc.speedY;
        if (sc.y < -sc.size * 2) Object.assign(sc, spawnScale(true));
        if (sc.x < -sc.size * 2) sc.x = width + sc.size * 2;
        else if (sc.x > width + sc.size * 2) sc.x = -sc.size * 2;
        drawScale(sc);
      }

      // partikel (persegi kecil solid, berputar pelan sambil melayang)
      for (const p of particles) {
        p.swayPhase += p.swaySpeed;
        p.rotation += p.rotSpeed;
        p.x += p.driftX + Math.sin(p.swayPhase) * p.swayAmp * 0.25;
        p.y += p.speedY;
        if (p.y < -16) Object.assign(p, spawnParticle(true));
        if (p.x < -16) p.x = width + 16;
        else if (p.x > width + 16) p.x = -16;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${p.opacity})`;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }

    let lastFrame = 0;
    const frameInterval = 1000 / 30; // cap at ~30fps to keep scrolling smooth

    function loop(now: number) {
      rafId = requestAnimationFrame(loop);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;
      render();
    }

    function start() {
      cancelAnimationFrame(rafId);
      if (reduced) render();
      else rafId = requestAnimationFrame(loop);
    }

    function stop() {
      cancelAnimationFrame(rafId);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    const themeObserver = new MutationObserver(() => {
      color = themeColor();
      if (reduced) render();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    function onReducedChange() {
      reduced = prefersReduced.matches;
      start();
    }

    resize();
    start();

    // Covers the case where the viewport is still 0 at mount (hidden tab,
    // deferred layout): fires as soon as a real size exists, unlike the
    // window 'resize' event which may never come.
    const viewportObserver = new ResizeObserver(resize);
    viewportObserver.observe(document.documentElement);

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    prefersReduced.addEventListener('change', onReducedChange);

    return () => {
      stop();
      viewportObserver.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      prefersReduced.removeEventListener('change', onReducedChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
      }}
    />
  );
}

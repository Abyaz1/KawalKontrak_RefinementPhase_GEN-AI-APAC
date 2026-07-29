'use client';

/**
 * KawalKontrak.ai — Jejak Partikel Kursor
 * =========================================
 * Canvas full-viewport (fixed, pointer-events: none) yang memancarkan
 * partikel tipis mengikuti gerakan kursor, lalu memudar.
 *
 * Prinsip desain (sama dengan ParticlesBackground):
 *  - Warna diambil dari palet tema yang sama, jadi ikut berubah saat
 *    light/dark di-toggle.
 *  - Sangat ringan. Tiga hal yang menjaganya tetap murah:
 *      1. Loop rAF BERHENTI total begitu partikel terakhir mati, jadi
 *         saat mouse diam biaya CPU benar-benar nol (bukan sekadar
 *         menggambar frame kosong berulang kali).
 *      2. Partikel dibatasi MAX_PARTICLES dan hanya lahir setiap
 *         SPAWN_DISTANCE piksel, sehingga gerakan cepat tidak membanjiri
 *         canvas.
 *      3. Tidak memakai shadowBlur/filter (bagian termahal di canvas 2D),
 *         hanya lingkaran kecil dengan alpha.
 *  - Nonaktif total pada perangkat sentuh (tidak ada kursor) dan saat
 *    prefers-reduced-motion aktif — canvas bahkan tidak dipasang.
 *  - Pause saat tab tidak aktif.
 */

import { useEffect, useRef } from 'react';

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

/** Maksimum partikel hidup bersamaan. */
const MAX_PARTICLES = 42;
/** Jarak tempuh kursor (px) sebelum partikel berikutnya lahir. */
const SPAWN_DISTANCE = 7;
/** Umur partikel dalam frame (~50 frame ≈ 0.8 detik pada 60fps). */
const LIFE_MIN = 26;
const LIFE_MAX = 50;

/** Warna per tema — senada dengan ParticlesBackground. */
function themeColor(): { r: number; g: number; b: number } {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark'
    ? { r: 120, g: 150, b: 235 } // dark bg → biru-indigo lembut
    : { r: 84, g: 105, b: 168 }; // light bg → slate-biru
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext('2d');
    if (!context) return;
    const canvas = canvasEl;
    const ctx = context;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Perangkat sentuh tidak punya kursor yang bisa diikuti.
    const finePointer = window.matchMedia('(pointer: fine)');

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: TrailParticle[] = [];
    let rafId = 0;
    let running = false;
    let color = themeColor();

    /** Efek dimatikan sepenuhnya jika tidak ada kursor atau motion dikurangi. */
    function enabled(): boolean {
      return finePointer.matches && !prefersReduced.matches;
    }

    let lastSpawnX = 0;
    let lastSpawnY = 0;
    let hasMoved = false;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Batal selama viewport masih melaporkan 0 (tab tersembunyi, layout
      // ancestor belum selesai). Tanpa ini canvas akan tersize 0x0; dengan
      // ini ia tetap 300x150 default sampai ResizeObserver di bawah
      // menjalankan ulang begitu ukuran sebenarnya tersedia.
      if (w === 0 || h === 0) return;
      // ResizeObserver di bawah mengamati documentElement, sehingga ikut
      // terpicu saat halaman sekadar bertambah tinggi (mis. kotak FAQ dibuka).
      // Viewport-nya sendiri tidak berubah, dan menyetel ulang canvas.width
      // akan menghapus jejak kursor yang sedang tampil. Jadi berhenti di sini.
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(x: number, y: number) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const maxLife = Math.random() * (LIFE_MAX - LIFE_MIN) + LIFE_MIN;
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        // Melayang pelan ke atas, meniru partikel latar
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 0.35 + 0.05),
        size: Math.random() * 2.6 + 1.2, // radius 1.2–3.8 px (tipis)
        life: maxLife,
        maxLife,
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 1;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        // Melambat perlahan agar jejaknya terasa mengendap, bukan melesat
        p.vx *= 0.97;
        p.vy *= 0.98;

        const t = p.life / p.maxLife; // 1 → 0
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${t * 0.45})`;
        ctx.fill();
      }
    }

    function loop() {
      render();
      if (particles.length === 0) {
        // Tidak ada lagi yang digambar: hentikan loop sepenuhnya sehingga
        // saat kursor diam, halaman ini benar-benar tidak memakai CPU.
        running = false;
        return;
      }
      rafId = requestAnimationFrame(loop);
    }

    function ensureRunning() {
      if (running || document.hidden) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      if (!enabled() || e.pointerType !== 'mouse') return;

      if (!hasMoved) {
        hasMoved = true;
        lastSpawnX = e.clientX;
        lastSpawnY = e.clientY;
        return;
      }

      const dx = e.clientX - lastSpawnX;
      const dy = e.clientY - lastSpawnY;
      if (dx * dx + dy * dy < SPAWN_DISTANCE * SPAWN_DISTANCE) return;

      lastSpawnX = e.clientX;
      lastSpawnY = e.clientY;
      spawn(e.clientX, e.clientY);
      ensureRunning();
    }

    function stop() {
      cancelAnimationFrame(rafId);
      running = false;
    }

    function clear() {
      particles = [];
      stop();
      ctx.clearRect(0, 0, width, height);
    }

    function onVisibility() {
      // Buang jejak yang tertinggal supaya tidak muncul beku saat kembali
      if (document.hidden) clear();
    }

    function onPreferenceChange() {
      if (!enabled()) clear();
    }

    const themeObserver = new MutationObserver(() => {
      color = themeColor();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    resize();

    // Menangani kasus viewport masih 0 saat mount (tab tersembunyi, layout
    // ditunda): memicu begitu ukuran sebenarnya ada, tidak seperti event
    // 'resize' window yang mungkin tidak pernah datang.
    const viewportObserver = new ResizeObserver(resize);
    viewportObserver.observe(document.documentElement);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    prefersReduced.addEventListener('change', onPreferenceChange);
    finePointer.addEventListener('change', onPreferenceChange);

    return () => {
      stop();
      viewportObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      prefersReduced.removeEventListener('change', onPreferenceChange);
      finePointer.removeEventListener('change', onPreferenceChange);
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
        // Di bawah lapisan paling atas (10000) agar tidak menutupi modal
        zIndex: 9998,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
      }}
    />
  );
}

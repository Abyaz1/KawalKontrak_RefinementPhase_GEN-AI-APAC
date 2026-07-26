import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Output standalone: `next build` menghasilkan .next/standalone berisi
   * server.js plus node_modules minimal (tanpa devDependencies seperti
   * eslint/typescript). Dipakai Dockerfile.frontend agar image produksi
   * kecil dan cold start Cloud Run cepat.
   */
  output: "standalone",

  /**
   * Kunci workspace root ke direktori proyek ini.
   *
   * Tanpa ini Next menebak root dari lokasi lockfile terdekat. Jika ada
   * package-lock.json nyasar di direktori induk (mis. C:\Users\<nama>\),
   * root ikut naik ke sana dan .next/standalone jadi bersarang di
   * .next/standalone/<path>/<relatif>/server.js — sehingga COPY di
   * Dockerfile mengambil folder kosong dan container gagal start.
   * Menguncinya membuat layout output deterministik di semua mesin.
   */
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

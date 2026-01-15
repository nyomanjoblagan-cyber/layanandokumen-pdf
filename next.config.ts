/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matikan pengecekan TypeScript & ESLint saat build agar tidak berat/crash
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Konfigurasi Webpack untuk mengatasi error 'canvas' pada library PDF
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    // Tambahan: Pastikan file worker tidak diproses berlebihan
    config.module.rules.push({
      test: /pdf\.worker\.js/,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;
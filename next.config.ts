// @ts-nocheck

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matikan pengecekan TypeScript & ESLint saat build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Konfigurasi Webpack
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    
    config.module.rules.push({
      test: /pdf\.worker\.js/,
      type: 'asset/resource',
    });
    
    return config;
  },
};

module.exports = nextConfig;
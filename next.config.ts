import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // AGENTS.md: check-ins, reflections, and relapse notes are special-category
        // data. Nothing authenticated may sit in a shared cache, so the safe default
        // is no-store everywhere and an explicit opt-in on the public marketing pages.
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' }
        ]
      }
    ];
  }
};

export default nextConfig;

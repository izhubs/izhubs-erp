/** @type {import('next').NextConfig} */
const nextConfig = {
  // SCSS support (sass is installed)
  sassOptions: {
    includePaths: ['./app/styles'],
  },

  // Standalone output for Docker
  output: 'standalone',

  // Security + PWA headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/service-worker.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ];
  },
};

export default nextConfig;

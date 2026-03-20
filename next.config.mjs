/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  sassOptions: {
    includePaths: ['./app/styles'],
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false, // Set to false to allow middleware interception if needed
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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

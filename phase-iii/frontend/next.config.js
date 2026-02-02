/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Environment variables that should be available on the client side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Experimental features for Next.js 16+
  experimental: {
    // Enable server actions if needed for Better Auth
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Disable Turbopack to avoid Windows junction point issues
    turbo: false,
  },

  // API proxy configuration (if needed for CORS bypass in development)
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

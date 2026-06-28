/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/health', destination: '/api/health' },
      { source: '/shorten', destination: '/api/shorten' },
      { source: '/track/:path*', destination: '/api/track/:path*' },
      { source: '/verify-password/:path*', destination: '/api/verify-password/:path*' },
      { source: '/link-info/:path*', destination: '/api/link-info/:path*' },
      { source: '/:code([a-zA-Z0-9_-]{5,})', destination: '/api/:code' },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://back.brnk.in';
    return {
      // Fallback rewrites only apply when no Next.js page matches the route.
      // This sends short-code requests (e.g. /abc123) to the backend for
      // redirection while keeping all frontend pages working normally.
      fallback: [
        {
          source: '/:shortCode',
          destination: `${backendUrl}/:shortCode`,
        },
      ],
    };
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://back.brnk.in').replace(/\/+$/, '');
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/:path*`,
        },
      ],
    };
  },
  experimental: {
    outputFileTracingIncludes: {
      '/sitemap.xml': ['./data/posts/**/*'],
    },
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
        protocol: 'https',
      },
      {
        hostname: '**',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        destination: `/:path*`,
        source: '/:path*',
      },
      {
        destination: `${process.env.DOCS_URL}/docs`,
        source: '/docs',
      },
      {
        destination: `${process.env.DOCS_URL}/docs/:path*`,
        source: '/docs/:path*',
      },
    ];
  },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    // If client-side, don't polyfill `fs`
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;

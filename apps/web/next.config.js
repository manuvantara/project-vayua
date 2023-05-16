module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `/:path*`,
      },
      {
        source: "/docs",
        destination: `${process.env.DOCS_URL}/docs`
      },
      {
        source: "/docs/:path*",
        destination: `${process.env.DOCS_URL}/docs/:path*`
      },
    ]
  }
};

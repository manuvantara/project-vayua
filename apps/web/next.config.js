module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  async rewrites() {
    return [
      {
        source: "/docs",
        destination: "http://localhost:4000/docs"
      },
      {
        source: "/docs/:path*",
        destination: "http://localhost:4000/docs/:path*"
      },
    ]
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "bourseup.vercel.app" }],
        destination: "https://bourseup.co/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

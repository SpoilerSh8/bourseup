/** @type {import('next').NextConfig} */
const OLD_HOSTS = ["bourseup.vercel.app", "bourseup-shai-1.vercel.app"];

const nextConfig = {
  async redirects() {
    return OLD_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: "https://bourseup.co/:path*",
      permanent: true,
    }));
  },
};

module.exports = nextConfig;

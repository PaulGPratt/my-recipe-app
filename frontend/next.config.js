/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/o4k9",
        destination: "/o4k9/index.html",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/o4k9/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/", // The path to redirect from
        destination: "/home", // The path to redirect to
        permanent: true, // Whether the redirect is permanent (308) or temporary (307)
      },
    ];
  },
};

module.exports = nextConfig;

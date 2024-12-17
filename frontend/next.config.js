/** @type {import('next').NextConfig} */
const nextConfig = {
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

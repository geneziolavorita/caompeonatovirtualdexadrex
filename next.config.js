/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: false
  },
  webpack: (config) => {
    return config;
  }
};

module.exports = nextConfig; 
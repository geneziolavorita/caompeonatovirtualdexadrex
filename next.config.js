/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Removendo as configurações experimentais problemáticas
  webpack: (config, { isServer }) => {
    // Ajustes adicionais do webpack se necessário
    return config;
  },
  // Configuração para Netlify
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_CONNECT_TIMEOUT: process.env.MONGODB_CONNECT_TIMEOUT,
    MONGODB_SOCKET_TIMEOUT: process.env.MONGODB_SOCKET_TIMEOUT,
  }
};

module.exports = nextConfig; 
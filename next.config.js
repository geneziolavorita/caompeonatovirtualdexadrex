/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuração para corrigir erro de webpack
  webpack: (config, { isServer }) => {
    // Configurações específicas para o MongoDB
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
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
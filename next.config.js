/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração para trabalhar com MongoDB
  webpack: (config) => {
    // Adicionar fallbacks para módulos Node.js em componentes cliente
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      dns: false,
      net: false,
      tls: false,
    };
    return config;
  },
  
  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
};

module.exports = nextConfig; 

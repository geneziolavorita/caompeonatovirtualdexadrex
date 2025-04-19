/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurações específicas para suporte ao MongoDB
  webpack: (config) => {
    return config;
  },
  
  // Otimização de imagens - necessário para Next.js 14
  images: {
    domains: [],
    remotePatterns: [],
  },
  
  // Definir variáveis de ambiente acessíveis ao cliente
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
};

module.exports = nextConfig; 
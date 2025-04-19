/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração simples para compatibilidade com servidor
  webpack: (config) => {
    return config;
  },
  
  // Variáveis de ambiente acessíveis ao cliente
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
};

module.exports = nextConfig; 
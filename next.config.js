/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  output: 'export', // Habilitar exportação estática para Netlify
  
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
  },

  // Configuração para otimização de imagens - necessária para exportação estática
  images: {
    unoptimized: true 
  },

  // Desativar compressão para evitar problemas no Netlify
  compress: false
};

module.exports = nextConfig; 

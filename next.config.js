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

  // Configuração para otimização de imagens
  images: {
    domains: ['localhost'],
    unoptimized: true // Necessário para exportação estática
  },

  // Desativar compressão para evitar problemas no Netlify
  compress: false,
  
  // Configuração para páginas com erros
  onDemandEntries: {
    // Período que a página deve permanecer no buffer
    maxInactiveAge: 60 * 60 * 1000, // 1 hora
    // Número de páginas a manter no buffer
    pagesBufferLength: 5
  },

  // Desabilitar exportação das rotas de API (não funcionam com output: 'export')
  experimental: {
    outputFileTracingExcludes: {
      '/api/**': true,
    },
  }
};

module.exports = nextConfig; 

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

  // Configuração para ignorar completamente as rotas de API na exportação estática
  distDir: process.env.NODE_ENV === 'production' ? '.next-static' : '.next',
  
  // Ignorar completamente as rotas de API na exportação estática
  transpilePackages: ['next'],
  
  // Padrões de arquivos a ignorar na exportação estática
  pageExtensions: ['jsx', 'js', 'tsx', 'ts'].filter(ext => 
    process.env.NODE_ENV === 'development' || !ext.includes('api')
  ),
  
  // Desativar análise de links nas páginas API
  experimental: {
    // Ignorar completamente as rotas de API na exportação estática
    outputFileTracingExcludes: {
      '**/node_modules/**': true,
      '**/api/**': true,
      '**/app/api/**': true
    }
  }
};

module.exports = nextConfig; 

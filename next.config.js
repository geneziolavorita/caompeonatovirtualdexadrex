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
  // Configuração atualizada para pacotes externos
  serverExternalPackages: ['mongoose', 'mongodb'],
};

module.exports = nextConfig; 
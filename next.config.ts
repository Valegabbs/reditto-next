import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Garante que o root da workspace seja este repo (evita o aviso de múltiplos lockfiles)
  outputFileTracingRoot: path.join(__dirname),
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Configurações de segurança
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Configuração para variáveis de ambiente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  publicRuntimeConfig: {
    // Variáveis públicas (apenas para configurações não sensíveis)
    appName: 'Reditto',
  },
};

export default nextConfig;

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-red-700">
        Página não encontrada
      </h1>
      <p className="mb-6 text-lg text-gray-700 max-w-xl">
        Desculpe, não conseguimos encontrar a página que você está procurando.
      </p>
      
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Voltar à página inicial
      </Link>
    </div>
  );
} 
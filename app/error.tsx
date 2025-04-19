'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registre o erro no sistema de monitoramento
    console.error('Erro não tratado:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-red-700">
        Algo deu errado!
      </h1>
      <p className="mb-6 text-lg text-gray-700 max-w-xl">
        Ocorreu um erro inesperado. Você pode tentar reiniciar o aplicativo ou
        voltar à página inicial.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
        
        <Link href="/" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
          Voltar à página inicial
        </Link>
      </div>
    </div>
  );
} 
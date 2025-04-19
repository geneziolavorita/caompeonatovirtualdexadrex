'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar o erro para depuração
    console.error('Erro global não tratado:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <head>
        <title>Erro - XADREX</title>
      </head>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-amber-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg">
            <h1 className="text-3xl font-bold text-red-700 mb-4">
              Algo deu errado!
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Ocorreu um erro inesperado ao carregar a aplicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
              <a 
                href="/"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Voltar à página inicial
              </a>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Se o problema persistir, tente limpar o cache do navegador ou contate o administrador.
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 
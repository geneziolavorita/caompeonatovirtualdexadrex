'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { isBrowser } from '@/lib/clientUtils';
import LoadingScreen from './loading';

// Lazy-load dinâmico do componente de jogo real, sem SSR
const GameComponent = dynamic(
  () => import('@/components/GameRoom'),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

// Componente de erro
function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-red-600 text-5xl mb-8">⚠️</div>
      <h1 className="text-2xl font-bold mb-4 text-red-700">Erro ao carregar o jogo</h1>
      <p className="text-gray-700 mb-8 max-w-md text-center">
        Ocorreu um problema ao inicializar o jogo. Isso pode ser devido a uma conexão instável ou um problema temporário.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
        
        <Link
          href="/reset-cache"
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-center"
        >
          Limpar cache e dados
        </Link>
        
        <Link
          href="/"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-center"
        >
          Voltar à página inicial
        </Link>
      </div>
    </div>
  );
}

// Wrapper para o jogo - com tratamento de erro
export default function ClientGameWrapper() {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Verificar se o cliente está pronto (apenas no lado do cliente)
  useEffect(() => {
    if (isBrowser) {
      setIsClientReady(true);
    }
  }, []);
  
  // Função para lidar com retry
  const handleRetry = () => {
    setHasError(false);
    
    // Tentar limpar qualquer estado problemático
    if (isBrowser) {
      try {
        sessionStorage.removeItem('gameError');
      } catch (err) {
        console.error('Erro ao limpar sessionStorage', err);
      }
    }
    
    // Força um refresh completo da página
    window.location.reload();
  };
  
  // Manipulador global de erros
  useEffect(() => {
    if (!isBrowser) return;
    
    const handleError = () => {
      setHasError(true);
      
      // Marcar que houve um erro para evitar loops
      try {
        sessionStorage.setItem('gameError', 'true');
      } catch (err) {
        console.error('Erro ao definir sessionStorage', err);
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);
  
  // Verificar se já teve erro em carregamentos anteriores
  useEffect(() => {
    if (!isBrowser) return;
    
    try {
      const hadPreviousError = sessionStorage.getItem('gameError') === 'true';
      if (hadPreviousError) {
        setHasError(true);
      }
    } catch (err) {
      console.error('Erro ao verificar sessionStorage', err);
    }
  }, []);
  
  if (!isClientReady) {
    return <LoadingScreen />;
  }
  
  if (hasError) {
    return <ErrorScreen onRetry={handleRetry} />;
  }
  
  return (
    <div className="game-wrapper">
      <GameComponent />
    </div>
  );
} 
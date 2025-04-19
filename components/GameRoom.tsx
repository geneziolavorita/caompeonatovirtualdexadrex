'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { isBrowser, getLocalStorageItem } from '@/lib/clientUtils';
import { Toaster } from 'react-hot-toast';

// Este é um componente de wrapper que vai carregar o jogo real
// usando lazy loading para evitar erros de inicialização

export default function GameRoom() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [RealGameComponent, setRealGameComponent] = useState<any>(null);

  useEffect(() => {
    if (!isBrowser) return;

    // Verificar se o jogador está logado
    const playerId = getLocalStorageItem('playerId', '');
    const playerName = getLocalStorageItem('playerName', '');

    if (!playerId || !playerName) {
      console.error('Jogador não está logado');
      setError('Você precisa selecionar um jogador antes de iniciar um jogo.');
      setIsLoading(false);
      return;
    }

    // Carregar o componente real de forma assíncrona
    const loadGame = async () => {
      try {
        setIsLoading(true);
        
        // Importação dinâmica protegida em try/catch
        const { default: RealGame } = await import('./GameRoomInner');
        setRealGameComponent(() => RealGame);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Falha ao carregar o componente do jogo:', err);
        setError('Não foi possível carregar o componente do jogo. Tente novamente mais tarde.');
        setIsLoading(false);
      }
    };

    // Iniciar carregamento após um pequeno delay para garantir 
    // que o navegador esteja pronto
    const timeoutId = setTimeout(() => {
      loadGame().catch(err => {
        console.error('Erro ao carregar o jogo:', err);
        setError('Erro ao carregar o jogo. Por favor, tente novamente.');
        setIsLoading(false);
      });
    }, 700);

    // Limpeza ao desmontar
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
        <h2 className="text-xl font-bold mb-2">Carregando sala de jogo...</h2>
        <p className="text-gray-600">Sala: {roomId}</p>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-600 text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold mb-4 text-red-700">Erro</h2>
        <p className="text-gray-700 mb-6 max-w-md text-center">{error}</p>
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
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

  // Renderizar o componente real se estiver disponível
  if (RealGameComponent) {
    return (
      <div className="game-container">
        <Toaster position="top-right" />
        <RealGameComponent roomId={roomId} />
      </div>
    );
  }

  // Fallback (não deveria chegar aqui)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <p>Carregando...</p>
      <Link href="/" className="mt-4 text-blue-600 hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
} 
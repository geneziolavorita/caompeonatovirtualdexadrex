'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { isBrowser, getLocalStorageItem } from '@/lib/clientUtils';
import { initSocket, disconnectSocket } from '@/lib/socketUtils';

// Componente interno do jogo que será carregado dinamicamente
export default function GameRoomInner({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [players, setPlayers] = useState<Array<{ id: string; name: string; color?: string }>>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [statusMessage, setStatusMessage] = useState('Conectando ao servidor...');

  // Setup do jogo
  useEffect(() => {
    if (!isBrowser) return;

    let socket: any = null;
    let mounted = true;

    // Obter informações do jogador
    const playerId = getLocalStorageItem('playerId', '');
    const playerName = getLocalStorageItem('playerName', '');

    if (!playerId || !playerName) {
      setErrorMessage('Você precisa selecionar um jogador antes de iniciar um jogo.');
      setIsLoading(false);
      return;
    }

    setCurrentPlayerId(playerId);
    setCurrentPlayerName(playerName);

    // Conectar ao socket
    const setupSocket = async () => {
      try {
        // Inicializar o socket
        socket = await initSocket();
        
        // Configurar eventos básicos
        socket.on('connect', () => {
          if (mounted) {
            setIsConnecting(false);
            setStatusMessage('Conectado. Entrando na sala...');
            
            // Entrar na sala
            socket.emit('join-game', {
              roomId,
              playerId,
              playerName
            });
          }
        });
        
        socket.on('player-joined', (data: any) => {
          if (mounted) {
            setPlayers(data.players || []);
            setStatusMessage(
              data.gameStarted 
                ? 'Jogo em andamento' 
                : data.players?.length === 2 
                  ? 'Dois jogadores conectados. O jogo começará em breve.' 
                  : 'Esperando outro jogador entrar na sala...'
            );
          }
        });
        
        socket.on('game-start', () => {
          if (mounted) {
            setGameStatus('playing');
            setStatusMessage('O jogo começou!');
            toast.success('O jogo começou!');
          }
        });
        
        socket.on('error', (error: any) => {
          if (mounted) {
            console.error('Erro no socket:', error);
            setErrorMessage('Erro de conexão: ' + (error.message || 'Erro desconhecido'));
          }
        });

        socket.on('disconnect', () => {
          if (mounted) {
            setStatusMessage('Desconectado do servidor. Tentando reconectar...');
            toast.error('Desconectado do servidor');
          }
        });
        
        // Remover o estado de carregamento
        setIsLoading(false);
        
      } catch (error: any) {
        console.error('Falha ao conectar ao servidor:', error);
        if (mounted) {
          setErrorMessage('Falha ao conectar ao servidor: ' + (error?.message || 'Erro desconhecido'));
          setIsLoading(false);
        }
      }
    };

    // Iniciar a configuração
    setupSocket().catch(err => {
      console.error('Erro ao configurar socket:', err);
      if (mounted) {
        setErrorMessage('Erro ao configurar conexão: ' + (err?.message || 'Erro desconhecido'));
        setIsLoading(false);
      }
    });

    // Limpeza
    return () => {
      mounted = false;
      if (socket) {
        disconnectSocket();
      }
    };
  }, [roomId]);

  // Função para copiar link da sala
  const copyRoomLink = useCallback(() => {
    if (!isBrowser) return;
    
    const link = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Link copiado para a área de transferência!'))
      .catch(() => toast.error('Não foi possível copiar o link'));
  }, [roomId]);

  // Função para retornar à página inicial
  const goToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
        <h2 className="text-xl font-bold mb-2">Carregando...</h2>
        <p className="text-gray-600">Preparando a sala de jogo {roomId}</p>
      </div>
    );
  }

  // Estado de erro
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-lg">
          <div className="text-red-600 text-5xl mb-6 text-center">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-700 text-center">Erro ao carregar o jogo</h2>
          <p className="text-gray-700 mb-6 text-center">{errorMessage}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
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
      </div>
    );
  }

  // Tela de espera simplificada
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Toaster position="top-right" />
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sala de Jogo: {roomId}</h1>
        <div className="flex gap-2">
          <button 
            onClick={copyRoomLink}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Copiar Link
          </button>
          <button 
            onClick={goToHome}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Voltar
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">{statusMessage}</h2>
        
        {isConnecting ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Jogadores na sala:</h3>
              {players.length === 0 ? (
                <p className="text-gray-500">Aguardando jogadores...</p>
              ) : (
                <ul className="space-y-2">
                  {players.map((player, index) => (
                    <li key={player.id} className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${player.color === 'white' ? 'bg-gray-200 border border-gray-400' : 'bg-gray-800'}`}></span>
                      <span className="font-medium">
                        {player.name} {player.id === currentPlayerId ? '(Você)' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Como jogar:</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Compartilhe o link da sala com outro jogador</li>
                <li>Aguarde o outro jogador entrar na sala</li>
                <li>O jogo iniciará automaticamente quando dois jogadores estiverem presentes</li>
                <li>Peças brancas começam o jogo</li>
              </ol>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-gray-600 text-sm">
        <p>Se o jogo não iniciar em alguns minutos, tente recarregar a página ou criar uma nova sala.</p>
        <Link 
          href="/reset-cache"
          className="text-blue-600 hover:underline inline-block mt-2"
        >
          Problemas? Limpar cache e dados
        </Link>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Chess, Square, Move } from 'chess.js';
import { Socket } from 'socket.io-client';
import Chessboard from '@/components/Chessboard';
import toast, { Toaster } from 'react-hot-toast';
import { initSocket, disconnectSocket } from '@/lib/socketUtils';
import { isBrowser, getLocalStorageItem } from '@/lib/clientUtils';
import dynamic from 'next/dynamic';

// Interface para a sala de jogo
interface GameRoom {
  players: Array<{
    id: string;
    name: string;
    color: 'white' | 'black';
  }>;
  gameStarted: boolean;
}

// Interface para o movimento do xadrez
interface ChessMove {
  from: Square;
  to: Square;
  promotion?: string;
}

interface PlayerType {
  id: string; 
  name: string;
  color?: 'white' | 'black';
}

// Interface para propriedades do tabuleiro do jogo de xadrez online
interface OnlineChessboardProps {
  position: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  boardOrientation: string;
  areArrowsAllowed: boolean;
  customBoardStyle?: React.CSSProperties;
  customDarkSquareStyle?: React.CSSProperties;
  customLightSquareStyle?: React.CSSProperties;
}

// Componente que só será renderizado no cliente
const ClientOnlyGame = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chessGame, setChessGame] = useState<Chess>(new Chess());
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [opponent, setOpponent] = useState<PlayerType | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ playerName: string; message: string; timestamp: string }>>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [drawOffered, setDrawOffered] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Inicializa o socket e configura o jogador ao carregar a página
  useEffect(() => {
    if (!isBrowser) return;
    
    // Recuperar o ID e nome do jogador do localStorage
    const storedPlayerId = getLocalStorageItem('playerId', '');
    const storedPlayerName = getLocalStorageItem('playerName', '');
    
    if (!storedPlayerId || !storedPlayerName) {
      // Redirecionar para a página de seleção de jogador se não estiver logado
      toast.error('Por favor, selecione um jogador antes de iniciar um jogo');
      router.push('/');
      return;
    }
    
    setPlayerId(storedPlayerId);
    setPlayerName(storedPlayerName);
    
    // Inicializar Socket.IO
    const setupSocket = async () => {
      try {
        setIsLoading(true);
        setConnectionError(null);
        
        const socketInstance = await initSocket();
        setSocket(socketInstance);
        
        // Entrar na sala de jogo ao conectar
        socketInstance.emit('join-game', {
          roomId,
          playerId: storedPlayerId,
          playerName: storedPlayerName
        });
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Falha ao conectar ao servidor:', error);
        setConnectionError(`Falha ao conectar ao servidor de jogo: ${error?.message || 'Erro desconhecido'}`);
        setIsLoading(false);
      }
    };
    
    setupSocket();
    
    // Limpar socket ao desmontar o componente
    return () => {
      disconnectSocket();
    };
  }, [roomId, router]);
  
  // Configurar eventos do socket quando o socket estiver disponível
  useEffect(() => {
    if (!socket) return;
    
    // Manipulador para atribuição de cor
    socket.on('color-assigned', ({ color }) => {
      setPlayerColor(color);
      console.log(`Você jogará com as peças ${color === 'white' ? 'brancas' : 'pretas'}`);
    });
    
    // Manipulador para quando um jogador entra na sala
    socket.on('player-joined', ({ player, players, gameStarted }: { player: PlayerType, players: PlayerType[], gameStarted: boolean }) => {
      console.log(`Jogador entrou: ${player.name}`);
      
      if (player.id !== playerId) {
        setOpponent(player);
        toast.success(`${player.name} entrou no jogo!`);
      }
      
      if (gameStarted) {
        setGameStarted(true);
      }
    });
    
    // Manipulador para o início do jogo
    socket.on('game-start', ({ players, initialFen }: { players: PlayerType[], initialFen: string }) => {
      setGameStarted(true);
      toast.success('O jogo começou!');
      
      try {
        // Resetar o jogo para a posição inicial
        const newGame = new Chess(initialFen);
        setChessGame(newGame);
        
        // Identificar oponente
        const opponentPlayer = players.find(p => p.id !== playerId);
        if (opponentPlayer) {
          setOpponent(opponentPlayer);
        }
      } catch (error) {
        console.error('Erro ao inicializar o jogo:', error);
        toast.error('Erro ao inicializar o jogo. Tente recarregar a página.');
      }
    });
    
    // Manipulador para movimentos feitos pelo oponente
    socket.on('move-made', ({ move, playerId: movingPlayerId, fen }: { move: ChessMove, playerId: string, fen: string }) => {
      if (movingPlayerId !== playerId) {
        // Aplicar o movimento do oponente no tabuleiro local
        try {
          const newGame = new Chess(fen);
          setChessGame(newGame);
        } catch (e) {
          console.error('Erro ao aplicar movimento:', e);
          toast.error('Erro ao processar o movimento do oponente. Tente recarregar a página.');
        }
      }
    });
    
    // Manipulador para mensagens de chat
    socket.on('chat-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });
    
    // Manipulador para ofertas de empate
    socket.on('draw-offered', () => {
      setDrawOffered(true);
      toast((t) => (
        <span>
          Seu oponente ofereceu empate!
          <div className="mt-2">
            <button 
              onClick={() => {
                socket.emit('respond-to-draw', { roomId, accepted: true, playerId });
                toast.dismiss(t.id);
              }}
              className="bg-green-500 text-white px-2 py-1 rounded mr-2"
            >
              Aceitar
            </button>
            <button 
              onClick={() => {
                socket.emit('respond-to-draw', { roomId, accepted: false, playerId });
                toast.dismiss(t.id);
                setDrawOffered(false);
              }}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Recusar
            </button>
          </div>
        </span>
      ), { duration: 30000 });
    });
    
    // Manipulador para recusa de empate
    socket.on('draw-declined', () => {
      toast.error('Oferta de empate recusada');
      setDrawOffered(false);
    });
    
    // Manipulador para o fim do jogo
    socket.on('game-end', ({ result, winnerId, message }: { result: string, winnerId?: string, message: string }) => {
      toast(message);
      
      // Desabilitar interações com o tabuleiro
      setGameStarted(false);
    });
    
    // Manipulador para modo espectador
    socket.on('spectator-mode', () => {
      setIsSpectator(true);
      toast.success('Você está assistindo a esta partida como espectador');
    });
    
    // Manipulador para desconexão do jogador
    socket.on('player-disconnected', ({ playerId: disconnectedPlayerId }: { playerId: string }) => {
      if (opponent && opponent.id === disconnectedPlayerId) {
        toast.error(`${opponent.name} se desconectou do jogo`);
      }
    });
    
    // Manipulador para reconexão
    socket.on('reconnect', (attemptNumber) => {
      toast.success(`Reconectado ao servidor (tentativa ${attemptNumber})`);
      
      // Re-entrar na sala após reconexão
      socket.emit('join-game', {
        roomId,
        playerId,
        playerName
      });
    });
    
    // Limpar eventos ao desmontar
    return () => {
      socket.off('color-assigned');
      socket.off('player-joined');
      socket.off('game-start');
      socket.off('move-made');
      socket.off('chat-message');
      socket.off('draw-offered');
      socket.off('draw-declined');
      socket.off('game-end');
      socket.off('spectator-mode');
      socket.off('player-disconnected');
      socket.off('reconnect');
    };
  }, [socket, playerId, roomId, opponent]);
  
  // Função para fazer um movimento
  const makeMove = (move: ChessMove) => {
    if (!gameStarted || isSpectator || !socket || !playerColor) return;
    
    // Verificar se é a vez do jogador
    const isPlayerTurn = (playerColor === 'white' && chessGame.turn() === 'w') || 
                        (playerColor === 'black' && chessGame.turn() === 'b');
    
    if (!isPlayerTurn) {
      toast.error('Não é sua vez de jogar');
      return;
    }
    
    try {
      // Tentar fazer o movimento localmente
      const gameCopy = new Chess(chessGame.fen());
      const result = gameCopy.move({
        from: move.from,
        to: move.to,
        promotion: 'q' // Auto-promover para rainha
      });
      
      if (result) {
        // Atualizar o jogo localmente
        setChessGame(gameCopy);
        
        // Enviar o movimento para o servidor
        socket.emit('move', {
          roomId,
          move,
          playerId,
          fen: gameCopy.fen()
        });
        
        // Verificar se o jogo acabou após o movimento
        if (gameCopy.isGameOver()) {
          let result = '';
          let message = '';
          
          if (gameCopy.isCheckmate()) {
            result = 'checkmate';
            message = `Xeque-mate! ${playerColor === 'white' ? playerName : opponent?.name} venceu a partida!`;
          } else if (gameCopy.isDraw()) {
            result = 'draw';
            message = 'O jogo terminou em empate.';
          }
          
          // Enviar o resultado para o servidor
          socket.emit('game-over', {
            roomId,
            result,
            winnerId: result === 'checkmate' ? playerId : undefined
          });
          
          toast(message);
          setGameStarted(false);
        }
      }
    } catch (error) {
      console.error('Erro ao fazer movimento:', error);
      toast.error('Movimento inválido');
    }
  };
  
  // Função para enviar mensagem de chat
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !messageInput.trim()) return;
    
    socket.emit('chat-message', {
      roomId,
      message: messageInput,
      playerName
    });
    
    setMessageInput('');
  };
  
  // Função para oferecer empate
  const offerDraw = () => {
    if (!socket || !gameStarted || isSpectator || drawOffered) return;
    
    socket.emit('offer-draw', {
      roomId,
      playerId
    });
    
    toast.success('Você ofereceu empate ao seu oponente');
    setDrawOffered(true);
  };
  
  // Função para desistir do jogo
  const resignGame = () => {
    if (!socket || !gameStarted || isSpectator) return;
    
    if (window.confirm('Tem certeza que deseja desistir da partida?')) {
      socket.emit('resign', {
        roomId,
        playerId
      });
    }
  };
  
  // Função para copiar o link da sala
  const copyRoomLink = () => {
    const link = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Link copiado para a área de transferência!'))
      .catch(() => toast.error('Não foi possível copiar o link'));
  };
  
  // Renderização de estados especiais
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-dark mx-auto mb-4"></div>
          <p className="text-wood-dark">Conectando ao servidor de jogo...</p>
        </div>
      </div>
    );
  }
  
  if (connectionError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-wood-dark mb-2">Erro de Conexão</h1>
          <p className="mb-6 text-wood-medium">{connectionError}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-wood-dark text-white px-4 py-2 rounded hover:bg-wood-medium"
            >
              Tentar novamente
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar componentes de jogo
  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wood-dark">Partida Online - Sala {roomId}</h1>
        <div>
          <button 
            onClick={copyRoomLink}
            className="px-3 py-1 bg-wood-dark text-white rounded hover:bg-wood-medium mr-2"
          >
            Copiar Link da Sala
          </button>
          <button 
            onClick={() => router.push('/')}
            className="px-3 py-1 bg-wood-medium text-white rounded hover:bg-wood-dark"
          >
            Voltar
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do jogo */}
        <div className="lg:col-span-1 bg-wood-lightest p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Informações da Partida</h2>
          
          {isSpectator ? (
            <div className="mb-4 p-2 bg-yellow-100 rounded">
              Você está assistindo como espectador
            </div>
          ) : null}
          
          <div className="mb-4">
            <h3 className="font-semibold">Brancas</h3>
            <div className="p-2 bg-white rounded">
              {playerColor === 'white' ? (
                <div className="font-bold">{playerName} (Você)</div>
              ) : opponent && opponent.color === 'white' ? (
                <div>{opponent.name}</div>
              ) : (
                <div className="text-gray-500">Aguardando jogador...</div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold">Pretas</h3>
            <div className="p-2 bg-gray-800 text-white rounded">
              {playerColor === 'black' ? (
                <div className="font-bold">{playerName} (Você)</div>
              ) : opponent && opponent.color === 'black' ? (
                <div>{opponent.name}</div>
              ) : (
                <div className="text-gray-300">Aguardando jogador...</div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold">Status</h3>
            <div className="p-2 bg-white rounded">
              {!gameStarted ? (
                <div className="text-yellow-600">Aguardando oponente...</div>
              ) : chessGame.turn() === 'w' ? (
                <div className="text-blue-600">Vez das brancas</div>
              ) : (
                <div className="text-blue-600">Vez das pretas</div>
              )}
            </div>
          </div>
          
          {gameStarted && !isSpectator ? (
            <div className="flex space-x-2 mt-4">
              <button 
                onClick={offerDraw}
                disabled={drawOffered || !gameStarted}
                className={`flex-1 py-2 rounded ${drawOffered ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
              >
                {drawOffered ? 'Empate Oferecido' : 'Oferecer Empate'}
              </button>
              <button 
                onClick={resignGame}
                disabled={!gameStarted}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Desistir
              </button>
            </div>
          ) : null}
        </div>
        
        {/* Tabuleiro de xadrez */}
        <div className="lg:col-span-1">
          <div className="bg-wood-medium p-2 rounded-lg shadow">
            <Chessboard 
              game={chessGame}
              setGame={setChessGame}
              gameMode="player"
            />
          </div>
        </div>
        
        {/* Chat do jogo */}
        <div className="lg:col-span-1 bg-wood-lightest p-4 rounded-lg shadow h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">Chat da Partida</h2>
          
          <div className="flex-grow overflow-y-auto mb-4 max-h-[400px] bg-white p-2 rounded">
            {chatMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Nenhuma mensagem ainda. Seja o primeiro a enviar!
              </div>
            ) : (
              <div className="space-y-2">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded ${msg.playerName === playerName ? 'bg-blue-100 ml-6' : 'bg-gray-100 mr-6'}`}
                  >
                    <div className="font-bold">{msg.playerName}</div>
                    <div>{msg.message}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <form onSubmit={sendChatMessage} className="flex">
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-wood-dark"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-wood-dark text-white rounded-r hover:bg-wood-medium"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Usar dynamic para garantir que o componente só será renderizado no cliente
const GamePage = dynamic(() => Promise.resolve(ClientOnlyGame), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-dark mx-auto mb-4"></div>
        <p className="text-wood-dark">Carregando jogo...</p>
      </div>
    </div>
  )
});

export default GamePage; 
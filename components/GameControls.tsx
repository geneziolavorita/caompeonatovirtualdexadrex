'use client';

import { Chess } from 'chess.js';
import { useEffect, useRef, RefObject, Dispatch, SetStateAction } from 'react';

interface GameControlsProps {
  game: Chess;
  setGame: Dispatch<SetStateAction<Chess>>;
  onEndGame: () => void;
  isFullscreen: boolean;
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
  gameContainerRef: RefObject<HTMLDivElement>;
}

// Componentes de ícones
const UndoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-2" viewBox="0 0 16 16">
    <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
  </svg>
);

const RestartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-2" viewBox="0 0 16 16">
    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
    <path d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
  </svg>
);

const FullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-2" viewBox="0 0 16 16">
    <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-2" viewBox="0 0 16 16">
    <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
  </svg>
);

const ExitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-2" viewBox="0 0 16 16">
    <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
    <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
  </svg>
);

export default function GameControls({ 
  game, 
  setGame, 
  onEndGame, 
  isFullscreen, 
  setIsFullscreen, 
  gameContainerRef 
}: GameControlsProps) {
  // Verificar se a API de tela cheia está disponível
  const fullscreenAvailable = typeof document !== 'undefined' &&
    (document.documentElement.requestFullscreen ||
     (document.documentElement as any).webkitRequestFullscreen ||
     (document.documentElement as any).mozRequestFullScreen ||
     (document.documentElement as any).msRequestFullscreen);

  // Função para desfazer o último movimento
  const undoLastMove = () => {
    if (game.history().length > 0) {
      game.undo();
      setGame(new Chess(game.fen()));
    }
  };

  // Função para reiniciar o jogo
  const restartGame = () => {
    if (window.confirm('Tem certeza que deseja reiniciar o jogo?')) {
      setGame(new Chess());
    }
  };

  // Função para alternar o modo de tela cheia com suporte a diferentes navegadores
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && 
        !(document as any).webkitFullscreenElement && 
        !(document as any).mozFullScreenElement && 
        !(document as any).msFullscreenElement) {
      // Entrar em modo de tela cheia
      if (gameContainerRef.current) {
        const element = gameContainerRef.current;
        
        if (element.requestFullscreen) {
          element.requestFullscreen().catch(err => {
            console.error(`Erro ao tentar entrar em modo de tela cheia: ${err.message}`);
          });
        } else if ((element as any).webkitRequestFullscreen) {
          (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          (element as any).msRequestFullscreen();
        }
      }
      setIsFullscreen(true);
    } else {
      // Sair do modo de tela cheia
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error(`Erro ao tentar sair do modo de tela cheia: ${err.message}`);
        });
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Função para confirmar o fim do jogo
  const confirmEndGame = () => {
    if (game.isGameOver() || window.confirm('Tem certeza que deseja encerrar este jogo?')) {
      onEndGame();
    }
  };

  // Observador para detectar mudanças no estado de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement || 
                                 !!(document as any).webkitFullscreenElement || 
                                 !!(document as any).mozFullScreenElement || 
                                 !!(document as any).msFullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
      <button
        onClick={undoLastMove}
        disabled={game.history().length === 0}
        className={`flex items-center justify-center py-2 px-3 rounded-md transition-colors ${
          game.history().length === 0 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-wood-medium text-white hover:bg-wood-dark'
        }`}
        title="Desfazer o último movimento"
      >
        <UndoIcon /> Desfazer
      </button>
      
      <button
        onClick={restartGame}
        className="bg-wood-medium text-white py-2 px-3 rounded-md hover:bg-wood-dark flex items-center justify-center transition-colors"
        title="Reiniciar a partida"
      >
        <RestartIcon /> Reiniciar
      </button>
      
      {fullscreenAvailable && (
        <button
          onClick={toggleFullscreen}
          className="bg-wood-medium text-white py-2 px-3 rounded-md hover:bg-wood-dark flex items-center justify-center transition-colors"
          title={isFullscreen ? "Sair do modo tela cheia" : "Entrar em modo tela cheia"}
        >
          {isFullscreen ? (
            <>
              <ExitFullscreenIcon /> Sair
            </>
          ) : (
            <>
              <FullscreenIcon /> Tela Cheia
            </>
          )}
        </button>
      )}
      
      <button
        onClick={confirmEndGame}
        className="bg-wood-dark text-white py-2 px-3 rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
        title="Encerrar a partida e voltar ao menu principal"
      >
        <ExitIcon /> Encerrar
      </button>
    </div>
  );
} 
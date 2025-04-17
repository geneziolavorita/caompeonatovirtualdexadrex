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
    game.undo();
    setGame(new Chess(game.fen()));
  };

  // Função para reiniciar o jogo
  const restartGame = () => {
    setGame(new Chess());
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
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        onClick={undoLastMove}
        className="bg-wood-medium text-white py-2 px-4 rounded-md hover:bg-wood-dark"
      >
        Desfazer Movimento
      </button>
      <button
        onClick={restartGame}
        className="bg-wood-medium text-white py-2 px-4 rounded-md hover:bg-wood-dark"
      >
        Reiniciar
      </button>
      {fullscreenAvailable && (
        <button
          onClick={toggleFullscreen}
          className="bg-wood-medium text-white py-2 px-4 rounded-md hover:bg-wood-dark"
        >
          {isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
        </button>
      )}
      <button
        onClick={onEndGame}
        className="bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium"
      >
        Encerrar Jogo
      </button>
    </div>
  );
} 
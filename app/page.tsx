'use client'

import { useState, useEffect, useRef } from 'react'
import Chessboard from '@/components/Chessboard'
import GameControls from '@/components/GameControls'
import PlayerInfo from '@/components/PlayerInfo'
import { Chess } from 'chess.js'

// Componente de ícone para tela cheia
const FullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-2" viewBox="0 0 16 16">
    <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
  </svg>
);

// Componente de ícone para sair da tela cheia
const ExitFullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-2" viewBox="0 0 16 16">
    <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
  </svg>
);

export default function Home() {
  const [game, setGame] = useState<Chess>(new Chess())
  const [player1Name, setPlayer1Name] = useState('Jogador 1')
  const [player2Name, setPlayer2Name] = useState('Jogador 2')
  const [gameMode, setGameMode] = useState<'player' | 'computer'>('player')
  const [gameStarted, setGameStarted] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Verificar se a API de tela cheia está disponível
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false)

  useEffect(() => {
    // Verificar suporte à API de tela cheia
    const checkFullscreenSupport = () => {
      return document.fullscreenEnabled || 
        (document as any).webkitFullscreenEnabled || 
        (document as any).mozFullScreenEnabled || 
        (document as any).msFullscreenEnabled;
    };
    
    setFullscreenAvailable(checkFullscreenSupport());
  }, []);

  useEffect(() => {
    // Evento para reiniciar apenas o jogo atual sem voltar para a tela de configuração
    const handleRestartCurrentGame = () => {
      setGame(new Chess());
    };

    window.addEventListener('restart-current-game', handleRestartCurrentGame);
    
    // Limpeza do listener quando o componente é desmontado
    return () => {
      window.removeEventListener('restart-current-game', handleRestartCurrentGame);
    };
  }, []);

  // Monitorar mudanças no estado de tela cheia com suporte multi-navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullscreen = Boolean(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).mozFullScreenElement || 
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isInFullscreen);
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
  }, []);

  const startGame = () => {
    setGame(new Chess())
    setGameStarted(true)
  }

  const resetGame = () => {
    // Se estiver em tela cheia, saia dela antes de voltar para a tela inicial
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    setGame(new Chess())
    setGameStarted(false)
  }

  const toggleGameMode = () => {
    setGameMode(gameMode === 'player' ? 'computer' : 'player')
    if (gameStarted) {
      resetGame()
    }
  }

  // Função melhorada para alternar o modo de tela cheia com suporte a diferentes navegadores
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
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-wood-dark">CAMPEONATO VIRTUAL DE XADREZ</h2>
        <h3 className="text-lg font-medium text-wood-dark">EEB PROFESSOR PEDRO TEIXEIRA BARROSO - ITAPIPOCA CEARÁ</h3>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-4 text-wood-dark">XADREX</h1>
      
      <div className="text-center mb-8">
        <p className="text-sm text-wood-dark">Orientação e Desenvolvimento: Professor Genezio de Lavor</p>
      </div>
      
      {!gameStarted ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Configuração do Jogo</h2>
          <div className="mb-4">
            <label className="block mb-2">Nome do Jogador 1 (Brancas):</label>
            <input 
              type="text" 
              value={player1Name} 
              onChange={(e) => setPlayer1Name(e.target.value)} 
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">
              {gameMode === 'player' ? 'Nome do Jogador 2 (Pretas):' : 'Jogando contra o computador'}
            </label>
            {gameMode === 'player' && (
              <input 
                type="text" 
                value={player2Name} 
                onChange={(e) => setPlayer2Name(e.target.value)} 
                className="w-full p-2 border rounded"
              />
            )}
          </div>
          <div className="mb-6">
            <button 
              onClick={toggleGameMode} 
              className="button bg-wood-dark text-white w-full mb-2"
            >
              {gameMode === 'player' 
                ? 'Jogar contra o computador' 
                : 'Jogar contra outro jogador'}
            </button>
          </div>
          {fullscreenAvailable && (
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isFullscreen} 
                  onChange={() => setIsFullscreen(!isFullscreen)}
                  className="mr-2"
                />
                <span className="flex items-center">
                  <FullscreenIcon /> Iniciar em Tela Cheia
                </span>
              </label>
            </div>
          )}
          <button 
            onClick={() => {
              startGame();
              // Se a opção de tela cheia estiver marcada e disponível, entrar em tela cheia
              if (isFullscreen && fullscreenAvailable) {
                // Pequeno atraso para garantir que o elemento já esteja renderizado
                setTimeout(() => {
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
                }, 100);
              }
            }} 
            className="button w-full"
          >
            Iniciar Jogo
          </button>
        </div>
      ) : (
        <div ref={gameContainerRef} className="game-container relative">
          <div>
            <Chessboard 
              game={game} 
              setGame={setGame} 
              gameMode={gameMode}
            />
          </div>
          <div className="info-panel">
            <PlayerInfo 
              player1Name={player1Name} 
              player2Name={gameMode === 'player' ? player2Name : 'Computador'} 
              game={game}
            />
            <GameControls 
              resetGame={resetGame} 
              showRules={showRules}
              setShowRules={setShowRules}
            />
            
            {fullscreenAvailable && (
              <button 
                onClick={toggleFullscreen} 
                className="button w-full mt-4 flex items-center justify-center"
              >
                {isFullscreen ? (
                  <>
                    <ExitFullscreenIcon /> Sair da Tela Cheia
                  </>
                ) : (
                  <>
                    <FullscreenIcon /> Entrar em Tela Cheia
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
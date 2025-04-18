'use client'

import { useState, useEffect, useRef } from 'react'
import Chessboard from '@/components/Chessboard'
import GameControls from '@/components/GameControls'
import PlayerInfo from '@/components/PlayerInfo'
import PlayerRegistration from '@/components/PlayerRegistration'
import TournamentRanking from '@/components/TournamentRanking'
import PlayerSelect from '@/components/PlayerSelect'
import { Chess } from 'chess.js'
import { saveGameResult } from '@/lib/gameUtils'

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
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [gameMode, setGameMode] = useState<'player' | 'computer'>('player')
  const [gameStarted, setGameStarted] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null)
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

  const handleStartGame = () => {
    if (gameMode === 'player' && (!player1Id || !player2Id)) {
      alert('Por favor, selecione ambos os jogadores para iniciar o jogo.');
      return;
    }
    
    setGame(new Chess())
    setGameStarted(true)
    setGameStartTime(new Date())
  }

  const handleEndGame = () => {
    if (gameStarted && gameStartTime && player1Id && player2Id) {
      // Verificar se o jogo está em um estado final
      if (game.isGameOver()) {
        // Salvar o resultado do jogo
        saveGameResult(
          game,
          player1Id,
          player2Id,
          player1Name,
          player2Name,
          gameStartTime
        ).then((success) => {
          if (success) {
            alert('Jogo finalizado e resultado salvo!');
          } else {
            alert('Falha ao salvar o resultado do jogo.');
          }
        });
      }
    }
    
    setGameStarted(false)
    setGameStartTime(null)
  }

  const handleSelectPlayer1 = (id: string, name: string) => {
    setPlayer1Id(id);
    setPlayer1Name(name);
  }

  const handleSelectPlayer2 = (id: string, name: string) => {
    setPlayer2Id(id);
    setPlayer2Name(name);
  }

  const handlePlayerRegistered = () => {
    // Atualizar a lista de jogadores após um novo registro
    // A atualização é automática devido à forma como os componentes foram construídos
  }

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
        <div>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <div className="bg-wood-light p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4 text-wood-dark">Iniciar Nova Partida</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-wood-dark mb-1">
                    Modo de Jogo
                  </label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as 'player' | 'computer')}
                    className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
                  >
                    <option value="player">Jogador vs Jogador</option>
                    <option value="computer">Jogador vs Computador</option>
                  </select>
                </div>
                
                {gameMode === 'player' ? (
                  <>
                    <PlayerSelect 
                      label="Jogador 1 (Brancas)" 
                      value={player1Id} 
                      onChange={handleSelectPlayer1} 
                    />
                    <PlayerSelect 
                      label="Jogador 2 (Pretas)" 
                      value={player2Id} 
                      onChange={handleSelectPlayer2} 
                    />
                  </>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-wood-dark mb-1">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="flex items-center text-sm font-medium text-wood-dark">
                    <input
                      type="checkbox"
                      checked={isFullscreen}
                      onChange={(e) => setIsFullscreen(e.target.checked)}
                      className="mr-2 h-4 w-4 text-wood-dark focus:ring-wood-dark border-wood-medium rounded"
                    />
                    Iniciar em tela cheia
                  </label>
                </div>
                
                <button
                  onClick={handleStartGame}
                  className="w-full bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark"
                >
                  Iniciar Jogo
                </button>
              </div>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowRegistration(!showRegistration)}
                  className="flex-1 bg-wood-medium text-white py-2 px-4 rounded-md hover:bg-wood-dark focus:outline-none focus:ring-2 focus:ring-wood-dark"
                >
                  {showRegistration ? 'Fechar Registro' : 'Registrar Jogador'}
                </button>
                
                <button
                  onClick={() => setShowRanking(!showRanking)}
                  className="flex-1 bg-wood-medium text-white py-2 px-4 rounded-md hover:bg-wood-dark focus:outline-none focus:ring-2 focus:ring-wood-dark"
                >
                  {showRanking ? 'Fechar Ranking' : 'Ver Ranking'}
                </button>

                <a
                  href="/players"
                  className="flex-1 bg-wood-medium text-white py-2 px-4 rounded-md hover:bg-wood-dark focus:outline-none focus:ring-2 focus:ring-wood-dark text-center"
                >
                  Lista de Jogadores
                </a>
              </div>
              
              {showRegistration && (
                <PlayerRegistration onPlayerRegistered={handlePlayerRegistered} />
              )}
            </div>
            
            {showRanking && (
              <div className="flex-1">
                <TournamentRanking />
              </div>
            )}
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setShowRules(!showRules)}
              className="text-wood-dark underline hover:text-wood-medium focus:outline-none"
            >
              {showRules ? 'Ocultar Regras' : 'Ver Regras do Xadrez'}
            </button>
            
            {showRules && (
              <div className="mt-4 text-left bg-wood-lightest p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-2 text-wood-dark">Regras Básicas do Xadrez</h3>
                <ul className="list-disc pl-5 space-y-2 text-wood-dark">
                  <li>O xadrez é jogado em um tabuleiro 8x8 entre dois jogadores.</li>
                  <li>Cada jogador começa com 16 peças: 1 rei, 1 rainha, 2 torres, 2 cavalos, 2 bispos e 8 peões.</li>
                  <li>O objetivo é dar xeque-mate no rei adversário, deixando-o sem movimentos válidos.</li>
                  <li>As peças brancas sempre começam o jogo.</li>
                  <li>Os jogadores se alternam, fazendo um movimento por vez.</li>
                  <li>Cada tipo de peça se move de forma diferente:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Peão: Move-se uma casa para frente (duas na primeira jogada) e captura peças na diagonal.</li>
                      <li>Torre: Move-se em linha reta horizontalmente ou verticalmente.</li>
                      <li>Cavalo: Move-se em forma de "L" (duas casas em uma direção e uma casa em direção perpendicular).</li>
                      <li>Bispo: Move-se em diagonal.</li>
                      <li>Rainha: Move-se em qualquer direção, combinando os movimentos da torre e do bispo.</li>
                      <li>Rei: Move-se uma casa em qualquer direção.</li>
                    </ul>
                  </li>
                  <li>Um peão que chega à última fileira pode ser promovido a qualquer outra peça (geralmente uma rainha).</li>
                  <li>O roque permite mover o rei e a torre em um único movimento sob certas condições.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div ref={gameContainerRef} className={`game-container ${isFullscreen ? 'fullscreen' : ''}`}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-3/4">
              <Chessboard game={game} setGame={setGame} gameMode={gameMode} />
              <GameControls 
                game={game} 
                setGame={setGame} 
                onEndGame={handleEndGame} 
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                gameContainerRef={gameContainerRef}
              />
            </div>
            <div className="md:w-1/4">
              <PlayerInfo 
                player1Name={player1Name} 
                player2Name={player2Name} 
                game={game} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
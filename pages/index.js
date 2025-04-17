'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';

// Carregar componentes de forma dinâmica sem SSR
const ChessboardComponent = dynamic(() => import('../components/Chessboard'), { ssr: false });
const PlayerSelectComponent = dynamic(() => import('../components/PlayerSelect'), { ssr: false });
const TournamentRankingComponent = dynamic(() => import('../components/TournamentRanking'), { ssr: false });
const PlayerRegistrationComponent = dynamic(() => import('../components/PlayerRegistration'), { ssr: false });
const PlayerInfoComponent = dynamic(() => import('../components/PlayerInfo'), { ssr: false });
const GameControlsComponent = dynamic(() => import('../components/GameControls'), { ssr: false });

export default function Home() {
  const [view, setView] = useState('home');
  const [game, setGame] = useState(new Chess());
  const [player1Name, setPlayer1Name] = useState('Jogador 1');
  const [player2Name, setPlayer2Name] = useState('Jogador 2');
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [gameMode, setGameMode] = useState('player');
  const [gameStarted, setGameStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const gameContainerRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Carregar jogadores ao iniciar
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Jogadores carregados:', data);
          setPlayers(data);
        } else {
          console.error('Erro ao carregar jogadores:', response.status);
        }
      } catch (err) {
        console.error('Erro ao buscar jogadores:', err);
      }
    };
    
    fetchPlayers();
  }, [view, registrationCompleted]);

  const handleSelectPlayer1 = (id, name) => {
    console.log(`Selecionando jogador 1: ID=${id}, Nome=${name}`);
    setPlayer1Id(id);
    setPlayer1Name(name);
  };

  const handleSelectPlayer2 = (id, name) => {
    console.log(`Selecionando jogador 2: ID=${id}, Nome=${name}`);
    setPlayer2Id(id);
    setPlayer2Name(name);
  };

  const handleStartGame = () => {
    if (gameMode === 'player' && (!player1Id || !player2Id)) {
      alert('Por favor, selecione ambos os jogadores para iniciar o jogo.');
      return;
    }
    
    setGame(new Chess());
    setGameStarted(true);
    setGameStartTime(new Date());
  };

  const handleEndGame = () => {
    setGameStarted(false);
    setGameStartTime(null);
  };

  const handlePlayerRegistered = (playerData) => {
    console.log('Jogador registrado com sucesso:', playerData);
    
    // Atualizar lista de jogadores localmente
    setPlayers(prevPlayers => {
      // Verificar se o jogador já existe
      const exists = prevPlayers.some(p => 
        p.id === playerData.id || 
        p.name.toLowerCase() === playerData.name.toLowerCase()
      );
      
      // Só adicionar se não existir
      if (!exists) {
        console.log('Adicionando novo jogador à lista:', playerData);
        return [...prevPlayers, playerData];
      }
      
      console.log('Jogador já existe na lista');
      return prevPlayers;
    });
    
    // Marcar o registro como concluído para acionar efeito de atualização
    setRegistrationCompleted(prev => !prev);
    
    // Exibir mensagem de sucesso
    alert(`Jogador "${playerData.name}" registrado com sucesso!`);
    
    // Redirecionar para ranking após alguns segundos
    setTimeout(() => {
      setView('ranking');
    }, 1500);
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
      
      <div className="flex space-x-4 justify-center mb-6">
        <button 
          onClick={() => setView('home')}
          className={`px-4 py-2 rounded ${view === 'home' ? 'bg-wood-dark text-white' : 'bg-wood-light text-wood-dark'} hover:bg-wood-medium`}
        >
          Início
        </button>
        <button 
          onClick={() => setView('ranking')}
          className={`px-4 py-2 rounded ${view === 'ranking' ? 'bg-wood-dark text-white' : 'bg-wood-light text-wood-dark'} hover:bg-wood-medium`}
        >
          Ver Ranking
        </button>
        <button 
          onClick={() => setView('register')}
          className={`px-4 py-2 rounded ${view === 'register' ? 'bg-wood-dark text-white' : 'bg-wood-light text-wood-dark'} hover:bg-wood-medium`}
        >
          Registrar Jogador
        </button>
      </div>
      
      {view === 'home' && !gameStarted && (
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
                    onChange={(e) => setGameMode(e.target.value)}
                    className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
                  >
                    <option value="player">Jogador vs Jogador</option>
                    <option value="computer">Jogador vs Computador</option>
                  </select>
                </div>
                
                {gameMode === 'player' ? (
                  <>
                    <PlayerSelectComponent 
                      label="Jogador 1 (Brancas)" 
                      value={player1Id} 
                      onChange={handleSelectPlayer1} 
                    />
                    <PlayerSelectComponent 
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
                
                <button
                  onClick={handleStartGame}
                  className="w-full bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark mt-4"
                >
                  Iniciar Partida
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="bg-wood-light p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-wood-dark">Instruções</h2>
                <div className="prose">
                  <p>Selecione o modo de jogo e configure os jogadores para começar uma partida.</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Clique nas peças para movê-las</li>
                    <li>As peças brancas sempre começam</li>
                    <li>Registre-se no campeonato para aparecer no ranking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {view === 'home' && gameStarted && (
        <div className="flex flex-col md:flex-row gap-6" ref={gameContainerRef}>
          <div className="md:w-2/3">
            <ChessboardComponent 
              game={game} 
              setGame={setGame} 
              gameMode={gameMode} 
            />
            <GameControlsComponent 
              game={game} 
              setGame={setGame} 
              onEndGame={handleEndGame}
              isFullscreen={isFullscreen} 
              setIsFullscreen={setIsFullscreen}
              gameContainerRef={gameContainerRef}
            />
          </div>
          <div className="md:w-1/3">
            <PlayerInfoComponent 
              player1Name={player1Name} 
              player2Name={player2Name} 
              game={game} 
            />
          </div>
        </div>
      )}
      
      {view === 'ranking' && (
        <TournamentRankingComponent />
      )}
      
      {view === 'register' && (
        <PlayerRegistrationComponent onPlayerRegistered={handlePlayerRegistered} />
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { mockPlayers } from '@/lib/mock-data';

export default function CreateGameRoom() {
  const router = useRouter();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');

  useEffect(() => {
    // Carregar jogadores do mockData para simplificar
    setPlayers(mockPlayers);
    
    // Tentar carregar jogador do localStorage, se existir
    const storedPlayerId = localStorage.getItem('playerId');
    const storedPlayerName = localStorage.getItem('playerName');
    
    if (storedPlayerId && storedPlayerName) {
      setSelectedPlayer(storedPlayerId);
      setPlayerName(storedPlayerName);
    }
  }, []);

  const handlePlayerSelect = (e) => {
    const playerId = e.target.value;
    setSelectedPlayer(playerId);
    
    if (playerId) {
      const player = players.find(p => p.id.toString() === playerId);
      if (player) {
        setPlayerName(player.name);
      }
    } else {
      setPlayerName('');
    }
  };

  // Função para salvar o jogador no localStorage
  const savePlayerToLocalStorage = () => {
    if (selectedPlayer && playerName) {
      localStorage.setItem('playerId', selectedPlayer);
      localStorage.setItem('playerName', playerName);
      return true;
    }
    return false;
  };

  // Função para criar uma nova sala de jogo
  const createNewGameRoom = () => {
    if (!selectedPlayer) {
      toast.error('Por favor, selecione um jogador antes de criar uma sala');
      return;
    }

    setIsCreatingRoom(true);

    try {
      // Salvar jogador selecionado no localStorage
      savePlayerToLocalStorage();
      
      // Gerar um ID único para a sala
      const roomId = uuidv4().substring(0, 8);
      
      // Redirecionar para a sala de jogo
      router.push(`/game/${roomId}`);
    } catch (error) {
      console.error('Erro ao criar sala de jogo:', error);
      toast.error('Não foi possível criar a sala. Tente novamente.');
      setIsCreatingRoom(false);
    }
  };

  // Função para entrar em uma sala existente
  const joinExistingRoom = (e) => {
    e.preventDefault();
    
    if (!selectedPlayer) {
      toast.error('Por favor, selecione um jogador antes de entrar em uma sala');
      return;
    }
    
    if (!roomIdInput) {
      toast.error('Por favor, digite o código da sala');
      return;
    }
    
    setIsJoiningRoom(true);
    
    try {
      // Salvar jogador selecionado no localStorage
      savePlayerToLocalStorage();
      
      // Redirecionar para a sala de jogo
      router.push(`/game/${roomIdInput}`);
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      toast.error('Não foi possível entrar na sala. Tente novamente.');
      setIsJoiningRoom(false);
    }
  };

  return (
    <div className="bg-wood-light rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-wood-dark">Jogar Online</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-wood-dark mb-1">
          Selecione seu jogador
        </label>
        <select
          value={selectedPlayer}
          onChange={handlePlayerSelect}
          className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark mb-4"
        >
          <option value="">Selecione um jogador</option>
          {players.map((player) => (
            <option key={player.id} value={player.id.toString()}>
              {player.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-wood-dark">
            Crie uma sala de jogo e compartilhe o código com outro jogador.
          </p>
          
          <button
            onClick={createNewGameRoom}
            disabled={isCreatingRoom || !selectedPlayer}
            className={`w-full px-4 py-2 rounded ${
              isCreatingRoom || !selectedPlayer
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-wood-dark text-white hover:bg-wood-medium'
            }`}
          >
            {isCreatingRoom ? 'Criando sala...' : 'Criar Nova Sala'}
          </button>
        </div>
        
        <div className="border-t border-wood-medium pt-4">
          <p className="mb-2 text-sm text-wood-dark">
            Ou entre em uma sala existente com o código:
          </p>
          
          <form onSubmit={joinExistingRoom} className="flex">
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Digite o código da sala"
              className="flex-grow px-3 py-2 border border-wood-medium rounded-l focus:outline-none focus:ring-2 focus:ring-wood-dark"
              required
            />
            <button
              type="submit"
              disabled={isJoiningRoom || !selectedPlayer || !roomIdInput}
              className={`px-4 py-2 rounded-r ${
                isJoiningRoom || !selectedPlayer || !roomIdInput
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-wood-dark text-white hover:bg-wood-medium'
              }`}
            >
              {isJoiningRoom ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
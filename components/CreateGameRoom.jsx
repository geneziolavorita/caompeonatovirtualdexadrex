'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

export default function CreateGameRoom() {
  const router = useRouter();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Função para criar uma nova sala de jogo
  const createNewGameRoom = () => {
    // Verificar se o jogador está logado
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');

    if (!playerId || !playerName) {
      toast.error('Por favor, selecione um jogador antes de criar uma sala');
      return;
    }

    setIsCreatingRoom(true);

    try {
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
    
    // Verificar se o jogador está logado
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');

    if (!playerId || !playerName) {
      toast.error('Por favor, selecione um jogador antes de entrar em uma sala');
      return;
    }
    
    const roomId = e.target.roomId.value.trim();
    
    if (!roomId) {
      toast.error('Por favor, digite o código da sala');
      return;
    }
    
    // Redirecionar para a sala de jogo
    router.push(`/game/${roomId}`);
  };

  return (
    <div className="bg-wood-light rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-wood-dark">Jogar Online</h2>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-wood-dark">
            Crie uma sala de jogo e compartilhe o código com outro jogador.
          </p>
          
          <button
            onClick={createNewGameRoom}
            disabled={isCreatingRoom}
            className={`w-full px-4 py-2 rounded ${
              isCreatingRoom 
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
              name="roomId"
              placeholder="Digite o código da sala"
              className="flex-grow px-3 py-2 border border-wood-medium rounded-l focus:outline-none focus:ring-2 focus:ring-wood-dark"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-wood-dark text-white rounded-r hover:bg-wood-medium"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
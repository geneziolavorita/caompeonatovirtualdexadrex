'use client';

import { useEffect, useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';
import { toast } from 'react-hot-toast';
import { isBrowser } from '@/lib/clientUtils';

export interface Player {
  _id: string;
  nome: string;
  name: string;
  pontuacao: number;
  jogos: number;
  vitorias: number;
  derrotas: number;
  empates: number;
}

interface PlayerSelectProps {
  onSelect: (player: Player) => void;
  selectedPlayer?: Player;
  label?: string;
}

export default function PlayerSelect({ onSelect, selectedPlayer, label }: PlayerSelectProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Não executar no servidor
    if (!isBrowser) return;

    const fetchPlayers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/players');
        
        if (!response.ok) throw new Error('Falha ao carregar jogadores');
        
        const data = await response.json();
        setPlayers(data);
        setIsOffline(false);
      } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
        setPlayers(mockPlayers);
        setIsOffline(true);
        toast.error('Servidor offline. Usando dados de exemplo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (isLoading) {
    return <div className="text-gray-500">Carregando jogadores...</div>;
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Servidor offline. Usando dados de exemplo.</p>
        </div>
      )}
      
      <select
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-wood-dark focus:border-wood-dark"
        value={selectedPlayer?._id || ''}
        onChange={(e) => {
          const player = players.find(p => p._id === e.target.value);
          if (player) onSelect(player);
        }}
      >
        <option value="">Selecione um jogador</option>
        {players.map(player => (
          <option key={player._id} value={player._id}>
            {player.nome} ({player.pontuacao} pontos)
          </option>
        ))}
      </select>
      
      {!isLoading && players.length === 0 && (
        <div className="text-sm text-red-500">
          Nenhum jogador encontrado. 
          <button
            onClick={() => {
              if (isBrowser) {
                window.location.href = '/?showRegistration=true';
              }
            }}
            className="ml-2 text-blue-500 hover:underline"
          >
            Cadastrar novo jogador
          </button>
        </div>
      )}
    </div>
  );
} 
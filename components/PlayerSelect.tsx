'use client';

import { useEffect, useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';
import { toast } from 'react-hot-toast';

// Atualizar interface do jogador para incluir campos do MongoDB
interface Player {
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
}

export default function PlayerSelect({ onSelect, selectedPlayer }: PlayerSelectProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error('Failed to fetch players');
        const data = await response.json();
        setPlayers(data);
        setIsOffline(false);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers(mockPlayers);
        setIsOffline(true);
        toast.error('Server offline. Using mock data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  return (
    <div className="space-y-4">
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Server is offline. Using mock data.</p>
        </div>
      )}
      <select
        className="w-full p-2 border rounded"
        value={selectedPlayer?._id || ''}
        onChange={(e) => {
          const player = players.find(p => p._id === e.target.value);
          if (player) onSelect(player);
        }}
      >
        <option value="">Select a player</option>
        {players.map(player => (
          <option key={player._id} value={player._id}>
            {player.name} ({player.pontuacao} points)
          </option>
        ))}
      </select>
    </div>
  );
} 
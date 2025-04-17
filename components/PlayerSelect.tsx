'use client';

import { useEffect, useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';

interface Player {
  id: number;
  name: string;
}

interface PlayerSelectProps {
  label: string;
  value: string;
  onChange: (id: string, name: string) => void;
}

export default function PlayerSelect({ label, value, onChange }: PlayerSelectProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Primeiro, tente buscar do servidor
        try {
          const response = await fetch('/api/players');
          
          if (response.ok) {
            const data = await response.json();
            setPlayers(data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log('Erro ao buscar do servidor, usando dados mock', err);
        }

        // Se falhar, use os dados mock
        console.log('Usando dados mock para jogadores');
        setPlayers(mockPlayers);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao carregar os jogadores');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando jogadores...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (players.length === 0) {
    return <div className="text-sm text-gray-500">Não há jogadores registrados</div>;
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-wood-dark mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => {
          const player = players.find(p => p.id.toString() === e.target.value);
          if (player) {
            onChange(player.id.toString(), player.name);
          }
        }}
        className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
      >
        <option value="">Selecione um jogador</option>
        {players.map((player) => (
          <option key={player.id} value={player.id.toString()}>
            {player.name}
          </option>
        ))}
      </select>
    </div>
  );
} 
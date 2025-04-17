'use client';

import { useEffect, useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';

interface Player {
  id: number | string;
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
        setLoading(true);
        console.log('PlayerSelect: Buscando lista de jogadores');
        // Primeiro, tente buscar do servidor
        try {
          const response = await fetch('/api/players', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          console.log('PlayerSelect: Resposta da API:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('PlayerSelect: Dados recebidos:', data);
            
            if (Array.isArray(data) && data.length > 0) {
              setPlayers(data);
              setLoading(false);
              return;
            } else {
              console.log('PlayerSelect: Nenhum jogador encontrado na API, usando dados mock');
              throw new Error('Nenhum jogador encontrado');
            }
          } else {
            const errorText = await response.text();
            console.error('PlayerSelect: Erro na resposta da API:', response.status, errorText);
            throw new Error(`Erro do servidor: ${response.status}`);
          }
        } catch (err) {
          console.error('PlayerSelect: Erro ao buscar do servidor, usando dados mock', err);
          // Se falhar, use os dados mock
          console.log('PlayerSelect: Usando dados mock para jogadores');
          setPlayers(mockPlayers);
        }
      } catch (err: any) {
        console.error('PlayerSelect: Erro ao carregar os jogadores:', err);
        setError(err.message || 'Ocorreu um erro ao carregar os jogadores');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    if (!playerId) {
      onChange('', '');
      return;
    }
    
    const player = players.find(p => p.id.toString() === playerId);
    if (player) {
      console.log(`PlayerSelect: Selecionado jogador ID=${playerId}, Nome=${player.name}`);
      onChange(playerId, player.name);
    } else {
      console.error(`PlayerSelect: Jogador com ID ${playerId} não encontrado na lista`);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">Carregando jogadores...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500 p-3 bg-red-50 rounded border border-red-100">{error}</div>;
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-sm text-amber-500 p-3 bg-amber-50 rounded border border-amber-100">
        Não há jogadores registrados. 
        <button 
          onClick={() => window.location.href = '/?view=register'}
          className="ml-2 text-blue-500 underline"
        >
          Registrar jogador
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-wood-dark mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
      >
        <option value="">Selecione um jogador</option>
        {players.map((player) => (
          <option key={player.id} value={player.id.toString()}>
            {player.name}
          </option>
        ))}
      </select>
      
      {players.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {players.length} jogador(es) disponível(is)
        </div>
      )}
    </div>
  );
} 
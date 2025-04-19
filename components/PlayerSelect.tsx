'use client';

import { useEffect, useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';
import { toast } from 'react-hot-toast';

// Atualizar interface do jogador para incluir campos do MongoDB
interface Player {
  _id?: string; // MongoDB usa _id
  id?: number | string;
  nome?: string; // Campo em português para MongoDB
  name?: string; // Campo alternativo em inglês
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
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const refreshPlayersList = async () => {
    setLoading(true);
    setLastUpdate(Date.now());
    await fetchPlayers();
  };

  const fetchPlayers = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/players?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setPlayers(data.data);
          setIsServerOnline(true);
        }
      } else {
        throw new Error('Falha ao carregar jogadores');
      }
    } catch (err) {
      console.error('Erro ao carregar jogadores:', err);
      setIsServerOnline(false);
      
      // Carregar jogadores do localStorage como fallback
      const localPlayers = loadLocalPlayers();
      if (localPlayers.length > 0) {
        setPlayers(localPlayers);
      } else {
        setPlayers(mockPlayers);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLocalPlayers = () => {
    try {
      const stored = localStorage.getItem('localPlayers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchPlayers();

    // Atualizar a cada 2 segundos
    const interval = setInterval(fetchPlayers, 2000);

    // Listener para evento de novo jogador registrado
    const handleNewPlayer = () => {
      console.log('Novo jogador registrado, atualizando lista...');
      fetchPlayers();
    };

    window.addEventListener('playerRegistered', handleNewPlayer);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('playerRegistered', handleNewPlayer);
    };
  }, [lastUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    const player = players.find(p => (p._id || p.id) === playerId);
    
    if (player) {
      onChange(playerId, player.nome || player.name || '');
    } else {
      onChange('', '');
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-wood-dark mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
        >
          <option value="">Selecione um jogador</option>
          {players.map((player) => (
            <option key={player._id || player.id} value={player._id || player.id}>
              {player.nome || player.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={refreshPlayersList}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          title="Atualizar lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {loading && (
        <div className="mt-1 text-sm text-gray-500">
          Atualizando lista de jogadores...
        </div>
      )}
      
      {!loading && players.length === 0 && (
        <div className="mt-1 text-sm text-red-500">
          Nenhum jogador encontrado. 
          <button
            onClick={() => window.location.href = '/?showRegistration=true'}
            className="ml-2 text-blue-500 hover:underline"
          >
            Cadastrar novo jogador
          </button>
        </div>
      )}
    </div>
  );
} 
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
  // Contador de recargas para forçar recarregamento da lista
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Função para recarregar a lista de jogadores
  const refreshPlayersList = () => {
    setRefreshCounter(prev => prev + 1);
    setLoading(true);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError('');
        console.log(`PlayerSelect (${label}): Buscando lista de jogadores...`);
        
        try {
          // Gera um timestamp único para evitar o cache
          const timestamp = new Date().getTime();
          const response = await fetch(`/api/players?t=${timestamp}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
          console.log(`PlayerSelect (${label}): Resposta da API:`, response.status);
          
          if (response.ok) {
            const responseText = await response.text();
            console.log(`PlayerSelect (${label}): Resposta bruta:`, responseText.substring(0, 100));
            
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (e) {
              console.error(`PlayerSelect (${label}): Erro ao fazer parse do JSON:`, e);
              throw new Error('Resposta inválida do servidor');
            }
            
            console.log(`PlayerSelect (${label}): Dados recebidos:`, data);
            
            if (Array.isArray(data) && data.length > 0) {
              console.log(`PlayerSelect (${label}): ${data.length} jogadores encontrados`);
              setPlayers(data);
              setLoading(false);
              return;
            } else {
              console.log(`PlayerSelect (${label}): Lista vazia ou inválida, usando dados mock`);
              setPlayers(mockPlayers);
            }
          } else {
            throw new Error(`Erro do servidor: ${response.status}`);
          }
        } catch (err) {
          console.error(`PlayerSelect (${label}): Erro ao buscar do servidor:`, err);
          console.log(`PlayerSelect (${label}): Usando dados mock como fallback`);
          setPlayers(mockPlayers);
        }
      } catch (err: any) {
        console.error(`PlayerSelect (${label}): Erro geral:`, err);
        setError(err.message || 'Erro ao carregar jogadores');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
    
    // Recarregar a cada 5 segundos enquanto o componente estiver montado
    const interval = setInterval(() => {
      fetchPlayers();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [label, refreshCounter]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    if (!playerId) {
      onChange('', '');
      return;
    }
    
    const player = players.find(p => p.id.toString() === playerId);
    if (player) {
      console.log(`PlayerSelect (${label}): Selecionado jogador ID=${playerId}, Nome=${player.name}`);
      onChange(playerId, player.name);
    } else {
      console.error(`PlayerSelect (${label}): Jogador com ID ${playerId} não encontrado na lista`);
    }
  };

  if (loading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-wood-dark mb-1">
          {label}
        </label>
        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded flex items-center justify-between">
          <span>Carregando jogadores...</span>
          <button 
            onClick={refreshPlayersList}
            className="text-blue-500 text-xs underline"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-wood-dark mb-1">
          {label}
        </label>
        <div className="text-sm text-red-500 p-3 bg-red-50 rounded border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={refreshPlayersList}
            className="text-blue-500 text-xs underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-wood-dark mb-1">
          {label}
        </label>
        <div className="text-sm text-amber-500 p-3 bg-amber-50 rounded border border-amber-100 flex items-center justify-between">
          <span>Não há jogadores registrados.</span>
          <button 
            onClick={() => window.location.href = '/?view=register'}
            className="text-blue-500 text-xs underline"
          >
            Registrar jogador
          </button>
        </div>
      </div>
    );
  }

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
            <option key={player.id} value={player.id.toString()}>
              {player.name}
            </option>
          ))}
        </select>
        <button 
          onClick={refreshPlayersList}
          className="absolute right-2 top-2 text-gray-500 hover:text-wood-dark"
          title="Recarregar lista de jogadores"
        >
          ↻
        </button>
      </div>
      
      {players.length > 0 && (
        <div className="mt-1 text-xs text-gray-500 flex justify-between">
          <span>{players.length} jogador(es) disponível(is)</span>
          <button 
            onClick={() => window.location.href = '/?view=register'}
            className="text-blue-500 text-xs underline"
          >
            Adicionar novo
          </button>
        </div>
      )}
    </div>
  );
} 
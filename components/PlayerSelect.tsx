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
  // Contador de recargas para forçar recarregamento da lista
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Função para recarregar a lista de jogadores
  const refreshPlayersList = () => {
    setRefreshCounter(prev => prev + 1);
    setLoading(true);
  };

  // Carregar jogadores locais do localStorage
  const loadLocalPlayers = () => {
    try {
      const localPlayersStr = localStorage.getItem('localPlayers');
      if (localPlayersStr) {
        const localPlayers = JSON.parse(localPlayersStr);
        console.log(`PlayerSelect (${label}): Carregados ${localPlayers.length} jogadores locais`);
        return localPlayers;
      }
    } catch (err) {
      console.error(`PlayerSelect (${label}): Erro ao carregar jogadores locais:`, err);
    }
    return [];
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError('');
        console.log(`PlayerSelect (${label}): Buscando lista de jogadores...`);
        
        // Obter jogadores locais
        const localPlayers = loadLocalPlayers();
        
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
            const data = await response.json();
            console.log(`PlayerSelect (${label}): Dados recebidos:`, data);
            
            if (data.success && data.data && Array.isArray(data.data)) {
              console.log(`PlayerSelect (${label}): ${data.data.length} jogadores encontrados no servidor`);
              
              // Combinar jogadores do servidor com jogadores locais
              const serverPlayers = data.data;
              const allPlayers = [...serverPlayers];
              
              // Adicionar jogadores locais que não existem no servidor
              if (localPlayers.length > 0) {
                localPlayers.forEach((localPlayer: Player) => {
                  const localId = getPlayerId(localPlayer);
                  const exists = serverPlayers.some((serverPlayer: Player) => 
                    getPlayerId(serverPlayer) === localId || 
                    getPlayerName(serverPlayer) === getPlayerName(localPlayer)
                  );
                  
                  if (!exists) {
                    allPlayers.push(localPlayer);
                  }
                });
              }
              
              setPlayers(allPlayers);
              setIsServerOnline(true);
              setLoading(false);
              return;
            } else {
              console.log(`PlayerSelect (${label}): Lista vazia ou inválida do servidor`);
            }
          } else {
            throw new Error(`Erro do servidor: ${response.status}`);
          }
        } catch (err) {
          console.error(`PlayerSelect (${label}): Erro ao buscar do servidor:`, err);
          setIsServerOnline(false);
          
          // Verificar se temos jogadores locais
          if (localPlayers.length > 0) {
            console.log(`PlayerSelect (${label}): Usando ${localPlayers.length} jogadores locais`);
            setPlayers(localPlayers);
            toast.success('Usando jogadores locais (modo offline)');
          } else {
            // Se não tivermos jogadores locais, usar mock
            console.log(`PlayerSelect (${label}): Usando dados mock como fallback`);
            setPlayers(mockPlayers);
          }
        }
      } catch (err: any) {
        console.error(`PlayerSelect (${label}): Erro geral:`, err);
        setError(err.message || 'Erro ao carregar jogadores');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
    
    // Recarregar a cada 2 segundos (tempo reduzido) enquanto o componente estiver montado
    const interval = setInterval(() => {
      fetchPlayers();
    }, 2000);
    
    // Adicionar ouvinte para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'localPlayers' || e.key === null) {
        console.log(`PlayerSelect (${label}): Detectada alteração no localStorage`);
        fetchPlayers();
      }
    };
    
    // Detectar registros de jogadores através de um evento personalizado
    const handlePlayerRegistered = () => {
      console.log(`PlayerSelect (${label}): Detectado evento de registro de jogador`);
      fetchPlayers();
    };
    
    // Registrar ouvintes
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('playerRegistered', handlePlayerRegistered);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('playerRegistered', handlePlayerRegistered);
    };
  }, [label, refreshCounter]);

  // Função para obter o ID do jogador (compatível com MongoDB que usa _id)
  const getPlayerId = (player: Player): string => {
    return (player._id || player.id || '').toString();
  };

  // Função para obter o nome do jogador (compatível com campos nome e name)
  const getPlayerName = (player: Player): string => {
    return player.nome || player.name || 'Jogador sem nome';
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    if (!playerId) {
      onChange('', '');
      return;
    }
    
    const player = players.find(p => getPlayerId(p) === playerId);
    if (player) {
      const playerName = getPlayerName(player);
      console.log(`PlayerSelect (${label}): Selecionado jogador ID=${playerId}, Nome=${playerName}`);
      
      // Salvar no localStorage para criar/entrar em salas
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', playerName);
      
      onChange(playerId, playerName);
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
            <option key={getPlayerId(player)} value={getPlayerId(player)}>
              {getPlayerName(player)} {!isServerOnline && getPlayerId(player).includes('-') ? '(Local)' : ''}
            </option>
          ))}
        </select>
        <button 
          type="button"
          onClick={refreshPlayersList}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
          title="Atualizar lista de jogadores"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="mt-1 text-xs text-right">
        <button 
          type="button" 
          onClick={refreshPlayersList} 
          className="text-blue-500 hover:text-blue-700"
        >
          Atualizar lista
        </button>
      </div>
      
      {players.length > 0 && (
        <div className="mt-1 text-xs text-gray-500 flex justify-between">
          <span>
            {players.length} jogador(es) disponível(is)
            {!isServerOnline && ' (modo offline)'}
          </span>
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
'use client';

import { useEffect, useState } from 'react';

export default function PlayerSelect({ label, value, onChange }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/players', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setPlayers(data.data);
          } else {
            throw new Error('Formato de dados inválido');
          }
        } else {
          throw new Error(`Erro ao buscar jogadores: ${response.status}`);
        }
      } catch (err) {
        console.error('Erro ao carregar jogadores:', err);
        setError(err.message || 'Erro ao carregar jogadores');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Função para manipular a seleção do jogador
  const handlePlayerChange = (e) => {
    const playerId = e.target.value;
    
    // Encontrar o jogador selecionado para obter o nome
    const selectedPlayer = players.find(p => (p._id || p.id) === playerId);
    
    // Armazenar o jogador selecionado no localStorage para jogos online
    if (selectedPlayer) {
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', selectedPlayer.nome || selectedPlayer.name || 'Jogador');
    }
    
    // Chamar o callback de mudança normal
    if (onChange) {
      onChange(playerId, selectedPlayer ? (selectedPlayer.nome || selectedPlayer.name) : '');
    }
  };

  // Função para obter o ID do jogador
  const getPlayerId = (player) => {
    return (player._id || player.id || '').toString();
  };

  // Função para obter o nome do jogador
  const getPlayerName = (player) => {
    return (player.nome || player.name || 'Jogador sem nome');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-wood-dark mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={handlePlayerChange}
        className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
        disabled={loading}
      >
        <option value="">Selecione um jogador</option>
        {players.map(player => (
          <option key={getPlayerId(player)} value={getPlayerId(player)}>
            {getPlayerName(player)}
          </option>
        ))}
      </select>
      {loading && <p className="text-sm text-gray-500 mt-1">Carregando jogadores...</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
} 
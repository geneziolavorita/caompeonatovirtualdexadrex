'use client';

import { useEffect, useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';

// Interface para uniformizar os dados de jogador
interface Player {
  _id?: string;
  id?: number | string;
  nome?: string;
  name?: string;
  pontuacao?: number;
  points?: number;
  vitorias?: number;
  wins?: number;
  derrotas?: number;
  losses?: number;
  empates?: number;
  draws?: number;
  jogos?: number;
  gamesPlayed?: number;
  posicao?: number;
}

/**
 * Componente que exibe o ranking do campeonato de xadrez
 * Mostra uma tabela com a classificação dos jogadores ordenados
 * por pontuação, vitórias, empates e derrotas
 */
export default function TournamentRanking() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para normalizar os dados do jogador, unificando campos com nomes diferentes
  const normalizePlayerData = (player: Player): Player => {
    return {
      ...player,
      // Garantir que os campos estejam preenchidos corretamente
      id: player.id || player._id,
      name: player.name || player.nome,
      nome: player.nome || player.name,
      points: player.points || player.pontuacao || 0,
      pontuacao: player.pontuacao || player.points || 0,
      wins: player.wins || player.vitorias || 0,
      vitorias: player.vitorias || player.wins || 0,
      draws: player.draws || player.empates || 0,
      empates: player.empates || player.draws || 0,
      losses: player.losses || player.derrotas || 0,
      derrotas: player.derrotas || player.losses || 0,
      gamesPlayed: player.gamesPlayed || player.jogos || 0,
      jogos: player.jogos || player.gamesPlayed || 0
    };
  };

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        setError('');

        try {
          // Tentar buscar os dados do servidor
          const response = await fetch('/api/players');
          
          if (response.ok) {
            const data = await response.json();
            // Dados obtidos com sucesso do servidor
            setPlayers(data.jogadores.map(normalizePlayerData));
          } else {
            // Erro na resposta da API
            const errorText = await response.text();
            console.error('Erro na resposta da API:', response.status, errorText);
            throw new Error(`Erro do servidor: ${response.status}`);
          }
        } catch (err) {
          console.error('Erro ao buscar ranking do servidor, usando dados mock', err);
          // Se falhar, use os dados mock
          console.log('Usando dados mock para ranking');
          // Ordenar dados mock por pontos e vitórias
          const sortedPlayers = [...mockPlayers].sort((a, b) => {
            if (a.pontuacao !== b.pontuacao) {
              return b.pontuacao - a.pontuacao;
            }
            return b.vitorias - a.vitorias;
          });
          setPlayers(sortedPlayers);
        }
      } catch (err: any) {
        console.error('Erro ao carregar ranking:', err);
        setError(err.message || 'Ocorreu um erro ao carregar o ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Carregando ranking...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <p>Usando dados de exemplo para demonstração.</p>
      </div>
    );
  }

  if (players.length === 0) {
    return <div className="text-center py-4">Ainda não há jogadores registrados no campeonato.</div>;
  }

  return (
    <div className="bg-wood-light p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-wood-dark">Ranking do Campeonato</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-wood-dark text-white">
              <th className="py-2 px-4 text-left">Posição</th>
              <th className="py-2 px-4 text-left">Jogador</th>
              <th className="py-2 px-4 text-center">Pontos</th>
              <th className="py-2 px-4 text-center">V</th>
              <th className="py-2 px-4 text-center">E</th>
              <th className="py-2 px-4 text-center">D</th>
              <th className="py-2 px-4 text-center">Jogos</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player._id || player.id} className={index % 2 === 0 ? 'bg-wood-lightest' : 'bg-white'}>
                <td className="py-2 px-4 border-b border-wood-light">{player.posicao || index + 1}</td>
                <td className="py-2 px-4 border-b border-wood-light font-medium">{player.nome || player.name}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center font-bold">{player.pontuacao || player.points || 0}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.vitorias || player.wins || 0}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.empates || player.draws || 0}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.derrotas || player.losses || 0}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.jogos || player.gamesPlayed || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
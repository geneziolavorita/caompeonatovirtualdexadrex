'use client';

import { useEffect, useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';

interface Player {
  id: number;
  name: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
}

export default function TournamentRanking() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        console.log('Buscando ranking...');
        // Primeiro, tente buscar do servidor
        try {
          const response = await fetch('/api/ranking', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          console.log('Resposta da API:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Dados recebidos:', data);
            setPlayers(data);
            setLoading(false);
            return;
          } else {
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
            if (a.points !== b.points) {
              return b.points - a.points;
            }
            return b.wins - a.wins;
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
              <tr key={player.id} className={index % 2 === 0 ? 'bg-wood-lightest' : 'bg-white'}>
                <td className="py-2 px-4 border-b border-wood-light">{index + 1}</td>
                <td className="py-2 px-4 border-b border-wood-light font-medium">{player.name}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center font-bold">{player.points}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.wins}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.draws}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.losses}</td>
                <td className="py-2 px-4 border-b border-wood-light text-center">{player.gamesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
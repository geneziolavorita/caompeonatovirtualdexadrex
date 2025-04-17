import { useEffect, useState } from 'react';

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
        const response = await fetch('/api/ranking');
        
        if (!response.ok) {
          throw new Error('Falha ao buscar o ranking');
        }
        
        const data = await response.json();
        setPlayers(data);
      } catch (err: any) {
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
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
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
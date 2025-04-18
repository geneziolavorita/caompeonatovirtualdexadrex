'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Player {
  _id?: string;
  id?: string | number;
  nome?: string;
  name?: string;
  email?: string;
  pontuacao?: number;
  jogos?: number;
  vitorias?: number;
  derrotas?: number;
  empates?: number;
  dataCriacao?: string;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError('');
        
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
          throw new Error(`Erro do servidor: ${response.status}`);
        }
      } catch (err: any) {
        console.error('Erro ao buscar jogadores:', err);
        setError(err.message || 'Erro ao carregar jogadores');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleDeletePlayer = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este jogador?')) {
      return;
    }

    try {
      const response = await fetch(`/api/players?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Jogador excluído com sucesso');
        // Atualizar a lista de jogadores
        setPlayers(players.filter(player => (player._id || player.id) !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir jogador');
      }
    } catch (err: any) {
      console.error('Erro ao excluir jogador:', err);
      toast.error(err.message || 'Erro ao excluir jogador');
    }
  };

  // Função para obter o ID do jogador
  const getPlayerId = (player: Player): string => {
    return (player._id || player.id || '').toString();
  };

  // Função para obter o nome do jogador
  const getPlayerName = (player: Player): string => {
    return (player.nome || player.name || 'Jogador sem nome');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Carregando jogadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Voltar para página inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-wood-dark">Jogadores Cadastrados</h1>
        <Link href="/" className="px-4 py-2 bg-wood-dark text-white rounded hover:bg-wood-medium">
          Voltar
        </Link>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-8 bg-wood-lightest rounded-lg">
          <p className="text-lg">Nenhum jogador cadastrado ainda.</p>
          <Link href="/?showRegistration=true" className="mt-4 inline-block px-4 py-2 bg-wood-dark text-white rounded hover:bg-wood-medium">
            Cadastrar Jogador
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-wood-dark text-white">
                <th className="py-3 px-4 text-left">Nome</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-center">Pontos</th>
                <th className="py-3 px-4 text-center">Jogos</th>
                <th className="py-3 px-4 text-center">V/E/D</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={getPlayerId(player)} className={index % 2 === 0 ? 'bg-wood-lightest' : 'bg-white'}>
                  <td className="py-3 px-4 border-b border-wood-light font-medium">
                    {getPlayerName(player)}
                  </td>
                  <td className="py-3 px-4 border-b border-wood-light">
                    {player.email || '-'}
                  </td>
                  <td className="py-3 px-4 border-b border-wood-light text-center font-bold">
                    {player.pontuacao || 0}
                  </td>
                  <td className="py-3 px-4 border-b border-wood-light text-center">
                    {player.jogos || 0}
                  </td>
                  <td className="py-3 px-4 border-b border-wood-light text-center">
                    {player.vitorias || 0}/{player.empates || 0}/{player.derrotas || 0}
                  </td>
                  <td className="py-3 px-4 border-b border-wood-light text-center">
                    <button
                      onClick={() => handleDeletePlayer(getPlayerId(player))}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir jogador"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { getMockRanking, MockPlayer } from '@/lib/mock-data';
import Link from 'next/link';

export default function LeaderboardClient() {
  const [ranking, setRanking] = useState<MockPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRanking() {
      try {
        // Attempt to fetch from the API
        const response = await fetch('/api/ranking');
        
        if (!response.ok) {
          throw new Error('Failed to fetch ranking data');
        }
        
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        // Fall back to mock data if API request fails
        const mockData = getMockRanking();
        setRanking(mockData);
        setError('Usando dados offline. Alguns dados podem estar desatualizados.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRanking();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Classificação</h1>
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Jogador</th>
                <th className="py-3 px-4 text-center">Pontos</th>
                <th className="py-3 px-4 text-center">Jogos</th>
                <th className="py-3 px-4 text-center">V</th>
                <th className="py-3 px-4 text-center">E</th>
                <th className="py-3 px-4 text-center">D</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, index) => (
                <tr key={player._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4 border-b">{index + 1}</td>
                  <td className="py-3 px-4 border-b font-medium">
                    <Link href={`/player/${player._id}`} className="text-blue-600 hover:text-blue-800">
                      {player.name || player.nome}
                    </Link>
                  </td>
                  <td className="py-3 px-4 border-b text-center">{player.pontuacao}</td>
                  <td className="py-3 px-4 border-b text-center">{player.jogos}</td>
                  <td className="py-3 px-4 border-b text-center">{player.vitorias}</td>
                  <td className="py-3 px-4 border-b text-center">{player.empates}</td>
                  <td className="py-3 px-4 border-b text-center">{player.derrotas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
} 
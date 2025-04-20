'use client';

import { useState, useEffect } from 'react';
import { getMockPlayerById, MockPlayer } from '@/lib/mock-data';
import Link from 'next/link';

export async function generateStaticParams() {
  // Return empty params to allow static export
  return [];
}

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<MockPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerId = params.id;

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        // Attempt to fetch from the API
        const response = await fetch(`/api/players/${playerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }
        
        const data = await response.json();
        setPlayer(data);
      } catch (err) {
        console.error('Error fetching player data:', err);
        // Fall back to mock data if API request fails
        const mockPlayer = getMockPlayerById(playerId);
        if (mockPlayer) {
          setPlayer(mockPlayer);
          setError('Usando dados offline. Alguns dados podem estar desatualizados.');
        } else {
          setError('Jogador não encontrado.');
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlayerData();
  }, [playerId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && !player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <div className="mt-8 text-center">
          <Link 
            href="/leaderboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Voltar para a Classificação
          </Link>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>Jogador não encontrado.</p>
        </div>
        <div className="mt-8 text-center">
          <Link 
            href="/leaderboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Voltar para a Classificação
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Perfil do Jogador</h1>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-3xl mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{player.name || player.nome}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Estatísticas</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pontuação:</span>
                  <span className="font-bold">{player.pontuacao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jogos:</span>
                  <span className="font-bold">{player.jogos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vitórias:</span>
                  <span className="font-bold text-green-600">{player.vitorias}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Empates:</span>
                  <span className="font-bold text-yellow-600">{player.empates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Derrotas:</span>
                  <span className="font-bold text-red-600">{player.derrotas}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Desempenho</h3>
              <div className="h-48 flex items-center justify-center">
                {player.jogos > 0 ? (
                  <div className="w-full">
                    {/* Bar chart showing win/draw/loss ratio */}
                    <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(player.vitorias / player.jogos) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${(player.empates / player.jogos) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${(player.derrotas / player.jogos) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Vitórias: {Math.round((player.vitorias / player.jogos) * 100)}%</span>
                      <span>Empates: {Math.round((player.empates / player.jogos) * 100)}%</span>
                      <span>Derrotas: {Math.round((player.derrotas / player.jogos) * 100)}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum jogo registrado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        <Link 
          href="/leaderboard" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Voltar para a Classificação
        </Link>
        
        <Link 
          href="/" 
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Página Inicial
        </Link>
      </div>
    </div>
  );
} 
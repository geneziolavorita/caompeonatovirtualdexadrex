'use client';

import React, { useState, useEffect } from 'react';
import { getMockPlayerById, MockPlayer, mockPlayers } from '@/lib/mock-data';

// Função assíncrona para buscar os dados do jogador
async function fetchPlayerData(id: string): Promise<MockPlayer | null> {
  try {
    // Em produção com exportação estática, as APIs não funcionam
    // Verificar o ambiente e usar estratégia apropriada
    if (process.env.NODE_ENV === 'development') {
      try {
        // Tentar buscar dados da API apenas em desenvolvimento
        const response = await fetch(`/api/players/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          return data.player;
        }
      } catch (apiError) {
        console.error('Erro na API:', apiError);
        // Fallback para dados mockados abaixo
      }
    }
    
    // Em produção ou se a API falhar em desenvolvimento, usar dados mockados
    const mockPlayer = getMockPlayerById(id);
    if (mockPlayer) return mockPlayer;
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do jogador:', error);
    
    // Usar dados mockados como fallback
    const mockPlayer = getMockPlayerById(id);
    if (mockPlayer) return mockPlayer;
    
    return null;
  }
}

export default function PlayerDetail({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<MockPlayer | null>(null);

  useEffect(() => {
    // Função para buscar os dados do jogador
    const getPlayerData = async () => {
      try {
        const data = await fetchPlayerData(params.id);
        if (data) {
          setPlayer(data);
        } else {
          setError('Jogador não encontrado.');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    getPlayerData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Detalhes do Jogador</h1>
        <p>Carregando dados do jogador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Detalhes do Jogador</h1>
        <p className="text-red-500">Erro: {error}</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Detalhes do Jogador</h1>
        <p>Jogador não encontrado.</p>
      </div>
    );
  }

  // Taxa de vitórias (%)
  const winRate = player.jogos > 0 
    ? Math.round((player.vitorias / player.jogos) * 100) 
    : 0;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Perfil do Jogador</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{player.name || player.nome}</h2>
          <span className="text-lg font-bold">{player.pontuacao} pontos</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email: {player.email || 'Não informado'}</p>
            <p className="text-gray-600">ID: {player._id}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Jogos</p>
            <p className="text-xl font-bold">{player.jogos}</p>
          </div>
          
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-gray-600">Vitórias</p>
            <p className="text-xl font-bold">{player.vitorias}</p>
          </div>
          
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <p className="text-sm text-gray-600">Derrotas</p>
            <p className="text-xl font-bold">{player.derrotas}</p>
          </div>
          
          <div className="text-center p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-gray-600">Empates</p>
            <p className="text-xl font-bold">{player.empates}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Desempenho</h3>
          <div className="flex items-center">
            <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${winRate}%` }}
              ></div>
            </div>
            <span className="ml-2">{winRate}% vitórias</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
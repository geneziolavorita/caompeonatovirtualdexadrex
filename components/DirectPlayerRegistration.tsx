'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Player {
  id: string;
  nome: string;
  email?: string;
  pontuacao: number;
  jogos: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  dataCriacao: string;
}

interface DirectPlayerRegistrationProps {
  onComplete?: (player: Player) => void;
}

export default function DirectPlayerRegistration({ onComplete }: DirectPlayerRegistrationProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!nome.trim()) {
      setError('Nome do jogador é obrigatório');
      return;
    }
    
    // Verificar se já existe um jogador com este nome no localStorage
    try {
      const localPlayersStr = localStorage.getItem('localPlayers');
      const localPlayers = localPlayersStr ? JSON.parse(localPlayersStr) : [];
      
      if (localPlayers.some((p: any) => 
        p.nome.toLowerCase() === nome.toLowerCase() || 
        p.name?.toLowerCase() === nome.toLowerCase()
      )) {
        setError(`Jogador com nome "${nome}" já existe`);
        return;
      }
      
      // Criar novo jogador
      const newId = uuidv4();
      const newPlayer: Player = {
        id: newId,
        nome: nome,
        email: email || undefined,
        pontuacao: 0,
        jogos: 0,
        vitorias: 0,
        derrotas: 0,
        empates: 0,
        dataCriacao: new Date().toISOString()
      };
      
      // Salvar no localStorage
      const updatedPlayers = [...localPlayers, newPlayer];
      localStorage.setItem('localPlayers', JSON.stringify(updatedPlayers));
      
      // Limpar formulário
      setNome('');
      setEmail('');
      
      // Callback
      if (onComplete) {
        onComplete(newPlayer);
      }
      
      // Mostrar mensagem de sucesso
      alert('Jogador cadastrado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao salvar jogador:', err);
      setError('Falha ao salvar jogador. Tente novamente.');
    }
  };

  return (
    <div className="bg-wood-light p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-wood-dark">Cadastro Rápido de Jogador</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-wood-dark text-sm font-medium mb-1">Nome do Jogador *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-wood-dark text-sm font-medium mb-1">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
            disabled={loading}
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark"
            disabled={loading}
          >
            Cadastrar
          </button>
          
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
} 
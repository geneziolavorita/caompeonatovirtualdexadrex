'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CadastrarJogadorPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    if (!nome.trim()) {
      setError('Nome do jogador é obrigatório');
      setLoading(false);
      return;
    }
    
    try {
      // Primeiro, verificar se já existe localmente
      const localPlayersStr = localStorage.getItem('localPlayers');
      const localPlayers = localPlayersStr ? JSON.parse(localPlayersStr) : [];
      
      if (localPlayers.some((p: any) => 
        p.nome.toLowerCase() === nome.toLowerCase() || 
        p.name?.toLowerCase() === nome.toLowerCase()
      )) {
        setError(`Jogador com nome "${nome}" já existe localmente`);
        setLoading(false);
        return;
      }
      
      // Tentar salvar no servidor
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email: email || undefined })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Se for erro de duplicação, podemos tentar apenas localmente
        if (response.status === 409) {
          setError(`Jogador "${nome}" já existe no servidor. Por favor, escolha outro nome.`);
        } else {
          // Para qualquer outro erro, salvamos localmente
          throw new Error(result.erro || 'Erro ao cadastrar jogador');
        }
      } else {
        // Sucesso ao salvar no servidor!
        setSuccess(true);
        setNome('');
        setEmail('');
        
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar jogador:', err);
      
      // Salvar localmente como fallback
      if (confirm('Não foi possível salvar no servidor. Deseja salvar localmente?')) {
        try {
          const localPlayersStr = localStorage.getItem('localPlayers');
          const localPlayers = localPlayersStr ? JSON.parse(localPlayersStr) : [];
          
          // Gerar ID único
          const newId = Date.now().toString();
          
          // Criar jogador
          const newPlayer = {
            id: newId,
            _id: newId,
            nome: nome,
            name: nome,
            email: email || undefined,
            pontuacao: 0,
            jogos: 0,
            vitorias: 0,
            derrotas: 0,
            empates: 0,
            dataCriacao: new Date().toISOString()
          };
          
          // Salvar
          localPlayers.push(newPlayer);
          localStorage.setItem('localPlayers', JSON.stringify(localPlayers));
          
          setSuccess(true);
          setNome('');
          setEmail('');
          
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } catch (localErr) {
          setError('Falha ao salvar localmente. Tente novamente.');
        }
      } else {
        setError('Cadastro cancelado pelo usuário.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Cadastrar Jogador</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            Voltar
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Jogador cadastrado com sucesso! Redirecionando...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-gray-700 text-sm font-medium mb-1">
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading || success}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
              Email (opcional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || success}
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="submit"
              className={`bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                (loading || success) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading || success}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            
            <Link
              href="/"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
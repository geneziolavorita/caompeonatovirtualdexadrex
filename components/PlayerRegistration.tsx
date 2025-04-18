'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PlayerRegistrationProps {
  onPlayerRegistered: (player: { id: string; name: string; email?: string }) => void;
}

export default function PlayerRegistration({ onPlayerRegistered }: PlayerRegistrationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar a conectividade do servidor ao carregar o componente
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        console.log('Verificando status do servidor...');
        const response = await fetch('/api/status', { 
          method: 'GET',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Servidor está online:', data);
          setServerStatus('online');
          setIsOfflineMode(false);
        } else {
          console.log('Servidor respondeu com erro:', response.status);
          setServerStatus('offline');
          setIsOfflineMode(true);
        }
      } catch (err) {
        console.error('Erro ao verificar status do servidor:', err);
        setServerStatus('offline');
        setIsOfflineMode(true);
      }
    };

    checkServerStatus();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setDetailedError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, digite o nome do jogador');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Enviando dados para API:', { nome: name, email });
      
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nome: name,  // Usar 'nome' para compatibilidade com a API
          email: email || undefined
        }),
      });
      
      const result = await response.json();
      console.log('Resposta da API:', result);
      
      if (!response.ok) {
        // Mensagem personalizada baseada no código de status
        if (response.status === 409) {
          toast.error(`Jogador com nome '${name}' já existe`);
        } else {
          toast.error(result.message || 'Erro ao cadastrar jogador');
        }
        return;
      }
      
      if (result.success) {
        toast.success('Jogador cadastrado com sucesso!');
        setName('');
        setEmail('');
        router.refresh();
        router.push('/players');
      } else {
        toast.error(result.message || 'Erro ao cadastrar jogador');
      }
    } catch (error) {
      console.error('Erro ao cadastrar jogador:', error);
      toast.error('Falha na comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    clearMessages();
    setSuccess(isOfflineMode ? 'Modo online ativado' : 'Modo offline ativado');
  };

  const retryConnection = async () => {
    setServerStatus('checking');
    clearMessages();
    
    try {
      const response = await fetch('/api/status', { 
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        setServerStatus('online');
        setIsOfflineMode(false);
        setSuccess('Conexão com o servidor restaurada!');
      } else {
        setServerStatus('offline');
        setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
      }
    } catch (err) {
      setServerStatus('offline');
      setError('Falha ao verificar a conexão com o servidor.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Cadastrar Novo Jogador</h2>
      
      {serverStatus === 'checking' && (
        <div className="mb-4 text-blue-500 text-sm bg-blue-50 p-2 rounded border border-blue-200">
          Verificando conexão com o servidor...
        </div>
      )}
      
      {serverStatus === 'offline' && !isOfflineMode && (
        <div className="mb-4 text-yellow-500 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
          Aviso: Servidor parece estar offline. Considere usar o modo offline.
          <button 
            onClick={retryConnection}
            className="ml-2 text-blue-500 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite o nome do jogador"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email (opcional)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite o email do jogador (opcional)"
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
            {error}
            {detailedError && (
              <div className="mt-2 text-xs text-red-400 p-1 bg-red-100 rounded">
                Detalhes: {detailedError}
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mb-4 text-green-500 text-sm bg-green-50 p-3 rounded border border-green-200">
            {success}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Jogador'}
        </button>
      </form>
    </div>
  );
} 
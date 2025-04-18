'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PlayerRegistrationProps {
  onPlayerRegistered: (player: { id: string; nome: string; email?: string }) => void;
}

export default function PlayerRegistration({ onPlayerRegistered }: PlayerRegistrationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
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
          
          // Verificar se o banco de dados está conectado
          if (data.database && data.database.status === 'connected') {
            setServerStatus('online');
            toast.success('Conectado ao banco de dados MongoDB');
          } else {
            setServerStatus('offline');
            toast.error('Problema na conexão com o banco de dados');
          }
        } else {
          console.log('Servidor respondeu com erro:', response.status);
          setServerStatus('offline');
          toast.error('Servidor indisponível');
        }
      } catch (err) {
        console.error('Erro ao verificar status do servidor:', err);
        setServerStatus('offline');
        toast.error('Erro ao conectar ao servidor');
      }
    };

    checkServerStatus();
  }, []);

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
          nome: name,
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
        
        if (result.data && onPlayerRegistered) {
          onPlayerRegistered(result.data);
        }
        
        setName('');
        setEmail('');
        
        // Atualizar a página atual em vez de redirecionar
        router.refresh();
        
        // Verificar se estamos na tela inicial antes de redirecionar
        if (window.location.pathname === '/') {
          // Mostrar toast de sucesso sem redirecionar
          toast.success('Jogador disponível para seleção na lista');
        } else {
          // Redirecionar para a página inicial
          window.location.href = '/';
        }
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

  const retryConnection = async () => {
    setServerStatus('checking');
    
    try {
      const response = await fetch('/api/status', { 
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.database && data.database.status === 'connected') {
          setServerStatus('online');
          toast.success('Conexão com o banco de dados restaurada!');
        } else {
          setServerStatus('offline');
          toast.error('Problema na conexão com o banco de dados');
        }
      } else {
        setServerStatus('offline');
        toast.error('Não foi possível conectar ao servidor');
      }
    } catch (err) {
      setServerStatus('offline');
      toast.error('Falha ao verificar a conexão com o servidor');
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
      
      {serverStatus === 'offline' && (
        <div className="mb-4 text-yellow-500 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
          Aviso: Problema na conexão com o banco de dados.
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
            disabled={loading || serverStatus === 'offline'}
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
            disabled={loading || serverStatus === 'offline'}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || serverStatus === 'offline'}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading || serverStatus === 'offline' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Jogador'}
        </button>
      </form>
    </div>
  );
} 
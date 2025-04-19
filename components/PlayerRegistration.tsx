'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { mockPlayers } from '@/lib/mock-data';
// @ts-ignore - Ignorar erro de tipagem do uuid
import { v4 as uuidv4 } from 'uuid';

interface PlayerRegistrationProps {
  onPlayerRegistered?: (player: { id: string; nome: string; email?: string }) => void;
}

export default function PlayerRegistration({ onPlayerRegistered }: PlayerRegistrationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [useMock, setUseMock] = useState(false);
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

  const notifyPlayerRegistered = () => {
    // Disparar evento personalizado para notificar outros componentes
    const event = new Event('playerRegistered', { bubbles: true });
    document.dispatchEvent(event);
    
    // Forçar atualização da interface
    try {
      router.refresh();
    } catch (e) {
      console.error("Erro ao atualizar a rota:", e);
    }
  };

  const registerPlayerLocally = () => {
    if (!name.trim()) {
      toast.error('Por favor, digite o nome do jogador');
      return false;
    }

    try {
      // Gerar ID único para o jogador local
      const playerId = uuidv4();
      
      // Criar objeto de jogador
      const playerData = {
        id: playerId,
        _id: playerId,
        nome: name,
        name: name, // Para compatibilidade
        email: email || undefined,
        pontuacao: 0,
        jogos: 0,
        vitorias: 0,
        derrotas: 0,
        empates: 0,
        dataCriacao: new Date().toISOString()
      };

      // Salvar no localStorage
      const existingPlayers = localStorage.getItem('localPlayers');
      let players = existingPlayers ? JSON.parse(existingPlayers) : [];
      
      // Verificar se o nome já existe
      if (players.some((p: any) => p.nome === name || p.name === name)) {
        toast.error(`Jogador com nome '${name}' já existe localmente`);
        return false;
      }
      
      // Adicionar novo jogador
      players.push(playerData);
      localStorage.setItem('localPlayers', JSON.stringify(players));
      
      // Atualizar mockPlayers para uso imediato
      mockPlayers.push(playerData);
      
      toast.success('Jogador cadastrado localmente com sucesso!');
      
      // Notificar outros componentes
      notifyPlayerRegistered();
      
      if (onPlayerRegistered) {
        onPlayerRegistered(playerData);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar jogador localmente:', error);
      toast.error('Falha ao salvar jogador localmente');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, digite o nome do jogador');
      return;
    }
    
    setLoading(true);
    
    try {
      // Se estiver usando modo offline ou servidor offline, registrar localmente
      if (useMock || serverStatus === 'offline') {
        const success = registerPlayerLocally();
        
        if (success) {
          setName('');
          setEmail('');
          notifyPlayerRegistered(); // Notificar após registro local
        }
        
        setLoading(false);
        return;
      }
      
      // Modo online - tentar salvar no servidor
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
      
      if (!response.ok) {
        if (response.status === 409 || (result.erro && result.erro.includes("já existe"))) {
          toast.error(`Jogador com nome '${name}' já existe`);
        } else {
          toast.error(result.erro || 'Erro ao cadastrar jogador');
        }
        setLoading(false);
        return;
      }
      
      if (result.jogador) {
        toast.success('Jogador cadastrado com sucesso!');
        notifyPlayerRegistered(); // Notificar após registro no servidor
        
        if (onPlayerRegistered) {
          onPlayerRegistered(result.jogador);
        }
        
        setName('');
        setEmail('');
      } else {
        toast.error(result.erro || 'Erro ao cadastrar jogador');
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar jogador:', error);
      toast.error('Falha na comunicação com o servidor');
      
      if (window.confirm('Falha na comunicação com o servidor. Deseja registrar o jogador localmente?')) {
        const success = registerPlayerLocally();
        if (success) {
          notifyPlayerRegistered(); // Notificar após registro local em caso de falha no servidor
        }
      }
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
          toast.success('Conectado ao banco de dados com sucesso!');
          setUseMock(false);
        } else {
          setServerStatus('offline');
          toast.error('Banco de dados indisponível');
        }
      } else {
        setServerStatus('offline');
        toast.error('Servidor indisponível');
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setServerStatus('offline');
      toast.error('Falha ao tentar conectar ao servidor');
    }
  };

  return (
    <div className="bg-wood-light p-6 rounded-lg shadow-md">
      <Toaster position="top-right" />
      <h2 className="text-xl font-bold mb-4 text-wood-dark">Cadastro de Jogador</h2>
      
      {serverStatus === 'offline' && (
        <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Modo Offline!</strong>
          <span className="block sm:inline"> Os dados serão salvos localmente.</span>
          <button 
            onClick={retryConnection}
            className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded text-sm"
          >
            Tentar conectar novamente
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-wood-dark text-sm font-medium mb-1">Nome do Jogador *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="useMock"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
            className="h-4 w-4 text-wood-dark focus:ring-wood-dark border-wood-medium rounded"
            disabled={loading || serverStatus === 'offline'}
          />
          <label htmlFor="useMock" className="ml-2 block text-sm text-wood-dark">
            Salvar apenas localmente (sem enviar ao servidor)
          </label>
        </div>
        
        <button
          type="submit"
          className={`w-full bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Jogador'}
        </button>
      </form>
    </div>
  );
} 